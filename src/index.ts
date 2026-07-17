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
import { loadActiveCliConfigs } from "./tools/cli-config-loader.ts";
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
import { ensureSpaceSubscription, sendMessage } from "./router/channels/google-chat-client.ts";
import { createIdleSessionScanner } from "./cron/idle-session-scanner.ts";
import { startIdleSessionCron } from "./cron/idle-session-cron.ts";
import { ensureEpisodicCollection, storeEpisodicSummary } from "./memory/episodic-store.ts";
import { createEmbedder } from "./memory/embedder.ts";
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
        "You have access to the runCommand tool, which runs a CLI command for read-only Jira access.",
        "DO:",
        '- Call runCommand with `command` set to the exact command line you would type in a terminal, e.g. `jira issue search --jql "project = KAN"` — quote values containing spaces, exactly like a real shell.',
        "- Use runCommand to get real data — never invent ticket data.",
        "- Use --help on any subcommand if you're unsure of its flags.",
        "- Use native JQL syntax for relative dates (e.g. now()) — don't compute dates yourself.",
        '- When a search can return more than one or two issues, add --fields to issue search (e.g. --fields summary,status,assignee,duedate) — the full unfiltered issue JSON is large and makes it easier to lose track of an item when listing results back to the user.',
        '- If a call is rejected, errors, or returns an empty result that seems suspicious given the question, actually call runCommand again, in this same turn, with a corrected command before giving your final answer.',
        '- If the user\'s free-text value (e.g. a status name) comes back with no results, retry with at least one likely real wording (e.g. "todo" → "To Do") before concluding there\'s no data.',
        "",
        "DON'T:",
        "- DON'T just say you'll retry and stop there — an empty/rejected/suspicious result means retry for real, not just talk about it.",
      ].join("\n"),
    );
  }
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
    // Interim, explicitly non-deterministic mitigation for the "replies to
    // every message" gap (DECISIONS.md D-33/S-08) — not a replacement for
    // real mention detection, which needs Mercury's own identity. See
    // NO_REPLY in google-chat-events.ts for the code side of this check.
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
// always 1:1 (D-23) — an operator typing normally shouldn't risk an
// unexpected NO_REPLY meant for a shared Google Chat space.
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

// D-20 (session persistence, Layer 3): a Google Chat session idle past
// SESSION_IDLE_TIMEOUT_MS is summarized (not the Layer-1 summarizer above —
// see episodic-summarizer.ts for why) and written to Qdrant as a dated
// episodic record, then discarded from `histories`. Terminal sessions are
// never tracked here — D-23, not a real multi-user surface, and D-15's
// per-user isolation needs a real Google Chat sender, which the terminal
// doesn't have.
const sessionUsers = new Map<string, string>(); // session key -> Google Chat sender (userId, D-15)
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

const tools: Record<string, Tool> = {};
if (Object.keys(activeCliConfigs).length > 0) {
  Object.assign(tools, createCliTool(runCli, activeCliConfigs));
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
    (input, space, sender) => {
      const sessionKey = deriveSessionKey(space, sender);
      // Touch before processing, not after: D-20's idle clock tracks time
      // since the human's last message, not Mercury's response latency.
      sessionUsers.set(sessionKey, sender);
      idleScanner.touch(sessionKey, Date.now());
      return runTurn(getOrCreateHistory(sessionKey), input, {
        model,
        tools,
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
    },
    {
      topic: googleChatTopic,
      spaces: (process.env.GOOGLE_CHAT_SPACES ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    },
  );
  Object.assign(tools, createJoinSpaceTool(manager.ensureChannel));
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

    lastSteps = [];
    const result = await runTurn(getOrCreateHistory("terminal"), input, {
      model,
      tools,
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
