import { describe, it, expect } from "bun:test";
import { CuratedFrontmatterSchema, InferredFrontmatterSchema, ResolvedFrontmatterSchema } from "./frontmatter-schema.ts";

describe("CuratedFrontmatterSchema", () => {
  it("accepts a minimal curated frontmatter", () => {
    const result = CuratedFrontmatterSchema.safeParse({ type: "curated" });
    expect(result.success).toBe(true);
  });

  it("accepts a curated frontmatter with author/last_updated", () => {
    const result = CuratedFrontmatterSchema.safeParse({
      type: "curated",
      author: "luca",
      last_updated: "2026-07-16",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a frontmatter with the wrong type literal", () => {
    const result = CuratedFrontmatterSchema.safeParse({ type: "seed" });
    expect(result.success).toBe(false);
  });
});

describe("InferredFrontmatterSchema", () => {
  it("accepts a valid inferred frontmatter", () => {
    const result = InferredFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "medium",
      derived_from: ["ep_a1b2", "ep_c3d4"],
      last_reviewed: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects inferred frontmatter missing confidence", () => {
    const result = InferredFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      derived_from: ["ep_a1b2"],
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid confidence value", () => {
    const result = InferredFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "very-high",
      derived_from: ["ep_a1b2"],
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects inferred frontmatter with an empty derived_from", () => {
    const result = InferredFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "low",
      derived_from: [],
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects inferred frontmatter missing derived_from entirely", () => {
    const result = InferredFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "low",
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });
});

// "resolved" is a third, distinct category from curated/inferred: a
// deterministic fact fetched directly from an external API (e.g. a Chat
// user id -> display name lookup), not human-authored (curated) and not
// a probabilistic conversation-derived inference (inferred) — it has no
// meaningful confidence/derived_from, but does need to know when/how it
// was resolved.
describe("ResolvedFrontmatterSchema", () => {
  it("accepts a valid resolved frontmatter with an email", () => {
    const result = ResolvedFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Luca Brognara",
      email: "luca@comperio.local",
    });
    expect(result.success).toBe(true);
  });

  // Not every People API profile exposes an email (scopes, privacy) —
  // null is a legitimate outcome, distinct from the key being absent.
  it("accepts a valid resolved frontmatter with a null email", () => {
    const result = ResolvedFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Luca Brognara",
      email: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects resolved frontmatter missing email entirely", () => {
    const result = ResolvedFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Luca Brognara",
    });
    expect(result.success).toBe(false);
  });

  it("rejects resolved frontmatter missing resolved_at", () => {
    const result = ResolvedFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      display_name: "Luca Brognara",
      email: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects resolved frontmatter missing display_name", () => {
    const result = ResolvedFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      email: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a resolved frontmatter with a source other than api", () => {
    const result = ResolvedFrontmatterSchema.safeParse({
      type: "resolved",
      source: "agent",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Luca Brognara",
      email: null,
    });
    expect(result.success).toBe(false);
  });
});
