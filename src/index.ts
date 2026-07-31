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
import { createJiraIssueListFormatter } from "./tools/jira/issue-list-formatter.ts";
import { createConfirmationStore } from "./tools/confirmation-store.ts";
import { loadActiveCliConfigs } from "./tools/cli-config-loader.ts";
import { createSessionHistory, type SessionHistory, type Message } from "./session/history.ts";
import { createSummarizer } from "./session/summarizer.ts";
import { createEpisodicSummarizer } from "./session/episodic-summarizer.ts";
import { createSemanticFactExtractor } from "./session/semantic-fact-extractor.ts";
import { buildContextPrimer } from "./session/context-primer.ts";
import { createTurnRunner } from "./router/turn-runner.ts";
import type { TurnSink } from "./router/provider.ts";
import { createTerminalProvider } from "./router/terminal-provider.ts";
import {
  truncateForDisplay,
  describeToolOutcome,
} from "./router/tool-log.ts";
import type { StepInfo } from "./session/step-info.ts";
import { createGoogleChatProvider, NO_REPLY } from "./router/channels/google-chat-provider.ts";
import { withToolStartHook } from "./session/tool-start-hook.ts";
import {
  writeInferredNote,
  writeToolCorrectionNote,
  writeConfirmationNote,
} from "./wiki/wiki-note.ts";
import { createWikiTools } from "./wiki/wiki-tools.ts";
import { createToolLogRecallTool } from "./session/tool-log-recall-tool.ts";
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

/** Reads a required env var, failing fast instead of silently defaulting. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

/**
 * Builds a system prompt that only describes tools actually present in
 * `tools` (see `src/session/agent-turn.ts` for why a prompt mentioning
 * an absent tool is a real bug, not a harmless no-op).
 */
function buildSystemPrompt(opts: { jira: boolean; multiUserChannel: boolean }): string {
  const lines = ["You are Mercury, an internal assistant."];
  if (opts.jira) {
    lines.push(
      [
        "You have access to the runCommand tool, which runs a CLI command for Jira access — reading issues, and writing via issue create/transition/comment.",
        "DO:",
        '- Call runCommand with `command` set to the exact command line you would type in a terminal, e.g. `jira issue search --jql "project = KAN"` — quote values containing spaces, exactly like a real shell.',
        "- Use runCommand to get real data — never invent ticket data.",
        "- **Use --help on any subcommand if you're unsure of its flags.**",
        "- Use native JQL syntax for relative dates (e.g. now()) — don't compute dates yourself.",
        '- When a search can return more than one or two issues, add --fields to issue search (e.g. --fields summary,status,assignee,duedate) — the full unfiltered issue JSON is large and makes it easier to lose track of an item when listing results back to the user.',
        "- When you have a list of Jira issues to show the user, for any reason, issue search's result already includes a formattedList field (deterministic, with a link per issue) whenever the data has enough for it — relay it verbatim instead of writing the list yourself. This field is added to runCommand's result AFTER jira itself runs; it is never part of jira's own JSON.",
        "- If issue search's result has a formattedListNote instead of formattedList, that means the data (usually because of --select) wasn't in a shape it could format — if the user actually wants a list, retry without --select (or with --select-all / --fields) so a real formattedList can be produced.",
        "- If the user refers to a project by an informal name (e.g. \"the monorepo\") rather than its JQL project key, check curated/projects/project-codes.md for the mapping FIRST, before guessing a key or running a keyword search. If it's not there and you learn it (from the user or from search results), write_file it there so you don't have to rediscover it next time.",
        '- If a call is rejected, errors, or returns an empty result that seems suspicious given the question, actually call runCommand again, in this same turn, with a corrected command before giving your final answer.',
        '- If the user\'s free-text value (e.g. a status name) comes back with no results, retry with at least one likely real wording (e.g. "todo" → "To Do") before concluding there\'s no data.',
        "- issue create/transition/comment run immediately, no confirmation needed — tell the user what you did (e.g. the new issue's key) after it succeeds.",
        "- issue delete is irreversible: runCommand won't execute it directly. Instead you'll get back a `token` and a `pendingConfirmation` result — you have no role in confirming it: the channel shows the user its own confirmation UI and handles the token entirely on its own. Just tell the user the action is staged and awaiting their confirmation. Never mention the token value in your reply, in any form.",
        "",
        "DON'T:",
        "- DON'T just say you'll retry and stop there — an empty/rejected/suspicious result means retry for real, not just talk about it.",
        "- DON'T describe a command you're about to run as your entire response — if the question needs runCommand, call it in this same turn before replying; a sentence saying what you're about to look up, with no tool call attached, leaves the user with nothing.",
        '- DON\'T treat a bare `{}` as "confirmed zero matching issues" — it usually means your `--select` path was wrong, not that the search found nothing. A genuine empty result looks like `{"issues": []}`. On `{}`, check curated/standards/jira-cli.md for the correct `--select` syntax, or retry with `--select-all`, before telling the user there\'s no data.',
        "- DON'T hand-format a list of Jira issues yourself, even straight from the raw JSON — if formattedList isn't in the result, retry issue search with --fields including summary instead of improvising from partial data.",
        "- DON'T ever try `--select formattedList` (or any --select path built from it) to fetch a formatted list directly — jira has no such field in its own JSON, that path always resolves to nothing. formattedList only ever shows up as a field Mercury adds to the result you already have; it can't be requested.",
        "- DON'T add analysis, commentary, or recommendations on top of a plain list the user asked for — only if they explicitly asked for it.",
      ].join("\n"),
    );
  }
  // Always present (WIKI_VAULT_PATH is a required env var, the vault
  // always exists once Mercury boots) — unlike jira, this
  // block doesn't need its own opts flag.
  lines.push(
    [
      "You have access to wiki tools: list_files, read_file, grep, write_file, resolve_reference — Mercury's own knowledge base. " +
        "curated/ is team knowledge (conventions, docs, project status) — written by maintainers, and by you. " +
        "inferred/ is private per-user notes managed automatically by a separate process, not by you directly.",
      "DO:",
      "- If your context contains an opaque `[REQ:<token>]` marker, that's a reference to a past confirm-required request — call resolve_reference with that token to see what it was, don't guess at what it means.",
      "- For a CLI's own syntax/flags, rely on --help first. Only check the wiki if --help doesn't cover something specific to how this team uses that tool (a convention, a naming pattern, a policy).",
      "- When a command's --select flag description is generic/shared across multiple subcommands, don't take its inline example at face value — check that command's own \"Examples\" section at the bottom of its --help output for the syntax that actually works with it.",
      "- For anything else — documentation, project status, how some tool or process is used, team conventions — consult the wiki FIRST (grep/read_file/list_files), before trying a CLI or answering from general knowledge.",
      "- If the wiki doesn't have the answer, try a live CLI query if one is relevant, before giving up.",
      "- If you still don't know after checking both, say so plainly — don't guess or invent an answer.",
      "- If you learn something worth remembering (a useful command pattern, a correction from the user, a new convention), write_file to add it to curated/ — prefer creating a new, clearly-named file over guessing at how to merge into an existing one.",
      "",
      "DON'T:",
      "- DON'T claim something is documented in the wiki without actually reading it via read_file/grep first.",
      "- DON'T write_file over an existing curated document without reading it first — write_file replaces the whole file, it doesn't merge, so an unread overwrite silently destroys whatever was already there.",
    ].join("\n"),
  );
  lines.push(
    [
      "You have access to the recall_tool_calls tool.",
      "DO:",
      "- If asked what you actually ran/queried/did earlier in this same conversation, call recall_tool_calls and quote it verbatim — you have no memory of your own past tool calls otherwise, only your own prior reply text, so reconstructing from memory instead of calling this tool risks getting it wrong.",
    ].join("\n"),
  );

  if (opts.multiUserChannel) {
    // Interim, explicitly non-deterministic mitigation for Mercury replying
    // to every message in a shared space — not a replacement for real
    // @-mention detection, which the registered app's own identity now
    // makes possible but which isn't implemented yet. See NO_REPLY in
    // google-chat-provider.ts for the code side of this check.
    lines.push(
      [
        "This conversation may be a shared space with more than one person, not a private one-on-one chat.",
        "DO:",
        "- Only give a substantive answer if this message is clearly directed at you (e.g. it explicitly mentions/addresses you) or is a direct continuation of an exchange you were already having with this same sender.",
        `- If the message doesn't seem directed at you or isn't relevant to you, respond with exactly \`${NO_REPLY}\` and nothing else — no punctuation, no explanation, nothing before or after it.`,
      ].join("\n"),
    );
  }

  lines.push(
    [
      "DO:",
      "- Answer directly, in plain text only.",
      "- Be dry but respectful, and complete.",
      "- If you believe a point of view is useful, add it — but keep it brief and put it strictly at the end.",
      "",
      "DON'T:",
      "- DON'T use Markdown formatting (no **, #, -, etc.), unless the user explicitly asks for it.",
      "- DON'T introduce yourself as Mercury unless asked; the user already knows who you are.",
      "- DON'T ask follow-up questions.",
      "- DON'T add extra explanations or extra actions beyond what was requested.",
    ].join("\n"),
  );
  return lines.join("\n");
}

const enabledClis = (process.env.MERCURY_CLIS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// The known-CLI boundary for this instance is no longer a hardcoded
// TypeScript map — it's whatever maintainer-authored config files exist
// in cliConfigDir, one per binary, bind-mounted at runtime (see
// docker-compose.override.yml, .env.example). Only a binary with a
// present, schema-valid, version-checked config file ever reaches
// runCommand, no matter what MERCURY_CLIS says — bitbucket/google-chat
// can be listed there with no effect until someone adds a config file
// for them.
const cliConfigDir = process.env.MERCURY_CLI_CONFIG_DIR ?? "/app/cli-config";
const activeCliConfigs = await loadActiveCliConfigs(enabledClis, {
  configDir: cliConfigDir,
  runCliFn: runCli,
});
const jiraEnabled = Boolean(activeCliConfigs.jira);

// The "issue-list" hook cli-configs/jira.json declares on `issue search`
// only actually does anything if this is set — JIRA_SITE_URL isn't
// derivable from any CLI output (the API talks to
// api.atlassian.com/ex/jira/<cloud-id>/..., unrelated to the human-facing
// hostname), so without it the formatter is simply never registered and
// runCommand's result for `issue search` passes through unaugmented, same
// as any other CLI with no post-processor configured.
const cliPostProcessors: Record<string, CliPostProcessor> = {};
const jiraSiteUrl = process.env.JIRA_SITE_URL;
if (jiraSiteUrl) {
  cliPostProcessors["issue-list"] = createJiraIssueListFormatter(jiraSiteUrl);
}
// A single subscription for the whole app (Cloud Pub/Sub deployment) —
// unlike the retired impersonation channel, there's no per-space Workspace
// Events subscription to manage: whatever space the app is a member of
// delivers its events here.
const googleChatSubscription = process.env.GOOGLE_CHAT_PUBSUB_SUBSCRIPTION;

// Two separate system prompts, not one shared string: the multiUserChannel
// clause (NO_REPLY heuristic) must never reach the terminal, which is
// always a private 1:1 conversation — an operator typing normally
// shouldn't risk an unexpected NO_REPLY meant for a shared Google Chat space.
const system = buildSystemPrompt({ jira: jiraEnabled, multiUserChannel: false });
const chatSystem = buildSystemPrompt({ jira: jiraEnabled, multiUserChannel: true });

const provider = getOllamaProvider();
const ollamaHost = requireEnv("OLLAMA_HOST"); // already validated by getOllamaProvider(); read again here for the terminal provider's getLoadedContextLength call
const ollamaModel = requireEnv("OLLAMA_MODEL");
// think: true enables Ollama's native extended-thinking tokens (only takes
// effect on models that actually support it — see agent-turn.ts's
// reasoning-delta handling, and google-chat-provider.ts/terminal-provider.ts
// for where the resulting stream gets displayed). Model-construction-time
// setting only, no per-call override exists in ai-sdk-ollama, so it's set
// once here for the one shared model instance used by every channel.
const model = provider(ollamaModel, { think: true });
const summarize = createSummarizer(model);

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
void idleCron; // kept alive for the process lifetime; no shutdown hook exists yet (same as the rest of Mercury today)

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
void selfReviewCron; // kept alive for the process lifetime, same as idleCron

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
  return onToolStart ? withToolStartHook(sessionTools, onToolStart, activeCliConfigs, onToolFinish) : sessionTools;
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
if (process.env.ADMIN_PANEL_ENABLED === "true") {
  const adminPort = Number(process.env.ADMIN_PANEL_PORT ?? "4000");
  startAdminServer({
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
