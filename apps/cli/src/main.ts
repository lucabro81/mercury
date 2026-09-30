/**
 * The `mfw` command. One subcommand for now, `create <folder>`: writes a
 * new Mercury app from the template, asking what to put in it (or taking the
 * answers from flags with `--yes`). It writes the files; `bun install` in the
 * new app is left to the user.
 */
import { basename, dirname, join, resolve } from "node:path";
import { parseCreateArgs, type CreateArgs } from "./args.ts";
import { CATALOG } from "./catalog.ts";
import { kebabCase } from "./naming.ts";
import { renderApp, selectionError } from "./render.ts";
import { appVersions, DEFAULT_REGISTRY } from "./versions.ts";
import { askAnswers, DEFAULT_ASSISTANT_NAME, DEFAULT_ROLE, type Answers } from "./wizard.ts";
import { targetError, writeApp } from "./write.ts";

const USAGE = `mfw, the Mercury command-line tool.

Usage:
  mfw create <folder> [options]

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
  const versions = await appVersions(chosen, { registry: process.env.MFW_REGISTRY ?? DEFAULT_REGISTRY });
  writeApp(dir, renderApp({ ...answers, versions }));
  console.log(`Created ${answers.name} in ${dir}

Next:
  cd ${dir}
  bun install
  cp .env.example .env    # then fill it in
  docker compose up --build`);
  return 0;
}

/** Runs `mfw` with `argv` (the arguments after the command name) and returns
 * the exit code, printing to stdout/stderr. `bin.ts` and `create-mercury-fw`
 * both call it. */
export async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (command === "--help" || command === "-h") {
    console.log(USAGE);
    return 0;
  }
  if (command === undefined) {
    console.error(USAGE);
    return 1;
  }
  if (command === "create" && rest.some((a) => a === "--help" || a === "-h")) {
    console.log(USAGE);
    return 0;
  }
  if (command !== "create") {
    console.error(`Unknown command "${command}"\n\n${USAGE}`);
    return 1;
  }
  try {
    return await create(rest);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}
