import { describe, it, expect } from "bun:test";
import { sweepChatDirectory } from "./chat-directory-sweep.ts";
import type { writeResolvedNote } from "../wiki/wiki-note.ts";
import type { runCli } from "../tools/cli-executor.ts";
import type { CliResult } from "../tools/cli-executor.ts";

// Shape confirmed against real `spaces members list --select-all` output
// (session 8) — names/emails below are synthetic, not real people.
function membersFixture() {
  return {
    ok: true,
    data: {
      members: [
        {
          emailAddresses: [
            { metadata: { primary: true }, value: "alice@example.com" },
            { metadata: {}, value: "alice.personal@example.net" },
          ],
          names: [{ displayName: "Alice Example", metadata: { primary: true } }],
          resourceName: "people/111111111111111111111",
        },
        {
          emailAddresses: [
            { metadata: { primary: true }, value: "bob@example.com" },
            { metadata: {}, value: "bob.personal@example.net" },
          ],
          names: [{ displayName: "Bob Example", metadata: { primary: true } }],
          resourceName: "people/222222222222222222222",
        },
      ],
      unresolved: [
        { member: "users/333333333333333333333", reason: "member type is not HUMAN; the People API only resolves human Google accounts" },
      ],
    },
  } satisfies CliResult;
}

describe("sweepChatDirectory", () => {
  it("resolves each human member, converting people/<id> to users/<id>", async () => {
    const runCliFn: typeof runCli = async () => membersFixture();
    const written: unknown[][] = [];
    const writeResolvedNoteFn: typeof writeResolvedNote = async (...args) => {
      written.push(args);
    };

    const results = await sweepChatDirectory(["spaces/AAA"], {
      vaultPath: "/vault",
      runCliFn,
      writeResolvedNoteFn,
      now: () => new Date("2026-07-20T00:00:00Z"),
    });

    expect(results).toEqual([{ space: "spaces/AAA", resolved: 2, skipped: 0 }]);
    expect(written).toHaveLength(2);
    expect(written[0]).toEqual([
      "/vault",
      "users/111111111111111111111",
      { resolvedAt: "2026-07-20T00:00:00.000Z", email: "alice@example.com" },
      "Alice Example",
    ]);
    expect(written[1]).toEqual([
      "/vault",
      "users/222222222222222222222",
      { resolvedAt: "2026-07-20T00:00:00.000Z", email: "bob@example.com" },
      "Bob Example",
    ]);
  });

  it("skips unresolved (non-human) members without writing anything for them", async () => {
    const runCliFn: typeof runCli = async () => membersFixture();
    let writeCalls = 0;
    const writeResolvedNoteFn: typeof writeResolvedNote = async () => {
      writeCalls++;
    };

    const results = await sweepChatDirectory(["spaces/AAA"], {
      vaultPath: "/vault",
      runCliFn,
      writeResolvedNoteFn,
    });

    expect(results).toEqual([{ space: "spaces/AAA", resolved: 2, skipped: 0 }]);
    expect(writeCalls).toBe(2); // unresolved entries never reach writeResolvedNoteFn at all
  });

  it("falls back to the first email when none is marked primary", async () => {
    const runCliFn: typeof runCli = async () => ({
      ok: true,
      data: {
        members: [
          {
            emailAddresses: [{ value: "fallback@example.com" }],
            names: [{ displayName: "Fallback Person" }],
            resourceName: "people/1",
          },
        ],
      },
    });
    const written: unknown[][] = [];
    const writeResolvedNoteFn: typeof writeResolvedNote = async (...args) => {
      written.push(args);
    };

    await sweepChatDirectory(["spaces/AAA"], { vaultPath: "/vault", runCliFn, writeResolvedNoteFn });

    expect(written[0]?.[2]).toMatchObject({ email: "fallback@example.com" });
  });

  it("skips a member with no resolvable name instead of throwing", async () => {
    const runCliFn: typeof runCli = async () => ({
      ok: true,
      data: { members: [{ emailAddresses: [], names: [], resourceName: "people/1" }] },
    });
    let writeCalls = 0;
    const writeResolvedNoteFn: typeof writeResolvedNote = async () => {
      writeCalls++;
    };

    const results = await sweepChatDirectory(["spaces/AAA"], { vaultPath: "/vault", runCliFn, writeResolvedNoteFn });

    expect(results).toEqual([{ space: "spaces/AAA", resolved: 0, skipped: 1 }]);
    expect(writeCalls).toBe(0);
  });

  // One bad space shouldn't kill the sweep for the rest — same
  // "log and continue" convention as every other cron loop in this repo.
  it("logs and continues to the next space when one space's CLI call fails", async () => {
    const runCliFn: typeof runCli = async (_binary, args) => {
      if (args.includes("spaces/BAD")) {
        return { ok: false, error: "permission denied" };
      }
      return membersFixture();
    };
    const logged: string[] = [];
    const writeResolvedNoteFn: typeof writeResolvedNote = async () => {};

    const results = await sweepChatDirectory(["spaces/BAD", "spaces/AAA"], {
      vaultPath: "/vault",
      runCliFn,
      writeResolvedNoteFn,
      log: (msg) => logged.push(msg),
    });

    expect(results).toEqual([
      { space: "spaces/BAD", error: expect.stringContaining("permission denied") },
      { space: "spaces/AAA", resolved: 2, skipped: 0 },
    ]);
    expect(logged.some((m) => m.includes("spaces/BAD"))).toBe(true);
  });
});
