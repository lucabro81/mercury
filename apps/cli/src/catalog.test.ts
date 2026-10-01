/**
 * The catalog is hand-written (until plugins describe themselves through the
 * registry), so these tests are what keeps it honest against the packages it
 * names: a renamed export, a moved package or a plugin whose name drifts from
 * its catalog id fails here instead of in an app the CLI just scaffolded.
 */
import { describe, expect, test } from "bun:test";
import { CATALOG, findEntry } from "./catalog.ts";

describe("CATALOG", () => {
  test("lists the first-party channels and tool plugins", () => {
    expect(CATALOG.map((e) => `${e.kind}:${e.id}`)).toEqual([
      "channel:google-chat",
      "channel:http",
      "tool:jira",
      "tool:bitbucket",
      "tool:atlassian-admin",
    ]);
  });

  test("every entry's package exports what the catalog says, named as its id", async () => {
    for (const entry of CATALOG) {
      const mod = (await import(entry.package)) as Record<string, { name?: unknown } | undefined>;
      const exported = mod[entry.exportName];
      expect(exported, `${entry.package} has no export ${entry.exportName}`).toBeDefined();
      // The id is what MERCURY_CLIS lists for a tool plugin, so it must be the
      // name the loader matches on.
      expect(exported?.name).toBe(entry.id);
    }
  });

  test("every tool plugin declares its CLI's credentials: the config folder and the variable carrying it", () => {
    const tools = CATALOG.filter((e) => e.kind === "tool");
    expect(Object.fromEntries(tools.map((e) => [e.id, e.credentials]))).toEqual({
      jira: { folder: "jira-cli", variable: "JIRA_CLI_CONFIG_TAR_B64" },
      bitbucket: { folder: "bitbucket-cli", variable: "BITBUCKET_CLI_CONFIG_TAR_B64" },
      "atlassian-admin": { folder: "atlassian-admin-cli", variable: "ATLASSIAN_ADMIN_CLI_CONFIG_TAR_B64" },
    });
    expect(CATALOG.filter((e) => e.kind === "channel").every((e) => e.credentials === undefined)).toBe(true);
  });

  test("every env var has a comment, and no var is declared twice", () => {
    const names = CATALOG.flatMap((e) => e.env.map((v) => v.name));
    expect(new Set(names).size).toBe(names.length);
    for (const v of CATALOG.flatMap((e) => e.env)) {
      expect(v.comment.length).toBeGreaterThan(0);
    }
  });
});

describe("findEntry", () => {
  test("returns the entry of that kind with that id", () => {
    expect(findEntry("tool", "jira")?.package).toBe("@mercury-fw/plugin-jira");
    expect(findEntry("channel", "http")?.exportName).toBe("httpChannel");
  });

  test("returns undefined for an unknown id or the wrong kind", () => {
    expect(findEntry("tool", "slack")).toBeUndefined();
    expect(findEntry("channel", "jira")).toBeUndefined();
  });
});
