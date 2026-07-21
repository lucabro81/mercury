/**
 * Composition root: wires the model, the per-CLI tools this instance
 * has enabled, and the channels (terminal always, Google Chat if
 * configured) into running conversations.
 *
 * This is the only file that decides which tools actually exist on
 * this instance — `runCommand` only if `loadActiveCliConfigs` (see
 * `src/tools/cli-config-loader.ts`) successfully loads at least one
 * maintainer-authored CLI config for a name listed in `MERCURY_CLIS`,
 * `joinSpace` only if the Google Chat channel is configured. Every
 * other module (`runTurn`, the channels) takes tools/system as inputs
 * rather than assuming any of them exist, specifically so this file can
 * make that call in one place.
 */
import { QdrantClient } from "@qdrant/js-client-rest";
import { getOllamaProvider } from "./model/client.ts";
import { getLoadedContextLength } from "./model/context-size.ts";
import { runCli, spawnLines } from "./tools/cli-executor.ts";
import { createCliTool } from "./tools/cli-tool.ts";
import { createConfirmationStore } from "./tools/confirmation-store.ts";
import { loadActiveCliConfigs } from "./tools/cli-config-loader.ts";
import { tryConfirm } from "./router/confirm-flow.ts";
import { createJoinSpaceTool } from "./tools/google-chat-join.ts";
import { createSessionHistory, type SessionHistory } from "./session/history.ts";
import { createSummarizer } from "./session/summarizer.ts";
import { createEpisodicSummarizer } from "./session/episodic-summarizer.ts";
import { runTurn } from "./session/agent-turn.ts";
import { startTerminalRepl } from "./router/terminal.ts";
import {
  truncateForDisplay,
  describeToolOutcome,
  formatContextUsage,
  parseDumpCommand,
  defaultDumpPath,
  writeDump,
} from "./router/tool-log.ts";
import type { StepInfo } from "./session/agent-turn.ts";
import { startGoogleChatChannelManager, deriveSessionKey, NO_REPLY } from "./router/channels/google-chat-events.ts";
import { ensureSpaceSubscription, sendMessage, getUser, getOrCreateDmSpace } from "./router/channels/google-chat-client.ts";
import { resolveSenderName } from "./router/user-resolution.ts";
import { writeResolvedNote, writeSuppressionNote, writeCuratedNote, writeJiraUserResolvedNote } from "./wiki/wiki-note.ts";
import { createWikiTools } from "./wiki/wiki-tools.ts";
import { createIdleSessionScanner } from "./cron/idle-session-scanner.ts";
import { startIdleSessionCron } from "./cron/idle-session-cron.ts";
import { ensureEpisodicCollection, storeEpisodicSummary, searchEpisodicMemory } from "./memory/episodic-store.ts";
import { createEmbedder } from "./memory/embedder.ts";
import { initVault } from "./wiki/vault-init.ts";
import { findOrphanCuratedDocs } from "./wiki/orphan-detector.ts";
import { listWikiFilesInRoots, readWikiFile } from "./wiki/wiki-read.ts";
import { runRawTriagePass, runIndexAndOrphanPass, runContradictionCheckPass } from "./wiki/self-review-runner.ts";
import { startSelfReviewCron } from "./cron/self-review-cron.ts";
import { isNotificationSuppressed } from "./cron/notification-suppression.ts";
import { resolveChatTargetForJiraUser } from "./cron/identity-bridge.ts";
import { composeStaleTicketMessage } from "./cron/notification-composer.ts";
import { notifyAdmin } from "./cron/admin-notify.ts";
import { startStaleTicketCron } from "./cron/stale-ticket-cron.ts";
import { resolve as resolvePath } from "node:path";
import type { Tool } from "ai";

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
function buildSystemPrompt(opts: { jira: boolean; googleChatJoin: boolean; multiUserChannel: boolean }): string {
  const lines = ["You are Mercury, an internal assistant."];
  if (opts.jira) {
    lines.push(
      [
        "You have access to the runCommand tool, which runs a CLI command for Jira access — reading issues, and writing via issue create/transition/comment.",
        "DO:",
        '- Call runCommand with `command` set to the exact command line you would type in a terminal, e.g. `jira issue search --jql "project = KAN"` — quote values containing spaces, exactly like a real shell.',
        "- Use runCommand to get real data — never invent ticket data.",
        "- Use --help on any subcommand if you're unsure of its flags.",
        "- Use native JQL syntax for relative dates (e.g. now()) — don't compute dates yourself.",
        '- When a search can return more than one or two issues, add --fields to issue search (e.g. --fields summary,status,assignee,duedate) — the full unfiltered issue JSON is large and makes it easier to lose track of an item when listing results back to the user.',
        '- If a call is rejected, errors, or returns an empty result that seems suspicious given the question, actually call runCommand again, in this same turn, with a corrected command before giving your final answer.',
        '- If the user\'s free-text value (e.g. a status name) comes back with no results, retry with at least one likely real wording (e.g. "todo" → "To Do") before concluding there\'s no data.',
        "- issue create/transition/comment run immediately, no confirmation needed — tell the user what you did (e.g. the new issue's key) after it succeeds.",
        '- issue delete is irreversible: runCommand won\'t execute it directly. Instead you\'ll get back a `token` and a `pendingConfirmation` result — relay that exact token to the user verbatim and ask them to reply exactly `conferma <token>` to proceed. Never invent a token, never claim the deletion already happened.',
        "",
        "DON'T:",
        "- DON'T just say you'll retry and stop there — an empty/rejected/suspicious result means retry for real, not just talk about it.",
        "- DON'T alter, abbreviate, or make up a confirmation token — copy it exactly as returned.",
      ].join("\n"),
    );
  }
  // Always present (WIKI_VAULT_PATH is a required env var, the vault
  // always exists once Mercury boots) — unlike jira/googleChatJoin, this
  // block doesn't need its own opts flag.
  lines.push(
    [
      "You have access to wiki tools: list_files, read_file, grep, write_file — Mercury's own knowledge base. " +
        "curated/ is team knowledge (conventions, docs, project status) — written by maintainers, and by you. " +
        "inferred/ is private per-user notes managed automatically by a separate process, not by you directly.",
      "DO:",
      "- For a CLI's own syntax/flags, rely on --help first. Only check the wiki if --help doesn't cover something specific to how this team uses that tool (a convention, a naming pattern, a policy).",
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

  if (opts.googleChatJoin) {
    lines.push(
      [
        "You have access to the joinSpace tool.",
        "DO:",
        "- If a user asks you to participate in a specific Google Chat space, use it to start listening immediately instead of waiting for periodic discovery.",
      ].join("\n"),
    );
  }

  if (opts.multiUserChannel) {
    // Interim, explicitly non-deterministic mitigation for Mercury replying
    // to every message in a shared space — not a replacement for real
    // mention detection, which needs Mercury's own identity (not available
    // yet). See NO_REPLY in google-chat-events.ts for the code side of this check.
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
const googleChatTopic = process.env.GOOGLE_CHAT_PUBSUB_TOPIC;

// Two separate system prompts, not one shared string: the multiUserChannel
// clause (NO_REPLY heuristic) must never reach the terminal, which is
// always a private 1:1 conversation — an operator typing normally
// shouldn't risk an unexpected NO_REPLY meant for a shared Google Chat space.
const system = buildSystemPrompt({ jira: jiraEnabled, googleChatJoin: Boolean(googleChatTopic), multiUserChannel: false });
const chatSystem = buildSystemPrompt({ jira: jiraEnabled, googleChatJoin: Boolean(googleChatTopic), multiUserChannel: true });

const provider = getOllamaProvider();
const ollamaHost = requireEnv("OLLAMA_HOST"); // already validated by getOllamaProvider(); read again here for getLoadedContextLength's direct HTTP call
const ollamaModel = requireEnv("OLLAMA_MODEL");
const model = provider(ollamaModel);
const summarize = createSummarizer(model);

const histories = new Map<string, SessionHistory>();
function getOrCreateHistory(key: string): SessionHistory {
  let history = histories.get(key);
  if (!history) {
    history = createSessionHistory(summarize);
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
const idleScanner = createIdleSessionScanner();
const episodicSummarize = createEpisodicSummarizer(model);
const embeddingModel = provider.textEmbeddingModel(process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text");
const embed = createEmbedder(embeddingModel);
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL ?? "http://qdrant:6333" });
const episodicCollection = process.env.QDRANT_EPISODIC_COLLECTION ?? "episodic_memory";
const episodicVectorSize = Number(process.env.QDRANT_EPISODIC_VECTOR_SIZE ?? "768");
await ensureEpisodicCollection(qdrant, episodicCollection, episodicVectorSize);

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
    summarize: episodicSummarize,
    store: (entry) => storeEpisodicSummary(qdrant, episodicCollection, embed, entry),
    closeSession: (key) => {
      histories.delete(key);
      sessionUsers.delete(key);
    },
    log: (msg) => console.error(`[cron] ${msg}`),
  },
  {
    idleTimeoutMs: Number(process.env.SESSION_IDLE_TIMEOUT_MS ?? String(30 * 60_000)),
    checkIntervalMs: Number(process.env.SESSION_IDLE_CHECK_INTERVAL_MS ?? String(60_000)),
  },
);
void idleCron; // kept alive for the process lifetime; no shutdown hook exists yet (same as the rest of Mercury today)

// Idempotent self-heal: the vault lives on a named Docker volume, empty on
// first boot and not pre-populatable at build time like the CLI binaries —
// re-running this every startup is cheap and means a wiped/fresh volume
// never needs a separate manual provisioning step.
const wikiVaultPath = requireEnv("WIKI_VAULT_PATH");
await initVault(wikiVaultPath);

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

// Needs both an active Jira CLI config (there's nothing to query
// otherwise) and an admin space (the identity bridge and unassigned-ticket
// path both need somewhere to send an ownerless finding) — skip cleanly
// with a clear reason instead of starting a cron that will fail on its
// first ownerless case.
const mercuryAdminSpace = process.env.MERCURY_ADMIN_SPACE;
if (jiraEnabled && mercuryAdminSpace) {
  const staleTicketCron = startStaleTicketCron(
    {
      vaultPath: wikiVaultPath,
      adminSpace: mercuryAdminSpace,
      model,
      runCliFn: runCli,
      readWikiFileFn: readWikiFile,
      writeCuratedNoteFn: writeCuratedNote,
      writeJiraUserResolvedNoteFn: writeJiraUserResolvedNote,
      isNotificationSuppressedFn: isNotificationSuppressed,
      resolveChatTargetForJiraUserFn: resolveChatTargetForJiraUser,
      historyFn: (userId, queryText) => searchEpisodicMemory(qdrant, episodicCollection, embed, { userId, queryText }),
      composeStaleTicketMessageFn: composeStaleTicketMessage,
      getOrCreateDmSpaceFn: getOrCreateDmSpace,
      sendMessageFn: sendMessage,
      notifyAdminFn: notifyAdmin,
      recordEventFn: (entry) => storeEpisodicSummary(qdrant, episodicCollection, embed, entry),
      log: (msg) => console.error(`[cron] ${msg}`),
    },
    { checkIntervalMs: Number(process.env.STALE_TICKET_CHECK_INTERVAL_MS ?? String(60 * 60_000)) },
  );
  void staleTicketCron; // kept alive for the process lifetime, same as idleCron
} else if (jiraEnabled) {
  console.error("[cron] stale-ticket check not started: MERCURY_ADMIN_SPACE is not set");
}

// runCommand's confirm-required branch stages a command per-session (see
// createCliTool's opts) — the tool itself must therefore be rebuilt fresh
// for each turn, scoped to that turn's own sessionKey, rather than built
// once here and shared across every session like the rest of `tools`
// historically was. `staticTools` holds whatever doesn't need that
// (joinSpace, assigned below), `buildTools` layers the session-scoped
// runCommand on top for a given turn.
const confirmationStore = createConfirmationStore();
const staticTools: Record<string, Tool> = {};

// `wikiUserId` is separate from `sessionKey`: inferred/users/<userId> notes
// are scoped per-person, not per-(space,person) pair, so it must not
// include the space. Terminal has no real per-user identity (single
// operator), so it just uses a fixed "terminal" id.
function buildTools(sessionKey: string, wikiUserId: string): Record<string, Tool> {
  const sessionTools: Record<string, Tool> = { ...staticTools };
  if (Object.keys(activeCliConfigs).length > 0) {
    Object.assign(
      sessionTools,
      createCliTool(runCli, activeCliConfigs, { sessionKey, store: confirmationStore }),
    );
  }
  Object.assign(sessionTools, createWikiTools({ vaultPath: wikiVaultPath, userId: wikiUserId }));
  return sessionTools;
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

if (googleChatTopic) {
  const manager = startGoogleChatChannelManager(
    async (input, space, sender) => {
      const sessionKey = deriveSessionKey(space, sender);
      // Touch before processing, not after: the idle clock should track time
      // since the human's last message, not Mercury's response latency.
      sessionUsers.set(sessionKey, sender);
      idleScanner.touch(sessionKey, Date.now());
      // Lazy, on-demand: resolves (and caches in the vault) the sender's
      // display name the first time this id is seen, since Chat's own API
      // never exposes one on message.sender. Never blocks/fails the turn —
      // a resolution failure just means no name marker gets prepended.
      const senderName = await resolveSenderName(sender, {
        vaultPath: wikiVaultPath,
        getUserFn: getUser,
        runCliFn: runCli,
        writeResolvedNoteFn: writeResolvedNote,
      });
      const markedInput = senderName ? `[Da: ${senderName}]\n${input}` : input;
      return runTurn(getOrCreateHistory(sessionKey), markedInput, {
        model,
        // encodeURIComponent: matches how writeResolvedNote already encodes
        // the sender id (which contains "/", e.g. "users/42") into a safe
        // single path segment — using the raw sender here would scope wiki
        // tool access to a directory that never actually gets written to.
        tools: buildTools(sessionKey, encodeURIComponent(sender)),
        system: chatSystem,
        onStepFinish: (step) => logStep(`[chat:${space}:${sender}] `, step),
        onUsage: (inputTokens) =>
          console.error(`[chat:${space}:${sender}] [usage] inputTokens=${inputTokens ?? "?"}`),
      });
    },
    {
      spawnLinesFn: spawnLines,
      sendMessageFn: sendMessage,
      ensureSpaceSubscriptionFn: ensureSpaceSubscription,
      runCliFn: runCli,
      store: confirmationStore,
      vaultPath: wikiVaultPath,
      writeSuppressionNoteFn: writeSuppressionNote,
      recordSuppressionEventFn: (entry) => storeEpisodicSummary(qdrant, episodicCollection, embed, entry),
    },
    {
      topic: googleChatTopic,
      spaces: (process.env.GOOGLE_CHAT_SPACES ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    },
  );
  Object.assign(staticTools, createJoinSpaceTool(manager.ensureChannel));
}

let lastSteps: StepInfo[] = [];

// Real (not estimated) context-usage figures for the prompt indicator
// below. lastInputTokens comes from runTurn's onUsage, once a turn has
// actually completed. contextLength is fetched lazily, after the first
// turn — /api/ps only reports models that are actually loaded, and the
// model isn't loaded until its first real call.
let lastInputTokens: number | undefined;
let contextLength: number | null = null;

await startTerminalRepl(
  async (input, onChunk) => {
    const dumpCommand = parseDumpCommand(input);
    if (dumpCommand) {
      const path = dumpCommand.path ?? defaultDumpPath();
      await writeDump(path, lastSteps);
      return `wrote ${lastSteps.length} tool step(s) from the last turn to ${path}`;
    }

    // Same deterministic interception as Google Chat's processLine — never
    // let running a previously-approved mutation depend on the model.
    const confirmReply = await tryConfirm(input, "terminal", {
      store: confirmationStore,
      runCliFn: runCli,
      userId: "terminal",
      vaultPath: wikiVaultPath,
      writeSuppressionNoteFn: writeSuppressionNote,
      recordSuppressionEventFn: (entry) => storeEpisodicSummary(qdrant, episodicCollection, embed, entry),
    });
    if (confirmReply !== null) {
      return confirmReply;
    }

    lastSteps = [];
    const result = await runTurn(getOrCreateHistory("terminal"), input, {
      model,
      tools: buildTools("terminal", "terminal"),
      system,
      // Streams the answer to the terminal as it's generated instead of
      // going silent for however long the full response takes — the local
      // development model can take several seconds. Google Chat's wiring
      // above never sets this, since `messages send` needs one complete
      // message anyway.
      onTextChunk: onChunk,
      // Visibility into what Mercury did before answering, same as Google
      // Chat's wiring above (see logStep) — additionally kept in
      // lastSteps here so the terminal-only `/dump` command can write the
      // untruncated version to a file.
      onStepFinish: (step) => {
        lastSteps.push(step);
        logStep("", step);
      },
      onUsage: (inputTokens) => {
        lastInputTokens = inputTokens;
      },
    });
    if (contextLength === null) {
      contextLength = await getLoadedContextLength(ollamaHost, ollamaModel);
    }
    return result;
  },
  undefined,
  // A degraded answer under a long conversation is hard to tell apart by
  // eye from "the context is genuinely near full" — this shows a live,
  // real figure right before every prompt, terminal-only debugging aid.
  { promptSuffix: () => formatContextUsage(lastInputTokens, contextLength) },
);
