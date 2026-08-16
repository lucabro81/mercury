/**
 * Admin panel's CLI status tab: lists each active CLI's allowlisted
 * commands straight from the same `CliConfig` `src/index.ts` already
 * built at startup (`activeCliConfigs`), and — where a CLI declares a
 * plain, non-mutating `auth whoami`-shaped prefix — runs it through the
 * exact same `runCli` used for real tool calls. Never constructs or runs
 * anything else; this is read-only status, not a command console.
 */
import type { CliConfig } from "../tools/cli-tool.ts";
import type { runCli } from "../tools/cli-executor.ts";

export type CliStatusEntry = {
  binary: string;
  allowedPrefixes: CliConfig["allowedPrefixes"];
  whoami: { available: false } | { available: true; ok: boolean; output: string };
};

function findWhoamiPrefix(config: CliConfig): string[] | null {
  const match = config.allowedPrefixes.find(
    (c) => !c.confirm && c.prefix.length === 2 && c.prefix[0] === "auth" && c.prefix[1] === "whoami",
  );
  return match ? match.prefix : null;
}

export async function getCliStatus(
  configs: Record<string, CliConfig>,
  runCliFn: typeof runCli,
): Promise<CliStatusEntry[]> {
  const entries: CliStatusEntry[] = [];
  for (const [binary, config] of Object.entries(configs)) {
    const whoamiPrefix = findWhoamiPrefix(config);
    if (!whoamiPrefix) {
      entries.push({ binary, allowedPrefixes: config.allowedPrefixes, whoami: { available: false } });
      continue;
    }
    const result = await runCliFn(binary, whoamiPrefix);
    entries.push({
      binary,
      allowedPrefixes: config.allowedPrefixes,
      whoami: {
        available: true,
        ok: result.ok,
        output: result.ok ? String(result.data) : result.error,
      },
    });
  }
  return entries;
}
