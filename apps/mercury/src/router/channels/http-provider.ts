/**
 * The HTTP channel's `Provider` — a thin wrapper that makes the HTTP surface a
 * first-class channel the composition root starts and stops like the terminal
 * and Google Chat. The conversational mechanics (the `/turn` endpoint, SSE, the
 * `tryConfirm` interception) live in `src/http/server.ts`; this file only
 * satisfies the `Provider` contract around it.
 *
 * `start` launches the Bun.serve and resolves immediately — the server runs in
 * the background, same as the chat provider, so the composition root proceeds
 * to the blocking terminal REPL. `notify` is a no-op: HTTP is request/response,
 * with no persistent connection to push a proactive message to (that stays with
 * Google Chat). `stop` closes the socket on shutdown.
 */
import { startHttpServer, type HttpConfirmDeps, type HttpReads } from "../../http/server.ts";
import type { Provider, HandleTurn } from "../provider.ts";

export type HttpProviderDeps = {
  port: number;
  confirmDeps: HttpConfirmDeps;
  reads?: HttpReads;
  /** Allowed CORS origin echoed to a browser UI; defaults to `*` in the server. */
  corsOrigin?: string;
};

export function createHttpProvider(deps: HttpProviderDeps): Provider & { stop(): Promise<void> } {
  let server: ReturnType<typeof startHttpServer> | undefined;
  return {
    async start(handleTurn: HandleTurn): Promise<void> {
      server = startHttpServer({
        port: deps.port,
        handleTurn,
        confirmDeps: deps.confirmDeps,
        reads: deps.reads,
        corsOrigin: deps.corsOrigin,
      });
    },
    async notify(): Promise<{ sessionKey: string }> {
      // No proactive push channel over HTTP (4a is request/response only).
      return { sessionKey: "" };
    },
    async stop(): Promise<void> {
      server?.stop();
    },
  };
}
