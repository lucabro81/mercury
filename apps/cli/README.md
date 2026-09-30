# @mercury-fw/cli

`mfw`, the command-line tool of [Mercury](https://github.com/lucabro81/mercury-fw). For now it has one command, `mfw create`, which scaffolds a new app; operating an app (starting it, the REPL, memory maintenance) moves here next.

```bash
bunx @mercury-fw/cli create my-agent
```

or, the same thing under the `create` convention:

```bash
bun create mercury-agent my-agent
```

## `mfw create <folder>`

Writes a new Mercury app into `<folder>`, which has to be missing or empty; the folder's own name is turned into kebab case (`My Agent` becomes `my-agent`, the path above it stays as typed). Without flags it asks:

- the app name (the `name` in `package.json`, defaulting to the folder's);
- the assistant's name and role, which become `persona/identity.md` ("You are Hermes, the platform team's release assistant.") next to a `persona/tone.md` to edit;
- which channels and which tool plugins to include (none is fine: the REPL always works).

It writes the `mercury.config.ts` for that selection, the persona, the service and REPL entrypoints, a Dockerfile, a compose file with Qdrant, and an env example listing every variable the chosen pieces read. A plugin that hands over lists comes wrapped in the formatter with a starting rule, yours to change. Nothing is installed: run `bun install` in the new app.

| Flag | |
|---|---|
| `--name <name>` | The app name. |
| `--assistant-name <name>` | The assistant's name (default `Mercury`). |
| `--role <text>` | Completes "You are <name>, …" (default `an internal assistant`). |
| `--channels <ids>` | Comma-separated: `google-chat`, `http`. |
| `--plugins <ids>` | Comma-separated: `jira`, `bitbucket`, `atlassian-admin`. |
| `-y`, `--yes` | No questions: the flags, and the defaults for the rest. |

```bash
mfw create my-agent --assistant-name Hermes --channels http --plugins jira --yes
```

The framework packages get the CLI's own version (they're released together); each chosen plugin or channel gets its latest version on the registry, `https://registry.npmjs.org` unless `MFW_REGISTRY` names another.

MIT
