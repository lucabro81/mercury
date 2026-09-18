/**
 * The HTTP surface's Bun.serve and its one conversational endpoint (4a).
 * `POST /turn` runs a real model turn and streams the result back as
 * Server-Sent Events, mirroring what `terminal-provider.ts` does with console
 * chunks: reasoning/text deltas as they arrive, a `pending` event carrying the
 * token when a turn stages a confirm-required action, a `final` event with the
 * complete answer. A bare confirmation token in `text` is resolved by the same
 * `tryConfirm` every channel uses, before the model is ever consulted.
 *
 * `handleTurnRequest` is exported (and takes its collaborators as deps, with
 * test seams for `tryConfirm` and the ephemeral session key) so the streaming
 * behaviour is unit-tested without standing up a socket. The read-only routes
 * (4b) mount alongside `/turn` here, reusing the admin panel's per-domain
 * functions.
 *
 * No auth by design — this surface is opt-in and must not be reachable from
 * outside the container network (see `src/index.ts`'s enable gate), the same
 * posture as the admin panel.
 */
import { tryConfirm } from "../router/confirm-flow.ts";
import { detectPendingConfirmation } from "../session/pending-confirmation.ts";
import { PENDING_CONFIRMATION_NOTE } from "../session/agent-turn.ts";
import type { HandleTurn, TurnSink } from "../router/provider.ts";
import type { ConfirmationStore } from "../tools/confirmation-store.ts";
import type { writeConfirmationNote } from "../wiki/wiki-note.ts";

export type HttpConfirmDeps = {
  store: ConfirmationStore;
  vaultPath: string;
  writeConfirmationNoteFn: typeof writeConfirmationNote;
  now?: () => Date;
};

export type TurnRequestDeps = {
  handleTurn: HandleTurn;
  confirmDeps: HttpConfirmDeps;
  /** Test seam; defaults to the real `tryConfirm`. */
  tryConfirmFn?: typeof tryConfirm;
  /** Test seam for the ephemeral session key when the client sends no conversationId. */
  newSessionKey?: () => string;
};

const SSE_HEADERS = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache",
  connection: "keep-alive",
};

/**
 * Runs one `POST /turn` request and returns an SSE stream Response. The body is
 * `{ text, conversationId? }`; `conversationId` (opaque, client-owned) becomes
 * the session key so a client can continue a conversation — Mercury already
 * keys its histories by session, so many conversations run concurrently, each
 * one-on-one (`multiUser: false`). No `conversationId` means a fresh ephemeral
 * session. Never throws: a bad body is a 400, a mid-turn failure is an `error`
 * event on the stream.
 */
export async function handleTurnRequest(req: Request, deps: TurnRequestDeps): Promise<Response> {
  let body: { text?: unknown; conversationId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "body must be JSON" }, { status: 400 });
  }
  if (typeof body.text !== "string" || body.text.trim().length === 0) {
    return Response.json({ ok: false, error: "missing text" }, { status: 400 });
  }
  const text = body.text;
  const sessionKey =
    typeof body.conversationId === "string" && body.conversationId.trim().length > 0
      ? body.conversationId.trim()
      : (deps.newSessionKey ?? (() => crypto.randomUUID()))();

  const tryConfirmFn = deps.tryConfirmFn ?? tryConfirm;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Same deterministic interception as every other channel — a
      // previously-approved mutation must never depend on the model.
      const confirmReply = await tryConfirmFn(text, sessionKey, {
        ...deps.confirmDeps,
        userId: sessionKey,
      });
      if (confirmReply !== null) {
        send("final", { text: confirmReply });
        controller.close();
        return;
      }

      const sink: TurnSink = {
        onToolStart: (label, detail, toolCallId) => send("tool", { label, detail, toolCallId }),
        onToolFinish: (toolCallId, outcome) => send("tool_finish", { toolCallId, outcome }),
        onTextChunk: (chunk) => {
          if (chunk !== PENDING_CONFIRMATION_NOTE) send("text", { chunk });
        },
        onReasoningChunk: (chunk, id) => send("reasoning", { chunk, id }),
        onReasoningEnd: (id, failed) => send("reasoning_end", { id, failed }),
        onStep: (step) => {
          const pending = detectPendingConfirmation(step);
          if (pending) send("pending", { command: pending.summary, token: pending.token });
        },
        onUsage: () => {},
        finalize: async (finalText) => send("final", { text: finalText }),
        dispose: () => {},
      };

      try {
        await deps.handleTurn(
          {
            channel: "http",
            multiUser: false,
            text,
            sessionKey,
            wikiUserId: sessionKey,
            logPrefix: `[http:${sessionKey}] `,
          },
          sink,
        );
      } catch (err) {
        send("error", { message: err instanceof Error ? err.message : String(err) });
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

/**
 * Read-only introspection getters (4b), injected by the composition root so
 * this server stays decoupled from Qdrant, the vault, and the plugin list — it
 * only knows how to turn each getter into a route. Every getter reads state
 * that already exists in-process; nothing here computes anything new. Tokens are
 * never exposed (see `ConfirmationStore.pending`).
 */
export type HttpReads = {
  manifest: () => unknown;
  pendingConfirmations: () => unknown;
  wikiList: () => Promise<unknown>;
  wikiRead: (path: string) => Promise<unknown>;
  wikiGrep: (pattern: string) => Promise<unknown>;
  memoryScroll: (collection: string, limit: number, offset?: string) => Promise<unknown>;
  toolLog: () => unknown;
  health: () => Promise<unknown>;
};

function badRequest(message: string): Response {
  return Response.json({ ok: false, error: message }, { status: 400 });
}

function readRoutes(reads: HttpReads): Record<string, { GET: (req: Request) => Response | Promise<Response> }> {
  const requireParam = (req: Request, name: string): string | null => new URL(req.url).searchParams.get(name);
  return {
    "/manifest": { GET: () => Response.json({ ok: true, manifest: reads.manifest() }) },
    "/confirmations": { GET: () => Response.json({ ok: true, pending: reads.pendingConfirmations() }) },
    "/tool-log": { GET: () => Response.json({ ok: true, entries: reads.toolLog() }) },
    "/health": { GET: async () => Response.json({ ok: true, ...(await reads.health() as object) }) },
    "/wiki/list": { GET: async () => Response.json({ ok: true, files: await reads.wikiList() }) },
    "/wiki/read": {
      GET: async (req) => {
        const path = requireParam(req, "path");
        if (!path) return badRequest("missing ?path");
        return Response.json({ ok: true, content: await reads.wikiRead(path) });
      },
    },
    "/wiki/grep": {
      GET: async (req) => {
        const pattern = requireParam(req, "pattern");
        if (!pattern) return badRequest("missing ?pattern");
        return Response.json({ ok: true, matches: await reads.wikiGrep(pattern) });
      },
    },
    "/memory/scroll": {
      GET: async (req) => {
        const url = new URL(req.url);
        const collection = url.searchParams.get("collection");
        if (!collection) return badRequest("missing ?collection");
        const limit = Number(url.searchParams.get("limit") ?? "50");
        const offset = url.searchParams.get("offset") ?? undefined;
        return Response.json({ ok: true, ...(await reads.memoryScroll(collection, limit, offset) as object) });
      },
    },
  };
}

export type HttpServerDeps = TurnRequestDeps & { port: number; reads?: HttpReads };

/** Starts the HTTP surface: `POST /turn` (4a) plus the read-only routes (4b)
 * when `reads` is supplied. */
export function startHttpServer(deps: HttpServerDeps): ReturnType<typeof Bun.serve> {
  return Bun.serve({
    port: deps.port,
    // Bind all interfaces inside the container so a published port can reach it
    // (Bun defaults to loopback-only, unreachable through Docker's port proxy).
    // This is not "externally reachable": the container network still isolates
    // it — production simply does not publish the port (see docker-compose).
    hostname: "0.0.0.0",
    // Disable the idle timeout (Bun defaults to 10s): an SSE turn can go quiet
    // for longer than that between events — the model loading, a slow CLI
    // subprocess — and a timeout there would reset the stream mid-turn.
    idleTimeout: 0,
    routes: {
      "/turn": { POST: (req) => handleTurnRequest(req, deps) },
      ...(deps.reads ? readRoutes(deps.reads) : {}),
    },
    error: (err) => Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 }),
  });
}
