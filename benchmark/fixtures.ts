/**
 * Mock CLI subprocess execution for the tool-calling benchmark. Same
 * signature as the real `runCli` (src/tools/cli-executor.ts), so it drops
 * straight into `createCliTool`/`loadActiveCliConfigs` unchanged — only the
 * subprocess spawn is replaced, everything downstream (argv validation
 * against the real cli-configs/jira.json allowlist, the real
 * `createJiraIssueListFormatter` post-processor) is Mercury's own code.
 *
 * Replicates the real jira-cli quirks confirmed live this session (checked
 * against the actual `jira issue search --help`/`jira issue get --help`,
 * v0.5.0, not assumed): `--select`/`--select-all` are REQUIRED on both
 * commands — omitting both now fails the call outright, reporting the byte
 * size of the full response and its top-level field names, not a silent
 * full-JSON fallback. A `--select` path that doesn't match the command's
 * own shape (doesn't start with "issues"/"fields" respectively) still
 * returns a bare `{}` — the dead-end that used to send models into a
 * silent retry spiral. Any command ending in `--help` succeeds with plain,
 * non-JSON text.
 */
import type { CliResult } from "../src/tools/cli-executor.ts";

export type FixtureIssue = {
  key: string;
  self: string;
  fields: {
    summary: string;
    status: { name: string };
    assignee: { displayName: string } | null;
  };
};

export const FIXTURE_ISSUES: FixtureIssue[] = [
  {
    key: "MER-12",
    self: "https://api.atlassian.com/ex/jira/fixture-cloud-id/rest/api/3/issue/10001",
    fields: {
      summary: "Fix Ollama think crash on unsupported models",
      status: { name: "Done" },
      assignee: { displayName: "Luca Brognara" },
    },
  },
  {
    key: "MER-20",
    self: "https://api.atlassian.com/ex/jira/fixture-cloud-id/rest/api/3/issue/10002",
    fields: {
      summary: "Deterministic Jira issue-list formatting",
      status: { name: "In Progress" },
      assignee: { displayName: "Luca Brognara" },
    },
  },
  {
    key: "MER-21",
    self: "https://api.atlassian.com/ex/jira/fixture-cloud-id/rest/api/3/issue/10003",
    fields: {
      summary: "Wiki index self-review orphan detection",
      status: { name: "To Do" },
      assignee: null,
    },
  },
];

function helpTextFor(args: string[]): string {
  const subject = args.filter((a) => !a.startsWith("--")).join(" ") || "jira";
  return [
    `Usage: ${subject} [flags]`,
    "",
    "Flags:",
    "  --jql string       JQL query string",
    "  --select string    dot-notation projection into the JSON output",
    "  --select-all        skip projection, return the full JSON",
    "  --fields string     comma-separated field list",
    "",
    "Examples:",
    `  ${subject} --jql "project = MER AND status = 'To Do'"`,
  ].join("\n");
}

/** Same "response is N bytes; retry with --select or --select-all. Top-level fields: ..." shape the real CLI reports when both are omitted. */
function requiredSelectError(fullResponse: unknown): CliResult {
  const bytes = JSON.stringify(fullResponse).length;
  const topLevelFields = Object.keys(fullResponse as object).join(", ");
  return {
    ok: false,
    error: `response is ${bytes} bytes; retry with --select or --select-all. Top-level fields: ${topLevelFields}`,
  };
}

function mockIssueSearch(args: string[]): CliResult {
  const hasSelectAll = args.includes("--select-all");
  const selectIdx = args.indexOf("--select");
  const selectValue = selectIdx >= 0 ? args[selectIdx + 1] : undefined;
  const full = { issues: FIXTURE_ISSUES };

  if (selectValue === undefined && !hasSelectAll) {
    return requiredSelectError(full);
  }
  // Real observed behavior: a --select path that isn't rooted at "issues"
  // matches nothing and comes back as a bare, silent {} — not an error, not
  // an empty array.
  if (selectValue !== undefined && !selectValue.startsWith("issues")) {
    return { ok: true, data: {} };
  }
  return { ok: true, data: full };
}

function mockIssueGet(args: string[]): CliResult {
  const key = args[2];
  const issue = FIXTURE_ISSUES.find((i) => i.key === key);
  if (!issue) return { ok: false, error: `no such issue: ${key}` };

  const hasSelectAll = args.includes("--select-all");
  const selectIdx = args.indexOf("--select");
  const selectValue = selectIdx >= 0 ? args[selectIdx + 1] : undefined;

  if (selectValue === undefined && !hasSelectAll) {
    return requiredSelectError(issue);
  }
  if (selectValue !== undefined && !selectValue.startsWith("fields")) {
    return { ok: true, data: {} };
  }
  return { ok: true, data: issue };
}

/** Same signature as the real `runCli` — drop-in replacement for the benchmark's CliTool/loader wiring. */
export async function mockRunCli(binary: string, args: string[]): Promise<CliResult> {
  if (binary !== "jira") {
    return { ok: false, error: `mockRunCli: no fixture for binary "${binary}"` };
  }

  if (args[args.length - 1] === "--help") {
    return { ok: true, data: helpTextFor(args) };
  }

  const [group, action] = args;

  if (group === "issue" && action === "search") return mockIssueSearch(args);
  if (group === "issue" && action === "get") return mockIssueGet(args);
  if (group === "issue" && action === "create") return { ok: true, data: { key: "MER-99" } };
  if (group === "issue" && action === "transition") return { ok: true, data: { key: args[2], status: "transitioned" } };
  if (group === "issue" && action === "comment") return { ok: true, data: { key: args[2], commented: true } };

  return { ok: false, error: `mockRunCli: no fixture for command "${args.join(" ")}"` };
}
