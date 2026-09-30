/**
 * Confirm-required detection, re-exported from `@mercury-fw/channel-types`. The
 * logic moved to the shared package so channel plugins can import it without
 * depending on the app; kept re-exported here for the core callers
 * (`agent-turn.ts` and the tests) that import it from this path.
 */
export { detectPendingConfirmation } from "@mercury-fw/channel-types";
export type { PendingConfirmation } from "@mercury-fw/channel-types";
