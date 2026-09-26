/**
 * Service entrypoint: builds the instance via `composeMercury()` (see
 * `compose.ts`) and starts what a long-running service runs — the declared
 * channels, the POC admin panel, and the Layer-3 crons. The terminal REPL is a
 * separate dev entrypoint (`repl.ts`), not part of the service.
 */
import { composeMercury } from "./compose.ts";
import { loadChannels, type LoadedChannel } from "./router/channel-loader.ts";
import { createTerminalProvider } from "./router/terminal-provider.ts";
import { stdinIsSession } from "./router/terminal.ts";

const app = await composeMercury();

// Channels are plugins (declared in mercury.config.ts's `channels`) — declared =
// active, no env gate. Each gets the runtime context composeMercury built (the
// injected confirm capability, plus HTTP's in-process reads).
const loadedChannels: LoadedChannel[] = loadChannels(app.channels, { runtime: app.channelRuntime });
for (const { name, provider } of loadedChannels) {
  await provider.start(app.handleTurn);
  console.error(`[channel] ${name} started`);
}

const adminServer = app.startAdmin();
const crons = app.startCrons();

await createTerminalProvider({
  confirmDeps: app.confirmDeps,
  ollamaHost: app.ollamaHost,
  ollamaModel: app.ollamaModel,
}).start(app.handleTurn);

// The REPL above always resolves — on a detached container stdin is already
// closed, so it ends immediately having read nothing, and Mercury must keep
// serving Google Chat. When stdin was a real session (a TTY, or a pipe from
// `docker compose run -T`), its EOF instead means this process is done, and
// everything holding the event loop open has to be released or the process
// hangs forever: the cron intervals, the admin server's listening socket, and
// Google Chat's StreamingPull.
//
// The explicit exit is deliberate and not a substitute for the shutdown above
// it: releasing every subsystem Mercury owns is not enough to end the process,
// because the Qdrant client and the Ollama provider keep pooled keep-alive
// sockets open and neither exposes a way to dispose of them. So the order
// matters — stop everything that could be mid-flight first, then exit to drop
// the third-party sockets nothing here can reach. Each step is traced so a
// shutdown that stalls names the last subsystem that reported done.
if (stdinIsSession()) {
  console.error("[shutdown] terminal session ended, releasing subsystems");
  crons.stop();
  console.error("[shutdown] crons stopped");
  adminServer?.stop();
  console.error("[shutdown] admin server stopped");
  for (const { name, provider } of loadedChannels) {
    await provider.stop?.();
    console.error(`[shutdown] channel ${name} stopped`);
  }
  process.exit(0);
}
