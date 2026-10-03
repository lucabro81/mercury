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

The CLI keeps its login under `~/.config/atlassian-admin-cli`, which in a container lives on the `cli-credentials` volume. Log in with the CLI's own setup (see [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo)), then bring that folder into the volume; doing it from the env file is planned ([#57](https://github.com/lucabro81/mercury-fw/issues/57)).

MIT
