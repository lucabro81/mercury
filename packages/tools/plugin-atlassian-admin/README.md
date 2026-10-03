# @mercury-fw/plugin-atlassian-admin

Lets a [Mercury](https://github.com/lucabro81/mercury-fw) agent look up users in an Atlassian organization, through the `atlassian-admin` CLI (read-only). The pinned binary downloads when the package installs.

```bash
bun add @mercury-fw/plugin-atlassian-admin
```

In the app: list it in `trustedDependencies` (or Bun skips the install script that downloads the binary) and declare it in `mercury.config.ts`:

```ts
import { atlassianAdminPlugin } from "@mercury-fw/plugin-atlassian-admin";

plugins: [atlassianAdminPlugin],
```

## Credentials

The CLI keeps its login under `~/.config/atlassian-admin-cli`, and the plugin declares that folder in its `package.json` (`mercury.cliCredentials`). Log in with the CLI's own setup (see [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo)) on your machine, then hand the folder to the app with `mfw credentials set atlassian-admin-cli`: it travels in the app's env file, and the app unpacks it onto its `cli-credentials` volume at the first start without that folder.

MIT
