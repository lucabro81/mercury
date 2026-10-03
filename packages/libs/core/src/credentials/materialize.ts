/**
 * Unpacks each plugin-declared CLI credentials variable onto the config folder
 * at startup. A plugin whose CLI keeps its login in a folder declares it in its
 * package.json (`mercury.cliCredentials`, read by `@mercury-fw/utils`); the
 * app's env file carries that folder packed into a variable (`mfw credentials
 * set` writes it). In the container `~/.config` is the credentials volume, so
 * this unpacks only while a CLI's folder isn't there yet: what the CLI writes
 * back afterwards, like a refreshed token, stays across redeploys and an older
 * variable never overwrites it. A login declared elsewhere in the home lives
 * on the volume too (`volumePath`), and the home path is made a link to it at
 * every start, since the rest of the home is the image's and starts over each
 * time. Called by `composeMercury` before the plugins load, so the service and
 * the REPL both get it. Never throws: a CLI without its login degrades only
 * that plugin's calls. It works on the home it's given, so an app run outside
 * its container (against the Docker-first rule) would unpack into the real
 * home: only with a credentials variable set and the folder missing there.
 */
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readlinkSync, renameSync, rmSync, symlinkSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { appCliCredentials, volumePath, type CliCredentials } from "@mercury-fw/utils";

/** Where to read the declarations and where to unpack them. */
export interface MaterializeOptions {
  /** The app's folder (its package.json and node_modules). */
  appDir: string;
  /** The home the CLIs run with; its `.config` is the credentials volume. */
  homeDir: string;
  env: Record<string, string | undefined>;
  log: (msg: string) => void;
}

/** Unpacks every declared login that's missing from the volume and has its
 * variable set, and links one declared outside `~/.config`; warns about one
 * that has neither, and logs each dependency it couldn't read. */
export async function materializeCliCredentials({ appDir, homeDir, env, log }: MaterializeOptions): Promise<void> {
  let declared: CliCredentials[];
  try {
    const read = appCliCredentials(appDir);
    for (const problem of read.problems) log(`CLI credentials: ${problem}`);
    declared = read.declared;
  } catch (err) {
    log(`CLI credentials not unpacked: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
  for (const c of declared) {
    const target = join(homeDir, volumePath(c.path));
    if (!existsSync(target)) {
      const value = env[c.variable];
      if (value === undefined || value === "") {
        log(
          `${c.package}: no login for its CLI (no ${c.name} folder, ${c.variable} not set): run mfw credentials set ${c.name}`,
        );
        continue;
      }
      try {
        await unpack(value, basename(c.path), target);
      } catch (err) {
        log(`${c.package}: could not unpack ${c.variable} into ${c.name}: ${err instanceof Error ? err.message : String(err)}`);
        continue;
      }
    }
    const link = join(homeDir, c.path);
    if (link === target) continue;
    try {
      linkTo(target, link, (msg) => log(`${c.package}: ${msg}`));
    } catch (err) {
      log(`${c.package}: could not link ${link} to the credentials volume: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

/** Makes `link` a symlink to `target` unless it already is one; anything else
 * at `link` is never replaced, only reported. */
function linkTo(target: string, link: string, log: (msg: string) => void): void {
  const existing = lstatSync(link, { throwIfNoEntry: false });
  if (existing === undefined) {
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(target, link);
  } else if (!existing.isSymbolicLink() || readlinkSync(link) !== target) {
    log(`${link} is already there and isn't a link to the credentials volume: the CLI won't find its login`);
  }
}

/** Extracts only `member` from the base64 tar.gz into a staging folder next to
 * `target`, then moves it to `target`: a failed extraction leaves nothing
 * behind that would count as present on the next start. */
async function unpack(value: string, member: string, target: string): Promise<void> {
  mkdirSync(dirname(target), { recursive: true });
  const staging = mkdtempSync(join(dirname(target), `.${member}-`));
  try {
    const proc = Bun.spawn(["tar", "-xzf", "-", "-C", staging, member], {
      stdin: Buffer.from(value, "base64"),
      stdout: "ignore",
      stderr: "pipe",
    });
    const [code, stderr] = await Promise.all([proc.exited, new Response(proc.stderr).text()]);
    if (code !== 0 || !existsSync(join(staging, member))) {
      throw new Error(stderr.trim() || `tar exited with ${code}`);
    }
    renameSync(join(staging, member), target);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}
