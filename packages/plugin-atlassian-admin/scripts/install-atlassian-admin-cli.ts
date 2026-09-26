/**
 * postinstall hook for @mercury/plugin-atlassian-admin: downloads the pinned
 * atlassian-admin CLI binary for the current platform into this package's
 * `bin/`. Identical in shape to the Jira/Bitbucket plugins' — the mechanism
 * lives in `@mercury/utils`; this script only names the pin (its own
 * package.json's `mercury.cliBinary`) and where to write it (`import.meta.url`).
 */
import { downloadPinnedBinary } from "@mercury/utils";
import pkg from "../package.json";

await downloadPinnedBinary(pkg, import.meta.url);
