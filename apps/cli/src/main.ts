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
import { appVersions, cliVersion, newerCli, registryFrom } from "./versions.ts";
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

/** Runs `argv` with stdio inherited and `env` on top of this process's
 * environment; returns its exit code. */
export type Relaunch = (argv: string[], env: Record<string, string>) => Promise<number>;

/** The real relaunch: a child process on the user's terminal. */
const spawnRelaunch: Relaunch = async (argv, env) => {
  const proc = Bun.spawn(argv, { stdin: "inherit", stdout: "inherit", stderr: "inherit", env: { ...process.env, ...env } });
  return await proc.exited;
};

/** When the registry has a newer `@mercury-fw/cli` than this one (a stale copy
 * out of Bun's bunx cache), installs it (`bunx … --version`), then runs
 * `create` again through it with the same arguments as typed and returns its
 * exit code, whatever it is (a cancelled wizard included). `undefined` means
 * carry on here: no newer CLI, a check skipped inside a relaunch
 * (`MFW_SELF_UPDATED`), a registry that can't answer, or a newer CLI that
 * can't be installed; the last two with a warning. */
async function relaunchIfStale(rawArgs: string[], relaunch: Relaunch): Promise<number | undefined> {
  if (process.env.MFW_SELF_UPDATED) return undefined;
  const registry = registryFrom(process.env.MFW_REGISTRY).replace(/\/+$/, "");
  let newer: string | undefined;
  try {
    newer = await newerCli({ registry });
  } catch (err) {
    console.error(`couldn't check for a newer mfw: ${err instanceof Error ? err.message : String(err)}`);
    return undefined;
  }
  if (newer === undefined) return undefined;
  const cli = `@mercury-fw/cli@${newer}`;
  const env = { MFW_SELF_UPDATED: newer, NPM_CONFIG_REGISTRY: registry };
  let installed: number;
  try {
    installed = await relaunch(["bunx", cli, "--version"], env);
  } catch {
    installed = -1;
  }
  if (installed !== 0) {
    console.error(`mfw ${cliVersion()} is behind the registry's ${newer}, which couldn't be installed: creating with ${cliVersion()}.`);
    return undefined;
  }
  console.error(`mfw ${cliVersion()} is behind the registry's ${newer}: running ${newer} instead.`);
  return relaunch(["bunx", cli, "create", ...rawArgs], env);
}

/** `mfw create`: returns the exit code. `rawArgs` are the arguments after
 * `create` as typed, for a relaunch. */
async function create(args: CreateArgs, rawArgs: string[], relaunch: Relaunch): Promise<number> {
  const relaunched = await relaunchIfStale(rawArgs, relaunch);
  if (relaunched !== undefined) return relaunched;
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
  const versions = await appVersions(chosen, { registry: registryFrom(process.env.MFW_REGISTRY) });
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
 * through `deps`; `relaunch` is how `create` hands over to a newer CLI. */
export async function main(
  argv: string[],
  { cwd = process.cwd(), deps, relaunch = spawnRelaunch }: { cwd?: string; deps?: AppDeps; relaunch?: Relaunch } = {},
): Promise<number> {
  const rawCreateArgs = argv.slice(argv.indexOf("create") + 1);
  return runProgram(argv, {
    create: (args) => create(args, rawCreateArgs, relaunch),
    app: () => appCommands(findApp(cwd), deps ?? terminalDeps()),
  });
}
