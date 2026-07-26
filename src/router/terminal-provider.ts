/**
 * The terminal channel's `Provider` implementation — wraps
 * `startTerminalRepl` (`src/router/terminal.ts`, unmodified) and owns
 * everything specific to running Mercury from a terminal: the `/dump`
 * command, `conferma <token>` interception, the dim/italic tool-status
 * rendering, and the live context-usage prompt suffix.
 *
 * A single operator, one conversation at a time — there is no real
 * per-user identity here, so `notify`/`notifyAdmin` just write to stderr
 * rather than actually reaching anyone; implemented (not left optional)
 * so a caller that expects a `Notifier` never silently loses a message.
 */
import { startTerminalRepl } from "./terminal.ts";
import { tryConfirm } from "./confirm-flow.ts";
import { parseDumpCommand, defaultDumpPath, writeDump, formatContextUsage } from "./tool-log.ts";
import { getLoadedContextLength } from "../model/context-size.ts";
import type { Provider, HandleTurn, TurnSink } from "./provider.ts";
import type { StepInfo } from "../session/agent-turn.ts";
import type { ConfirmationStore } from "../tools/confirmation-store.ts";
import type { runCli } from "../tools/cli-executor.ts";
import type { writeSuppressionNote } from "../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";

const TERMINAL_SESSION_KEY = "terminal";

export type TerminalProviderDeps = {
  confirmDeps: {
    store: ConfirmationStore;
    runCliFn: typeof runCli;
    vaultPath: string;
    writeSuppressionNoteFn: typeof writeSuppressionNote;
    recordSuppressionEventFn: (entry: EpisodicSummary) => Promise<void>;
    now?: () => Date;
  };
  ollamaHost: string;
  ollamaModel: string;
  /** Test seam; defaults to the real `getLoadedContextLength`. */
  getLoadedContextLengthFn?: typeof getLoadedContextLength;
  /** Test seam; defaults to the real `startTerminalRepl`. */
  startTerminalReplFn?: typeof startTerminalRepl;
  /** Test seam; defaults to the real `tryConfirm`. */
  tryConfirmFn?: typeof tryConfirm;
  /** Test seam; defaults to `console.error`. */
  stderrWrite?: (s: string) => void;
};

/** Builds the terminal's `Provider`. */
export function createTerminalProvider(deps: TerminalProviderDeps): Provider {
  const stderrWrite = deps.stderrWrite ?? ((s: string) => console.error(s));
  const getLoadedContextLengthFn = deps.getLoadedContextLengthFn ?? getLoadedContextLength;
  const tryConfirmFn = deps.tryConfirmFn ?? tryConfirm;
  const startTerminalReplFn = deps.startTerminalReplFn ?? startTerminalRepl;

  let lastSteps: StepInfo[] = [];
  let lastInputTokens: number | undefined;
  let contextLength: number | null = null;

  return {
    async start(handleTurn: HandleTurn): Promise<void> {
      await startTerminalReplFn(
        async (input, onChunk) => {
          const dumpCommand = parseDumpCommand(input);
          if (dumpCommand) {
            const path = dumpCommand.path ?? defaultDumpPath();
            await writeDump(path, lastSteps);
            return `wrote ${lastSteps.length} tool step(s) from the last turn to ${path}`;
          }

          // Same deterministic interception as every other channel — never
          // let running a previously-approved mutation depend on the model.
          const confirmReply = await tryConfirmFn(input, TERMINAL_SESSION_KEY, {
            ...deps.confirmDeps,
            userId: TERMINAL_SESSION_KEY,
          });
          if (confirmReply !== null) {
            return confirmReply;
          }

          lastSteps = [];
          let finalText = "";
          const dim = (label: string) => onChunk(`\x1b[2m\x1b[3m${label}\x1b[0m\n`);
          const sink: TurnSink = {
            onToolStart: dim,
            onTextChunk: onChunk,
            onStep: (step) => lastSteps.push(step),
            onUsage: (tokens) => {
              lastInputTokens = tokens;
            },
            finalize: async (text) => {
              finalText = text;
            },
            dispose: () => {},
          };

          await handleTurn(
            {
              channel: "terminal",
              multiUser: false,
              text: input,
              sessionKey: TERMINAL_SESSION_KEY,
              wikiUserId: TERMINAL_SESSION_KEY,
              logPrefix: "",
            },
            sink,
          );

          // Lazy, on-demand: /api/ps only reports models actually loaded,
          // and the model isn't loaded until its first real call.
          if (contextLength === null) {
            contextLength = await getLoadedContextLengthFn(deps.ollamaHost, deps.ollamaModel);
          }
          return finalText;
        },
        undefined,
        { promptSuffix: () => formatContextUsage(lastInputTokens, contextLength) },
      );
    },

    async notify(userId: string, text: string): Promise<{ sessionKey: string }> {
      stderrWrite(`[notify] to ${userId}: ${text}`);
      return { sessionKey: TERMINAL_SESSION_KEY };
    },

    async notifyAdmin(text: string): Promise<void> {
      stderrWrite(`[notify] admin: ${text}`);
    },
  };
}
