# Test bed

Where a change to the framework or to a plugin gets tried live before it's published. The test bed creates an app with `mfw create`, as anyone would, and makes it install this repo's packages packed the way they'd go to npm instead of the registry's. From there it's a normal app (same Dockerfile, same compose file, the real credentials) that runs your unreleased code, and `mfw e2e` checks what its real model does with it.

What it isn't: CI. The apps it creates, the tests you write for them and their results stay out of git, because they depend on things that only exist on your machine: the Ollama instance and the model, what's in the app's wiki and memory, and the accounts its credentials reach. The repo keeps the scripts, this guide and [an example test](tests/example.e2e.ts), a template to copy and fill in with what your instance has.

## Table of contents

- [Before you start](#before-you-start)
- [Creating an app](#creating-an-app)
- [Its env file and credentials](#its-env-file-and-credentials)
- [Running it](#running-it)
- [The loop: change, repack, check](#the-loop-change-repack-check)
- [Writing a test](#writing-a-test)
- [Reading the results](#reading-the-results)
- [Starting over, removing an app](#starting-over-removing-an-app)

## Before you start

- Docker running.
- An Ollama-compatible endpoint the containers can reach, with the model you want to test pulled.
- The credentials of the services the app's plugins use, as their CLIs keep them (see [Its env file and credentials](#its-env-file-and-credentials)).
- `bun install` done at the repo's root.

Every command below runs from `apps/testbed`, unless it says it runs from the app's folder.

## Creating an app

```bash
bun run create prova --plugins jira --channels http
bun run create prova --from tests/example.e2e.ts
```

The app lands in `apps/prova`, which git ignores and which isn't a workspace of the repo: it installs from tarballs like any app would, not through links to the sources (a link would point outside the folder Docker builds from). `--plugins` and `--channels` take catalog ids, as `mfw create` does; `--from` takes them from what a test declares it needs.

What it runs, in order, so you can also run the steps yourself:

1. `bun run pack`: the type declarations of every package, then `bun pm pack` of each public workspace into `apps/testbed/.packs/`, the same way publishing packs them (`bun run pack --no-types` skips the declarations when only the runtime matters: an app's typecheck is what needs them);
2. this repo's `mfw create apps/prova … --no-install --yes`: the git repository is skipped on its own, since the folder is inside this one;
3. `mfw local-packages ../../.packs`, from the app's folder: the tarballs copied into the app's `.packs/`, an `overrides` per package in its `package.json` (transitive dependencies included), `bun install`.

## Its env file and credentials

From the app's folder, the env file starts from the example, which lists every variable the chosen plugins and channels read:

```bash
cp .env.example .env
```

Fill in `OLLAMA_MODEL`, `OLLAMA_HOST` when the endpoint isn't Ollama on this machine, and what each plugin asks for (`JIRA_SITE_URL` for Jira, for example).

A tool plugin's CLI credentials go in its `*_CLI_CONFIG_TAR_B64` variable, the CLI's config folder packed, which the container unpacks at its first start. Mind whose they are:

- `bunx mfw credentials set jira` packs `~/.config/jira-cli` of this machine: the account you logged into the CLI with, which may be yours rather than the bot's. The app then acts as that account, so `currentUser()` is you, and a comment it writes is yours.
- To use the same account as another app (the service account a deployed instance runs as), copy that app's line for the variable into this `.env`, or run `mfw credentials set jira --print` where its config folder is and paste the line.

A Google Chat channel needs its own Chat app's key (`bunx mfw google-chat set-key`, see the [channel's README](../../packages/channels/channel-google-chat/README.md)). Two apps on one subscription split the conversations, so a test bed app shouldn't use a deployed instance's subscription.

## Running it

Inside a test bed app, run `mfw` as `bunx mfw`. Bun then runs the app's own CLI, which is this repo's (it came in the tarballs). A global `mfw` at the same version number would run itself instead, and it doesn't have what's unreleased, `mfw e2e` included until it's published.

From the app's folder:

```bash
bunx mfw start
bunx mfw repl
bunx mfw e2e ../../tests/jira.e2e.ts
```

`bunx mfw start` builds the image with the tarballs (the Dockerfile copies `.packs/` before installing) and starts the app and its Qdrant. Each app has its own Docker volumes, named after its folder: its wiki, memory and credentials don't mix with other apps'.

## The loop: change, repack, check

1. Change the sources in the repo.
2. From `apps/testbed`: `bun run create prova`. On an app that exists it only packs and installs again: its config, persona and `.env` stay, and `--plugins`, `--channels` or `--from` given for it change nothing (it says so; `--fresh` makes the app anew with them).
3. From the app's folder: `bunx mfw start`, which rebuilds the image with the new packages.
4. `bunx mfw e2e ../../tests/<test>.e2e.ts`, or `bunx mfw repl` to look around by hand.

A change to the template (what `mfw create` writes) only shows up in a new app: `bun run create prova --fresh`.

## Writing a test

A test is a `*.e2e.ts` file: the plugins and channels the app needs, then cases of turns sent to the model with checks on the tool calls each turn made and on the answer. The format, the checks you can make and what can't be tested are in the CLI's README, under [`mfw e2e`](../cli/README.md#mfw-e2e-tests---repeat-n).

Start from the example, a template that runs nowhere as it is: copy it under another name in `tests/` (git ignores everything there but the example), for instance `tests/jira.e2e.ts`, and fill in the constants at its top with what the Jira your app reaches actually has (a project's name and key, part of a person's name and their full name). It's committed for one reason: the typecheck keeps it in step with the test format. Tests can also live in the app's own `e2e/` folder, where `bunx mfw e2e` without arguments finds them.

Prefer read-only cases. A case that changes an external system (creates an issue, assigns one, comments) cleans up after itself in `after`, with `cli`, which runs a command in the app's container outside the model.

## Reading the results

`bunx mfw e2e` prints every check of every run and exits 1 when a case didn't pass. Everything is kept in the app's `e2e/results/<time>/`:

- `report.json`: for each case, each run's turns (calls with their input and output, the answer, the seconds) and checks;
- `run-<n>-turn-<m>.json`: what the REPL's `/dump` wrote for each turn, the model's steps as the AI SDK reports them.

## Starting over, removing an app

`bun run create prova --fresh` removes `apps/prova` and creates it anew, `.env` included: keep a copy of the env file if you want it back. It's also the way out when a first `bun run create` stopped halfway: the folder it left counts as an app that exists, so a plain rerun would only install into it. The app's Docker volumes stay. To drop them too (wiki, memory, unpacked credentials), from the app's folder, before removing it:

```bash
bunx mfw stop
docker compose down -v
```

Removing an app for good is the same two commands, then deleting its folder.
