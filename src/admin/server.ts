/**
 * Admin panel POC — a separate `Bun.serve()` instance running inside the
 * same Mercury process (see plan: reuses the already-constructed `qdrant`
 * client, `activeCliConfigs`, model, and vault path directly, no IPC).
 * Dev-only, unauthenticated by design (see docs/DECISIONS.md-adjacent
 * scoping conversation) — never started unless `ADMIN_PANEL_ENABLED` is
 * set (see `src/index.ts`).
 */
import type { LanguageModel } from "ai";
import type { CliConfig } from "../tools/cli-tool.ts";
import type { runCli } from "../tools/cli-executor.ts";
import { getCliStatus } from "./cli-routes.ts";
import { getModelStatus, getSelfHealth } from "./model-routes.ts";
import { scrollCollection, type ScrollableQdrantClient } from "./qdrant-scroll.ts";
import { setEnvValue } from "./env-file.ts";
import { getToolLog } from "./tool-log-buffer.ts";
import {
  listWikiVault,
  readWikiVaultFile,
  grepWikiVault,
  writeRawWikiEntry,
  deleteWikiEntry,
  editWikiViaModel,
} from "./wiki-routes.ts";

type QdrantDeps = ScrollableQdrantClient & { getCollections(): Promise<{ collections: Array<{ name: string }> }> };

/** The only `.env` keys the panel ever reads or writes — see plan §7. Never a secret. */
const ENV_ALLOWLIST = [
  "OLLAMA_MODEL",
  "STALE_TICKET_CHECK_INTERVAL_MS",
  "STALE_PR_CHECK_INTERVAL_MS",
  "SESSION_IDLE_TIMEOUT_MS",
  "SESSION_IDLE_CHECK_INTERVAL_MS",
] as const;

export type AdminServerDeps = {
  port: number;
  vaultPath: string;
  model: LanguageModel;
  qdrant: QdrantDeps;
  qdrantCollections: { episodic: string; semanticFacts: string };
  activeCliConfigs: Record<string, CliConfig>;
  runCliFn: typeof runCli;
  ollamaHost: string;
  ollamaModel: string;
  systemPrompts: { terminal: string; googleChat: string };
  envFilePath: string;
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function errorResponse(err: unknown, status = 400): Response {
  return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, status);
}

export function startAdminServer(deps: AdminServerDeps): ReturnType<typeof Bun.serve> {
  const indexHtml = Bun.file(new URL("./public/index.html", import.meta.url));

  return Bun.serve({
    port: deps.port,
    routes: {
      "/": async () => new Response(indexHtml, { headers: { "content-type": "text/html; charset=utf-8" } }),

      "/api/wiki/list": {
        GET: async () => json({ ok: true, files: await listWikiVault(deps.vaultPath) }),
      },
      "/api/wiki/read": {
        GET: async (req) => {
          const path = new URL(req.url).searchParams.get("path");
          if (!path) return errorResponse("missing ?path");
          try {
            return json({ ok: true, content: await readWikiVaultFile(deps.vaultPath, path) });
          } catch (err) {
            return errorResponse(err);
          }
        },
      },
      "/api/wiki/grep": {
        GET: async (req) => {
          const pattern = new URL(req.url).searchParams.get("pattern");
          if (!pattern) return errorResponse("missing ?pattern");
          try {
            return json({ ok: true, matches: await grepWikiVault(deps.vaultPath, pattern) });
          } catch (err) {
            return errorResponse(err);
          }
        },
      },
      "/api/wiki/edit": {
        POST: async (req) => {
          const body = (await req.json()) as { instruction?: string };
          if (!body.instruction?.trim()) return errorResponse("missing instruction");
          try {
            const reply = await editWikiViaModel(deps.model, deps.vaultPath, body.instruction);
            return json({ ok: true, reply });
          } catch (err) {
            return errorResponse(err, 500);
          }
        },
      },
      "/api/wiki/raw": {
        POST: async (req) => {
          const body = (await req.json()) as { path?: string; content?: string };
          if (!body.path || body.content === undefined) return errorResponse("missing path or content");
          try {
            await writeRawWikiEntry(deps.vaultPath, body.path, body.content);
            return json({ ok: true });
          } catch (err) {
            return errorResponse(err);
          }
        },
      },
      "/api/wiki/entry": {
        DELETE: async (req) => {
          const path = new URL(req.url).searchParams.get("path");
          if (!path) return errorResponse("missing ?path");
          try {
            await deleteWikiEntry(deps.vaultPath, path);
            return json({ ok: true });
          } catch (err) {
            return errorResponse(err);
          }
        },
      },

      "/api/qdrant/collections": {
        GET: async () => json({ ok: true, ...(await deps.qdrant.getCollections()) }),
      },
      "/api/qdrant/scroll": {
        GET: async (req) => {
          const url = new URL(req.url);
          const collection = url.searchParams.get("collection");
          if (!collection) return errorResponse("missing ?collection");
          const limit = Number(url.searchParams.get("limit") ?? "50");
          const offset = url.searchParams.get("offset") ?? undefined;
          const page = await scrollCollection(deps.qdrant, collection, { limit, offset });
          return json({ ok: true, ...page });
        },
      },

      "/api/cli/status": {
        GET: async () => json({ ok: true, clis: await getCliStatus(deps.activeCliConfigs, deps.runCliFn) }),
      },

      "/api/model/status": {
        GET: async () => json({ ok: true, ...(await getModelStatus(deps.ollamaHost, deps.ollamaModel)) }),
      },
      "/api/health": {
        GET: async () =>
          json({ ok: true, ...(await getSelfHealth({ qdrant: deps.qdrant, ollamaHost: deps.ollamaHost })) }),
      },

      "/api/system-prompt": {
        GET: async () => json({ ok: true, ...deps.systemPrompts }),
      },

      "/api/tool-log": {
        GET: async () => json({ ok: true, entries: getToolLog() }),
      },

      "/api/env": {
        GET: async () => {
          const content = await Bun.file(deps.envFilePath).text();
          const values: Record<string, string | undefined> = {};
          for (const key of ENV_ALLOWLIST) {
            const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
            values[key] = match?.[1];
          }
          return json({ ok: true, keys: ENV_ALLOWLIST, values });
        },
        PUT: async (req) => {
          const body = (await req.json()) as { key?: string; value?: string };
          if (!body.key || body.value === undefined) return errorResponse("missing key or value");
          if (!(ENV_ALLOWLIST as readonly string[]).includes(body.key)) {
            return errorResponse(`"${body.key}" is not an editable key from this panel`);
          }
          const content = await Bun.file(deps.envFilePath).text();
          await Bun.write(deps.envFilePath, setEnvValue(content, body.key, body.value));
          return json({ ok: true });
        },
      },
    },
    error: (err) => errorResponse(err, 500),
  });
}
