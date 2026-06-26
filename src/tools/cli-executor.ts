/**
 * Generic subprocess runner for the external CLI binaries Mercury talks
 * to (jira, google-chat, ...). Every external integration is a separate
 * CLI binary invoked as a subprocess — never an arbitrary shell string,
 * never MCP. This file is the one and only place that spawns a process,
 * for both of the two shapes Mercury needs: a one-shot command that
 * exits and produces a single output (`runCli`), and a long-running
 * process that streams lines indefinitely (`spawnLines`).
 *
 * Used by: `src/tools/jira.ts` (`createJiraTool`'s `execute`, via
 * `runCli`) and any future per-CLI tool module that follows the same
 * pattern; `src/router/channels/google-chat-events.ts` (via
 * `spawnLines`, to consume `google-chat listen`'s output).
 */

/**
 * Result of running a CLI command: either parsed JSON stdout on success,
 * or a human/model-readable error string. Never throws — callers branch
 * on `ok` instead of catching.
 */
export type CliResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

/**
 * Thin wrapper around `Bun.spawn` with both stdout and stderr piped.
 * Extracted into its own function (rather than calling `Bun.spawn`
 * inline in `runCli`) so its return type carries the literal `"pipe"`
 * option through to the caller — assigning the spawn call to a
 * pre-declared `ReturnType<typeof Bun.spawn>` variable would otherwise
 * widen `stdout`/`stderr` to a generic union TypeScript can't narrow.
 */
function spawnPiped(binary: string, args: string[]) {
  return Bun.spawn([binary, ...args], { stdout: "pipe", stderr: "pipe" });
}

/**
 * Runs `binary` with `args`, waits for it to exit, and parses its
 * stdout as JSON.
 *
 * Resolves to `{ ok: false, error }` — never rejects/throws — for every
 * failure mode: the binary not existing on `PATH`, a non-zero exit code
 * (the error includes the exit code and stderr), or stdout that isn't
 * valid JSON. Callers (model-invoked tools) need a result they can
 * always read and pass back to the model, not an exception to catch.
 */
export async function runCli(
  binary: string,
  args: string[],
): Promise<CliResult> {
  let proc: ReturnType<typeof spawnPiped>;
  try {
    proc = spawnPiped(binary, args);
  } catch (err) {
    return { ok: false, error: `failed to spawn ${binary}: ${String(err)}` };
  }

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    return {
      ok: false,
      error: `${binary} exited with code ${exitCode}: ${stderr.trim()}`,
    };
  }

  try {
    return { ok: true, data: JSON.parse(stdout) };
  } catch {
    return {
      ok: false,
      error: `failed to parse JSON output from ${binary}: ${stdout.trim()}`,
    };
  }
}

/**
 * Spawns a long-running process and calls `onLine` once per complete
 * line written to its stdout, as the lines arrive — distinct from
 * `runCli`, which assumes a process that exits and produces a single
 * parsed output. This is what `google-chat listen` (a process that runs
 * indefinitely, printing one NDJSON event per line) needs (see
 * `src/router/channels/google-chat-events.ts`).
 *
 * A chunk read from the stream is not guaranteed to align with line
 * boundaries — this buffers partial lines across chunks and only calls
 * `onLine` once a full line (up to but not including the `\n`) has
 * arrived.
 *
 * @param opts.signal - When aborted, the spawned process is killed
 *   (Bun's native `signal` support on `Bun.spawn`) and `exited` resolves
 *   once it has actually exited. If already aborted before this is
 *   called, the process is never spawned at all and `onLine` is never
 *   called.
 * @returns `exited` resolves once the process has exited (normally or
 *   via the abort signal) and no more `onLine` calls will happen.
 */
export function spawnLines(
  binary: string,
  args: string[],
  onLine: (line: string) => void,
  opts?: { signal?: AbortSignal },
): { exited: Promise<void> } {
  if (opts?.signal?.aborted) {
    return { exited: Promise.resolve() };
  }

  const proc = Bun.spawn([binary, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    signal: opts?.signal,
  });

  const exited = (async () => {
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          onLine(buffer.slice(0, newlineIndex));
          buffer = buffer.slice(newlineIndex + 1);
        }
      }
    } catch {
      // stream torn down (e.g. the process was killed via the abort signal) — stop reading
    }
    await proc.exited;
  })();

  return { exited };
}
