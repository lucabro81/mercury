/**
 * Dev REPL entrypoint (`bun run repl`): Mercury's developer console. Boots the
 * same composed instance the service uses (`@mercury/core`'s `composeMercury`,
 * fed this app's `mercury.config.ts`) and opens the terminal REPL against its
 * `handleTurn`. For bootstrap before a channel is wired and for local debugging
 * — not a production channel: it is identity-less by design (turns carry no
 * `userId`, so nothing is captured to per-user memory), single-operator, and
 * starts no channels, crons or admin.
 *
 * Destined to move into the future Mercury CLI (a separate monorepo app that
 * scaffolds an instance) as its `repl` command — see `compose.ts`'s header. Not
 * built yet, so this lives with the app.
 */
import { composeMercury, createTerminalProvider } from "@mercury/core";
import mercuryConfig from "../mercury.config.ts";

const app = await composeMercury(mercuryConfig);

await createTerminalProvider({
  confirmDeps: app.confirmDeps,
  ollamaHost: app.ollamaHost,
  ollamaModel: app.ollamaModel,
}).start(app.handleTurn);

// The REPL resolved (stdin EOF / Ctrl+D). Nothing long-running was started here
// (no channels, no crons), but the Qdrant client and Ollama provider keep pooled
// keep-alive sockets open with no dispose, so exit explicitly to end the process.
process.exit(0);
