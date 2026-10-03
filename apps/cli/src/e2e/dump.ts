/**
 * A turn read out of the file the REPL's `/dump` writes: the AI SDK's step
 * results for the last turn, whose `content` parts are the tool calls, their
 * results (or errors) and the model's text. Read as data, not through the
 * SDK's types: only the parts listed here matter.
 */

/** One tool call as a check sees it. `ok` is false when the call failed or
 * never got a result; a result without an `ok` of its own counts as worked. */
export type Call = { tool: string; input: unknown; output: unknown; ok: boolean };

/** What a turn did: its tool calls in order, and its final text. */
export type TurnData = { calls: Call[]; answer: string };

type Part = { type?: unknown; toolCallId?: unknown; toolName?: unknown; input?: unknown; output?: unknown; error?: unknown; text?: unknown };

/** The calls and the answer in `dump`, the parsed content of a `/dump` file. */
export function turnFromDump(dump: unknown): TurnData {
  if (!Array.isArray(dump)) throw new Error("the file isn't a /dump of steps");
  const parts: Part[][] = dump.map((step) =>
    Array.isArray((step as { content?: unknown } | null)?.content) ? ((step as { content: Part[] }).content) : [],
  );

  const calls: Array<Call & { id: unknown }> = [];
  for (const part of parts.flat()) {
    if (part.type === "tool-call") {
      calls.push({ id: part.toolCallId, tool: String(part.toolName), input: part.input, output: undefined, ok: false });
      continue;
    }
    const call = calls.find((c) => c.id === part.toolCallId);
    if (call === undefined) continue;
    if (part.type === "tool-result") {
      call.output = part.output;
      const reported = (part.output as { ok?: unknown } | null)?.ok;
      call.ok = typeof reported === "boolean" ? reported : true;
    } else if (part.type === "tool-error") {
      call.output = { error: part.error };
      call.ok = false;
    }
  }

  const last = parts.at(-1) ?? [];
  const answer = last.filter((p) => p.type === "text" && typeof p.text === "string").map((p) => p.text as string).join("");
  return { calls: calls.map(({ id: _, ...call }) => call), answer };
}
