/**
 * Zips `sourceDirName` (a directory inside `cwd`, e.g. "results") into
 * `<cwd>/<archiveFileName>`, leaving the source directory itself untouched —
 * a point-in-time backup of a finished benchmark run, not a replacement for
 * it. `zip` runs with `cwd` set to the source's parent so the archive's
 * internal paths stay relative (`results/model/...`) instead of embedding
 * the host's absolute path. Naming (what goes in `archiveFileName`, e.g.
 * which models/timestamp) is entirely up to the caller.
 */
import { resolve } from "node:path";

export async function archiveResults(cwd: string, sourceDirName: string, archiveFileName: string): Promise<string> {
  const archivePath = resolve(cwd, archiveFileName);
  const proc = Bun.spawn(["zip", "-rq", archivePath, sourceDirName], { cwd, stdout: "pipe", stderr: "pipe" });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`zip exited ${exitCode}: ${stderr}`);
  }
  return archivePath;
}
