/**
 * The `mfw` command. `create <folder>` writes a new Mercury app from the
 * template, asking what to put in it (or taking the answers from flags with
 * `--yes`); `bun install` in the new app is left to the user. The other
 * commands operate an existing app from inside its folder (see
 * `app/commands.ts`).
 */
import { basename, dirname, join, resolve } from "node:path";
import { parseCreateArgs, type CreateArgs } from "./args.ts";
import { CATALOG } from "./catalog.ts";
import { kebabCase } from "./naming.ts";
import { renderApp, selectionError } from "./render.ts";
import { appVersions, registryFrom } from "./versions.ts";
import { APP_COMMANDS, runAppCommand, terminalDeps, type AppCommand, type AppDeps } from "./app/commands.ts";
import { findApp } from "./app/find-app.ts";
import { askAnswers, DEFAULT_ASSISTANT_NAME, DEFAULT_ROLE, type Answers } from "./wizard.ts";
import { targetError, writeApp } from "./write.ts";

/** `mfw create --help`. */
const CREATE_HELP = `Usage: mfw create <folder> [options]

mfw create writes a new Mercury app into <folder>, which has to be missing or
empty (its own name is turned into kebab case). Without options it asks for the
app name, the assistant's name and role, and which channels and tool plugins
to include; then it writes mercury.config.ts for that selection, the persona
(persona/identity.md, persona/tone.md), the service and REPL entrypoints, a
Dockerfile, a compose file with Qdrant, and an env example listing every
variable the app reads. Nothing is installed: run bun install in the new app.

Options:
  --name <name>              app name, as in package.json (default: the folder's name)
  --assistant-name <name>    the assistant's name (default: ${DEFAULT_ASSISTANT_NAME})
  --role <text>              completes "You are <name>, …" (default: ${DEFAULT_ROLE})
  --channels <ids>           comma-separated: ${CATALOG.filter((e) => e.kind === "channel").map((e) => e.id).join(", ")}
  --plugins <ids>            comma-separated: ${CATALOG.filter((e) => e.kind === "tool").map((e) => e.id).join(", ")}
  -y, --yes                  don't ask: use the flags and the defaults

Examples:
  mfw create my-agent
  mfw create my-agent --assistant-name Hermes --channels http --plugins jira --yes

The framework packages get this CLI's version; each chosen plugin or channel
its latest on the registry (https://registry.npmjs.org, or MFW_REGISTRY).
`;

/** Each app command's help: its signature, then what it does. They all run
 * from inside an app (any folder under the one holding mercury.config.ts). */
const APP_HELP: Record<AppCommand, string> = {
  start: `Usage: mfw start [--no-cache]

Builds the app's image and starts the app and Qdrant in the background. Only
what changed is rebuilt, and only what changed (image, .env, compose file) is
recreated; --no-cache rebuilds everything from scratch.`,
  stop: `Usage: mfw stop

Stops the app and Qdrant and removes their containers. The volumes (memory,
wiki, CLI credentials) stay.`,
  restart: `Usage: mfw restart [--no-cache]

Like mfw start, but recreates the containers even when nothing changed: a
clean restart. --no-cache rebuilds everything from scratch.`,
  logs: `Usage: mfw logs [service]

Follows the logs of every service, or only of [service] (mercury, qdrant).`,
  repl: `Usage: mfw repl

Opens the dev REPL, a terminal conversation with the assistant, in a one-off
container. A running app isn't touched.`,
  shell: `Usage: mfw shell

Opens a shell in the app's container: the running one if the app is up,
otherwise a one-off container.`,
  vault: `Usage: mfw vault <command> [args]

Maintains the wiki vault, in a one-off container on the vault's volume.

  mfw vault list                                  every note
  mfw vault read <path>                           a note
  mfw vault grep <pattern>                        notes matching <pattern>
  mfw vault write-curated <path> [--author NAME]  writes a curated note, body from stdin
  mfw vault write-raw <path>                      writes raw material, body from stdin

Paths are vault-relative, as mfw vault list prints them (curated/…, raw/…).`,
  memory: `Usage: mfw memory <command> [args]

Reads Layer-3 memory on Qdrant, in a one-off container. Read-only.

  mfw memory list                          the collections and their points
  mfw memory read <collection> [--limit N]  a collection's points, newest first (default 20)`,
  reset: `Usage: mfw reset <memory|wiki>

Deletes for good what the assistant remembers: memory is every Qdrant
collection, wiki the whole vault. It asks you to type the app's name first
(a wrong answer deletes nothing), then brings the service back up empty.`,
};

const USAGE = `mfw, the Mercury command-line tool.

Usage: mfw <command> [args]

Creating an app:
  mfw create <folder> [options]   writes a new Mercury app

Operating an app (from inside its folder):
  mfw start [--no-cache]          builds and starts the app
  mfw stop                        stops it
  mfw restart [--no-cache]        rebuilds and restarts it
  mfw logs [service]              follows the logs
  mfw repl                        opens the dev REPL
  mfw shell                       opens a shell in the app's container
  mfw vault <command>             wiki vault maintenance
  mfw memory <command>            reads Layer-3 memory
  mfw reset <memory|wiki>         deletes memory or the wiki, after confirmation

mfw <command> --help describes a command.
`;

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
async function create(argv: string[]): Promise<number> {
  const args = parseCreateArgs(argv);
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
 * through `deps`. */
export async function main(
  argv: string[],
  { cwd = process.cwd(), deps }: { cwd?: string; deps?: AppDeps } = {},
): Promise<number> {
  const [command, ...rest] = argv;
  if (command === "--help" || command === "-h") {
    console.log(USAGE);
    return 0;
  }
  if (command === undefined) {
    console.error(USAGE);
    return 1;
  }
  const wantsHelp = rest.some((a) => a === "--help" || a === "-h");
  const appCommand = (APP_COMMANDS as readonly string[]).includes(command) ? (command as AppCommand) : undefined;
  if (command !== "create" && appCommand === undefined) {
    console.error(`Unknown command "${command}"\n\n${USAGE}`);
    return 1;
  }
  if (wantsHelp) {
    console.log(appCommand === undefined ? CREATE_HELP : APP_HELP[appCommand]);
    return 0;
  }
  try {
    if (appCommand === undefined) return await create(rest);
    return await runAppCommand(appCommand, rest, findApp(cwd), deps ?? terminalDeps());
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}
