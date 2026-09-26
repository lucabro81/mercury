/**
 * Channel contract, re-exported from `@mercury/channel-types`. A thin shim so
 * the core modules importing from `router/provider.ts` don't change; the
 * definitions moved to the shared package so channel plugins can import them
 * without depending on the app.
 */
export type { Provider, InboundTurn, TurnSink, HandleTurn, Notifier } from "@mercury/channel-types";
