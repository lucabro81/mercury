/**
 * Admin panel's Model tab (Ollama host/model/context-length/reachability)
 * and the self+dependency health check that stands in for "container
 * status" (see plan §5 — no Docker socket access, so this is Mercury's
 * own process plus its two real dependencies, not `docker compose ps`).
 */
import { getLoadedContextLength } from "../model/context-size.ts";

type OllamaTagsResponse = { models?: Array<{ name: string }> };

/** Live model names Ollama actually has pulled, or `null` if the host isn't reachable. */
export async function getAvailableModels(host: string, fetchFn: typeof fetch = fetch): Promise<string[] | null> {
  try {
    const response = await fetchFn(`${host}/api/tags`);
    if (!response.ok) return null;
    const data = (await response.json()) as OllamaTagsResponse;
    return data.models?.map((m) => m.name) ?? [];
  } catch {
    return null;
  }
}

export type ModelStatus = {
  host: string;
  model: string;
  contextLength: number | null;
  availableModels: string[] | null;
};

export async function getModelStatus(
  host: string,
  model: string,
  fetchFn: typeof fetch = fetch,
): Promise<ModelStatus> {
  // getLoadedContextLength (unlike getAvailableModels) doesn't catch its own
  // fetch failures — an unreachable host makes it throw, which would
  // otherwise take the whole status endpoint down with it.
  const [contextLength, availableModels] = await Promise.all([
    getLoadedContextLength(host, model, fetchFn).catch(() => null),
    getAvailableModels(host, fetchFn),
  ]);
  return { host, model, contextLength, availableModels };
}

export type SelfHealth = {
  uptimeSeconds: number;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  qdrantReachable: boolean;
  ollamaReachable: boolean;
};

export async function getSelfHealth(deps: {
  qdrant: { getCollections(): Promise<unknown> };
  ollamaHost: string;
  fetchFn?: typeof fetch;
}): Promise<SelfHealth> {
  const [qdrantReachable, availableModels] = await Promise.all([
    deps.qdrant
      .getCollections()
      .then(() => true)
      .catch(() => false),
    getAvailableModels(deps.ollamaHost, deps.fetchFn),
  ]);
  const memory = process.memoryUsage();
  return {
    uptimeSeconds: process.uptime(),
    memory: { rss: memory.rss, heapUsed: memory.heapUsed, heapTotal: memory.heapTotal },
    qdrantReachable,
    ollamaReachable: availableModels !== null,
  };
}
