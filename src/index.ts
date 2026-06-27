/**
 * Composition root: wires the model, the per-CLI tools this instance
 * has enabled, and the channels (terminal always, Google Chat if
 * configured) into running conversations.
 *
 * This is the only file that decides which tools actually exist on
 * this instance — `jiraCli` only if `jira` is in `MERCURY_CLIS`,
 * `joinSpace` only if the Google Chat channel is configured. Every
 * other module (`runTurn`, the channels) takes tools/system as inputs
 * rather than assuming any of them exist, specifically so this file can
 * make that call in one place.
 */
import { getOllamaProvider } from "./model/client.ts";
import { getLoadedContextLength } from "./model/context-size.ts";
import { runCli, spawnLines } from "./tools/cli-executor.ts";
import { createJiraTool } from "./tools/jira.ts";
import { createJoinSpaceTool } from "./tools/google-chat-join.ts";
import { createSessionHistory, type SessionHistory } from "./session/history.ts";
import { createSummarizer } from "./session/summarizer.ts";
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
import { startGoogleChatChannelManager } from "./router/channels/google-chat-events.ts";
import {
  ensureSpaceSubscription,
  sendMessage,
  listSpaces,
} from "./router/channels/google-chat-client.ts";
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
function buildSystemPrompt(opts: { jira: boolean; googleChatJoin: boolean }): string {
  const lines = ["You are Mercury, an internal assistant."];
  if (opts.jira) {
    lines.push(
      [
        'You have access to the jiraCli tool, which runs the "jira" CLI binary for read-only Jira access.',
        "DO:",
        "- Use jiraCli to get real data — never invent ticket data.",
        "- Use --help on any subcommand if you're unsure of its flags.",
        "- Use native JQL syntax for relative dates (e.g. now()) — don't compute dates yourself.",
        '- When a search can return more than one or two issues, add --fields to issue search (e.g. --fields summary,status,assignee,duedate) — the full unfiltered issue JSON is large and makes it easier to lose track of an item when listing results back to the user.',
        '- If a call is rejected, errors, or returns an empty result that seems suspicious given the question, actually call jiraCli again, in this same turn, with a corrected command/JQL before giving your final answer.',
        '- If the user\'s free-text value (e.g. a status name) comes back with no results, retry with at least one likely real wording (e.g. "todo" → "To Do") before concluding there\'s no data.',
        "",
        "DON'T:",
        "- DON'T run any subcommand other than read-only ones — only read-only subcommands are permitted on this instance.",
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
const jiraEnabled = enabledClis.includes("jira");
const googleChatTopic = process.env.GOOGLE_CHAT_PUBSUB_TOPIC;

const system = buildSystemPrompt({ jira: jiraEnabled, googleChatJoin: Boolean(googleChatTopic) });

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

const tools: Record<string, Tool> = {};
if (jiraEnabled) {
  Object.assign(tools, createJiraTool(runCli));
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
    (input, space) =>
      runTurn(getOrCreateHistory(space), input, {
        model,
        tools,
        system,
        onStepFinish: (step) => logStep(`[chat:${space}] `, step),
        onUsage: (inputTokens) => console.error(`[chat:${space}] [usage] inputTokens=${inputTokens ?? "?"}`),
      }),
    {
      spawnLinesFn: spawnLines,
      sendMessageFn: sendMessage,
      ensureSpaceSubscriptionFn: ensureSpaceSubscription,
      listSpacesFn: listSpaces,
      runCliFn: runCli,
    },
    {
      topic: googleChatTopic,
      discoveryIntervalMs: Number(process.env.GOOGLE_CHAT_DISCOVERY_INTERVAL_MS) || 60_000,
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
