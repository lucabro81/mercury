/**
 * Unpacks each plugin-declared CLI credentials variable onto the config folder
 * at startup. A plugin whose CLI keeps its login in a folder declares it in its
 * package.json (`mercury.cliCredentials`, read by `@mercury-fw/utils`); the
 * app's env file carries that folder packed into a variable (`mfw credentials
 * set` writes it). In the container the config folder is the credentials
 * volume, so this runs only while a CLI's folder isn't there yet: what the CLI
 * writes back afterwards, like a refreshed token, stays across redeploys and an
 * older variable never overwrites it. Called by `composeMercury` before the
 * plugins load, so the service and the REPL both get it. Never throws: a CLI
 * without its login degrades only that plugin's calls.
 */
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { appCliCredentials, type CliCredentials } from "@mercury-fw/utils";

/** Where to read the declarations and where to unpack them. */
export interface MaterializeOptions {
  /** The app's folder (its package.json and node_modules). */
  appDir: string;
  /** `~/.config`, where each CLI keeps its folder. */
  configDir: string;
  env: Record<string, string | undefined>;
  log: (msg: string) => void;
}

/** Unpacks every declared folder that's missing and has its variable set;
 * warns about one that has neither. */
export async function materializeCliCredentials({ appDir, configDir, env, log }: MaterializeOptions): Promise<void> {
  let declared: CliCredentials[];
  try {
    declared = appCliCredentials(appDir);
  } catch (err) {
    log(`CLI credentials not unpacked: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
  for (const c of declared) {
    if (existsSync(join(configDir, c.folder))) continue;
    const value = env[c.variable];
    if (value === undefined || value === "") {
      log(
        `${c.package}: no login for its CLI (no ${c.folder} folder, ${c.variable} not set): run mfw credentials set ${c.folder}`,
      );
      continue;
    }
    try {
      await unpack(value, c.folder, configDir);
    } catch (err) {
      log(`${c.package}: could not unpack ${c.variable} into ${c.folder}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

/** Extracts only `folder` from the base64 tar.gz into a staging folder next to
 * it, then moves it in place: a failed extraction leaves nothing behind that
 * would count as present on the next start. */
async function unpack(value: string, folder: string, configDir: string): Promise<void> {
  mkdirSync(configDir, { recursive: true });
  const staging = mkdtempSync(join(configDir, `.${folder}-`));
  try {
    const proc = Bun.spawn(["tar", "-xzf", "-", "-C", staging, folder], {
      stdin: Buffer.from(value, "base64"),
      stdout: "ignore",
      stderr: "pipe",
    });
    const [code, stderr] = await Promise.all([proc.exited, new Response(proc.stderr).text()]);
    if (code !== 0 || !existsSync(join(staging, folder))) {
      throw new Error(stderr.trim() || `tar exited with ${code}`);
    }
    renameSync(join(staging, folder), join(configDir, folder));
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}
