import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm, mkdir, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { archiveResults } from "./archive-results.ts";

const tempDirs: string[] = [];

async function makeTempDirWithResults(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-archive-results-test-"));
  tempDirs.push(dir);
  await mkdir(join(dir, "results", "some-model", "some-case"), { recursive: true });
  await writeFile(join(dir, "results", "some-model", "some-case", "trial-1.json"), '{"ok":true}', "utf-8");
  return dir;
}

async function listZipEntries(zipPath: string): Promise<string[]> {
  const proc = Bun.spawn(["unzip", "-Z1", zipPath], { stdout: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim().split("\n").filter(Boolean);
}

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

describe("archiveResults", () => {
  it("zips the results dir into the given archive file name next to it", async () => {
    const cwd = await makeTempDirWithResults();

    const archivePath = await archiveResults(cwd, "results", "results-gemma4_12b+qwen3.6_27b-1234567890.zip");

    expect(archivePath).toBe(join(cwd, "results-gemma4_12b+qwen3.6_27b-1234567890.zip"));
    const entries = await listZipEntries(archivePath);
    expect(entries).toContain("results/some-model/some-case/trial-1.json");
  });

  it("leaves the original results dir untouched", async () => {
    const cwd = await makeTempDirWithResults();

    await archiveResults(cwd, "results", "results-1234567890.zip");

    const files = await readdir(join(cwd, "results", "some-model", "some-case"));
    expect(files).toEqual(["trial-1.json"]);
  });

  it("rejects with zip's stderr when the source dir doesn't exist", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "mercury-archive-results-test-"));
    tempDirs.push(cwd);

    await expect(archiveResults(cwd, "results", "results-1234567890.zip")).rejects.toThrow();
  });
});
