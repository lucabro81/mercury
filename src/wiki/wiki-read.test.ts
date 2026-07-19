import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeCuratedNote, writeInferredNote } from "./wiki-note.ts";
import { listWikiFiles, readWikiFile, grepWiki } from "./wiki-read.ts";
import { initVault } from "./vault-init.ts";

const tempDirs: string[] = [];

// writeCuratedNote/writeInferredNote now commit after writing (D-16) —
// git add/commit fail outright against a non-repo, so the vault needs to
// be a real git repo before any write, not just a bare temp dir.
async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-wiki-read-test-"));
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

async function seedVault(vaultPath: string) {
  await writeCuratedNote(vaultPath, "standards/jira-fields.md", {}, "Convenzioni sui campi custom.");
  await writeCuratedNote(vaultPath, "glossary.md", {}, "Glossario del team.");
  await writeInferredNote(
    vaultPath,
    "user-a",
    "ticket_closing_style",
    { confidence: "medium", derived_from: ["ep_1"], last_reviewed: null },
    "user-a chiude i ticket a lotti.",
  );
  await writeInferredNote(
    vaultPath,
    "user-b",
    "review_responsiveness",
    { confidence: "low", derived_from: ["ep_2"], last_reviewed: null },
    "user-b risponde alle review lentamente.",
  );
}

describe("listWikiFiles", () => {
  it("returns an empty list on a vault with no content yet", async () => {
    const vaultPath = await makeTempVault();
    const files = await listWikiFiles(vaultPath, "user-a");
    expect(files).toEqual([]);
  });

  it("lists all curated files plus only the caller's own inferred files", async () => {
    const vaultPath = await makeTempVault();
    await seedVault(vaultPath);

    const files = await listWikiFiles(vaultPath, "user-a");
    expect(files.sort()).toEqual(
      [
        "curated/glossary.md",
        "curated/standards/jira-fields.md",
        "inferred/users/user-a/ticket_closing_style.md",
      ].sort(),
    );
    expect(files).not.toContain("inferred/users/user-b/review_responsiveness.md");
  });
});

describe("readWikiFile", () => {
  it("reads a curated file", async () => {
    const vaultPath = await makeTempVault();
    await seedVault(vaultPath);

    const content = await readWikiFile(vaultPath, "user-a", "curated/glossary.md");
    expect(content).toContain("Glossario del team.");
  });

  it("reads the caller's own inferred file", async () => {
    const vaultPath = await makeTempVault();
    await seedVault(vaultPath);

    const content = await readWikiFile(vaultPath, "user-a", "inferred/users/user-a/ticket_closing_style.md");
    expect(content).toContain("user-a chiude i ticket a lotti.");
  });

  it("rejects reading another user's inferred file", async () => {
    const vaultPath = await makeTempVault();
    await seedVault(vaultPath);

    await expect(
      readWikiFile(vaultPath, "user-a", "inferred/users/user-b/review_responsiveness.md"),
    ).rejects.toThrow();
  });

  it("rejects a path-traversal attempt", async () => {
    const vaultPath = await makeTempVault();
    await seedVault(vaultPath);

    await expect(readWikiFile(vaultPath, "user-a", "../../etc/passwd")).rejects.toThrow();
  });
});

describe("grepWiki", () => {
  it("finds matches in curated and the caller's own inferred files, not other users'", async () => {
    const vaultPath = await makeTempVault();
    await seedVault(vaultPath);

    const matches = await grepWiki(vaultPath, "user-a", "chiude i ticket");
    expect(matches.length).toBe(1);
    expect(matches[0]!.path).toBe("inferred/users/user-a/ticket_closing_style.md");
    expect(matches[0]!.text).toContain("chiude i ticket a lotti");
  });

  it("returns no matches for content that only exists in another user's inferred notes", async () => {
    const vaultPath = await makeTempVault();
    await seedVault(vaultPath);

    const matches = await grepWiki(vaultPath, "user-a", "risponde alle review");
    expect(matches).toEqual([]);
  });
});
