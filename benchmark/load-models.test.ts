import { describe, it, expect } from "bun:test";
import { loadModels } from "./load-models.ts";

describe("loadModels", () => {
  it("parses a valid JSON array into typed ModelSpecs", () => {
    const models = loadModels(
      '[{"tag":"gemma4:31b","family":"dense","activeParamsB":31},{"tag":"qwen3.5:35b-a3b","family":"moe","activeParamsB":3}]',
    );

    expect(models).toEqual([
      { tag: "gemma4:31b", family: "dense", activeParamsB: 31 },
      { tag: "qwen3.5:35b-a3b", family: "moe", activeParamsB: 3 },
    ]);
  });

  // Guards against silently running with no models declared at all — the
  // whole point of dropping the checked-in default roster.
  it("throws when BENCH_MODELS is unset", () => {
    expect(() => loadModels(undefined)).toThrow(/BENCH_MODELS is required/);
  });

  it("throws when BENCH_MODELS is not valid JSON", () => {
    expect(() => loadModels("not json")).toThrow(/not valid JSON/);
  });

  it("throws when the array is empty", () => {
    expect(() => loadModels("[]")).toThrow();
  });

  it("throws when a model is missing activeParamsB", () => {
    expect(() => loadModels('[{"tag":"gemma4:31b","family":"dense"}]')).toThrow();
  });

  it("throws on a family value outside dense/moe", () => {
    expect(() => loadModels('[{"tag":"gemma4:31b","family":"tiny","activeParamsB":31}]')).toThrow();
  });

  // Guards against a typo'd field name (e.g. "activeParams") silently
  // getting dropped instead of failing — same rationale as
  // src/tools/cli-config-schema.ts's .strict() on every object level.
  it("throws on an unrecognized extra field", () => {
    expect(() =>
      loadModels('[{"tag":"gemma4:31b","family":"dense","activeParamsB":31,"quant":"q4"}]'),
    ).toThrow();
  });
});
