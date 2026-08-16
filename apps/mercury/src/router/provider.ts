/**
 * Channel abstraction: what any provider (terminal, Google Chat, and future
 * ones) must supply to plug into the shared turn-taking pipeline
 * (`src/router/turn-runner.ts`) and proactive notification (cron layer).
 *
 * Deliberately opaque strings for addressing (`sessionKey`, `userId`,
 * `wikiUserId`) — same philosophy as `tryConfirm`'s `sessionKey`/`userId`
 * (see `src/router/confirm-flow.ts`): each provider owns its own addressing
 * model completely, nothing above this layer ever parses these values.
 */
import type { StepInfo } from "../session/step-info.ts";
import type { ToolOutcome } from "../session/tool-start-hook.ts";

/** One inbound message, already resolved by its own provider into the shape the shared layer needs. */
export type InboundTurn = {
  /** Stable provider id for the tool log (see `ToolLogChannel` in `tool-log-buffer.ts`) — no longer a closed union, any provider can supply its own. */
  channel: string;
  /**
   * Whether this conversation can carry more than one person — selects the
   * NO_REPLY system-prompt variant. Declared here, not resolved: only the
   * composition root can compose a prompt that accurately describes this
   * instance's actual tool set (see `agent-turn.ts`'s header on why a
   * prompt naming an absent tool is a real bug, not a no-op).
   */
  multiUser: boolean;
  /** Text handed to the model, already provider-decorated (e.g. Google Chat's "[Da: X]" marker). */
  text: string;
  /** Opaque session key. Derived by the provider; never parsed above it. */
  sessionKey: string;
  /** Opaque per-person id for Layer-3 capture. `undefined` means this provider has no real per-user identity and the session is never tracked for capture (today's terminal case). */
  userId?: string;
  /** Opaque, already path-safe per-person id for `inferred/users/<id>` scoping. */
  wikiUserId: string;
  /** stderr log prefix, e.g. `[chat:spaces/x:users/y] ` — empty for the terminal. */
  logPrefix: string;
};

/**
 * A provider's output for one turn — what it does with the model's
 * activity and final answer. Every optional member maps 1:1 onto an
 * optional `runTurn` dep, which is what lets Google Chat opt out of
 * *answer* streaming (leaving `onTextChunk` undefined) while still opting
 * into *reasoning* streaming (`onReasoningChunk`) — either one alone is
 * enough to put `runTurn` on its `streamText` path instead of
 * `generateText`, with no branch anywhere above this type.
 */
export type TurnSink = {
  /**
   * Passed to `buildTools` as `onToolStart`. `detail`/`toolCallId` are
   * present for a real tool call (via `withToolStartHook`) and for a
   * capture-ping (Layer-3 write) that supplies its own generated id;
   * `detail`/`toolCallId` undefined means a caller with no correlation id
   * at all — kept optional rather than a required 3-arg signature so any
   * such caller stays valid without change.
   */
  onToolStart: (label: string, detail?: string, toolCallId?: string) => void;
  /**
   * Paired with `onToolStart` via `toolCallId` once that call settles.
   * Optional — only Google Chat implements it today (to patch its status
   * card in place); terminal has no equivalent to update.
   */
  onToolFinish?: (toolCallId: string, outcome: ToolOutcome) => void;
  /** Present ⇒ `runTurn` uses `streamText`. MUST stay undefined for Google Chat's own *answer* delivery. */
  onTextChunk?: (chunk: string) => void;
  /**
   * Live reasoning-token delta as it streams (Ollama's native extended
   * thinking, gated behind OLLAMA_THINK at model-construction time — see
   * `src/index.ts`). Present ⇒ `runTurn` uses `streamText`, same as
   * `onTextChunk`. UI-only: never reaches `SessionHistory` (see
   * `agent-turn.ts`'s `fullText`/reasoning split) — never fires at all for
   * a model that doesn't support thinking. `id` is the SDK's own id for
   * that reasoning block — a single turn can reason more than once (e.g.
   * before a tool call, then again after seeing its result), each burst
   * with its own id, so a caller can treat them as independent (e.g. one
   * status card per id) instead of one continuous stream.
   */
  onReasoningChunk?: (chunk: string, id: string) => void;
  /**
   * Fires once per reasoning block that actually started — including if
   * the turn aborts while a block is still open (see `agent-turn.ts`'s
   * abrupt-failure guard) — so a caller holding a live display open (a
   * status card, a printed block) doesn't get stuck. Never fires for an
   * id `onReasoningChunk` never reported. `failed` is `true` only for the
   * abrupt-abort case, `false` on a normal end.
   */
  onReasoningEnd?: (id: string, failed: boolean) => void;
  /** Provider-local per-step bookkeeping (the terminal's `/dump` buffer). */
  onStep?: (step: StepInfo) => void;
  /** Provider-local usage handling (the terminal's prompt indicator, Chat's stderr line). */
  onUsage?: (inputTokens: number | undefined) => void;
  /** Deliver the model's complete final text. */
  finalize: (finalText: string) => Promise<void>;
  /** Release per-turn resources. Idempotent. */
  dispose: () => void;
};

/** What a provider calls once it has a real model turn to run. */
export type HandleTurn = (turn: InboundTurn, sink: TurnSink) => Promise<void>;

/** Proactive, out-of-band delivery — the slice the cron layer depends on. */
export type Notifier = {
  /**
   * DMs `userId` (an opaque id this provider knows how to address). Returns
   * the opaque session key of the conversation the message landed in, so
   * an episodic record can be filed against it and a reply continues that
   * same conversation (D-25).
   */
  notify(userId: string, text: string): Promise<{ sessionKey: string }>;
};

export type Provider = Notifier & {
  /**
   * Runs this provider's own inbound driver, calling `handleTurn` once per
   * message that actually needs the model. Deterministic pre-interception
   * (a bare confirmation token, `/dump`) belongs to the provider, before
   * this. Resolves when the provider stops.
   */
  start(handleTurn: HandleTurn): Promise<void>;
};
