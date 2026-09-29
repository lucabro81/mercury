#!/usr/bin/env bun
/**
 * The `mercury` command. One subcommand for now, `create <folder>`: writes a
 * new Mercury app from the template, asking what to put in it (or taking the
 * answers from flags with `--yes`). It only deposits the files; installing
 * comes once the packages are published.
 */
import { basename, resolve } from "node:path";
import { parseCreateArgs, type CreateArgs } from "./args.ts";
import { CATALOG } from "./catalog.ts";
import { renderApp, selectionError } from "./render.ts";
import { packageVersions } from "./versions.ts";
import { askAnswers, DEFAULT_ASSISTANT_NAME, DEFAULT_ROLE, type Answers } from "./wizard.ts";
import { targetError, writeApp } from "./write.ts";

const USAGE = `Usage:
  mercury create <folder> [options]

Writes a new Mercury app into <folder> (missing or empty).

Options:
  --name <name>              app name (default: the folder's name)
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

/** `mercury create`: returns the exit code. */
async function create(argv: string[]): Promise<number> {
  const args = parseCreateArgs(argv);
  const dir = resolve(args.dir);
  const defaultName = basename(dir);
  // What the command line already settles is checked before any question, so
  // the wizard is never answered for nothing.
  const early = targetError(dir) ?? selectionError(args.channels ?? [], args.plugins ?? []);
  if (early !== undefined) {
    throw new Error(early);
  }
  const answers = args.yes ? answersFromFlags(args, defaultName) : await askAnswers(args, defaultName);
  if (answers === undefined) {
    return 1;
  }
  const versions = packageVersions(["@mercury/core", "@mercury/formatter", ...CATALOG.map((e) => e.package)]);
  let files: Map<string, string>;
  try {
    files = renderApp({ ...answers, versions });
  } catch (err) {
    if (args.name === undefined && answers.name === defaultName && err instanceof Error && err.message.includes("app name")) {
      throw new Error(`${err.message}\nThe name comes from the folder; pass --name to choose another.`);
    }
    throw err;
  }
  writeApp(dir, files);
  console.log(`Created ${answers.name} in ${dir}

Next:
  cd ${args.dir}
  cp .env.example .env    # then fill it in
  docker compose up --build

The @mercury/* packages aren't published yet, so installing won't work until they are.`);
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
