/**
 * Loads the hand-listed channel plugins into the providers the composition root
 * starts — the channel-side mirror of `plugins/plugin-loader.ts`. It knows
 * nothing about any specific channel: the composition root names them, this
 * loop builds them identically.
 *
 * Fail-soft, same guarantees as the tool-plugin loader:
 *  - a channel contributes only when enabled on this instance (its name is in
 *    `MERCURY_CHANNELS`);
 *  - an `apiVersion` mismatch is refused before `build()` runs;
 *  - a `build()` that throws degrades as a single unit (logged, skipped) while
 *    every other channel and the process carry on;
 *  - a `build()` that returns `undefined` means "present but inert" (the
 *    instance isn't configured for it) — not started, not an error.
 */
import { CHANNEL_API_VERSION, type ChannelPlugin, type ChannelRuntimeContext, type Provider } from "@mercury/channel-types";

/** Everything the loader needs from the composition root: which channels are enabled, and the runtime context every `build()` gets. */
export type LoadChannelsContext = {
  enabled: string[];
  runtime: ChannelRuntimeContext;
};

/** One built channel, kept with its plugin name so the composition root can start it and look it up (e.g. the cron `Notifier`). */
export type LoadedChannel = { name: string; provider: Provider };

/** Builds every enabled channel in `channels`, returning the providers that actually constructed (skipping disabled, incompatible, inert, or failed ones). */
export function loadChannels(channels: ChannelPlugin[], ctx: LoadChannelsContext): LoadedChannel[] {
  const loaded: LoadedChannel[] = [];

  for (const channel of channels) {
    if (!ctx.enabled.includes(channel.name)) {
      continue;
    }
    if (channel.apiVersion !== CHANNEL_API_VERSION) {
      ctx.runtime.log(
        `channel "${channel.name}" not activated: apiVersion ${channel.apiVersion} ` +
          `incompatible with this core (supports ${CHANNEL_API_VERSION})`,
      );
      continue;
    }
    try {
      const provider = channel.build(ctx.runtime);
      // undefined = present but inert (this instance isn't configured for it).
      if (provider === undefined) {
        continue;
      }
      loaded.push({ name: channel.name, provider });
    } catch (err) {
      ctx.runtime.log(
        `channel "${channel.name}" failed to load, skipped: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return loaded;
}
