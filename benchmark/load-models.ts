/**
 * Parses and validates `BENCH_MODELS` — the sole source of which models a
 * benchmark run covers, no checked-in default roster. Must be a JSON array
 * of `{tag, family, activeParamsB}`; fails fast on anything missing or
 * malformed instead of silently defaulting or filling in a placeholder,
 * since `family`/`activeParamsB` feed straight into
 * `results/analysis/stats.md`'s per-model breakdown. `.strict()` matches
 * `src/tools/cli-config-schema.ts`'s convention: an unrecognized field is a
 * typo, not something to tolerate silently.
 */
import { z } from "zod";

const ModelSpecSchema = z
  .object({
    tag: z.string().min(1),
    family: z.enum(["dense", "moe"]),
    activeParamsB: z.number().positive(),
  })
  .strict();

export type ModelSpec = z.infer<typeof ModelSpecSchema>;
export type ModelFamily = ModelSpec["family"];

const ModelRosterSchema = z.array(ModelSpecSchema).min(1);

export function loadModels(benchModelsEnv: string | undefined): ModelSpec[] {
  if (!benchModelsEnv) {
    throw new Error(
      'BENCH_MODELS is required: a JSON array of {"tag","family":"dense"|"moe","activeParamsB"}, e.g. \'[{"tag":"gemma4:31b","family":"dense","activeParamsB":31}]\'',
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(benchModelsEnv);
  } catch (err) {
    throw new Error(`BENCH_MODELS is not valid JSON: ${String(err)}`);
  }

  const result = ModelRosterSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`BENCH_MODELS failed validation: ${result.error.message}`);
  }
  return result.data;
}
