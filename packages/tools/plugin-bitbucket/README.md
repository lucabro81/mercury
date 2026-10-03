# @mercury-fw/plugin-bitbucket

Gives a [Mercury](https://github.com/lucabro81/mercury-fw) agent read-only access to Bitbucket pull requests (listing them, reading one), through the `bitbucket` CLI. The pinned binary downloads when the package installs.

```bash
bun add @mercury-fw/plugin-bitbucket
```

In the app: list it in `trustedDependencies` (or Bun skips the install script that downloads the binary) and declare it in `mercury.config.ts`:

```ts
import { bitbucketPlugin } from "@mercury-fw/plugin-bitbucket";

plugins: [bitbucketPlugin],
```

## Credentials

The CLI keeps its login under `~/.config/bitbucket-cli`, and the plugin declares that folder in its `package.json` (`mercury.cliCredentials`). Log in with the CLI's own setup (see [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo)) on your machine, then hand the folder to the app with `mfw credentials set bitbucket-cli`: it travels in the app's env file, and the app unpacks it onto its `cli-credentials` volume at the first start without that folder.

MIT
