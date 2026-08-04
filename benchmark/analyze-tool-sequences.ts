/**
 * Reads every benchmark/results/<model>/<testCase>/trial-N.json produced by
 * run.ts and writes a flat, per-trial report to
 * results/analysis/tool-sequences.md: for each trial, the ordered sequence
 * of tool calls actually made (name, arguments, ok/failed), and — for a
 * runCommand call that got a real formattedList back — whether that list
 * was then actually relayed in the model's final answer.
 */
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";

const RESULTS_DIR = resolve(import.meta.dir, "results");
const OUTPUT_DIR = resolve(RESULTS_DIR, "analysis");
const OUTPUT_PATH = resolve(OUTPUT_DIR, "tool-sequences.md");

type StepLog = {
  stepIndex: number;
  toolName: string;
  input: unknown;
  rawOutput: unknown;
  isError: boolean;
  outputSummary: string;
};

type TrialRecord = {
  model: string;
  testCase: string;
  trial: number;
  // 1 for a single-turn test case; the live turn number within a
  // multi-turn one (e.g. "pressure").
  round: number;
  steps: StepLog[];
  derived: { formattedListRelayed: boolean };
};

async function loadTrials(): Promise<TrialRecord[]> {
  // "trial-*.json" also matches the multi-round naming ("trial-1-round-2.json")
  // — "*" is a substring wildcard, not anchored to a single path segment.
  const glob = new Bun.Glob("*/*/trial-*.json");
  const records: TrialRecord[] = [];
  for await (const rel of glob.scan({ cwd: RESULTS_DIR })) {
    const text = await Bun.file(resolve(RESULTS_DIR, rel)).text();
    records.push(JSON.parse(text) as TrialRecord);
  }
  records.sort(
    (a, b) => a.model.localeCompare(b.model) || a.testCase.localeCompare(b.testCase) || a.trial - b.trial || a.round - b.round,
  );
  return records;
}

/** Escapes "|" so a command/argument containing one can't corrupt the table row it's placed in. */
function escapeCell(s: string): string {
  return s.replace(/\|/g, "\\|");
}

/** For runCommand, the actual command string (the field readers care about); anything else, its full args as JSON. */
function formatParams(step: StepLog): string {
  if (step.toolName === "runCommand") {
    const command = (step.input as { command?: unknown } | undefined)?.command;
    if (typeof command === "string") return `\`${escapeCell(command)}\``;
  }
  return `\`${escapeCell(JSON.stringify(step.input))}\``;
}

/** One table row per step. "lista formattata" reflects the whole trial's outcome (derived.formattedListRelayed), same value on every row — not whether this particular step produced one. */
function formatStepRow(step: StepLog, formattedListRelayed: boolean): string {
  const esito = step.isError ? "FALLITO" : "SUCCESSO";
  return `| \`${step.toolName}\` | ${formatParams(step)} | ${esito} | ${formattedListRelayed ? "SÌ" : "NO"} |`;
}

/** Stable, unique per (model, testCase, trial, round) — used both as the heading's anchor id and the ToC link target, so it doesn't depend on any renderer's own heading-to-slug rules. */
function slugFor(record: TrialRecord): string {
  return `${record.model}-${record.testCase}-trial-${record.trial}-round-${record.round}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** "3" for a single-round trial, "3/2" (trial 3, round 2) for a multi-round one — round is only worth showing when there's more than one. */
function trialLabel(record: TrialRecord, maxRoundForThisTrial: number): string {
  return maxRoundForThisTrial > 1 ? `${record.trial}/${record.round}` : `${record.trial}`;
}

/** Nested by model then test case (matches the report's own ordering) — with 160+ trials a flat list would be as long as the report itself. */
function formatToc(records: TrialRecord[]): string {
  const byModel = new Map<string, Map<string, TrialRecord[]>>();
  for (const record of records) {
    if (!byModel.has(record.model)) byModel.set(record.model, new Map());
    const byTestCase = byModel.get(record.model)!;
    if (!byTestCase.has(record.testCase)) byTestCase.set(record.testCase, []);
    byTestCase.get(record.testCase)!.push(record);
  }

  const lines = ["## Indice", ""];
  for (const [model, byTestCase] of byModel) {
    lines.push(`- **${model}**`);
    for (const [testCase, trials] of byTestCase) {
      const maxRound = Math.max(...trials.map((r) => r.round));
      const links = trials.map((r) => `[${trialLabel(r, maxRound)}](#${slugFor(r)})`).join(", ");
      lines.push(`  - ${testCase}: ${links}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function formatTrial(record: TrialRecord, maxRoundForThisTrial: number): string {
  const heading =
    maxRoundForThisTrial > 1
      ? `### ${record.model} — ${record.testCase} — trial ${record.trial} — round ${record.round}`
      : `### ${record.model} — ${record.testCase} — trial ${record.trial}`;
  const lines = [`<a id="${slugFor(record)}"></a>`, heading, ""];
  if (record.steps.length === 0) {
    lines.push("(nessuna tool call)");
  } else {
    lines.push("| tool | params | esito | lista formattata |");
    lines.push("|------|--------|-------|------------------|");
    for (const step of record.steps) {
      lines.push(formatStepRow(step, record.derived.formattedListRelayed));
    }
  }
  lines.push("");
  return lines.join("\n");
}

/** Max round seen for this record's own (model, testCase) group — determines whether the round number is worth printing at all. */
function maxRoundFor(record: TrialRecord, records: TrialRecord[]): number {
  return Math.max(...records.filter((r) => r.model === record.model && r.testCase === record.testCase).map((r) => r.round));
}

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const records = await loadTrials();
  const header = `# Sequenze di tool call per trial\n\n${records.length} trial trovati in \`${RESULTS_DIR}\`.\n\n`;
  const toc = formatToc(records);
  const body = records.map((r) => formatTrial(r, maxRoundFor(r, records))).join("\n");
  await Bun.write(OUTPUT_PATH, header + toc + body);
  console.log(`Scritto ${OUTPUT_PATH} (${records.length} trial).`);
}

await main();
