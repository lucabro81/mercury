/**
 * Generic subprocess runner for the external CLI binaries Mercury talks
 * to (jira, google-chat, ...). Every external integration is a separate
 * CLI binary invoked as a subprocess — never an arbitrary shell string,
 * never MCP. This file is the one and only place that spawns a process
 * for a one-shot command/response interaction.
 *
 * Used by: `src/tools/jira.ts` (`createJiraTool`'s `execute`), and any
 * future per-CLI tool module that follows the same pattern.
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
