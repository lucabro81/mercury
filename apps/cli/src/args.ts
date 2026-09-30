/**
 * `mfw create`'s answers as the command line gives them: the target folder
 * plus what can be given as flags, either to skip the wizard (`--yes`) or to
 * pre-fill it. The command line itself is parsed in `program.ts`; no
 * validation of the answers here: `renderApp` owns that, so the wizard and the
 * flags go through the same checks.
 */

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

/** `create`'s options as commander hands them over. */
export type CreateOptions = {
  name?: string;
  assistantName?: string;
  role?: string;
  channels?: string;
  plugins?: string;
  yes?: boolean;
};

/** A comma-separated list, trimmed, empty items dropped. */
const list = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** The answers in `folder` and `opts`, with only what was actually given. */
export function toCreateArgs(folder: string, opts: CreateOptions): CreateArgs {
  const args: CreateArgs = { dir: folder, yes: opts.yes ?? false };
  if (opts.name !== undefined) args.name = opts.name;
  if (opts.assistantName !== undefined) args.assistantName = opts.assistantName;
  if (opts.role !== undefined) args.role = opts.role;
  if (opts.channels !== undefined) args.channels = list(opts.channels);
  if (opts.plugins !== undefined) args.plugins = list(opts.plugins);
  return args;
}
