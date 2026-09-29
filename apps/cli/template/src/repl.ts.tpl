/**
 * Dev REPL entrypoint (`bun run repl`): boots the same app the service runs and
 * opens an interactive terminal on it. For trying things out and debugging, not
 * a channel: no user identity (nothing goes to per-user memory), no channels,
 * crons or admin panel.
 */
import { composeMercury, createTerminalProvider } from "@mercury/core";
import mercuryConfig from "../mercury.config.ts";

const app = await composeMercury(mercuryConfig);

await createTerminalProvider({
  confirmDeps: app.confirmDeps,
  ollamaHost: app.ollamaHost,
  ollamaModel: app.ollamaModel,
}).start(app.handleTurn);

// The REPL ended (Ctrl+D); the model and Qdrant clients keep pooled sockets
// open, so exit explicitly.
process.exit(0);
