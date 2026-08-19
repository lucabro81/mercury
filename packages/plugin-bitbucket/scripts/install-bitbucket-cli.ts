/**
 * postinstall hook for @mercury/plugin-bitbucket: downloads the pinned bitbucket
 * CLI binary for the current platform into this package's `bin/`. Identical in
 * shape to the Jira plugin's — the mechanism lives in `@mercury/utils`; this
 * script only names the pin (its own package.json's `mercury.cliBinary`) and
 * where to write it (`import.meta.url`). The Dockerfile symlinks the downloaded
 * binary onto PATH so `runCommand` can spawn `bitbucket` by name.
 */
import { downloadPinnedBinary } from "@mercury/utils";
import pkg from "../package.json";

await downloadPinnedBinary(pkg, import.meta.url);
