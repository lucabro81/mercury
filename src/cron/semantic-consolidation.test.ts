import { describe, it, expect } from "bun:test";
import {
  consolidateSemanticFact,
  defaultConfidenceForCount,
  DEFAULT_CONSOLIDATION_K,
  type ConsolidationDeps,
} from "./semantic-consolidation.ts";
import type { SemanticFactEntry } from "../memory/semantic-facts-store.ts";

const VAULT = "/vault";
const NO_INCUMBENT = async () => {
  throw new Error("ENOENT");
};

function baseDeps(overrides: Partial<ConsolidationDeps>): ConsolidationDeps {
  return {
    vaultPath: VAULT,
    clusterFn: async () => [],
    readWikiFileFn: NO_INCUMBENT,
    writeInferredNoteFn: async () => {},
    k: 5,
    confidenceForCount: () => "medium",
    ...overrides,
  };
}

function entry(value: string, timestamp: string, topic = "preferred-language"): SemanticFactEntry {
  return { userId: "users/42", topic, value, timestamp };
}

describe("consolidateSemanticFact", () => {
  it("writes a new inferred note when no incumbent exists (first promotion)", async () => {
    let written: unknown;
    const deps = baseDeps({
      clusterFn: async () => [entry("italiano", "2026-07-20T09:00:00.000Z")],
      writeInferredNoteFn: async (vaultPath, userId, topic, fields, body) => {
        written = { vaultPath, userId, topic, fields, body };
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(written).toEqual({
      vaultPath: VAULT,
      userId: "users/42",
      topic: "preferred-language",
      fields: { confidence: "medium", derived_from: ["2026-07-20T09:00:00.000Z"], last_reviewed: expect.any(String) },
      body: "italiano",
    });
  });

  it("does not write when the challenger's count does not exceed the incumbent's (no update on a tie)", async () => {
    let writeCalls = 0;
    const deps = baseDeps({
      clusterFn: async () => [entry("italiano", "2026-07-20T09:00:00.000Z")],
      readWikiFileFn: async () =>
        [
          "---",
          "type: inferred",
          "source: agent",
          "confidence: medium",
          "derived_from:",
          "  - 2026-07-10T09:00:00.000Z",
          "last_reviewed: 2026-07-10T09:00:00.000Z",
          "---",
          "italiano",
        ].join("\n"),
      writeInferredNoteFn: async () => {
        writeCalls++;
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(writeCalls).toBe(0);
  });

  it("writes when the challenger's count exceeds the incumbent's stored count", async () => {
    let written: unknown;
    const deps = baseDeps({
      clusterFn: async () => [
        entry("inglese", "2026-07-18T09:00:00.000Z"),
        entry("inglese", "2026-07-19T09:00:00.000Z"),
      ],
      readWikiFileFn: async () =>
        [
          "---",
          "type: inferred",
          "source: agent",
          "confidence: low",
          "derived_from:",
          "  - 2026-07-01T09:00:00.000Z",
          "last_reviewed: 2026-07-01T09:00:00.000Z",
          "---",
          "italiano",
        ].join("\n"),
      writeInferredNoteFn: async (vaultPath, userId, topic, fields, body) => {
        written = { vaultPath, userId, topic, fields, body };
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(written).toEqual({
      vaultPath: VAULT,
      userId: "users/42",
      topic: "preferred-language",
      fields: {
        confidence: "medium",
        derived_from: ["2026-07-18T09:00:00.000Z", "2026-07-19T09:00:00.000Z"],
        last_reviewed: expect.any(String),
      },
      body: "inglese",
    });
  });

  it("does nothing when the cluster is empty", async () => {
    let writeCalls = 0;
    const deps = baseDeps({
      clusterFn: async () => [],
      writeInferredNoteFn: async () => {
        writeCalls++;
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(writeCalls).toBe(0);
  });

  it("does nothing when there's a tie for the most common value — no clear dominant value this round", async () => {
    let writeCalls = 0;
    const deps = baseDeps({
      clusterFn: async () => [
        entry("italiano", "2026-07-18T09:00:00.000Z"),
        entry("inglese", "2026-07-19T09:00:00.000Z"),
      ],
      writeInferredNoteFn: async () => {
        writeCalls++;
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(writeCalls).toBe(0);
  });

  // The cluster search is similarity-based (see searchSemanticFactsByTopic),
  // so it can surface near-topic noise ("team" vs "current-team") that
  // normalization alone doesn't dedupe — filtering to an exact topic match
  // before counting is what keeps the count honest.
  it("ignores cluster entries whose topic isn't an exact match, even if the search returned them", async () => {
    let written: unknown;
    const deps = baseDeps({
      clusterFn: async () => [
        entry("italiano", "2026-07-20T09:00:00.000Z", "preferred-language"),
        entry("platform", "2026-07-20T09:00:00.000Z", "current-team"),
      ],
      writeInferredNoteFn: async (vaultPath, userId, topic, fields, body) => {
        written = { vaultPath, userId, topic, fields, body };
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect((written as { body: string }).body).toBe("italiano");
    expect((written as { fields: { derived_from: string[] } }).fields.derived_from).toEqual([
      "2026-07-20T09:00:00.000Z",
    ]);
  });

  it("passes confidenceForCount(dominantCount, k) through to the frontmatter", async () => {
    let receivedArgs: [number, number] | undefined;
    const deps = baseDeps({
      clusterFn: async () => [entry("italiano", "2026-07-20T09:00:00.000Z")],
      confidenceForCount: (count, k) => {
        receivedArgs = [count, k];
        return "high";
      },
      k: 7,
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(receivedArgs).toEqual([1, 7]);
  });

  it("works correctly when the cluster has fewer than k entries (window not yet full)", async () => {
    let written: unknown;
    const deps = baseDeps({
      k: 10,
      clusterFn: async () => [entry("italiano", "2026-07-20T09:00:00.000Z")],
      writeInferredNoteFn: async (vaultPath, userId, topic, fields, body) => {
        written = { vaultPath, userId, topic, fields, body };
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect((written as { body: string }).body).toBe("italiano");
  });

  it("requests the cluster scoped to k", async () => {
    let receivedLimit: number | undefined;
    const deps = baseDeps({
      k: 12,
      clusterFn: async (_userId, _topic, limit) => {
        receivedLimit = limit;
        return [];
      },
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(receivedLimit).toBe(12);
  });

  it("falls back to DEFAULT_CONSOLIDATION_K when k isn't provided", async () => {
    let receivedLimit: number | undefined;
    const deps = baseDeps({
      clusterFn: async (_userId, _topic, limit) => {
        receivedLimit = limit;
        return [];
      },
      k: undefined as unknown as number,
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect(receivedLimit).toBe(DEFAULT_CONSOLIDATION_K);
  });

  it("falls back to defaultConfidenceForCount when confidenceForCount isn't provided", async () => {
    let written: unknown;
    const deps = baseDeps({
      clusterFn: async () => [entry("italiano", "2026-07-20T09:00:00.000Z")],
      writeInferredNoteFn: async (vaultPath, userId, topic, fields, body) => {
        written = { fields, body };
      },
      confidenceForCount: undefined as unknown as ConsolidationDeps["confidenceForCount"],
    });

    await consolidateSemanticFact("users/42", "preferred-language", deps);

    expect((written as { fields: { confidence: string } }).fields.confidence).toBe(
      defaultConfidenceForCount(1, DEFAULT_CONSOLIDATION_K),
    );
  });
});

describe("defaultConfidenceForCount", () => {
  it("is low on a single, unconfirmed occurrence", () => {
    expect(defaultConfidenceForCount(1, 5)).toBe("low");
  });

  it("is medium once repeated but the window isn't unanimous", () => {
    expect(defaultConfidenceForCount(3, 5)).toBe("medium");
  });

  it("is high once the dominant value fills the whole tracked window", () => {
    expect(defaultConfidenceForCount(5, 5)).toBe("high");
  });
});
