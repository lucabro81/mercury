/**
 * Orchestrates a single conversational turn: append the user's input to
 * history, ask the model for a response (with access to whichever tools
 * this Mercury instance has wired in), append the response to history,
 * return it.
 *
 * This is the one place that calls `generateText` for the main agent
 * loop (as opposed to `src/session/summarizer.ts`, which calls it for
 * summarization) — see `buildGenerateTextParams` below for why it's
 * `ai-sdk-ollama`'s enhanced version, not the plain `ai` one. The real
 * call is injected as
 * `generateTextFn` so tests can exercise the sequencing/wiring logic
 * here without needing a real model — see the test file for what that
 * does and doesn't cover.
 *
 * Deliberately generic about *what* Mercury can do: `system` and
 * `tools` are both passed in by the caller rather than hardcoded here.
 * A fixed prompt baked into this file describing a specific tool (e.g.
 * "use jiraCli") would be actively wrong on an instance where that tool
 * isn't wired in — the model could still attempt a call to a tool name
 * not present in the request's tool schema, which the AI SDK surfaces
 * as a real error (`NoSuchToolError`), not a harmless no-op. Composing
 * a `system` string that accurately reflects which tools are actually
 * available is `src/index.ts`'s job, since that's where the set of
 * enabled CLIs/tools is decided.
 *
 * Used by: `src/router/terminal.ts` and `src/router/channels/
 * google-chat-events.ts` both call this with the same shape (a string
 * in, a string out) — `runTurn` itself doesn't know or care which
 * channel a given conversation came from.
 */
import { stepCountIs, type LanguageModel, type Tool } from "ai";
import { generateText } from "ai-sdk-ollama";
import type { Message, SessionHistory } from "./history.ts";

/** The shape of the AI SDK call this module needs, injectable for tests. */
type GenerateTextFn = (params: {
  model: LanguageModel;
  messages: Message[];
  tools: Record<string, Tool>;
  system: string;
}) => Promise<{ text: string }>;

/**
 * Builds the params object passed to the real `generateText`. Extracted
 * as its own pure function so it's unit-testable without a real model —
 * `defaultGenerateTextFn` below is otherwise a thin, untestable wrapper
 * around a direct SDK call.
 *
 * `stopWhen: stepCountIs(5)` is the one non-obvious part: `generateText`
 * defaults to stopping after a single step. If that step is a tool call
 * with no accompanying text (the normal case — the model calls a tool,
 * then needs the tool's result before it can answer), the call returns
 * with `text: ""` and no error, having never given the model a chance to
 * read the tool result and respond. 5 steps is enough headroom for a
 * couple of tool calls in sequence before a final answer.
 *
 * `generateText` itself is imported from `ai-sdk-ollama`, not the plain
 * `ai` package — confirmed by a real run: with the standard SDK's
 * version, Ollama executed the tool call but `text` still came back
 * empty even with multi-step enabled. `ai-sdk-ollama`'s enhanced
 * `generateText` is a drop-in replacement (same params/return shape)
 * that specifically synthesizes a real response when this happens —
 * documented as a known Ollama-provider quirk, not something to patch
 * around here by hand.
 */
export function buildGenerateTextParams(params: {
  model: LanguageModel;
  messages: Message[];
  tools: Record<string, Tool>;
  system: string;
}) {
  return { ...params, stopWhen: stepCountIs(5) };
}

/** Default production implementation: calls the real `generateText` from `ai`. */
const defaultGenerateTextFn: GenerateTextFn = (params) =>
  generateText(buildGenerateTextParams(params));

/**
 * Runs one turn: records `userInput`, generates a response with the
 * given model/tools/system prompt, records the response, and returns it.
 *
 * @param history - The conversation's `SessionHistory`; one per
 *   channel/space, never shared (see `src/index.ts`).
 * @param userInput - The user's message for this turn.
 * @param deps.model - The language model to use.
 * @param deps.tools - The tools available to the model on this call —
 *   which tools end up here depends on which CLIs this Mercury instance
 *   has enabled (see `src/index.ts`), not on anything in this file.
 * @param deps.system - The system prompt for this call. Must accurately
 *   describe only the tools actually present in `deps.tools` — this
 *   function doesn't validate that, the caller is responsible for
 *   keeping the two in sync.
 * @param deps.generateTextFn - Test seam; defaults to the real AI SDK
 *   call. Injecting a fake here only tests this function's own
 *   sequencing — it does not exercise the real model or the real AI SDK
 *   integration, which can only be verified by an actual end-to-end run.
 */
export async function runTurn(
  history: SessionHistory,
  userInput: string,
  deps: {
    model: LanguageModel;
    tools: Record<string, Tool>;
    system: string;
    generateTextFn?: GenerateTextFn;
  },
): Promise<string> {
  await history.addUserMessage(userInput);

  const generate = deps.generateTextFn ?? defaultGenerateTextFn;
  const { text } = await generate({
    model: deps.model,
    messages: history.getMessages(),
    tools: deps.tools,
    system: deps.system,
  });

  await history.addAssistantMessage(text);
  return text;
}
