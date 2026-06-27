/**
 * Queries Ollama directly (its native HTTP API, not the AI SDK — which
 * has no concept of this) for the real context window size the running
 * model is currently loaded with.
 *
 * Why this exists, instead of just reading the model's architectural max
 * context length (available via `/api/show`'s `model_info`): Ollama can
 * load a model with a smaller effective context window than what the
 * model architecture supports (e.g. capped by `OLLAMA_CONTEXT_LENGTH` on
 * the server, or a per-request `num_ctx`), so the architectural max can
 * overstate what's actually usable. `/api/ps` reports what's actually
 * loaded right now — verified live against a real Ollama server (GB10,
 * qwen3.5:35b): it loaded with the full architectural context (262144),
 * but that's specific to this deployment's configuration, not something
 * to assume in general.
 *
 * Used by: `src/index.ts`, to show a real (not estimated) context-usage
 * indicator next to the terminal prompt — see `src/router/tool-log.ts`'s
 * `formatContextUsage`.
 */

/**
 * Returns the context length Ollama has the given model loaded with
 * right now, or `null` if that model isn't currently loaded (e.g. before
 * its first use this process) — `/api/ps` only lists loaded models, so
 * there's nothing to report yet. Querying again after the model has
 * been used at least once will find it.
 *
 * @param fetchFn - Test seam; defaults to the real global `fetch`.
 */
export async function getLoadedContextLength(
  host: string,
  model: string,
  fetchFn: typeof fetch = fetch,
): Promise<number | null> {
  const response = await fetchFn(`${host}/api/ps`);
  const data = (await response.json()) as {
    models?: Array<{ model: string; context_length?: number }>;
  };
  const entry = data.models?.find((m) => m.model === model);
  return entry?.context_length ?? null;
}
