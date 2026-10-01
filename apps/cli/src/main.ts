/**
 * The `mfw` command. `create <folder>` writes a new Mercury app from the
 * template, asking what to put in it (or taking the answers from flags with
 * `--yes`); `bun install` in the new app is left to the user. The other
 * commands operate an existing app from inside its folder (see
 * `app/commands.ts`). The command line itself is declared in `program.ts`.
 */
import { basename, dirname, join, resolve } from "node:path";
import type { CreateArgs } from "./args.ts";
import { CATALOG } from "./catalog.ts";
import { kebabCase } from "./naming.ts";
import { runProgram } from "./program.ts";
import { renderApp, selectionError } from "./render.ts";
import { appVersions, DEV_PACKAGES, registryFrom } from "./versions.ts";
import { appCommands, terminalDeps, type AppDeps } from "./app/commands.ts";
import { findApp } from "./app/find-app.ts";
import { askAnswers, DEFAULT_ASSISTANT_NAME, DEFAULT_ROLE, type Answers } from "./wizard.ts";
import { targetError, writeApp } from "./write.ts";

/** The answers taken from the flags alone, defaults for the rest. */
function answersFromFlags(args: CreateArgs, defaultName: string): Answers {
  return {
    name: args.name ?? defaultName,
    assistantName: args.assistantName ?? DEFAULT_ASSISTANT_NAME,
    role: args.role ?? DEFAULT_ROLE,
    channels: args.channels ?? [],
    plugins: args.plugins ?? [],
  };
}

/** `mfw create`: returns the exit code. */
async function create(args: CreateArgs): Promise<number> {
  // The folder is created in kebab case, only its own name: the parent path is
  // taken as typed. Its name is also the app name's default.
  const typed = resolve(args.dir);
  const folder = kebabCase(basename(typed));
  if (folder === "") {
    throw new Error(`"${basename(typed)}" has no letters or digits to name a folder with`);
  }
  const dir = join(dirname(typed), folder);
  // What the command line already settles is checked before any question, so
  // the wizard is never answered for nothing.
  const early = targetError(dir) ?? selectionError(args.channels ?? [], args.plugins ?? []);
  if (early !== undefined) {
    throw new Error(early);
  }
  const answers = args.yes ? answersFromFlags(args, folder) : await askAnswers(args, dir);
  if (answers === undefined) {
    return 1;
  }
  const chosen = CATALOG.filter(
    (e) => (e.kind === "channel" ? answers.channels : answers.plugins).includes(e.id),
  ).map((e) => e.package);
  const versions = await appVersions([...chosen, ...DEV_PACKAGES], { registry: registryFrom(process.env.MFW_REGISTRY) });
  writeApp(dir, renderApp({ ...answers, versions }));
  console.log(`Created ${answers.name} in ${dir}

Next:
  cd ${dir}
  bun install
  cp .env.example .env    # then fill it in
  bunx mfw start`);
  return 0;
}

/** Runs `mfw` with `argv` (the arguments after the command name) and returns
 * the exit code, printing to stdout/stderr. `bin.ts` and `create-mercury-agent`
 * both call it; the app commands look for the app from `cwd` and run docker
 * through `deps`. */
export async function main(
  argv: string[],
  { cwd = process.cwd(), deps }: { cwd?: string; deps?: AppDeps } = {},
): Promise<number> {
  return runProgram(argv, {
    create,
    app: () => appCommands(findApp(cwd), deps ?? terminalDeps()),
  });
}
