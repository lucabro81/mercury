/**
 * The plugin-authoring surface — one entry a plugin author imports from, instead
 * of reaching into the individual contract packages. It re-exports the two
 * contracts a plugin is written against: the tool-plugin contract
 * (`@mercury-fw/plugin-types`) and the channel-plugin contract
 * (`@mercury-fw/channel-types`).
 *
 * This is Mercury's `@nuxt/kit` equivalent, deliberately thin for now: today it
 * is a pure re-export of the contracts. The richer plugin-tool SDK (#27) — the
 * helpers for building a tool without hand-wiring the runtime context — will
 * land here, so authors depend on one stable entry as it grows.
 *
 * Split of concern: `@mercury-fw/core` is what an *app* consumes to run an
 * instance; `@mercury-fw/kit` is what a plugin *author* consumes to write one.
 */
export * from "@mercury-fw/plugin-types";
export * from "@mercury-fw/channel-types";
