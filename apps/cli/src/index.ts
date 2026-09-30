#!/usr/bin/env bun
/**
 * The `mfw` command. One subcommand for now, `create <folder>`: writes a
 * new Mercury app from the template, asking what to put in it (or taking the
 * answers from flags with `--yes`). It only deposits the files; installing
 * comes once the packages are published.
 */
import { basename, dirname, join, resolve } from "node:path";
import { parseCreateArgs, type CreateArgs } from "./args.ts";
import { CATALOG } from "./catalog.ts";
import { kebabCase } from "./naming.ts";
import { renderApp, selectionError } from "./render.ts";
import { packageVersions } from "./versions.ts";
import { askAnswers, DEFAULT_ASSISTANT_NAME, DEFAULT_ROLE, type Answers } from "./wizard.ts";
import { targetError, writeApp } from "./write.ts";

const USAGE = `Usage:
  mfw create <folder> [options]

Writes a new Mercury app into <folder> (missing or empty), its name in kebab case.

Options:
  --name <name>              app name, as in package.json (default: the folder's name)
  --assistant-name <name>    the assistant's name (default: ${DEFAULT_ASSISTANT_NAME})
  --role <text>              completes "You are <name>, …" (default: ${DEFAULT_ROLE})
  --channels <ids>           comma-separated: ${CATALOG.filter((e) => e.kind === "channel").map((e) => e.id).join(", ")}
  --plugins <ids>            comma-separated: ${CATALOG.filter((e) => e.kind === "tool").map((e) => e.id).join(", ")}
  -y, --yes                  don't ask: use the flags and the defaults
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
  const versions = packageVersions(["@mercury-fw/core", "@mercury-fw/formatter", ...CATALOG.map((e) => e.package)]);
  writeApp(dir, renderApp({ ...answers, versions }));
  console.log(`Created ${answers.name} in ${dir}

Next:
  cd ${dir}
  cp .env.example .env    # then fill it in
  docker compose up --build

The @mercury-fw/* packages aren't published yet, so installing won't work until they are.`);
  return 0;
}

/** Dispatches the subcommand; returns the exit code. */
async function main(argv: string[]): Promise<number> {
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

process.exit(await main(process.argv.slice(2)));
