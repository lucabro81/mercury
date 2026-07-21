import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm, readFile, mkdir, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  writeCuratedNote,
  writeInferredNote,
  writeResolvedNote,
  writeJiraUserResolvedNote,
  writeRawEntry,
  writeIndexFile,
  deleteRawEntry,
  deleteCuratedEntry,
  writeSuppressionNote,
} from "./wiki-note.ts";
import { initVault } from "./vault-init.ts";

const tempDirs: string[] = [];

// Every writer now commits after writing (every vault write is a
// commit) — git add/commit fail outright against a non-repo, so every test
// needs a real git-inited vault, not just a bare temp dir.
async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-wiki-note-test-"));
  tempDirs.push(dir);
  await initVault(dir);
  return dir;
}

async function gitLog(vaultPath: string): Promise<string[]> {
  const proc = Bun.spawn(["git", "log", "--format=%s"], { cwd: vaultPath, stdout: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim().split("\n").filter(Boolean);
}

async function gitStatusPorcelain(vaultPath: string): Promise<string> {
  const proc = Bun.spawn(["git", "status", "--porcelain"], { cwd: vaultPath, stdout: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

// A pre-commit hook that always fails deterministically breaks `git commit`
// specifically (hooks don't run on `git add`) — lets a test reproduce "file
// written, commit failed" without touching production code for injectability.
async function breakCommits(vaultPath: string): Promise<void> {
  const hookPath = join(vaultPath, ".git", "hooks", "pre-commit");
  await mkdir(join(vaultPath, ".git", "hooks"), { recursive: true });
  await writeFile(hookPath, "#!/bin/sh\nexit 1\n", "utf-8");
  await chmod(hookPath, 0o755);
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

  // Every vault write is a commit — audit trail + `git revert` as a
  // safety net. Regression: a write that lands on disk but is never
  // committed silently breaks that guarantee.
  it("commits the write, leaving a clean working tree", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "standards/jira-fields.md", { author: "luca" }, "body");

    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("standards/jira-fields.md");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  // Found by hand via the maintenance CLI: writing byte-identical content
  // twice made `git commit` fail with "nothing to commit" (a legitimate git
  // outcome, since there's no diff to record) — but that surfaced as a
  // thrown error to the caller, which is surprising: asking the vault to
  // contain X, when it already contains exactly X, should succeed as a
  // no-op, not fail.
  it("succeeds as a no-op, without a new commit, when the content is byte-identical to what's already there", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "standards/jira-fields.md", { author: "luca" }, "body");
    const logAfterFirst = await gitLog(vaultPath);

    await writeCuratedNote(vaultPath, "standards/jira-fields.md", { author: "luca" }, "body");

    const logAfterSecond = await gitLog(vaultPath);
    expect(logAfterSecond.length).toBe(logAfterFirst.length);
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
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

  it("commits the write, leaving a clean working tree", async () => {
    const vaultPath = await makeTempVault();
    await writeInferredNote(
      vaultPath,
      "user-42",
      "ticket_closing_style",
      { confidence: "medium", derived_from: ["ep_a1b2"], last_reviewed: null },
      "body",
    );

    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("user-42/ticket_closing_style");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
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

describe("writeResolvedNote", () => {
  it("writes a fixed resolved-name.md file under inferred/users/<userId>/ with full frontmatter", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(vaultPath, "users/42", { resolvedAt: "2026-07-19T12:00:00Z", email: null }, "Luca Brognara");

    const text = await readFile(join(vaultPath, "inferred/users/users%2F42/resolved-name.md"), "utf-8");
    const { frontmatter, body } = splitFrontmatter(text);
    expect(frontmatter).toEqual({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Luca Brognara",
      email: null,
    });
    expect(body).toBe("Luca Brognara\n");
  });

  it("commits the write, leaving a clean working tree", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(vaultPath, "users/42", { resolvedAt: "2026-07-19T12:00:00Z", email: null }, "Luca Brognara");

    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("users/42");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  it("overwrites an existing resolved note idempotently on re-resolution, with one commit each time", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(vaultPath, "users/42", { resolvedAt: "2026-07-19T12:00:00Z", email: null }, "Luca Brognara");
    await writeResolvedNote(vaultPath, "users/42", { resolvedAt: "2026-07-20T09:00:00Z", email: null }, "Luca B.");

    const text = await readFile(join(vaultPath, "inferred/users/users%2F42/resolved-name.md"), "utf-8");
    const { frontmatter, body } = splitFrontmatter(text);
    expect(frontmatter).toEqual({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-20T09:00:00Z",
      display_name: "Luca B.",
      email: null,
    });
    expect(body).toBe("Luca B.\n");

    const log = await gitLog(vaultPath);
    expect(log.length).toBe(2);
  });

  // Unlike writeInferredNote's topic (LLM-produced free text, where a "/"
  // would never legitimately appear), userId is a deterministic,
  // Mercury-controlled value that legitimately contains "/" in its normal
  // shape (e.g. "users/42") — so it's always encoded into a safe single
  // path segment rather than rejected outright when it contains one. A
  // "../../evil"-shaped userId just becomes an inert, oddly-named
  // directory inside inferred/users/, never a real traversal.
  it("stays within the vault for a userId containing path-traversal-shaped characters", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(vaultPath, "../../evil", { resolvedAt: "2026-07-19T12:00:00Z", email: null }, "pwned");

    const text = await readFile(join(vaultPath, "inferred/users/..%2F..%2Fevil/resolved-name.md"), "utf-8");
    const { frontmatter } = splitFrontmatter(text);
    expect(frontmatter).toEqual({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "pwned",
      email: null,
    });
  });

  it("stores a real email when one is provided", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "luca@comperio.local" },
      "Luca Brognara",
    );

    const text = await readFile(join(vaultPath, "inferred/users/users%2F42/resolved-name.md"), "utf-8");
    const { frontmatter } = splitFrontmatter(text);
    expect(frontmatter).toMatchObject({ email: "luca@comperio.local" });
  });
});

// The Jira<->Chat identity bridge: same "resolved" shape as Chat's
// resolved-name.md, different namespace (jira-users, not users) and
// filename (resolved-info.md) — the two caches are matched by email,
// not merged into one, so they stay in their own directory.
describe("writeJiraUserResolvedNote", () => {
  it("writes a fixed resolved-info.md file under inferred/jira-users/<accountId>/ with full frontmatter", async () => {
    const vaultPath = await makeTempVault();
    await writeJiraUserResolvedNote(
      vaultPath,
      "5b10a2844c20165700ede21g",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "mario@comperio.local" },
      "Mario Rossi",
    );

    const text = await readFile(
      join(vaultPath, "inferred/jira-users/5b10a2844c20165700ede21g/resolved-info.md"),
      "utf-8",
    );
    const { frontmatter, body } = splitFrontmatter(text);
    expect(frontmatter).toEqual({
      type: "resolved",
      source: "api",
      resolved_at: "2026-07-19T12:00:00Z",
      display_name: "Mario Rossi",
      email: "mario@comperio.local",
    });
    expect(body).toBe("Mario Rossi\n");
  });

  it("commits the write, leaving a clean working tree", async () => {
    const vaultPath = await makeTempVault();
    await writeJiraUserResolvedNote(
      vaultPath,
      "5b10a2844c20165700ede21g",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "mario@comperio.local" },
      "Mario Rossi",
    );

    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("5b10a2844c20165700ede21g");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  it("stores a null email when Jira has none for this assignee", async () => {
    const vaultPath = await makeTempVault();
    await writeJiraUserResolvedNote(
      vaultPath,
      "5b10a2844c20165700ede21g",
      { resolvedAt: "2026-07-19T12:00:00Z", email: null },
      "Mario Rossi",
    );

    const text = await readFile(
      join(vaultPath, "inferred/jira-users/5b10a2844c20165700ede21g/resolved-info.md"),
      "utf-8",
    );
    const { frontmatter } = splitFrontmatter(text);
    expect(frontmatter).toMatchObject({ email: null });
  });

  // Same defensive shape as writeResolvedNote's userId — accountId comes
  // from Jira's own data, not Mercury's own free-form text, so it's
  // encoded rather than rejected outright even though real Jira account
  // ids don't contain "/".
  it("stays within the vault for an accountId containing path-traversal-shaped characters", async () => {
    const vaultPath = await makeTempVault();
    await writeJiraUserResolvedNote(vaultPath, "../../evil", { resolvedAt: "2026-07-19T12:00:00Z", email: null }, "pwned");

    const text = await readFile(join(vaultPath, "inferred/jira-users/..%2F..%2Fevil/resolved-info.md"), "utf-8");
    const { frontmatter } = splitFrontmatter(text);
    expect(frontmatter).toMatchObject({ display_name: "pwned" });
  });
});

describe("writeRawEntry", () => {
  it("writes verbatim content under raw/<relativePath>, with no frontmatter", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/pasted-readme.md", "# Some README\n\nBody text.");

    const text = await readFile(join(vaultPath, "raw/notes/pasted-readme.md"), "utf-8");
    expect(text).toBe("# Some README\n\nBody text.\n");
    expect(text.startsWith("---\n")).toBe(false);
  });

  it("refuses to write outside raw/ via a path-traversing relativePath", async () => {
    const vaultPath = await makeTempVault();
    await expect(writeRawEntry(vaultPath, "../curated/evil.md", "pwned")).rejects.toThrow();
  });

  it("commits the write, leaving a clean working tree", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/pasted-readme.md", "body");

    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("notes/pasted-readme.md");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  it("succeeds as a no-op, without a new commit, when the content is byte-identical to what's already there", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/pasted-readme.md", "body");
    const logAfterFirst = await gitLog(vaultPath);

    await writeRawEntry(vaultPath, "notes/pasted-readme.md", "body");

    const logAfterSecond = await gitLog(vaultPath);
    expect(logAfterSecond.length).toBe(logAfterFirst.length);
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });
});

describe("writeIndexFile", () => {
  it("writes verbatim content at the vault root as index.md, with no frontmatter", async () => {
    const vaultPath = await makeTempVault();
    await writeIndexFile(vaultPath, "- [[standards/jira-fields]] — custom field conventions");

    const text = await readFile(join(vaultPath, "index.md"), "utf-8");
    expect(text).toBe("- [[standards/jira-fields]] — custom field conventions\n");
    expect(text.startsWith("---\n")).toBe(false);
  });

  it("commits the write, leaving a clean working tree", async () => {
    const vaultPath = await makeTempVault();
    await writeIndexFile(vaultPath, "index content");

    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("index");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });
});

describe("deleteRawEntry", () => {
  it("removes an existing raw/ entry and commits the deletion", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/pasted-readme.md", "body");

    await deleteRawEntry(vaultPath, "notes/pasted-readme.md");

    await expect(readFile(join(vaultPath, "raw/notes/pasted-readme.md"), "utf-8")).rejects.toThrow();
    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("notes/pasted-readme.md");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  it("refuses to delete outside raw/ via a path-traversing relativePath", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "standards/x.md", {}, "body");
    await expect(deleteRawEntry(vaultPath, "../curated/standards/x.md")).rejects.toThrow();

    const text = await readFile(join(vaultPath, "curated/standards/x.md"), "utf-8");
    expect(text).toContain("body");
  });

  it("succeeds as a no-op when the target doesn't exist", async () => {
    const vaultPath = await makeTempVault();
    await expect(deleteRawEntry(vaultPath, "never-existed.md")).resolves.toBeUndefined();
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });
});

describe("deleteCuratedEntry", () => {
  it("removes an existing curated/ entry and commits the deletion", async () => {
    const vaultPath = await makeTempVault();
    await writeCuratedNote(vaultPath, "standards/superseded.md", {}, "body");

    await deleteCuratedEntry(vaultPath, "standards/superseded.md");

    await expect(readFile(join(vaultPath, "curated/standards/superseded.md"), "utf-8")).rejects.toThrow();
    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("standards/superseded.md");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  it("refuses to delete outside curated/ via a path-traversing relativePath", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/x.md", "body");
    await expect(deleteCuratedEntry(vaultPath, "../raw/notes/x.md")).rejects.toThrow();

    const text = await readFile(join(vaultPath, "raw/notes/x.md"), "utf-8");
    expect(text).toContain("body");
  });

  it("succeeds as a no-op when the target doesn't exist", async () => {
    const vaultPath = await makeTempVault();
    await expect(deleteCuratedEntry(vaultPath, "never-existed.md")).resolves.toBeUndefined();
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });
});

// The hard, deterministic gate a cron check must read before
// re-notifying about an item — never an LLM judgment call. Distinct from
// writeResolvedNote/writeJiraUserResolvedNote (facts fetched from an
// external API): this is an explicit instruction the user confirmed via
// the same conferma <token> mechanism as an irreversible CLI action.
describe("writeSuppressionNote", () => {
  it("writes a fixed note under inferred/suppressed/<checkType>/<encoded itemKey>.md", async () => {
    const vaultPath = await makeTempVault();
    await writeSuppressionNote(vaultPath, "stale-ticket", "KAN-123", { confirmedAt: "2026-07-19T12:00:00Z" });

    const text = await readFile(join(vaultPath, "inferred/suppressed/stale-ticket/KAN-123.md"), "utf-8");
    const { frontmatter } = splitFrontmatter(text);
    expect(frontmatter).toEqual({
      type: "confirmed",
      confirmed_at: "2026-07-19T12:00:00Z",
      check_type: "stale-ticket",
      item_key: "KAN-123",
    });
  });

  it("commits the write, leaving a clean working tree", async () => {
    const vaultPath = await makeTempVault();
    await writeSuppressionNote(vaultPath, "stale-ticket", "KAN-123", { confirmedAt: "2026-07-19T12:00:00Z" });

    const log = await gitLog(vaultPath);
    expect(log[0]).toContain("KAN-123");
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  it("rejects a checkType containing a path separator", async () => {
    const vaultPath = await makeTempVault();
    await expect(
      writeSuppressionNote(vaultPath, "../../evil", "KAN-123", { confirmedAt: "2026-07-19T12:00:00Z" }),
    ).rejects.toThrow();
  });

  // itemKey comes from Jira/Bitbucket, not Mercury's own code — encoded
  // rather than rejected outright, same defensive shape as accountId in
  // writeJiraUserResolvedNote, even though real ticket/PR keys are safe.
  it("stays within the vault for an itemKey containing path-traversal-shaped characters", async () => {
    const vaultPath = await makeTempVault();
    await writeSuppressionNote(vaultPath, "stale-ticket", "../../evil", { confirmedAt: "2026-07-19T12:00:00Z" });

    const text = await readFile(join(vaultPath, "inferred/suppressed/stale-ticket/..%2F..%2Fevil.md"), "utf-8");
    const { frontmatter } = splitFrontmatter(text);
    expect(frontmatter).toMatchObject({ item_key: "../../evil" });
  });
});

// git add/commit against the same repo aren't safe
// to run concurrently (index lock races). Every writer shares one vault,
// so this must hold across different writer functions, not just repeated
// calls to the same one.
describe("concurrent writes", () => {
  // Found by hand: only git add/commit went through the queue, not the
  // preceding writeFile — two writers targeting the SAME path raced
  // directly on disk content (last writeFile wins silently, no error)
  // while the git layer got confused independently (one commit ends up
  // holding the other's content under its own message, the other then
  // fails with "nothing to commit"). Serializing the whole write (file +
  // commit) as one unit makes the outcome deterministic instead: whichever
  // call is processed second cleanly overwrites the first, with its own
  // clean commit — no races, no spurious failures.
  it("serializes same-path writes deterministically instead of racing on disk content", async () => {
    const vaultPath = await makeTempVault();

    const results = await Promise.allSettled([
      writeCuratedNote(vaultPath, "standards/jira-cli.md", {}, "versione A"),
      writeCuratedNote(vaultPath, "standards/jira-cli.md", {}, "versione B"),
    ]);

    expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    const log = await gitLog(vaultPath);
    expect(log.length).toBe(2);
    expect(await gitStatusPorcelain(vaultPath)).toBe("");

    const text = await readFile(join(vaultPath, "curated/standards/jira-cli.md"), "utf-8");
    expect(["versione A", "versione B"].some((v) => text.includes(v))).toBe(true);
  });

  it("serializes concurrent writes across writer functions instead of racing on git", async () => {
    const vaultPath = await makeTempVault();

    await Promise.all([
      writeCuratedNote(vaultPath, "standards/a.md", {}, "a"),
      writeResolvedNote(vaultPath, "users/1", { resolvedAt: "2026-07-19T12:00:00Z", email: null }, "User One"),
      writeInferredNote(
        vaultPath,
        "user-2",
        "topic",
        { confidence: "low", derived_from: ["ep_1"], last_reviewed: null },
        "body",
      ),
    ]);

    const log = await gitLog(vaultPath);
    expect(log.length).toBe(3);
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });

  // Regression: a commit failing after the file already landed on disk
  // (disk full, corrupt repo) used to leave the vault silently drifted from
  // git HEAD — the thrown error reached the caller, but nothing distinguished
  // this "written but uncommitted" state from a generic failure. This
  // covers the dedicated log line; routing it to a human is a separate,
  // not-yet-built escalation path.
  it("logs a dedicated message when the file lands on disk but the commit fails, instead of staying silent", async () => {
    const vaultPath = await makeTempVault();
    await breakCommits(vaultPath);

    const originalConsoleError = console.error;
    const loggedMessages: string[] = [];
    console.error = (msg: unknown) => {
      loggedMessages.push(String(msg));
    };

    try {
      await expect(
        writeCuratedNote(vaultPath, "standards/x.md", { author: "luca" }, "body"),
      ).rejects.toThrow();

      const text = await readFile(join(vaultPath, "curated/standards/x.md"), "utf-8");
      expect(text).toContain("body");
      expect(await gitStatusPorcelain(vaultPath)).toContain("curated/standards/x.md");

      expect(loggedMessages.some((m) => m.includes("curated/standards/x.md"))).toBe(true);
      expect(loggedMessages.some((m) => m.includes("not committed"))).toBe(true);
    } finally {
      console.error = originalConsoleError;
    }
  });

  it("serializes concurrent raw writes/deletes alongside a curated write", async () => {
    const vaultPath = await makeTempVault();
    await writeRawEntry(vaultPath, "notes/to-delete.md", "stale");

    await Promise.all([
      writeRawEntry(vaultPath, "notes/new.md", "fresh"),
      deleteRawEntry(vaultPath, "notes/to-delete.md"),
      writeCuratedNote(vaultPath, "standards/b.md", {}, "b"),
    ]);

    const log = await gitLog(vaultPath);
    // 1 (seed write) + 3 (the three concurrent ops)
    expect(log.length).toBe(4);
    expect(await gitStatusPorcelain(vaultPath)).toBe("");
  });
});
