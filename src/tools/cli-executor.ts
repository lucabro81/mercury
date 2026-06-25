export type CliResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

function spawnPiped(binary: string, args: string[]) {
  return Bun.spawn([binary, ...args], { stdout: "pipe", stderr: "pipe" });
}

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
