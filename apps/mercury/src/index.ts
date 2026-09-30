/**
 * Service entrypoint: builds the instance via `@mercury-fw/core`'s `composeMercury`,
 * fed this app's `mercury.config.ts`, and starts what a long-running service runs
 * — the declared channels, the POC admin panel, and the Layer-3 crons. Headless:
 * the terminal REPL is a separate dev entrypoint (`repl.ts`), not part of the
 * service.
 *
 * The process stays alive on the channels' background resources (Google Chat's
 * StreamingPull, the HTTP server) and the cron intervals, and shuts down on a
 * signal (SIGINT/SIGTERM — what `docker compose stop` sends), not on stdin EOF.
 */
import { composeMercury, loadChannels, type LoadedChannel } from "@mercury-fw/core";
import mercuryConfig from "../mercury.config.ts";

const app = await composeMercury(mercuryConfig);

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
console.error("[service] up — channels and crons started; waiting for SIGINT/SIGTERM");

// Signal-driven shutdown. Everything holding the event loop open has to be
// released or the process hangs: the cron intervals, the admin socket, and each
// channel's background resource. The explicit exit at the end is deliberate and
// not a substitute for the stops above it: the Qdrant client and the Ollama
// provider keep pooled keep-alive sockets open with no dispose, so the order
// matters — stop everything that could be mid-flight first, then exit to drop
// the third-party sockets nothing here can reach. Each step is traced so a
// shutdown that stalls names the last subsystem that reported done. Guarded so a
// second signal during teardown doesn't run it twice.
let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.error(`[shutdown] ${signal} received, releasing subsystems`);
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
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
