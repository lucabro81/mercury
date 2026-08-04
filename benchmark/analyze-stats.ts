/**
 * Reads every benchmark/results/<model>/<testCase>/trial-N.json produced by
 * run.ts and writes aggregate statistics to results/analysis/stats.md.
 * Each table below uses a different, explicitly labeled denominator (all
 * trials / trials with a real runCommand call / trials where a
 * formattedList was available / trials that hit an error) — mixing them up
 * would produce misleading rates, so every table's own heading says exactly
 * what it's a percentage of.
 */
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";

const RESULTS_DIR = resolve(import.meta.dir, "results");
const OUTPUT_DIR = resolve(RESULTS_DIR, "analysis");
const OUTPUT_PATH = resolve(OUTPUT_DIR, "stats.md");

type TestCaseId = string;

type StepLog = {
  stepIndex: number;
  toolName: string;
  input: unknown;
  rawOutput: unknown;
  isError: boolean;
  outputSummary: string;
};

type Derived = {
  outcome: "real-tool-call" | "hallucinated" | "no-attempt" | "error";
  usedSelect: boolean;
  usedSelectAll: boolean;
  usedCurrentUser: boolean;
  formattedListAvailable: boolean;
  formattedListRelayed: boolean;
  handFormatted: boolean;
  helpCalled: boolean;
  helpTiming: "before" | "after" | "no-error" | "never";
  wikiCalled: boolean;
  wikiTiming: "before" | "after" | "no-error" | "never";
  repeatedIdenticalCommand: boolean | undefined;
};

type Usage = { inputTokens?: number; outputTokens?: number; totalTokens?: number };

type RawStepLog = { reasoningText: string | undefined };

type TrialRecord = {
  model: string;
  family: "dense" | "moe";
  activeParamsB: number;
  quant: string;
  think: boolean;
  testCase: TestCaseId;
  trial: number;
  round: number;
  finishReason: string | undefined;
  finalText: string;
  latencyMs: number;
  usage: Usage | undefined;
  rawSteps: RawStepLog[];
  steps: StepLog[];
  derived: Derived;
};

// Must match run.ts's own MAX_STEPS — kept as a separate constant rather than
// imported, same as every other type here (this script reads run.ts's JSON
// output, it doesn't share code with it).
const MAX_STEPS = 100;

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

function uniqueModels(records: TrialRecord[]): string[] {
  return [...new Set(records.map((r) => r.model))].sort();
}

function uniqueTestCases(records: TrialRecord[]): string[] {
  const known = ["easy", "hard", "mutating", "ambiguous-project", "wiki-only", "pressure"];
  const present = new Set(records.map((r) => r.testCase));
  // Known order first (matches run.ts's own TEST_CASES order), then anything
  // unrecognized (e.g. an older run, or a new case added to run.ts but not
  // yet listed here) appended alphabetically rather than silently dropped.
  const ordered = known.filter((tc) => present.has(tc));
  const extra = [...present].filter((tc) => !known.includes(tc)).sort();
  return [...ordered, ...extra];
}

function pct(n: number, total: number): string {
  return total === 0 ? "—" : `${Math.round((n / total) * 100)}%`;
}

function avg(nums: number[]): number | undefined {
  return nums.length === 0 ? undefined : nums.reduce((a, b) => a + b, 0) / nums.length;
}

function fmtNum(n: number | undefined, digits: number): string {
  return n === undefined ? "—" : n.toFixed(digits);
}

const hasRunCommandCall = (r: TrialRecord) => r.steps.some((s) => s.toolName === "runCommand");
const hadAnyError = (r: TrialRecord) => r.steps.some((s) => s.isError);

/** For every model × testCase combination that actually has trials (order: model, then run.ts's own TEST_CASES order). For a multi-round case (e.g. "pressure"), a trial's every round counts as one of "its" trials here — see tablePressureByRound for a round-by-round breakdown instead. */
function modelCaseGroups(records: TrialRecord[]): Array<{ model: string; testCase: TestCaseId; trials: TrialRecord[] }> {
  const groups: Array<{ model: string; testCase: TestCaseId; trials: TrialRecord[] }> = [];
  for (const model of uniqueModels(records)) {
    for (const testCase of uniqueTestCases(records)) {
      const trials = records.filter((r) => r.model === model && r.testCase === testCase);
      if (trials.length > 0) groups.push({ model, testCase, trials });
    }
  }
  return groups;
}

function tableModels(records: TrialRecord[]): string {
  const lines = [
    "## Modelli",
    "",
    "| modello | famiglia | parametri attivi (B) | quant | think | n trial |",
    "|---|---|---|---|---|---|",
  ];
  for (const model of uniqueModels(records)) {
    const trials = records.filter((r) => r.model === model);
    const first = trials[0]!;
    lines.push(`| ${model} | ${first.family} | ${first.activeParamsB} | ${first.quant} | ${first.think ? "sì" : "no"} | ${trials.length} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function tableOutcomes(records: TrialRecord[]): string {
  const lines = [
    "## Esiti",
    "",
    "Percentuali sul totale dei trial di quella riga (modello × caso).",
    "",
    "| modello | caso | n | real-tool-call | hallucinated | no-attempt | error |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const n = trials.length;
    const count = (o: Derived["outcome"]) => trials.filter((r) => r.derived.outcome === o).length;
    lines.push(
      `| ${model} | ${testCase} | ${n} | ${pct(count("real-tool-call"), n)} | ${pct(count("hallucinated"), n)} | ${pct(count("no-attempt"), n)} | ${pct(count("error"), n)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function tableSelectUsage(records: TrialRecord[]): string {
  const lines = [
    "## Uso di --select / --select-all / currentUser()",
    "",
    "Percentuali sui trial di quella riga che hanno fatto almeno una vera chiamata a `runCommand` (non su tutti i trial).",
    "",
    "| modello | caso | n (con runCommand) | --select | --select-all | currentUser() |",
    "|---|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const withCall = trials.filter(hasRunCommandCall);
    const n = withCall.length;
    const count = (pred: (r: TrialRecord) => boolean) => withCall.filter(pred).length;
    lines.push(
      `| ${model} | ${testCase} | ${n} | ${pct(count((r) => r.derived.usedSelect), n)} | ${pct(count((r) => r.derived.usedSelectAll), n)} | ${pct(count((r) => r.derived.usedCurrentUser), n)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function tableFormattedList(records: TrialRecord[]): string {
  const lines = [
    "## Gestione della lista formattata",
    "",
    "Percentuali sui trial di quella riga in cui una `formattedList` era effettivamente disponibile (non su tutti i trial).",
    "",
    "| modello | caso | n (lista disponibile) | relayed (verbatim) | hand-formatted |",
    "|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const withList = trials.filter((r) => r.derived.formattedListAvailable);
    const n = withList.length;
    const count = (pred: (r: TrialRecord) => boolean) => withList.filter(pred).length;
    lines.push(
      `| ${model} | ${testCase} | ${n} | ${pct(count((r) => r.derived.formattedListRelayed), n)} | ${pct(count((r) => r.derived.handFormatted), n)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function tableHelpWikiUsage(records: TrialRecord[]): string {
  const lines = [
    "## Uso di --help e della wiki",
    "",
    "Percentuali su tutti i trial di quella riga.",
    "",
    "| modello | caso | n | --help usato | wiki consultata |",
    "|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const n = trials.length;
    const count = (pred: (r: TrialRecord) => boolean) => trials.filter(pred).length;
    lines.push(
      `| ${model} | ${testCase} | ${n} | ${pct(count((r) => r.derived.helpCalled), n)} | ${pct(count((r) => r.derived.wikiCalled), n)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function tableTimingRelativeToError(records: TrialRecord[]): string {
  const lines = [
    "## Tempismo di --help/wiki rispetto al primo errore",
    "",
    "Percentuali sui trial di quella riga in cui è avvenuto almeno un errore (non su tutti i trial).",
    "",
    "| modello | caso | n (con errore) | help: prima | help: dopo | help: mai | wiki: prima | wiki: dopo | wiki: mai |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const withError = trials.filter(hadAnyError);
    const n = withError.length;
    const count = (pred: (r: TrialRecord) => boolean) => withError.filter(pred).length;
    lines.push(
      `| ${model} | ${testCase} | ${n} ` +
        `| ${pct(count((r) => r.derived.helpTiming === "before"), n)} ` +
        `| ${pct(count((r) => r.derived.helpTiming === "after"), n)} ` +
        `| ${pct(count((r) => r.derived.helpTiming === "never"), n)} ` +
        `| ${pct(count((r) => r.derived.wikiTiming === "before"), n)} ` +
        `| ${pct(count((r) => r.derived.wikiTiming === "after"), n)} ` +
        `| ${pct(count((r) => r.derived.wikiTiming === "never"), n)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function tableAttemptPattern(records: TrialRecord[]): string {
  const lines = [
    "## Pattern di tentativo",
    "",
    "Percentuali sui trial di quella riga con almeno una tool call, di qualunque tipo (non su tutti i trial). " +
      "Single-shot riuscito: un solo tentativo, andato a buon fine. Single-shot fallito-poi-arreso: un solo " +
      "tentativo, fallito, e nessun retry — il pattern che nasconde un fallimento dietro un outcome `real-tool-call` " +
      "(visto live su llama3.3:70b nel caso hard: un `runCommand` fallisce e non c'è alcun retry). Multi-tentativo: 2 o più tool call.",
    "",
    "| modello | caso | n (con tool call) | single-shot riuscito | single-shot fallito-poi-arreso | multi-tentativo |",
    "|---|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const withCall = trials.filter((r) => r.steps.length > 0);
    const n = withCall.length;
    const singleShotOk = withCall.filter((r) => r.steps.length === 1 && !r.steps[0]!.isError).length;
    const singleShotFailed = withCall.filter((r) => r.steps.length === 1 && r.steps[0]!.isError).length;
    const multiAttempt = withCall.filter((r) => r.steps.length >= 2).length;
    lines.push(
      `| ${model} | ${testCase} | ${n} | ${pct(singleShotOk, n)} | ${pct(singleShotFailed, n)} | ${pct(multiAttempt, n)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function tableHardCaseRepeat(records: TrialRecord[]): string {
  const lines = [
    "## Caso hard: ha ripetuto lo stesso comando fallito?",
    "",
    "Percentuale sui trial del caso hard con almeno una tool call (non su tutti i trial hard) — indipendente dal pattern di tentativo sopra: anche un single-shot può ripetere il comando già fallito nel turno precedente seminato.",
    "",
    "| modello | n (con tool call, caso hard) | ha ripetuto lo stesso comando fallito |",
    "|---|---|---|",
  ];
  for (const model of uniqueModels(records)) {
    const withCall = records.filter((r) => r.model === model && r.testCase === "hard" && r.steps.length > 0);
    const n = withCall.length;
    const repeated = withCall.filter((r) => r.derived.repeatedIdenticalCommand === true).length;
    lines.push(`| ${model} | ${n} | ${pct(repeated, n)} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function tableFinishReason(records: TrialRecord[]): string {
  const lines = [
    "## Finish reason e saturazione dello step-cap",
    "",
    `Percentuali su tutti i trial di quella riga. "N/D" = il trial è terminato con un'eccezione prima che il modello restituisse un risultato. Tetto di step: il trial ha usato tutti e ${MAX_STEPS} gli step interni disponibili — segno che il modello voleva ancora continuare (tipicamente chiamare altri tool) e non ha mai raggiunto una risposta per conto suo.`,
    "",
    "| modello | caso | n | distribuzione finishReason | tetto di step raggiunto |",
    "|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const n = trials.length;
    const counts = new Map<string, number>();
    for (const r of trials) {
      const key = r.finishReason ?? "N/D";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const dist = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `${reason}: ${pct(count, n)}`)
      .join(", ");
    const hitCap = trials.filter((r) => r.rawSteps.length >= MAX_STEPS).length;
    lines.push(`| ${model} | ${testCase} | ${n} | ${dist} | ${pct(hitCap, n)} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function tableReasoningVolume(records: TrialRecord[]): string {
  const lines = [
    "## Reasoning vs risposta finale (solo modelli con think attivo)",
    "",
    "Caratteri medi per trial. \"reasoning\" somma il testo di thinking di ogni step interno del trial, non solo dell'ultimo; \"risposta finale\" è la lunghezza di `finalText`. " +
      "Un rapporto alto con un outcome comunque negativo indica un modello che ragiona a lungo senza che questo si traduca in un risultato corretto.",
    "",
    "| modello | caso | n | reasoning medio (car.) | risposta finale media (car.) | rapporto reasoning/risposta |",
    "|---|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    if (!trials[0]!.think) continue;
    const n = trials.length;
    const reasoningChars = trials.map((r) => r.rawSteps.reduce((sum, s) => sum + (s.reasoningText?.length ?? 0), 0));
    const finalChars = trials.map((r) => r.finalText.length);
    const avgReasoning = avg(reasoningChars);
    const avgFinal = avg(finalChars);
    const ratio = avgReasoning !== undefined && avgFinal !== undefined && avgFinal > 0 ? avgReasoning / avgFinal : undefined;
    lines.push(`| ${model} | ${testCase} | ${n} | ${fmtNum(avgReasoning, 0)} | ${fmtNum(avgFinal, 0)} | ${fmtNum(ratio, 1)}x |`);
  }
  lines.push("");
  return lines.join("\n");
}

function tableCost(records: TrialRecord[]): string {
  const lines = [
    "## Costo/latenza",
    "",
    "Medie sui trial di quella riga per cui è stato registrato un `usage` (un trial finito in errore prima della risposta del modello non ne ha uno, ed è escluso dalla media — vedi n).",
    "",
    "| modello | caso | n (con usage) | latenza media (s) | token input medi | token output medi | token totali medi |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const { model, testCase, trials } of modelCaseGroups(records)) {
    const withUsage = trials.filter((r) => r.usage !== undefined);
    const n = withUsage.length;
    lines.push(
      `| ${model} | ${testCase} | ${n} ` +
        `| ${fmtNum(avg(trials.map((r) => r.latencyMs / 1000)), 1)} ` +
        `| ${fmtNum(avg(withUsage.map((r) => r.usage!.inputTokens ?? 0)), 0)} ` +
        `| ${fmtNum(avg(withUsage.map((r) => r.usage!.outputTokens ?? 0)), 0)} ` +
        `| ${fmtNum(avg(withUsage.map((r) => r.usage!.totalTokens ?? 0)), 0)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function tablePressureByRound(records: TrialRecord[]): string {
  const lines = [
    "## Caso pressure: esito round per round",
    "",
    "Percentuali sui trial di quel round (non su tutti i round insieme, a differenza della tabella Esiti sopra) — ogni round è una vera risposta del modello a una spinta di pressione sociale successiva (\"no è sbagliato, riprova\"...), sullo stesso dato mai cambiato. Mostra a che round, se mai, un modello comincia ad allucinare o a fallire diversamente.",
    "",
    "| modello | round | n | real-tool-call | hallucinated | no-attempt | error |",
    "|---|---|---|---|---|---|---|",
  ];
  const pressureTrials = records.filter((r) => r.testCase === "pressure");
  const rounds = [...new Set(pressureTrials.map((r) => r.round))].sort((a, b) => a - b);
  for (const model of uniqueModels(records)) {
    for (const round of rounds) {
      const trials = pressureTrials.filter((r) => r.model === model && r.round === round);
      if (trials.length === 0) continue;
      const n = trials.length;
      const count = (o: Derived["outcome"]) => trials.filter((r) => r.derived.outcome === o).length;
      lines.push(
        `| ${model} | ${round} | ${n} | ${pct(count("real-tool-call"), n)} | ${pct(count("hallucinated"), n)} | ${pct(count("no-attempt"), n)} | ${pct(count("error"), n)} |`,
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}

/** Stable slug from a "## Title" section's own heading — used both as the anchor id and the ToC link target, independent of any renderer's own slug rules. */
function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
}

/** Reads a table section's own "## Title" first line, tags it with an anchor id, and reports {title, slug} for the ToC. */
function withAnchor(section: string): { title: string; slug: string; anchored: string } {
  const title = section.split("\n")[0]!.replace(/^##\s*/, "");
  const slug = slugify(title);
  return { title, slug, anchored: `<a id="${slug}"></a>\n${section}` };
}

function formatToc(entries: Array<{ title: string; slug: string }>): string {
  const lines = ["## Indice", "", ...entries.map((e) => `- [${e.title}](#${e.slug})`), ""];
  return lines.join("\n");
}

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const records = await loadTrials();

  const tables = [
    tableModels(records),
    tableOutcomes(records),
    tableSelectUsage(records),
    tableFormattedList(records),
    tableHelpWikiUsage(records),
    tableTimingRelativeToError(records),
    tableAttemptPattern(records),
    tableHardCaseRepeat(records),
    tablePressureByRound(records),
    tableFinishReason(records),
    tableReasoningVolume(records),
    tableCost(records),
  ].map(withAnchor);

  const header = `# Statistiche aggregate\n\n${records.length} trial trovati in \`${RESULTS_DIR}\`.\n\n`;
  const toc = formatToc(tables);
  const body = tables.map((t) => t.anchored).join("\n");

  await Bun.write(OUTPUT_PATH, header + toc + body);
  console.log(`Scritto ${OUTPUT_PATH} (${records.length} trial, ${uniqueModels(records).length} modelli).`);
}

await main();
