/**
 * The instance composition config contract and its `defineMercuryConfig`
 * helper. A Mercury instance is composed by declaring, in one place, which
 * plugins it runs — the way a Nuxt/Vite project declares its config through a
 * `defineConfig` call in a `*.config.ts` file. `defineMercuryConfig` adds no
 * runtime behavior; it exists purely so the app-root `mercury.config.ts` gets
 * editor/compiler support (the argument is checked against `MercuryConfig`) and
 * so there is a single, stable seam the composition root reads from.
 *
 * This is the minimal foundational slice of a broader composition rethink: for
 * now the config carries only the plugin list. Per-plugin configuration and the
 * eventual retirement of the file-based cli-configs are deliberately not here.
 */
import type { Plugin } from "@mercury/plugin-types";
import type { ChannelPlugin } from "@mercury/channel-types";

/** The shape of a Mercury instance's composition config: the tool plugins and
 * the channel plugins this instance runs (each gated by MERCURY_CLIS /
 * MERCURY_CHANNELS and loaded by its own loader). */
export type MercuryConfig = {
  plugins: Plugin[];
  channels?: ChannelPlugin[];
};

/**
 * Identity + typing helper for `mercury.config.ts`. Returns its argument
 * unchanged; its only job is to type the config literal against `MercuryConfig`
 * at the call site, exactly like `defineConfig` in the Vite/Nuxt ecosystem.
 */
export function defineMercuryConfig(config: MercuryConfig): MercuryConfig {
  return config;
}
