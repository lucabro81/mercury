/**
 * Zod schema for the externally-configured, maintainer-authored CLI
 * config file (e.g. `cli-configs/jira.json`), consumed by
 * `src/tools/cli-config-loader.ts`. Kept in its own module, separate
 * from the loader, so the schema itself is unit-testable without any
 * file I/O.
 *
 * `.strict()` on every object level: a maintainer typo (e.g.
 * `"prefixes"` instead of `"prefix"`) must fail validation loudly, not
 * silently pass through as an ignored extra key — the whole point of
 * this schema is to be the one thing standing between a maintainer's
 * config and what the model can execute, so silent tolerance of
 * malformed input is exactly what it must not do.
 */
import { z } from "zod";

export const CliCommandSchema = z
  .object({
    prefix: z.array(z.string().min(1)).min(1),
    confirm: z.boolean(),
  })
  .strict();

export const CliGlobalFlagSchema = z
  .object({
    flag: z.string().min(1),
    takesValue: z.boolean(),
  })
  .strict();

export const CliConfigFileSchema = z
  .object({
    binary: z.string().min(1),
    minVersion: z.string().min(1).optional(),
    commands: z.array(CliCommandSchema).min(1),
    globalFlags: z.array(CliGlobalFlagSchema).optional(),
  })
  .strict();

export type CliConfigFile = z.infer<typeof CliConfigFileSchema>;
