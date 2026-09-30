/**
 * Parses `mfw create`'s command line: one target folder plus the answers
 * that can be given as flags, either to skip the wizard (`--yes`) or to
 * pre-fill it. No validation of the answers themselves here: `renderApp` owns
 * that, so the wizard and the flags go through the same checks.
 */
import { parseArgs } from "node:util";

/** What the command line says. An answer left out is asked by the wizard, or
 * takes its default with `yes`. */
export type CreateArgs = {
  dir: string;
  name?: string;
  assistantName?: string;
  role?: string;
  channels?: string[];
  plugins?: string[];
  yes: boolean;
};

/** A comma-separated list, trimmed, empty items dropped. */
const list = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Parses the arguments that follow `create`. Throws on a missing or extra
 * folder and on an unknown flag. */
export function parseCreateArgs(argv: string[]): CreateArgs {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      name: { type: "string" },
      "assistant-name": { type: "string" },
      role: { type: "string" },
      channels: { type: "string" },
      plugins: { type: "string" },
      yes: { type: "boolean", short: "y" },
    },
  });
  if (positionals.length === 0) {
    throw new Error("Missing the folder to create the app in");
  }
  if (positionals.length > 1) {
    throw new Error(`Expected one folder, got ${positionals.length}: ${positionals.join(" ")}`);
  }
  const args: CreateArgs = { dir: positionals[0] as string, yes: values.yes ?? false };
  if (values.name !== undefined) args.name = values.name;
  if (values["assistant-name"] !== undefined) args.assistantName = values["assistant-name"];
  if (values.role !== undefined) args.role = values.role;
  if (values.channels !== undefined) args.channels = list(values.channels);
  if (values.plugins !== undefined) args.plugins = list(values.plugins);
  return args;
}
