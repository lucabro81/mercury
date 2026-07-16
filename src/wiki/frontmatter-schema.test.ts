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
});
