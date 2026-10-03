/**
 * The REPL session `mfw e2e` drives, against a stand-in REPL (a script that
 * reads lines like the real one, answers, and writes `/dump` files): each
 * turn is the line plus `/dump`, and ends when the REPL says it wrote the dump.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openReplSession } from "./session.ts";

let dir: string;
let fakeRepl: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "mfw-e2e-session-"));
  fakeRepl = join(dir, "fake-repl.ts");
  // Answers "answer to <line>" (slowly for "slow"), dies on "die", and writes
  // a one-step dump of the last line on `/dump <path>`, like the real REPL.
  writeFileSync(
    fakeRepl,
    `
import { writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
let last = "";
process.stdout.write("> ");
for await (const line of createInterface({ input: process.stdin })) {
  const dump = line.match(/^\\/dump (\\S+)$/);
  if (dump) {
    writeFileSync(dump[1], JSON.stringify([{ content: [{ type: "text", text: "answer to " + last }] }]));
    process.stdout.write("wrote 1 tool step(s) from the last turn to " + dump[1] + "\\n[~1k/~2k tokens] > ");
    continue;
  }
  if (line === "die") { console.error("model unreachable"); process.exit(3); }
  if (line === "slow") await new Promise((r) => setTimeout(r, 2000));
  last = line;
  process.stdout.write("thinking…\\nanswer to " + line + "\\n[~1k/~2k tokens] > ");
}
`,
  );
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const open = async (timeoutMs = 10_000) =>
  await openReplSession({ argv: ["bun", fakeRepl], cwd: dir, hostDir: dir, replDir: dir, name: "s1", timeoutMs });

describe("openReplSession", () => {
  test("a turn sends the line and /dump, and hands back the dump and what was printed before it", async () => {
    const session = await open();
    const first = await session.turn("hello");
    expect(first.dump).toEqual([{ content: [{ type: "text", text: "answer to hello" }] }]);
    expect(first.output).toBe("thinking…\nanswer to hello\n[~1k/~2k tokens] > ");
    const second = await session.turn("again");
    expect(second.dump).toEqual([{ content: [{ type: "text", text: "answer to again" }] }]);
    await session.close();
  });

  test("each turn's dump has its own file", async () => {
    const session = await open();
    await session.turn("a");
    await session.turn("b");
    await session.close();
    const { readdirSync } = await import("node:fs");
    expect(readdirSync(dir).filter((f) => f.endsWith(".json")).sort()).toEqual(["s1-turn-1.json", "s1-turn-2.json"]);
  });

  test("a REPL that exits mid-turn: an error with its exit code and stderr", async () => {
    const session = await open();
    await expect(session.turn("die")).rejects.toThrow("the REPL exited with code 3: model unreachable");
  });

  // #131: the first turn waited for the REPL to start, so its seconds
  // counted the container's startup too.
  test("opening waits for the REPL's first prompt: a turn's time is its own", async () => {
    writeFileSync(fakeRepl.replace(".ts", "-slow-start.ts"), `await new Promise((r) => setTimeout(r, 1500));\nawait import(${JSON.stringify(fakeRepl)});\n`);
    const opened = Date.now();
    const session = await openReplSession({ argv: ["bun", fakeRepl.replace(".ts", "-slow-start.ts")], cwd: dir, hostDir: dir, replDir: dir, name: "s1", timeoutMs: 10_000 });
    expect(Date.now() - opened).toBeGreaterThanOrEqual(1500);
    const sent = Date.now();
    await session.turn("hello");
    expect(Date.now() - sent).toBeLessThan(1000);
    await session.close();
  });

  test("a REPL that never starts: opening fails with its exit code and stderr", async () => {
    await expect(
      openReplSession({ argv: ["bun", "-e", "console.error('no model'); process.exit(4)"], cwd: dir, hostDir: dir, replDir: dir, name: "s1", timeoutMs: 10_000 }),
    ).rejects.toThrow("the REPL exited with code 4: no model");
  });

  test("a turn longer than the timeout: an error saying so", async () => {
    const session = await open(500);
    await expect(session.turn("slow")).rejects.toThrow("no reply within 0.5 s");
    await session.close();
  });
});
