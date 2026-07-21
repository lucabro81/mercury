import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeCuratedNote, writeInferredNote, writeRawEntry } from "./wiki-note.ts";
import { createSelfReviewTools } from "./self-review-tools.ts";
import { initVault } from "./vault-init.ts";

const tempDirs: string[] = [];

async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-self-review-tools-test-"));
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

describe("createSelfReviewTools", () => {
  it("list_files returns curated/ + raw/, never inferred/ even when it exists", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "glossary.md", {}, "Glossario.");
    await writeRawEntry(vaultPath, "notes/x.md", "pasted content");
    await writeInferredNote(
      vaultPath,
      "user-a",
      "topic-x",
      { confidence: "low", derived_from: ["ep_1"], last_reviewed: null },
      "nota inferita",
    );

    const { list_files } = createSelfReviewTools({ vaultPath });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await list_files.execute({}, {} as never)) as { ok: true; files: string[] };

    expect(result.ok).toBe(true);
    expect(result.files).toContain("curated/glossary.md");
    expect(result.files).toContain("raw/notes/x.md");
    expect(result.files.some((f) => f.startsWith("inferred/"))).toBe(false);
  });

  it("read_file reads curated/ and raw/ but rejects an inferred/ path", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/x.md", "pasted content");
    await writeInferredNote(
      vaultPath,
      "user-a",
      "topic-x",
      { confidence: "low", derived_from: ["ep_1"], last_reviewed: null },
      "nota inferita",
    );

    const { read_file } = createSelfReviewTools({ vaultPath });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const rawResult = (await read_file.execute({ path: "raw/notes/x.md" }, {} as never)) as
      | { ok: true; content: string }
      | { ok: false; error: string };
    expect(rawResult.ok).toBe(true);
    if (rawResult.ok) expect(rawResult.content).toContain("pasted content");

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const inferredResult = (await read_file.execute(
      { path: "inferred/users/user-a/topic-x.md" },
      {} as never,
    )) as { ok: true; content: string } | { ok: false; error: string };
    expect(inferredResult.ok).toBe(false);
  });

  it("grep finds matches in curated/ and raw/, never in inferred/", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/x.md", "pattern-unico");
    await writeInferredNote(
      vaultPath,
      "user-a",
      "topic-x",
      { confidence: "low", derived_from: ["ep_1"], last_reviewed: null },
      "pattern-unico",
    );

    const { grep } = createSelfReviewTools({ vaultPath });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await grep.execute({ pattern: "pattern-unico" }, {} as never)) as
      | { ok: true; matches: { path: string; line: number; text: string }[] }
      | { ok: false; error: string };

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches.length).toBe(1);
      expect(result.matches[0]!.path).toBe("raw/notes/x.md");
    }
  });

  it("write_curated writes a curated doc", async () => {
    const vaultPath = await makeTempVault();
    const { write_curated } = createSelfReviewTools({ vaultPath });

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await write_curated.execute(
      { path: "standards/new-doc.md", content: "Nuovo standard." },
      {} as never,
    )) as { ok: true } | { ok: false; error: string };

    expect(result.ok).toBe(true);
    const text = await readFile(join(vaultPath, "curated/standards/new-doc.md"), "utf-8");
    expect(text).toContain("Nuovo standard.");
    expect(text).toContain("type: curated");
  });

  it("write_index writes index.md at the vault root, verbatim", async () => {
    const vaultPath = await makeTempVault();
    const { write_index } = createSelfReviewTools({ vaultPath });

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await write_index.execute(
      { content: "- [[glossary]] — team glossary" },
      {} as never,
    )) as { ok: true } | { ok: false; error: string };

    expect(result.ok).toBe(true);
    const text = await readFile(join(vaultPath, "index.md"), "utf-8");
    expect(text).toBe("- [[glossary]] — team glossary\n");
  });

  it("delete_raw deletes an existing raw/ entry", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/x.md", "body");
    const { delete_raw } = createSelfReviewTools({ vaultPath });

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await delete_raw.execute({ path: "raw/notes/x.md" }, {} as never)) as
      | { ok: true }
      | { ok: false; error: string };

    expect(result.ok).toBe(true);
    await expect(readFile(join(vaultPath, "raw/notes/x.md"), "utf-8")).rejects.toThrow();
  });

  it("delete_raw rejects a path outside raw/, so it can't be used to delete curated content", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "standards/x.md", {}, "body");
    const { delete_raw } = createSelfReviewTools({ vaultPath });

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await delete_raw.execute({ path: "curated/standards/x.md" }, {} as never)) as
      | { ok: true }
      | { ok: false; error: string };

    expect(result.ok).toBe(false);
    const text = await readFile(join(vaultPath, "curated/standards/x.md"), "utf-8");
    expect(text).toContain("body");
  });

  it("delete_curated deletes an existing curated/ doc", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "standards/superseded.md", {}, "body");
    const { delete_curated } = createSelfReviewTools({ vaultPath });

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await delete_curated.execute({ path: "curated/standards/superseded.md" }, {} as never)) as
      | { ok: true }
      | { ok: false; error: string };

    expect(result.ok).toBe(true);
    await expect(readFile(join(vaultPath, "curated/standards/superseded.md"), "utf-8")).rejects.toThrow();
  });

  it("delete_curated rejects a path outside curated/, so it can't be used to delete raw content", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/x.md", "body");
    const { delete_curated } = createSelfReviewTools({ vaultPath });

    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await delete_curated.execute({ path: "raw/notes/x.md" }, {} as never)) as
      | { ok: true }
      | { ok: false; error: string };

    expect(result.ok).toBe(false);
    const text = await readFile(join(vaultPath, "raw/notes/x.md"), "utf-8");
    expect(text).toContain("body");
  });
});
