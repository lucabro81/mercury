import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeCuratedNote, writeInferredNote } from "./wiki-note.ts";
import { createWikiTools } from "./wiki-tools.ts";
import { initVault } from "./vault-init.ts";

const tempDirs: string[] = [];

// writeCuratedNote/writeInferredNote now commit after writing —
// git add/commit fail outright against a non-repo, so the vault needs to
// be a real git repo before any write, not just a bare temp dir.
async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-wiki-tools-test-"));
  tempDirs.push(dir);
  await initVault(dir);
  return dir;
}

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

describe("createWikiTools", () => {
  it("list_files returns curated + own inferred, not other users' inferred", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "glossary.md", {}, "Glossario.");
    await writeInferredNote(vaultPath, "user-a", "topic-x", { confidence: "low", derived_from: ["ep_1"], last_reviewed: null }, "nota di user-a");
    await writeInferredNote(vaultPath, "user-b", "topic-y", { confidence: "low", derived_from: ["ep_2"], last_reviewed: null }, "nota di user-b");

    const { list_files } = createWikiTools({ vaultPath, userId: "user-a" });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await list_files.execute({}, {} as never)) as { ok: true; files: string[] };

    expect(result.ok).toBe(true);
    expect(result.files).toContain("curated/glossary.md");
    expect(result.files).toContain("inferred/users/user-a/topic-x.md");
    expect(result.files).not.toContain("inferred/users/user-b/topic-y.md");
  });

  it("read_file returns the content of an allowed file", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "glossary.md", {}, "Glossario del team.");

    const { read_file } = createWikiTools({ vaultPath, userId: "user-a" });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await read_file.execute({ path: "curated/glossary.md" }, {} as never)) as
      | { ok: true; content: string }
      | { ok: false; error: string };

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toContain("Glossario del team.");
    }
  });

  it("read_file returns a self-correctable error, not a throw, for a disallowed path", async () => {
    const vaultPath = await makeTempVault();
    await writeInferredNote(vaultPath, "user-b", "topic-y", { confidence: "low", derived_from: ["ep_2"], last_reviewed: null }, "nota di user-b");

    const { read_file } = createWikiTools({ vaultPath, userId: "user-a" });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await read_file.execute({ path: "inferred/users/user-b/topic-y.md" }, {} as never)) as
      | { ok: true; content: string }
      | { ok: false; error: string };

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeDefined();
    }
  });

  it("write_file writes under curated/ given a path relative to it", async () => {
    const vaultPath = await makeTempVault();
    const { write_file } = createWikiTools({ vaultPath, userId: "user-a" });

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await write_file.execute(
      { path: "standards/new-doc.md", content: "Nuovo standard." },
      {} as never,
    )) as { ok: true } | { ok: false; error: string };

    expect(result.ok).toBe(true);
    const text = await readFile(join(vaultPath, "curated/standards/new-doc.md"), "utf-8");
    expect(text).toContain("Nuovo standard.");
    expect(text).toContain("type: curated");
  });

  it("write_file cannot be used to write into inferred/ (only curated/ is reachable)", async () => {
    const vaultPath = await makeTempVault();
    const { write_file } = createWikiTools({ vaultPath, userId: "user-a" });

    // the tool only ever writes under curated/, so passing an inferred-looking
    // path just becomes a literal curated/ subpath, never an escape into inferred/
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await write_file.execute({ path: "../inferred/users/user-a/hacked.md", content: "x" }, {} as never);

    const { list_files } = createWikiTools({ vaultPath, userId: "user-a" });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await list_files.execute({}, {} as never)) as { ok: true; files: string[] };
    expect(result.files).not.toContain("inferred/users/user-a/hacked.md");
  });

  it("grep finds matches only within the caller's allowed scope", async () => {
    const vaultPath = await makeTempVault();
    await writeInferredNote(vaultPath, "user-a", "topic-x", { confidence: "low", derived_from: ["ep_1"], last_reviewed: null }, "pattern-unico-a");
    await writeInferredNote(vaultPath, "user-b", "topic-y", { confidence: "low", derived_from: ["ep_2"], last_reviewed: null }, "pattern-unico-b");

    const { grep } = createWikiTools({ vaultPath, userId: "user-a" });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await grep.execute({ pattern: "pattern-unico" }, {} as never)) as
      | { ok: true; matches: { path: string; line: number; text: string }[] }
      | { ok: false; error: string };

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches.length).toBe(1);
      expect(result.matches[0]!.path).toBe("inferred/users/user-a/topic-x.md");
    }
  });
});
