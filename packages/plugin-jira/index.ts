/**
 * The Jira plugin's public surface. For now it is exactly one thing: the
 * command allowlist Mercury's core validates and turns into `runCommand`'s
 * permitted-prefix set. The core owns the schema and the validation (see
 * `loadCliConfigFromObject` in `apps/mercury/src/tools/cli-config-loader.ts`);
 * the plugin owns the data. This is the first piece of Jira to leave the core
 * — the allowlist used to be a maintainer-authored file scanned out of a
 * config directory (`cli-configs/jira.json`, bind-mounted at runtime); it is
 * now a versioned asset that travels with the plugin package.
 */
import rawConfig from "./jira.json";

/** The raw, unvalidated allowlist object. Handed to the core as data — the
 * core runs the same `.strict()` Zod barrier over it that it runs over any
 * file-based CLI config, so nothing here reaches the model's executable
 * surface unvalidated. */
export const jiraCliConfig: unknown = rawConfig;
