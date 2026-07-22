import { describe, it, expect } from "bun:test";
import { findStalePrs } from "./stale-pr-finder.ts";
import type { runCli, CliResult } from "../tools/cli-executor.ts";

const NOW = new Date("2026-07-22T12:00:00.000Z");
const STALE_DAYS = 3;

function listResponse(values: Array<{ id: number; title: string; updated_on: string }>, page = 1, pagelen = 10) {
  return { page, pagelen, size: values.length, values };
}

function reviewer(accountId: string, displayName: string, approved: boolean) {
  return { role: "REVIEWER", approved, user: { account_id: accountId, display_name: displayName } };
}

describe("findStalePrs", () => {
  it("returns no findings and makes no calls when no repositories are configured", async () => {
    let calls = 0;
    const runCliFn: typeof runCli = async () => {
      calls++;
      return { ok: true, data: {} };
    };

    const result = await findStalePrs([], STALE_DAYS, NOW, { runCliFn });

    expect(result).toEqual([]);
    expect(calls).toBe(0);
  });

  it("queries pr list with --state OPEN, then pr get only for candidates past the staleness window", async () => {
    const calls: Array<{ binary: string; args: string[] }> = [];
    const runCliFn: typeof runCli = async (binary, args): Promise<CliResult> => {
      calls.push({ binary, args });
      if (args[1] === "list") {
        return {
          ok: true,
          data: listResponse([
            { id: 1, title: "Stale PR", updated_on: "2026-07-18T09:00:00.000Z" }, // 4 days old — stale
            { id: 2, title: "Fresh PR", updated_on: "2026-07-22T09:00:00.000Z" }, // fresh
          ]),
        };
      }
      return { ok: true, data: { id: 1, title: "Stale PR", participants: [reviewer("rev-1", "Reviewer One", false)] } };
    };

    const result = await findStalePrs(["comperiosrl/repo"], STALE_DAYS, NOW, { runCliFn });

    expect(calls[0]).toEqual({
      binary: "bitbucket",
      args: ["pr", "list", "comperiosrl/repo", "--state", "OPEN", "--page", "1", "--select", "values.id,values.title,values.updated_on"],
    });
    // only the stale PR (id 1) gets a pr get call — the fresh one (id 2) never does
    expect(calls.filter((c) => c.args[1] === "get").map((c) => c.args[3])).toEqual(["1"]);
    expect(result).toEqual([
      {
        repository: "comperiosrl/repo",
        prId: 1,
        title: "Stale PR",
        updatedOn: "2026-07-18T09:00:00.000Z",
        reviewer: { accountId: "rev-1", displayName: "Reviewer One" },
      },
    ]);
  });

  it("produces one finding per unapproved REVIEWER participant, ignoring approved reviewers and non-reviewer participants", async () => {
    const runCliFn: typeof runCli = async (_binary, args): Promise<CliResult> => {
      if (args[1] === "list") {
        return { ok: true, data: listResponse([{ id: 1, title: "PR", updated_on: "2026-07-18T09:00:00.000Z" }]) };
      }
      return {
        ok: true,
        data: {
          id: 1,
          title: "PR",
          updated_on: "2026-07-18T09:00:00.000Z",
          participants: [
            reviewer("rev-1", "Reviewer One", false),
            reviewer("rev-2", "Reviewer Two", true),
            { role: "PARTICIPANT", approved: false, user: { account_id: "p-1", display_name: "Commenter" } },
            reviewer("rev-3", "Reviewer Three", false),
          ],
        },
      };
    };

    const result = await findStalePrs(["comperiosrl/repo"], STALE_DAYS, NOW, { runCliFn });

    expect(result.map((f) => f.reviewer.accountId)).toEqual(["rev-1", "rev-3"]);
  });

  it("skips a stale PR entirely when every reviewer has already approved", async () => {
    const runCliFn: typeof runCli = async (_binary, args): Promise<CliResult> => {
      if (args[1] === "list") {
        return { ok: true, data: listResponse([{ id: 1, title: "PR", updated_on: "2026-07-18T09:00:00.000Z" }]) };
      }
      return {
        ok: true,
        data: { id: 1, title: "PR", updated_on: "2026-07-18T09:00:00.000Z", participants: [reviewer("rev-1", "R", true)] },
      };
    };

    const result = await findStalePrs(["comperiosrl/repo"], STALE_DAYS, NOW, { runCliFn });

    expect(result).toEqual([]);
  });

  it("paginates pr list across multiple pages until a short page is returned", async () => {
    const listCalls: string[] = [];
    const runCliFn: typeof runCli = async (_binary, args): Promise<CliResult> => {
      if (args[1] === "list") {
        const page = args[args.indexOf("--page") + 1] as string;
        listCalls.push(page);
        if (page === "1") {
          return {
            ok: true,
            data: listResponse(
              Array.from({ length: 2 }, (_, i) => ({
                id: i + 1,
                title: `PR ${i + 1}`,
                updated_on: "2026-07-18T09:00:00.000Z",
              })),
              1,
              2, // pagelen 2 — a full page, so the finder must fetch page 2
            ),
          };
        }
        return { ok: true, data: listResponse([], 2, 2) }; // empty page — stop
      }
      return { ok: true, data: { participants: [] } };
    };

    await findStalePrs(["comperiosrl/repo"], STALE_DAYS, NOW, { runCliFn });

    expect(listCalls).toEqual(["1", "2"]);
  });

  it("a failure listing one repository's PRs is logged and doesn't stop the others", async () => {
    const loggedMessages: string[] = [];
    const runCliFn: typeof runCli = async (_binary, args): Promise<CliResult> => {
      if (args[1] === "list") {
        if (args[2] === "comperiosrl/bad") {
          return { ok: false, error: "repository not found" };
        }
        return { ok: true, data: listResponse([{ id: 1, title: "PR", updated_on: "2026-07-18T09:00:00.000Z" }]) };
      }
      return { ok: true, data: { participants: [reviewer("rev-1", "R", false)] } };
    };

    const result = await findStalePrs(["comperiosrl/bad", "comperiosrl/good"], STALE_DAYS, NOW, {
      runCliFn,
      log: (msg) => loggedMessages.push(msg),
    });

    expect(result).toEqual([
      {
        repository: "comperiosrl/good",
        prId: 1,
        title: "PR",
        updatedOn: "2026-07-18T09:00:00.000Z",
        reviewer: { accountId: "rev-1", displayName: "R" },
      },
    ]);
    expect(loggedMessages.some((m) => m.includes("comperiosrl/bad") && m.includes("repository not found"))).toBe(true);
  });

  it("a failure fetching one PR's participants is logged and doesn't stop the others in the same repository", async () => {
    const loggedMessages: string[] = [];
    const runCliFn: typeof runCli = async (_binary, args): Promise<CliResult> => {
      if (args[1] === "list") {
        return {
          ok: true,
          data: listResponse([
            { id: 1, title: "Bad PR", updated_on: "2026-07-18T09:00:00.000Z" },
            { id: 2, title: "Good PR", updated_on: "2026-07-18T09:00:00.000Z" },
          ]),
        };
      }
      if (args[3] === "1") {
        return { ok: false, error: "pr not found" };
      }
      return { ok: true, data: { participants: [reviewer("rev-1", "R", false)] } };
    };

    const result = await findStalePrs(["comperiosrl/repo"], STALE_DAYS, NOW, {
      runCliFn,
      log: (msg) => loggedMessages.push(msg),
    });

    expect(result).toEqual([
      {
        repository: "comperiosrl/repo",
        prId: 2,
        title: "Good PR",
        updatedOn: "2026-07-18T09:00:00.000Z",
        reviewer: { accountId: "rev-1", displayName: "R" },
      },
    ]);
    expect(loggedMessages.some((m) => m.includes("comperiosrl/repo") && m.includes("1") && m.includes("pr not found"))).toBe(
      true,
    );
  });
});
