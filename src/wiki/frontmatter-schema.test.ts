import { describe, it, expect } from "bun:test";
import { WikiFrontmatterSchema } from "./frontmatter-schema.ts";

describe("WikiFrontmatterSchema", () => {
  it("accepts a minimal curated frontmatter", () => {
    const result = WikiFrontmatterSchema.safeParse({ type: "curated" });
    expect(result.success).toBe(true);
  });

  it("accepts a curated frontmatter with author/last_updated", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "curated",
      author: "luca",
      last_updated: "2026-07-16",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid inferred frontmatter", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "medium",
      derived_from: ["ep_a1b2", "ep_c3d4"],
      last_reviewed: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects inferred frontmatter missing confidence", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      derived_from: ["ep_a1b2"],
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid confidence value", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "very-high",
      derived_from: ["ep_a1b2"],
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects inferred frontmatter with an empty derived_from", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "low",
      derived_from: [],
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown type value", () => {
    const result = WikiFrontmatterSchema.safeParse({ type: "seed" });
    expect(result.success).toBe(false);
  });

  it("rejects inferred frontmatter missing derived_from entirely", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "inferred",
      source: "agent",
      confidence: "low",
      last_reviewed: null,
    });
    expect(result.success).toBe(false);
  });

  // "resolved" is a third, distinct category from curated/inferred: a
  // deterministic fact fetched directly from an external API (e.g. a Chat
  // user id -> display name lookup), not human-authored (curated) and not
  // a probabilistic conversation-derived inference (inferred) — it has no
  // meaningful confidence/derived_from, but does need to know when/how it
  // was resolved.
  it("accepts a valid resolved frontmatter", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Luca Brognara",
    });
    expect(result.success).toBe(true);
  });

  it("rejects resolved frontmatter missing resolved_at", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      display_name: "Luca Brognara",
    });
    expect(result.success).toBe(false);
  });

  it("rejects resolved frontmatter missing display_name", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a resolved frontmatter with a source other than api", () => {
    const result = WikiFrontmatterSchema.safeParse({
      type: "resolved",
      source: "agent",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Luca Brognara",
    });
    expect(result.success).toBe(false);
  });
});
