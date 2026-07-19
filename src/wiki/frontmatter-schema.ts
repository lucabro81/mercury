/**
 * Frontmatter schema for wiki notes, based on Open Knowledge
 * Format (OKF — https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing):
 * `type` is the only field OKF mandates; `source`/`confidence`/
 * `derived_from`/`last_reviewed` are Mercury-specific extensions, the
 * kind OKF explicitly leaves to the producer. `curated` and `inferred`
 * are validated as separate shapes (discriminated on `type`) because
 * only `inferred` notes carry provenance — a curated doc has no
 * meaningful `confidence` or `derived_from`.
 */
import { z } from "zod";

export const CuratedFrontmatterSchema = z.object({
  type: z.literal("curated"),
  author: z.string().optional(),
  last_updated: z.string().optional(),
});

export const InferredFrontmatterSchema = z.object({
  type: z.literal("inferred"),
  source: z.literal("agent"),
  confidence: z.enum(["low", "medium", "high"]),
  derived_from: z.array(z.string()).min(1),
  last_reviewed: z.string().nullable(),
});

/**
 * A third category, distinct from both curated (human-authored) and
 * inferred (probabilistic, conversation-derived, D-22's consolidation
 * engine only): a deterministic fact fetched directly from an external
 * API — e.g. resolving a Google Chat user id to a display name. No
 * meaningful `confidence` or `derived_from` (it isn't an inference), but
 * needs `resolved_at` to know when it was looked up.
 */
export const ResolvedFrontmatterSchema = z.object({
  type: z.literal("resolved"),
  source: z.literal("api"),
  resolved_at: z.string(),
  display_name: z.string(),
});

export const WikiFrontmatterSchema = z.discriminatedUnion("type", [
  CuratedFrontmatterSchema,
  InferredFrontmatterSchema,
  ResolvedFrontmatterSchema,
]);

export type CuratedFrontmatter = z.infer<typeof CuratedFrontmatterSchema>;
export type InferredFrontmatter = z.infer<typeof InferredFrontmatterSchema>;
export type ResolvedFrontmatter = z.infer<typeof ResolvedFrontmatterSchema>;
export type WikiFrontmatter = z.infer<typeof WikiFrontmatterSchema>;
