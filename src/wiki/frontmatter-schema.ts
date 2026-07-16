/**
 * Frontmatter schema for wiki notes (D-34), based on Open Knowledge
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

export const WikiFrontmatterSchema = z.discriminatedUnion("type", [
  CuratedFrontmatterSchema,
  InferredFrontmatterSchema,
]);

export type CuratedFrontmatter = z.infer<typeof CuratedFrontmatterSchema>;
export type InferredFrontmatter = z.infer<typeof InferredFrontmatterSchema>;
export type WikiFrontmatter = z.infer<typeof WikiFrontmatterSchema>;
