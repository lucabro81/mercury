/**
 * Minimal shape of a finished generation step that callers might care
 * about — just enough to show what tool Mercury called, with what
 * input, and what it got back. `toolCallId` is what links an entry in
 * `toolCalls` to its entry in `toolResults` — a call with no matching
 * result is a real case callers need to handle explicitly rather than
 * assume a 1:1 pairing: it means the call failed before ever executing
 * (e.g. malformed arguments that don't match the tool's schema), which
 * shows up as a `tool-error` entry in `content`, not in `toolResults` —
 * confirmed against the real AI SDK's `StepResult` type, which has no
 * separate `toolErrors` array; `content` is the one place every part
 * (text/tool-call/tool-result/tool-error) actually lives. The real AI
 * SDK step object has many more fields; this is a subset, which is fine
 * since function parameter types only need to be structurally
 * compatible, not identical.
 *
 * Lives in its own file, not `agent-turn.ts`, specifically so
 * `pending-confirmation.ts` (which needs this type) and `agent-turn.ts`
 * (which needs `pending-confirmation.ts`'s `detectPendingConfirmation` to
 * decide whether to stop the tool-calling loop early) don't form an
 * import cycle.
 */
export type StepInfo = {
  toolCalls: Array<{ toolCallId: string; toolName: string; input: unknown }>;
  toolResults: Array<{ toolCallId: string; toolName: string; output: unknown }>;
  content: Array<{ type: string; toolCallId?: string; error?: unknown }>;
};
