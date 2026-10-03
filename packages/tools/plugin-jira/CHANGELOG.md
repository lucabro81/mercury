# @mercury-fw/plugin-jira

## 0.4.3

### Patch Changes

- a493d9b: - A plugin whose CLI keeps its login in a folder declares it in its `package.json` (`mercury.cliCredentials`): `{ folder }` under `~/.config`, the default, or `{ path }` anywhere else under the home. Any plugin's CLI gets the login mechanism, not only the first-party ones.
  - The core unpacks each declared login from its env variable onto the credentials volume (`~/.config`) at startup, only when the folder isn't there yet, for the service and the REPL alike; a folder declared elsewhere in the home lives on the volume under `~/.config/mercury-home`, linked from its usual place. It warns about a declared folder with neither the folder nor the variable.
  - `mfw credentials set|reset <plugin>` names the plugin by its package or its CLI's folder (`@mercury-fw/plugin-jira` or `jira-cli`), read from the app's installed plugins; the short name (`jira`) is no longer accepted, and reset asks for the folder's name.
  - `mfw create` no longer writes `docker-entrypoint.sh` or the credentials variables in the env example, and always mounts the `cli-credentials` volume; an existing app's entrypoint keeps working alongside.
  - The generated README explains how a plugin's CLI gets its login without listing plugins.
  - jira, bitbucket and atlassian-admin declare their CLI's login folder; their READMEs point to `mfw credentials set`.

## 0.4.2

### Patch Changes

- 1fa3a97: - Every tool plugin declared in `mercury.config.ts` loads: `MERCURY_CLIS` is no longer read. An app that used it to keep a declared plugin off now gets that plugin on; remove the plugin from the config instead.
  - A new app's env example has no `MERCURY_CLIS`, and its config's comment says every declared plugin and channel is active.
  - A plugin caught in a dependency cycle is always reported at startup.
  - The plugins' READMEs no longer ask to list them in `MERCURY_CLIS`.

## 0.4.1

### Patch Changes

- 9a6bec5: - For a project named informally, the skill has the model search the wiki for the name instead of reading a fixed file a new app doesn't have, then look the project up in Jira.

## 0.4.0

### Minor Changes

- 587a4f7: - The agent can look up Jira users (`user search`) and projects (`project search`).
  - The agent can assign and unassign an issue (`issue assign`), without confirmation like the other edits.
  - The skill shows how to get the account ID that assigning and mentioning in a comment need, and that JQL filters by display name without it.

## 0.3.1

### Patch Changes

- 8df4840: - Installs jira CLI 0.8.2, whose `issue search --help` no longer suggests `currentUser()`.

## 0.3.0

### Minor Changes

- bd643ab: - `JIRA_SITE_URL` is required: without it the plugin doesn't load, and the startup log says which variable to set.
  - Every search result carries `issueCount` and the notes for the model, since the extractor is always there.

## 0.2.1

### Patch Changes

- 0c85d4a: - Installs jira CLI 0.8.1, whose `--help` examples all carry `--select`.
  - The skill no longer warns that the `--help` examples omit `--select`.

## 0.2.0

### Minor Changes

- 1a7d9d2: - The Jira skill gives a working `--select` for every read command: the list select for `issue search`, one for `issue get` and `issue transitions`, and how to count and paginate.
  - The skill no longer says to retry without `--select` or to rely on `--fields`, both refused by the `jira` CLI.
  - When a search result can't be formatted as a list, the note names the exact `--select` to rerun it with.
  - A search that selects issues without their summary (a count, an existence check) returns its data with a note instead of an error.
  - An `issue search` result with an `issues` array carries `issueCount`, the number of issues on that page, and the skill tells the model to read it instead of counting.

## 0.1.2

### Patch Changes

- 60916cb: - The wiki vault's automated commits are authored as `Mercury <mercury@mercury.local>`. Commits written before keep their old address; `git log --author=Mercury` matches both.
  - The Jira issue-list extractor's docs use a generic example site.

## 0.1.1

### Patch Changes

- 0c5bb5b: Dependencies at their latest minor: `ai` 7.0.126, `ai-sdk-ollama` 4.4.0, `zod` 4.6.5, `yaml` 2.9.1, `shell-quote` 1.11.0. A new app from `mfw create` runs Qdrant on its `v1` tag, which follows every 1.x release, instead of a fixed 1.19.0, and gets `@types/bun` `^1.4.2`.
