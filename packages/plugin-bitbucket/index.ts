/**
 * The Bitbucket plugin — the second plugin, and the one that validates the
 * `@mercury/plugin-types` contract wasn't quietly Jira-shaped. Bitbucket is the
 * minimal case: a read-only CLI (pr list/get, doctor, auth whoami — no
 * mutating or confirm-gated commands), with no result post-processing, no
 * post-turn guard, and no prompt block of its own (the generic runCommand +
 * `--help` guidance in the system prompt covers it). So the whole plugin is a
 * `name`, an `apiVersion`, and the raw allowlist — `build` and
 * `systemPromptFragment` stay unset, both already optional on `Plugin`. That it
 * fits without widening the interface is the point.
 *
 * Its allowlist (`bitbucket.json`) and its pinned CLI binary (via the package's
 * postinstall, using `@mercury/utils`) travel with the package, exactly like
 * the Jira plugin's do.
 */
import { PLUGIN_API_VERSION, type Plugin } from "@mercury/plugin-types";
import rawConfig from "./bitbucket.json";

/** The raw, unvalidated allowlist object. Handed to the core as data — the core
 * runs the same `.strict()` Zod barrier over it that it runs over any file-based
 * CLI config, so nothing here reaches the model's executable surface
 * unvalidated. */
export const bitbucketCliConfig: unknown = rawConfig;

export const bitbucketPlugin: Plugin = {
  apiVersion: PLUGIN_API_VERSION,
  name: "bitbucket",
  cliConfig: bitbucketCliConfig,
};
