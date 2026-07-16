import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { writeCuratedNote, writeInferredNote } from "./wiki-note.ts";

const tempDirs: string[] = [];

async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-wiki-note-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

function splitFrontmatter(fileText: string): { frontmatter: unknown; body: string } {
  const match = fileText.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
  if (!match) throw new Error("file does not have the expected frontmatter shape");
  return { frontmatter: parseYaml(match[1]!), body: match[2]! };
}

describe("writeCuratedNote", () => {
  it("writes a file under curated/ with type: curated frontmatter and the given body", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "standards/jira-fields.md", { author: "luca" }, "Convenzioni sui campi custom.");

    const text = await readFile(join(vaultPath, "curated/standards/jira-fields.md"), "utf-8");
    const { frontmatter, body } = splitFrontmatter(text);
    expect(frontmatter).toEqual({ type: "curated", author: "luca" });
    expect(body).toBe("Convenzioni sui campi custom.\n");
  });

  it("refuses to write outside the vault via a path-traversing relativePath", async () => {
    const vaultPath = await makeTempVault();
    await expect(
      writeCuratedNote(vaultPath, "../../etc/evil.md", {}, "pwned"),
    ).rejects.toThrow();
  });
});

describe("writeInferredNote", () => {
  it("writes a file under inferred/users/<userId>/<topic>.md with full frontmatter", async () => {
    const vaultPath = await makeTempVault();
    await writeInferredNote(
      vaultPath,
      "user-42",
      "ticket_closing_style",
      { confidence: "medium", derived_from: ["ep_a1b2", "ep_c3d4"], last_reviewed: null },
      "L'utente tende a chiudere i ticket a lotti.",
    );

    const text = await readFile(join(vaultPath, "inferred/users/user-42/ticket_closing_style.md"), "utf-8");
    const { frontmatter, body } = splitFrontmatter(text);
    expect(frontmatter).toEqual({
      type: "inferred",
      source: "agent",
      confidence: "medium",
      derived_from: ["ep_a1b2", "ep_c3d4"],
      last_reviewed: null,
    });
    expect(body).toBe("L'utente tende a chiudere i ticket a lotti.\n");
  });

  it("rejects an invalid confidence value before writing anything", async () => {
    const vaultPath = await makeTempVault();
    await expect(
      writeInferredNote(
        vaultPath,
        "user-42",
        "ticket_closing_style",
        // @ts-expect-error deliberately invalid for the test
        { confidence: "very-high", derived_from: ["ep_a1b2"], last_reviewed: null },
        "body",
      ),
    ).rejects.toThrow();
  });

  it("rejects a topic containing a path separator", async () => {
    const vaultPath = await makeTempVault();
    await expect(
      writeInferredNote(
        vaultPath,
        "user-42",
        "../../evil",
        { confidence: "low", derived_from: ["ep_a1b2"], last_reviewed: null },
        "body",
      ),
    ).rejects.toThrow();
  });

  it("rejects a userId containing a path separator", async () => {
    const vaultPath = await makeTempVault();
    await expect(
      writeInferredNote(
        vaultPath,
        "../../evil",
        "ticket_closing_style",
        { confidence: "low", derived_from: ["ep_a1b2"], last_reviewed: null },
        "body",
      ),
    ).rejects.toThrow();
  });
});
