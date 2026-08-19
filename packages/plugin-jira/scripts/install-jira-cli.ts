/**
 * postinstall hook for @mercury/plugin-jira: downloads the pinned jira CLI
 * binary for the current platform into this package's `bin/`. Runs
 * automatically on `bun install` — on the host during development (a native
 * macos-arm64 binary) and inside the Docker build (linux). The Dockerfile then
 * symlinks each plugin's downloaded bin contents onto PATH so `runCommand` can
 * spawn `jira` by name.
 *
 * The mechanism (pinned version, Bun `fetch`, no curl/jq) is shared across
 * plugins in `@mercury/utils`; this script only names the pin (its own
 * package.json's `mercury.cliBinary`) and where to write it (`import.meta.url`).
 */
import { downloadPinnedBinary } from "@mercury/utils";
import pkg from "../package.json";

await downloadPinnedBinary(pkg, import.meta.url);
