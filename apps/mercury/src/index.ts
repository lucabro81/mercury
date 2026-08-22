/**
 * Composition root: wires the model, the per-CLI tools this instance
 * has enabled, and the channels (terminal always, Google Chat if
 * configured) into running conversations.
 *
 * This is the only file that decides which tools actually exist on
 * this instance — `runCommand` only if `loadActiveCliConfigs` (see
 * `src/tools/cli-config-loader.ts`) successfully loads at least one
 * maintainer-authored CLI config for a name listed in `MERCURY_CLIS`.
 * Every other module (`runTurn`, the channels) takes tools/system as
 * inputs rather than assuming any of them exist, specifically so this
 * file can make that call in one place.
 */
import { QdrantClient } from "@qdrant/js-client-rest";
import { getOllamaProvider } from "./model/client.ts";
import { runCli } from "./tools/cli-executor.ts";
import { createCliTool, type CliPostProcessor } from "./tools/cli-tool.ts";
import { createConfirmationStore } from "./tools/confirmation-store.ts";
import { loadActiveCliConfigs, loadCliConfigFromObject } from "./tools/cli-config-loader.ts";
import { loadPlugins } from "./plugins/plugin-loader.ts";
import type { Plugin } from "@mercury/plugin-types";
import { jiraPlugin } from "@mercury/plugin-jira";
import { bitbucketPlugin } from "@mercury/plugin-bitbucket";
import { createSessionHistory, type SessionHistory, type Message } from "./session/history.ts";
import { createSummarizer } from "./session/summarizer.ts";
import { createEpisodicSummarizer } from "./session/episodic-summarizer.ts";
import { createSemanticFactExtractor } from "./session/semantic-fact-extractor.ts";
import { buildContextPrimer } from "./session/context-primer.ts";
import { buildSystemPrompt } from "./session/system-prompt.ts";
import { createTurnRunner } from "./router/turn-runner.ts";
import type { TurnSink } from "./router/provider.ts";
import { createTerminalProvider } from "./router/terminal-provider.ts";
import { stdinIsSession } from "./router/terminal.ts";
import {
  truncateForDisplay,
  describeToolOutcome,
} from "./router/tool-log.ts";
import type { StepInfo } from "./session/step-info.ts";
import { createGoogleChatProvider, NO_REPLY } from "./router/channels/google-chat-provider.ts";
import { createHttpProvider } from "./router/channels/http-provider.ts";
import { withToolStartHook, createCliStatusDescriber } from "./session/tool-start-hook.ts";
import {
  writeInferredNote,
  writeToolCorrectionNote,
  writeConfirmationNote,
} from "./wiki/wiki-note.ts";
import { createWikiTools } from "./wiki/wiki-tools.ts";
import { createToolLogRecallTool } from "./session/tool-log-recall-tool.ts";
import { createReadSkillTool } from "./session/read-skill-tool.ts";
import { createIdleSessionScanner } from "./cron/idle-session-scanner.ts";
import { startIdleSessionCron, captureSessionToMemory, type CaptureDeps } from "./cron/idle-session-cron.ts";
import {
  ensureEpisodicCollection,
  storeEpisodicSummary,
  getLastSessionEpisodicSummaries,
} from "./memory/episodic-store.ts";
import { ensureSemanticFactsCollection, storeSemanticFact, searchSemanticFactsByTopic } from "./memory/semantic-facts-store.ts";
import { ensureToolCorrectionsCollection, storeToolCorrection, searchToolCorrectionsByTopic } from "./memory/tool-corrections-store.ts";
import { consolidateSemanticFact, consolidateToolCorrection, type ToolCorrectionConsolidationDeps } from "./cron/semantic-consolidation.ts";
import { createToolCorrectionExtractor } from "./session/tool-correction-extractor.ts";
import { createEmbedder } from "./memory/embedder.ts";
import { initVault } from "./wiki/vault-init.ts";
import { findOrphanCuratedDocs } from "./wiki/orphan-detector.ts";
import { listWikiFilesInRoots, readWikiFile, readWikiFileInRoots, readIndexFile } from "./wiki/wiki-read.ts";
import { runRawTriagePass, runIndexAndOrphanPass, runContradictionCheckPass } from "./wiki/self-review-runner.ts";
import { startSelfReviewCron } from "./cron/self-review-cron.ts";
import { resolve as resolvePath } from "node:path";
import type { Tool } from "ai";
import { startAdminServer } from "./admin/server.ts";
// The HTTP surface's read routes (4b) reuse the admin panel's per-domain
// functions — the admin is a POC to be retired later; these reads outlive it.
import { listWikiVault, readWikiVaultFile, grepWikiVault } from "./admin/wiki-routes.ts";
import { scrollCollection } from "./admin/qdrant-scroll.ts";
import { getSelfHealth } from "./admin/model-routes.ts";
import { getToolLog } from "./session/tool-log-buffer.ts";
import { buildPluginManifest } from "./plugins/manifest.ts";

/** Reads a required env var, failing fast instead of silently defaulting. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const enabledClis = (process.env.MERCURY_CLIS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// The model is constructed up front, before the plugins load and the system
// prompt is built: a plugin's post-turn guard can be model-backed (Jira's
// issue-list corrector is), and the system prompt is assembled from the
// fragments the plugin loader returns — both need the model in hand first.
const provider = getOllamaProvider();
const ollamaHost = requireEnv("OLLAMA_HOST"); // already validated by getOllamaProvider(); read again here for the terminal provider's getLoadedContextLength call
const ollamaModel = requireEnv("OLLAMA_MODEL");
// think: true enables Ollama's native extended-thinking tokens — see
// agent-turn.ts's reasoning-delta handling, and google-chat-provider.ts/
// terminal-provider.ts for where the resulting stream gets displayed.
// NOT a silent no-op on a model that doesn't support it, despite what this
// comment used to claim: observed live against nemotron:70b, Ollama
// rejects the request outright (400 "does not support thinking"), failing
// every single turn. OLLAMA_THINK lets the deployer turn it off for a
// model that doesn't support it — Mercury has no way to detect this
// itself, same reasoning as never guessing OLLAMA_HOST. Model-construction-
// time setting only, no per-call override exists in ai-sdk-ollama, so it's
// set once here for the one shared model instance used by every channel.
const ollamaThink = process.env.OLLAMA_THINK !== "false";
const model = provider(ollamaModel, { think: ollamaThink });
const summarize = createSummarizer(model);

// Plugins. This is the only place that names them — the loader and every other
// module process an opaque list (see plugins/plugin-loader.ts). Each supplies
// its allowlist as data, a system-prompt fragment, and a `build()` that turns
// the runtime context into post-processors and post-turn guards. A plugin
// contributes only when it's both listed in MERCURY_CLIS and its allowlist
// validates through the same schema/version barrier a file-based config passes;
// one that fails — bad config, throwing build — degrades only itself.
const plugins: Plugin[] = [jiraPlugin, bitbucketPlugin];
const pluginNames = new Set(plugins.map((p) => p.name));

// File-based CLI configs come from maintainer-authored files in cliConfigDir,
// one per binary, bind-mounted at runtime (bitbucket/google-chat — see
// docker-compose.override.yml, .env.example). Plugin-provided names are
// excluded here: they carry their allowlist as data, validated by loadPlugins
// below, and are never looked for on disk (no spurious "not activated" for a
// jira.json that no longer exists).
const cliConfigDir = process.env.MERCURY_CLI_CONFIG_DIR ?? "/app/cli-config";
const activeCliConfigs = await loadActiveCliConfigs(
  enabledClis.filter((name) => !pluginNames.has(name)),
  { configDir: cliConfigDir, runCliFn: runCli },
);

const loadedPlugins = await loadPlugins(plugins, {
  enabledClis,
  loadCliConfig: (raw) => loadCliConfigFromObject(raw, { runCliFn: runCli }),
  model,
  env: process.env,
  log: (msg) => console.error(msg),
});
Object.assign(activeCliConfigs, loadedPlugins.cliConfigs);
const cliPostProcessors: Record<string, CliPostProcessor> = loadedPlugins.postProcessors;

// The status content for a `runCommand` call comes from the command's plugin
// (its `describeStatus`, or the shared default) — the core stops classifying
// read/write. Built once from the active configs (for the mutating flag a
// custom describer may use) and the plugins' overrides; the terminal and
// Google Chat channels render whatever string it returns.
const describeCliStatus = createCliStatusDescriber(activeCliConfigs, loadedPlugins.statusDescribers);

// A single subscription for the whole app (Cloud Pub/Sub deployment) —
// unlike the retired impersonation channel, there's no per-space Workspace
// Events subscription to manage: whatever space the app is a member of
// delivers its events here.
const googleChatSubscription = process.env.GOOGLE_CHAT_PUBSUB_SUBSCRIPTION;

// Two separate system prompts, not one shared string: the multiUserChannel
// clause (NO_REPLY heuristic) must never reach the terminal, which is
// always a private 1:1 conversation — an operator typing normally
// shouldn't risk an unexpected NO_REPLY meant for a shared Google Chat space.
// Both are built from the fragments of whatever plugins actually loaded.
const system = buildSystemPrompt({
  pluginFragments: loadedPlugins.promptFragments,
  skills: loadedPlugins.skills,
  multiUserChannel: false,
});
const chatSystem = buildSystemPrompt({
  pluginFragments: loadedPlugins.promptFragments,
  skills: loadedPlugins.skills,
  multiUserChannel: true,
});

const histories = new Map<string, SessionHistory>();
/**
 * `trackForCapture` wires `onBeforeCompress` so a Layer 1 compression also
 * mirrors the compressed batch to Qdrant (see `captureIncrement` further
 * down) — only meaningful for Google Chat sessions, which are the only
 * ones tracked in `sessionUsers`/`sessionCaptureMarkers`; the terminal
 * channel omits it and behaves exactly as before.
 */
function getOrCreateHistory(key: string, trackForCapture = false, primer?: string): SessionHistory {
  let history = histories.get(key);
  if (!history) {
    history = createSessionHistory(
      summarize,
      trackForCapture
        ? (messages) => {
            void captureIncrement(key, messages).finally(() => {
              // The new getMessages() view after compression starts fresh
              // (just the new synthetic summary message) — the old
              // marker's index has no meaning against it regardless of
              // whether the capture above succeeded.
              sessionCaptureMarkers.set(key, 0);
            });
          }
        : undefined,
      primer,
    );
    histories.set(key, history);
  }
  return history;
}

// Session persistence, Layer 3: a Google Chat session idle past
// SESSION_IDLE_TIMEOUT_MS is summarized (not the Layer-1 summarizer above —
// see episodic-summarizer.ts for why) and written to Qdrant as a dated
// episodic record, then discarded from `histories`. Terminal sessions are
// never tracked here — it's a single-operator debug channel, not a real
// multi-user surface, and per-user isolation needs a real Google Chat
// sender, which the terminal doesn't have.
const sessionUsers = new Map<string, string>(); // session key -> Google Chat sender (userId)
// How many of a session's current getMessages() entries have already been
// mirrored to Qdrant by captureIncrement below — advanced only after a
// successful capture, so a failure retries the same (or a larger) slice
// next time instead of silently losing it. Reset to 0 whenever Layer 1
// compresses the session (see history.ts's onBeforeCompress wiring further
// down): the new getMessages() view starts fresh at that point, nothing in
// it has been captured yet. Discarded along with everything else on
// idle-timeout close, same as sessionUsers.
const sessionCaptureMarkers = new Map<string, number>();
// The current turn's tool-status callbacks (the sink's onToolStart/
// onToolFinish), refreshed each turn since a fresh sink is created per turn
// — looked up lazily by captureIncrement/onBeforeCompress rather than
// captured once, same reason sessionUsers is looked up lazily instead of
// closed over.
const sessionOnCaptureCallbacks = new Map<
  string,
  { onToolStart: TurnSink["onToolStart"]; onToolFinish: TurnSink["onToolFinish"] }
>();
const idleScanner = createIdleSessionScanner();
const episodicSummarize = createEpisodicSummarizer(model);
const embeddingModel = provider.textEmbeddingModel(process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text");
const embed = createEmbedder(embeddingModel);
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL ?? "http://qdrant:6333" });
const episodicCollection = process.env.QDRANT_EPISODIC_COLLECTION ?? "episodic_memory";
const episodicVectorSize = Number(process.env.QDRANT_EPISODIC_VECTOR_SIZE ?? "768");
await ensureEpisodicCollection(qdrant, episodicCollection, episodicVectorSize);

// Semantic consolidation (D-22/D-34): a separate Qdrant collection from
// episodic memory above — one point per extracted {topic, value} candidate,
// vector embedded on the topic alone (see semantic-facts-store.ts for why).
const semanticFactsCollection = process.env.QDRANT_SEMANTIC_FACTS_COLLECTION ?? "semantic_facts";
const semanticFactsVectorSize = Number(process.env.QDRANT_SEMANTIC_FACTS_VECTOR_SIZE ?? "768");
await ensureSemanticFactsCollection(qdrant, semanticFactsCollection, semanticFactsVectorSize);
const extractFacts = createSemanticFactExtractor(model);

// Idempotent self-heal: the vault lives on a named Docker volume, empty on
// first boot and not pre-populatable at build time like the CLI binaries —
// re-running this every startup is cheap and means a wiped/fresh volume
// never needs a separate manual provisioning step.
const wikiVaultPath = requireEnv("WIKI_VAULT_PATH");
await initVault(wikiVaultPath);

// Shared by the idle sweep below (final capture + close) and by
// captureIncrement further down (the two mid-conversation triggers,
// neither of which closes the session) — one definition of "how to
// capture", reused everywhere instead of duplicated per trigger.
const captureDeps: CaptureDeps = {
  summarize: episodicSummarize,
  store: (entry) => storeEpisodicSummary(qdrant, episodicCollection, embed, entry),
  extractFacts,
  storeFact: (entry) => storeSemanticFact(qdrant, semanticFactsCollection, embed, entry),
  consolidateFact: (userId, topic) =>
    consolidateSemanticFact(userId, topic, {
      vaultPath: wikiVaultPath,
      clusterFn: (u, t, limit) => searchSemanticFactsByTopic(qdrant, semanticFactsCollection, embed, { userId: u, topic: t, limit }),
      readWikiFileFn: readWikiFile,
      writeInferredNoteFn: writeInferredNote,
    }),
  log: (msg) => console.error(`[cron] ${msg}`),
};

const idleCron = startIdleSessionCron(
  idleScanner,
  {
    getSession: (key) => {
      const history = histories.get(key);
      const userId = sessionUsers.get(key);
      if (!history || !userId) {
        return undefined;
      }
      return { key, userId, messages: history.getMessages() };
    },
    closeSession: (key) => {
      histories.delete(key);
      sessionUsers.delete(key);
      sessionCaptureMarkers.delete(key);
      sessionOnCaptureCallbacks.delete(key);
    },
    ...captureDeps,
  },
  {
    idleTimeoutMs: Number(process.env.SESSION_IDLE_TIMEOUT_MS ?? String(30 * 60_000)),
    checkIntervalMs: Number(process.env.SESSION_IDLE_CHECK_INTERVAL_MS ?? String(60_000)),
  },
);
// Held, not discarded: see the shutdown block at the bottom of this file.

// How many new messages (since the last capture) a live Google Chat
// session needs before captureIncrement mirrors them to Qdrant, instead of
// only ever capturing on idle-timeout — see the plan discussion: a
// conversation that stays active for a long time, or even just 6-7
// messages well under Layer 1's own compression threshold, previously
// wrote nothing to Qdrant until it finally went idle.
const MESSAGE_COUNT_CAPTURE_THRESHOLD = Number(process.env.SESSION_CAPTURE_MESSAGE_THRESHOLD ?? "6");

// How much of the pending messages' actual text shows up in a capture
// status card's detail — enough to recognize which exchange is being
// saved, not the full conversation.
const MESSAGE_PREVIEW_CHARS = 200;

/** Joins `messages`' content and head-truncates to `maxChars`, "…"-suffixed when cut. */
function previewMessages(messages: Message[], maxChars: number): string {
  const joined = messages.map((m) => m.content).join(" ");
  return joined.length <= maxChars ? joined : `${joined.slice(0, maxChars)}…`;
}

/**
 * Captures whatever's new in `messages` since the last capture for
 * `sessionKey` (tracked via `sessionCaptureMarkers`) — a no-op if nothing
 * new. Shared by both mid-conversation triggers (message-count threshold,
 * Layer 1 compression); the idle-timeout trigger uses
 * `runIdleSessionSweep`/`captureSessionToMemory` directly instead, since it
 * also closes the session. Looks up that turn's tool-status callbacks
 * (`sessionOnCaptureCallbacks`, refreshed per turn) and, when present,
 * drives them exactly like a real tool call (start with a label + detail
 * naming what's being written and to which Qdrant collection, finish with
 * the outcome) — reuses the same mechanism already wired for tool-call
 * status messages (Google Chat's status card, the dim/italic terminal
 * callback), so a live conversation shows this happening instead of it
 * running invisibly. The generated id only needs to be unique for this one
 * start/finish pair, not stable across calls.
 */
async function captureIncrement(sessionKey: string, messages: Message[]): Promise<void> {
  const userId = sessionUsers.get(sessionKey);
  if (!userId) return;

  const alreadyCaptured = sessionCaptureMarkers.get(sessionKey) ?? 0;
  const pending = messages.slice(alreadyCaptured);
  if (pending.length === 0) return;

  const callbacks = sessionOnCaptureCallbacks.get(sessionKey);
  const captureId = crypto.randomUUID();
  callbacks?.onToolStart(
    "Mi sto segnando un'informazione importante…",
    `Conversazione recente (${pending.length} messaggi: "${previewMessages(pending, MESSAGE_PREVIEW_CHARS)}"), collection "${episodicCollection}"`,
    captureId,
  );
  try {
    await captureSessionToMemory(userId, sessionKey, pending, Date.now(), captureDeps);
    sessionCaptureMarkers.set(sessionKey, messages.length);
    callbacks?.onToolFinish?.(captureId, "success");
  } catch (err) {
    console.error(`[capture] failed for ${sessionKey}, will retry next trigger: ${String(err)}`);
    callbacks?.onToolFinish?.(captureId, "failed");
  }
}

// Procedural corrections (punto 2/Fase D): per-turn, not per-idle-session
// — the tool-call trace only exists in memory for the duration of the
// turn it belongs to (see tool-correction-extractor.ts's own header for
// why idle-session-cron.ts's sweep isn't the right place for this).
const toolCorrectionsCollection = process.env.QDRANT_TOOL_CORRECTIONS_COLLECTION ?? "tool_corrections";
const toolCorrectionsVectorSize = Number(process.env.QDRANT_TOOL_CORRECTIONS_VECTOR_SIZE ?? "768");
await ensureToolCorrectionsCollection(qdrant, toolCorrectionsCollection, toolCorrectionsVectorSize);
const extractToolCorrections = createToolCorrectionExtractor(model, undefined, {
  log: (msg) => console.error(`[cron] ${msg}`),
});
const toolCorrectionConsolidationDeps: ToolCorrectionConsolidationDeps = {
  vaultPath: wikiVaultPath,
  clusterFn: (tool, topic, limit) =>
    searchToolCorrectionsByTopic(qdrant, toolCorrectionsCollection, embed, { tool, topic, limit }),
  readNoteFn: (vp, relativePath) => readWikiFileInRoots(vp, [resolvePath(vp, "curated")], relativePath),
  writeNoteFn: writeToolCorrectionNote,
  // A single confirmed correction (a precise error, then a precise fix, in
  // the same turn) is already a strong signal — unlike identity/preference
  // facts (DEFAULT_CONSOLIDATION_K = 3), which benefit from repetition to
  // rule out a one-off. k: 1 means defaultConfidenceForCount's own
  // dominantCount >= k branch fires on the very first candidate ("high"
  // confidence immediately), not a separately-tuned confidence function.
  k: 1,
};

/**
 * Extracts and consolidates any procedural corrections found in one turn's
 * `steps` — a no-op if none are found. `onToolStart`/`onToolFinish`, when
 * given, get the same status label used by `captureIncrement` (reused, not
 * a new one) plus a detail naming the tool/topic and the Qdrant collection,
 * driven once per correction exactly like a real tool call.
 */
async function processToolCorrections(
  steps: StepInfo[],
  onToolStart?: TurnSink["onToolStart"],
  onToolFinish?: TurnSink["onToolFinish"],
): Promise<void> {
  const corrections = await extractToolCorrections(steps);
  for (const correction of corrections) {
    const correctionId = crypto.randomUUID();
    onToolStart?.(
      "Mi sto segnando un'informazione importante…",
      `Correzione per lo strumento "${correction.tool}" (argomento: "${correction.topic}", collection: "${toolCorrectionsCollection}")`,
      correctionId,
    );
    try {
      const timestamp = new Date().toISOString();
      await storeToolCorrection(qdrant, toolCorrectionsCollection, embed, { ...correction, timestamp });
      await consolidateToolCorrection(correction.tool, correction.topic, toolCorrectionConsolidationDeps);
      onToolFinish?.(correctionId, "success");
    } catch (err) {
      console.error(`[capture] procedural correction failed for ${correction.tool}/${correction.topic}: ${String(err)}`);
      onToolFinish?.(correctionId, "failed");
    }
  }
}

const selfReviewCron = startSelfReviewCron(
  {
    listRawEntries: () => listWikiFilesInRoots(wikiVaultPath, [resolvePath(wikiVaultPath, "raw")]),
    findOrphans: () => findOrphanCuratedDocs(wikiVaultPath),
    runRawTriage: (rawEntries) => runRawTriagePass({ vaultPath: wikiVaultPath, model, rawEntries }),
    runIndexAndOrphan: (orphans) => runIndexAndOrphanPass({ vaultPath: wikiVaultPath, model, orphans }),
    runContradictionCheck: () => runContradictionCheckPass({ vaultPath: wikiVaultPath, model }),
    log: (msg) => console.error(`[cron] ${msg}`),
  },
);
// Held, not discarded, same as idleCron.

// runCommand's confirm-required branch stages a command per-session (see
// createCliTool's opts) — the tool itself must therefore be rebuilt fresh
// for each turn, scoped to that turn's own sessionKey, rather than built
// once and shared across every session.
const confirmationStore = createConfirmationStore();

// `wikiUserId` is separate from `sessionKey`: inferred/users/<userId> notes
// are scoped per-person, not per-(space,person) pair, so it must not
// include the space. Terminal has no real per-user identity (single
// operator), so it just uses a fixed "terminal" id.
function buildTools(
  sessionKey: string,
  wikiUserId: string,
  onToolStart?: TurnSink["onToolStart"],
  onToolFinish?: TurnSink["onToolFinish"],
): Record<string, Tool> {
  const sessionTools: Record<string, Tool> = {};
  if (Object.keys(activeCliConfigs).length > 0) {
    Object.assign(
      sessionTools,
      createCliTool(runCli, activeCliConfigs, {
        sessionKey,
        store: confirmationStore,
        vaultPath: wikiVaultPath,
        userId: wikiUserId,
        postProcessors: cliPostProcessors,
      }),
    );
  }
  Object.assign(sessionTools, createWikiTools({ vaultPath: wikiVaultPath, userId: wikiUserId }));
  Object.assign(sessionTools, createToolLogRecallTool({ sessionKey }));
  // read_skill only exists when a plugin contributed at least one skill — an
  // instance with none never sees the tool (and its prompt has no skills
  // section to point at it).
  if (loadedPlugins.skills.length > 0) {
    Object.assign(sessionTools, createReadSkillTool(loadedPlugins.skills));
  }
  return onToolStart ? withToolStartHook(sessionTools, onToolStart, describeCliStatus, onToolFinish) : sessionTools;
}

// Raw tool output can be tens of KB (e.g. a Jira issue search) — too long
// to print in full and stay readable. MAX_INLINE_CHARS bounds what's
// shown per call/result; the terminal's `/dump` (below) writes the
// untruncated version of its own last turn when that's actually needed.
const MAX_INLINE_CHARS = 600;

/**
 * Server-side-only tool-call/result visibility for debugging a turn —
 * written to this process's own stderr (`docker compose logs mercury`),
 * never sent back to whoever asked the question. `prefix` distinguishes
 * which conversation a line belongs to when more than one can be running
 * concurrently (several Google Chat spaces) — the terminal, which only
 * ever has one conversation at a time, uses an empty prefix.
 */
function logStep(prefix: string, step: StepInfo): void {
  for (const call of step.toolCalls) {
    console.error(
      `${prefix}[tool] ${call.toolName}(${truncateForDisplay(call.input, MAX_INLINE_CHARS)})`,
    );
    console.error(`${prefix}${describeToolOutcome(step, call.toolCallId, MAX_INLINE_CHARS)}`);
  }
}

// Shared turn-taking pipeline (see src/router/turn-runner.ts): deduplicates
// what used to be two near-identical per-channel closures. Parameterized
// entirely by Provider/InboundTurn/TurnSink (src/router/provider.ts) — this
// function doesn't know or care which provider a given turn came from.
// getOrCreateHistory seeds a context primer (src/session/context-primer.ts)
// only for a genuinely new, tracked (real per-user identity) session —
// today that's Google Chat; the terminal's turn.userId is always undefined,
// so it never triggers this, same as before this refactor.
const handleTurn = createTurnRunner({
  model,
  systemPrompts: { singleUser: system, multiUser: chatSystem },
  buildTools,
  // Post-turn guards contributed by whatever plugins loaded — the core runs
  // them without knowing what any of them does (see PostTurnGuard). Jira's
  // model-backed issue-list corrector is built inside its plugin's build().
  postTurnGuards: loadedPlugins.postTurnGuards,
  getOrCreateHistory: async (key, trackForCapture, userId) => {
    if (trackForCapture && userId && !histories.has(key)) {
      const primer = await buildContextPrimer(userId, {
        vaultPath: wikiVaultPath,
        getLastSessionEntries: (uid) => getLastSessionEpisodicSummaries(qdrant, episodicCollection, { userId: uid }),
        listWikiFilesInRootsFn: listWikiFilesInRoots,
        readWikiFileInRootsFn: readWikiFileInRoots,
        readIndexFileFn: readIndexFile,
      });
      return getOrCreateHistory(key, trackForCapture, primer);
    }
    return getOrCreateHistory(key, trackForCapture);
  },
  trackSession: (key, userId, at) => {
    sessionUsers.set(key, userId);
    idleScanner.touch(key, at);
  },
  registerCaptureCallback: (key, onToolStart, onToolFinish) => sessionOnCaptureCallbacks.set(key, { onToolStart, onToolFinish }),
  maybeCapture: async (key, history) => {
    const messages = history.getMessages();
    const alreadyCaptured = sessionCaptureMarkers.get(key) ?? 0;
    if (messages.length - alreadyCaptured >= MESSAGE_COUNT_CAPTURE_THRESHOLD) {
      await captureIncrement(key, messages);
    }
  },
  processToolCorrections,
  logStep,
});

let chatProvider: ReturnType<typeof createGoogleChatProvider> | undefined;
if (googleChatSubscription) {
  chatProvider = createGoogleChatProvider({
    credentials: {
      clientEmail: requireEnv("GOOGLE_CHAT_APP_CLIENT_EMAIL"),
      // A PEM key is multi-line; stored in a single-line env var with
      // literal "\n" escape sequences (the standard convention for this),
      // not real newlines — unescape before handing it to Node's crypto,
      // which needs the real thing.
      privateKey: requireEnv("GOOGLE_CHAT_APP_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
    subscription: googleChatSubscription,
    store: confirmationStore,
    vaultPath: wikiVaultPath,
    runCliFn: runCli,
    writeConfirmationNoteFn: writeConfirmationNote,
  });
  await chatProvider.start(handleTurn);
}

// POC admin panel (see docs/plans, throwaway scaffolding) — opt-in only,
// never started unless explicitly enabled, so it never touches the real
// deployment path. Runs in-process, reusing the already-constructed
// qdrant client, activeCliConfigs, model, and vault path directly.
let adminServer: ReturnType<typeof startAdminServer> | undefined;
if (process.env.ADMIN_PANEL_ENABLED === "true") {
  const adminPort = Number(process.env.ADMIN_PANEL_PORT ?? "4000");
  adminServer = startAdminServer({
    port: adminPort,
    vaultPath: wikiVaultPath,
    model,
    qdrant,
    qdrantCollections: { episodic: episodicCollection, semanticFacts: semanticFactsCollection },
    activeCliConfigs,
    runCliFn: runCli,
    ollamaHost,
    ollamaModel,
    systemPrompts: { terminal: system, googleChat: chatSystem },
    envFilePath: ".env",
  });
  console.error(`[admin] panel listening on http://localhost:${adminPort}`);
}

// HTTP surface (Fase 4a): opt-in conversational endpoint, same posture as the
// admin panel — never started unless HTTP_SURFACE_ENABLED, and must not be
// reachable from outside the container network. Started in the background (like
// Google Chat) so the blocking terminal REPL below is still reached. Reuses the
// terminal's confirmDeps so a staged jira delete confirms through the identical
// tryConfirm path.
let httpProvider: ReturnType<typeof createHttpProvider> | undefined;
if (process.env.HTTP_SURFACE_ENABLED === "true") {
  const httpPort = Number(process.env.HTTP_SURFACE_PORT ?? "4100");
  httpProvider = createHttpProvider({
    port: httpPort,
    confirmDeps: {
      store: confirmationStore,
      runCliFn: runCli,
      vaultPath: wikiVaultPath,
      writeConfirmationNoteFn: writeConfirmationNote,
    },
    // Read-only introspection (4b): everything already in-process — the loaded
    // plugins/manifest, redacted pending confirmations, and the wiki/memory/
    // tool-log reads reused from the admin panel's own functions.
    reads: {
      manifest: () => buildPluginManifest(plugins, activeCliConfigs, loadedPlugins.skills),
      pendingConfirmations: () => confirmationStore.pending(),
      wikiList: () => listWikiVault(wikiVaultPath),
      wikiRead: (path) => readWikiVaultFile(wikiVaultPath, path),
      wikiGrep: (pattern) => grepWikiVault(wikiVaultPath, pattern),
      memoryScroll: (collection, limit, offset) => scrollCollection(qdrant, collection, { limit, offset }),
      toolLog: () => getToolLog(),
      health: () => getSelfHealth({ qdrant, ollamaHost }),
    },
  });
  await httpProvider.start(handleTurn);
  console.error(`[http] surface listening on http://localhost:${httpPort}`);
}

await createTerminalProvider({
  confirmDeps: {
    store: confirmationStore,
    runCliFn: runCli,
    vaultPath: wikiVaultPath,
    writeConfirmationNoteFn: writeConfirmationNote,
  },
  ollamaHost,
  ollamaModel,
}).start(handleTurn);

// The REPL above always resolves — on a detached container stdin is already
// closed, so it ends immediately having read nothing, and Mercury must keep
// serving Google Chat. When stdin was a real session (a TTY, or a pipe from
// `docker compose run -T`), its EOF instead means this process is done, and
// everything holding the event loop open has to be released or the process
// hangs forever: both cron intervals, the admin server's listening socket,
// and Google Chat's StreamingPull. Observed live before this existed — a
// `docker compose run --rm` that answered its question and then never exited,
// leaving `--rm` unfired and a second Chat consumer alive on the same
// subscription.
//
// The explicit exit at the end is deliberate, and is not a substitute for the
// shutdown above it. Releasing every subsystem Mercury owns is not enough to
// end the process: measured against this exact build, the trace below runs to
// completion and the process still never exits, because the Qdrant client and
// the Ollama provider both keep pooled keep-alive sockets open and neither
// exposes a way to dispose of them. So the order matters — stop everything
// that could be mid-flight first, then exit to drop the third-party sockets
// that nothing here can reach. Exiting *instead* of stopping would be the
// fragile version: it would kill an in-flight Layer-3 capture or a running
// cron tick with no trace.
// Each step is traced: a shutdown that stalls is otherwise indistinguishable
// from one that never started, and both look like "the container is still
// running". The trace names the last subsystem that reported done, so the one
// that hung is the next one.
if (stdinIsSession()) {
  console.error("[shutdown] terminal session ended, releasing subsystems");
  idleCron.stop();
  console.error("[shutdown] idle cron stopped");
  selfReviewCron.stop();
  console.error("[shutdown] self-review cron stopped");
  adminServer?.stop();
  console.error("[shutdown] admin server stopped");
  httpProvider?.stop();
  console.error("[shutdown] http surface stopped");
  await chatProvider?.stop();
  console.error("[shutdown] google chat stopped");
  process.exit(0);
}
