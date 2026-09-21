/**
 * Builds the `runCommand` status describer the composition root injects into
 * the core's tool-start hook. It parses the command, computes whether it
 * mutates from the same allowlist that gates execution (via `matchCommand`, so
 * the label can never drift from what actually runs), and hands that to the
 * command's plugin describer — or `defaultStatusLabel` when the plugin doesn't
 * override it (and for file-based CLIs, which aren't plugins). The core no
 * longer classifies read vs write itself; it only transports whatever the
 * describer returns. This is CLI-specific, so it lives with the CLI mechanism,
 * not in the core session layer.
 */
import { defaultStatusLabel, type StatusDescriber } from "@mercury/plugin-types";
import { parseCommand } from "./command-parser.ts";
import { matchCommand, type CliConfig } from "./cli-tool.ts";

export function createCliStatusDescriber(
  configs: Record<string, CliConfig>,
  describers: Record<string, StatusDescriber>,
): (command: string) => string {
  return (command) => {
    const parsed = parseCommand(command);
    if (!parsed.ok) return "esecuzione di un comando";
    const config = configs[parsed.binary];
    const match = config ? matchCommand(parsed.args, config) : undefined;
    const mutating = match !== undefined && match.kind !== "not-allowed" ? match.mutating : false;
    const describe = describers[parsed.binary] ?? defaultStatusLabel;
    return describe({ binary: parsed.binary, args: parsed.args, mutating });
  };
}
