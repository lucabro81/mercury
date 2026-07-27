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
 * streaming (leaving `onTextChunk` undefined keeps `runTurn` on its
 * `generateText` path) while the terminal opts in, with no branch anywhere
 * above this type.
 */
export type TurnSink = {
  /** Passed to `buildTools` as `onToolStart`. */
  onToolStart: (label: string) => void;
  /** Present ⇒ `runTurn` uses `streamText`. MUST stay undefined for Google Chat. */
  onTextChunk?: (chunk: string) => void;
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
  /**
   * Escalation destination for ownerless findings (D-35). A distinct
   * method, not a sentinel `userId` — the two targets differ in kind
   * (per-user identity resolution vs. a static admin destination) and in
   * configuration.
   */
  notifyAdmin(text: string): Promise<void>;
};

export type Provider = Notifier & {
  /**
   * Runs this provider's own inbound driver, calling `handleTurn` once per
   * message that actually needs the model. Deterministic pre-interception
   * (`conferma <token>`, `/dump`) belongs to the provider, before this.
   * Resolves when the provider stops.
   */
  start(handleTurn: HandleTurn): Promise<void>;
};
