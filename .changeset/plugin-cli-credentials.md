---
"@mercury-fw/utils": minor
"@mercury-fw/core": minor
"@mercury-fw/cli": minor
"@mercury-fw/kit": minor
"@mercury-fw/plugin-jira": patch
"@mercury-fw/plugin-bitbucket": patch
"@mercury-fw/plugin-atlassian-admin": patch
---

- A plugin whose CLI keeps its login in a folder declares it in its `package.json` (`mercury.cliCredentials`): `{ folder }` under `~/.config`, the default, or `{ path }` anywhere else under the home. Any plugin's CLI gets the login mechanism, not only the first-party ones.
- The core unpacks each declared login from its env variable onto the credentials volume (`~/.config`) at startup, only when the folder isn't there yet, for the service and the REPL alike; a folder declared elsewhere in the home lives on the volume under `~/.config/mercury-home`, linked from its usual place. It warns about a declared folder with neither the folder nor the variable.
- `mfw credentials set|reset <plugin>` names the plugin by its package or its CLI's folder (`@mercury-fw/plugin-jira` or `jira-cli`), read from the app's installed plugins; the short name (`jira`) is no longer accepted, and reset asks for the folder's name.
- `mfw create` no longer writes `docker-entrypoint.sh` or the credentials variables in the env example, and always mounts the `cli-credentials` volume; an existing app's entrypoint keeps working alongside.
- The generated README explains how a plugin's CLI gets its login without listing plugins.
- jira, bitbucket and atlassian-admin declare their CLI's login folder; their READMEs point to `mfw credentials set`.
