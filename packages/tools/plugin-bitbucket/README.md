# @mercury-fw/plugin-bitbucket

Gives a [Mercury](https://github.com/lucabro81/mercury-fw) agent read-only access to Bitbucket pull requests (listing them, reading one), through the `bitbucket` CLI. The pinned binary downloads when the package installs.

```bash
bun add @mercury-fw/plugin-bitbucket
```

In the app: list it in `trustedDependencies` (or Bun skips the install script that downloads the binary), add `bitbucket` to `MERCURY_CLIS`, and declare it in `mercury.config.ts`:

```ts
import { bitbucketPlugin } from "@mercury-fw/plugin-bitbucket";

plugins: [bitbucketPlugin],
```

## Credentials

The CLI keeps its login under `~/.config/bitbucket-cli`, which in a container lives on the `cli-credentials` volume. Log in with the CLI's own setup (see [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo)), then bring that folder into the volume; doing it from the env file is planned ([#57](https://github.com/lucabro81/mercury-fw/issues/57)).

MIT
