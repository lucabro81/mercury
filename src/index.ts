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
import { runCli, spawnLines } from "./tools/cli-executor.ts";
import { createJiraTool } from "./tools/jira.ts";
import { createJoinSpaceTool } from "./tools/google-chat-join.ts";
import { createSessionHistory, type SessionHistory } from "./session/history.ts";
import { createSummarizer } from "./session/summarizer.ts";
import { runTurn } from "./session/agent-turn.ts";
import { startTerminalRepl } from "./router/terminal.ts";
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
      'You have access to the jiraCli tool, which runs the "jira" CLI binary for read-only Jira access. Use it to get real data — never invent ticket data. Use --help on any subcommand if you\'re unsure of its flags. Relative dates in JQL are native JQL syntax (e.g. now()) — don\'t compute dates yourself. Only read-only subcommands are permitted on this instance.',
    );
  }
  if (opts.googleChatJoin) {
    lines.push(
      "You have access to the joinSpace tool: if a user asks you to participate in a specific Google Chat space, use it to start listening immediately instead of waiting for periodic discovery.",
    );
  }
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
const model = provider(requireEnv("OLLAMA_MODEL"));
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

if (googleChatTopic) {
  const manager = startGoogleChatChannelManager(
    (input, space) => runTurn(getOrCreateHistory(space), input, { model, tools, system }),
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

await startTerminalRepl((input) =>
  runTurn(getOrCreateHistory("terminal"), input, {
    model,
    tools,
    system,
    // Visibility into what Mercury did before answering — the terminal
    // exists for bootstrap/debugging, so showing this here is in scope;
    // Google Chat's wiring above deliberately doesn't do the same.
    onStepFinish: (step) => {
      for (const call of step.toolCalls) {
        console.error(`[tool] ${call.toolName}(${JSON.stringify(call.input)})`);
      }
    },
  }),
);
