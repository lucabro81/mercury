/**
 * Terminal-only "sto usando un tool" indicator: wraps every tool's
 * `execute` so `onToolStart` fires the moment a call actually begins
 * (before its result is ready), instead of the existing `onStepFinish`
 * visibility (`tool-log.ts`) which only reports after a step already
 * finished. Used by `src/index.ts`'s terminal wiring only — Google Chat's
 * `buildTools` call passes no `onToolStart`, so it stays wrapped exactly
 * as before.
 */
import type { Tool } from "ai";
import { parseCommand } from "../tools/command-parser.ts";
import { matchCommand, type CliConfig } from "../tools/cli-tool.ts";

// Elenco piccolo e stabile (6 tool totali oggi) — va aggiornato a mano se
// si aggiunge un nuovo tool nominato; qualunque nome non elencato qui
// ricade nel fallback generico, non è un errore.
const WIKI_TOOL_CATEGORY: Record<string, "read" | "write"> = {
  list_files: "read",
  read_file: "read",
  grep: "read",
  write_file: "write",
};

/**
 * Describes, in one short user-facing sentence, what a tool call is about
 * to do — no arguments/queries shown, just which service and (for the
 * generic `runCommand` CLI tool) whether it reads or writes. Read/write
 * classification for `runCommand` reuses `parseCommand`/`matchCommand`
 * as-is (the exact same functions `cli-tool.ts`'s own `execute` calls a
 * moment later) rather than guessing from the command text, so it can
 * never drift from what actually executes.
 */
export function describeToolStart(toolName: string, input: unknown, configs: Record<string, CliConfig>): string {
  if (toolName === "runCommand") {
    const command =
      typeof input === "object" && input !== null && "command" in input
        ? (input as { command: unknown }).command
        : undefined;
    if (typeof command === "string") {
      const parsed = parseCommand(command);
      if (parsed.ok) {
        const config = configs[parsed.binary];
        const match = config ? matchCommand(parsed.args, config) : undefined;
        if (match && match.kind !== "not-allowed") {
          return match.mutating ? `Sto scrivendo dati con ${parsed.binary}…` : `Sto leggendo dati con ${parsed.binary}…`;
        }
        return `Sto usando ${parsed.binary}…`;
      }
    }
    return "Sto eseguendo un comando…";
  }
  if (toolName === "recall_tool_calls") return "Sto consultando la memoria…";
  const wikiCategory = WIKI_TOOL_CATEGORY[toolName];
  if (wikiCategory === "read") return "Sto leggendo il wiki…";
  if (wikiCategory === "write") return "Sto scrivendo sul wiki…";
  return `Sto usando ${toolName}…`;
}

/** Wraps every tool's `execute` to call `onToolStart` first, then run the original unchanged. */
export function withToolStartHook(
  tools: Record<string, Tool>,
  onToolStart: (label: string) => void,
  configs: Record<string, CliConfig>,
): Record<string, Tool> {
  const wrapped: Record<string, Tool> = {};
  for (const [name, t] of Object.entries(tools)) {
    wrapped[name] = {
      ...t,
      execute: async (input: unknown) => {
        onToolStart(describeToolStart(name, input, configs));
        return (t.execute as (i: unknown) => unknown)(input);
      },
    } as Tool;
  }
  return wrapped;
}
