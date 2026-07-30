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
 * A fourth category: the lifecycle of one confirm-required action, from
 * staging through its eventual resolution — a deterministic instruction
 * the user explicitly approved via the confirmation-token mechanism,
 * never an autonomous LLM judgment call. Tracks a specific CLI action's
 * own token, written once when staged (`status: "pending"`) and
 * overwritten in place once resolved (`"confirmed"`/`"failed"`). Lives
 * outside `inferred/users/<userId>/` (see `wiki-read.ts`'s
 * `allowedRoots`) so it's structurally invisible to the model's own
 * `list_files`/`grep` — reachable only via the narrow `resolve_reference`
 * tool given the exact token (see `wiki-tools.ts`), never by browsing.
 */
export const ConfirmationFrontmatterSchema = z.object({
  type: z.literal("confirmation"),
  status: z.enum(["pending", "confirmed", "failed"]),
  requested_at: z.string(),
  resolved_at: z.string().nullable(),
  command: z.string(),
});

export type CuratedFrontmatter = z.infer<typeof CuratedFrontmatterSchema>;
export type InferredFrontmatter = z.infer<typeof InferredFrontmatterSchema>;
export type ConfirmationFrontmatter = z.infer<typeof ConfirmationFrontmatterSchema>;
