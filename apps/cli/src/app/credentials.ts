/**
 * The two halves of `mfw credentials set`: packing a CLI's config folder into
 * its credentials variable (a base64 tar.gz with the folder at its root, what
 * the app's `docker-entrypoint.sh` unpacks into `~/.config` on the volume), and
 * writing that variable into the app's env file.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

/** `from` packed as `<folder>/…` into a base64 tar.gz on one line. A `from`
 * named otherwise is archived under `folder` anyway, through a symlink. */
export async function packCredentials(from: string, folder: string): Promise<string> {
  const source = resolve(from);
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    throw new Error(`No folder at ${source}`);
  }
  let parent = dirname(source);
  let staging: string | undefined;
  const flags = ["-cz", "--no-xattrs"];
  if (basename(source) !== folder) {
    staging = mkdtempSync(join(tmpdir(), "mfw-credentials-"));
    symlinkSync(source, join(staging, folder));
    parent = staging;
    flags.push("-h");
  }
  try {
    // COPYFILE_DISABLE: macOS's tar would otherwise add ._ files for metadata.
    const proc = Bun.spawn(["tar", ...flags, "-f", "-", "-C", parent, folder], {
      env: { ...process.env, COPYFILE_DISABLE: "1" },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [archive, stderr, code] = await Promise.all([
      new Response(proc.stdout).arrayBuffer(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);
    if (code !== 0) throw new Error(`tar failed packing ${source}: ${stderr.trim()}`);
    return Buffer.from(archive).toString("base64");
  } finally {
    if (staging !== undefined) rmSync(staging, { recursive: true, force: true });
  }
}

/** Sets `name=value` in the env file at `file`: replaces the line that
 * assigns `name`, or appends one; every other line stays as it was. A missing
 * file is created readable by its owner only. */
export function setEnvVar(file: string, name: string, value: string): void {
  const line = `${name}=${value}`;
  if (!existsSync(file)) {
    writeFileSync(file, `${line}\n`, { mode: 0o600 });
    return;
  }
  const text = readFileSync(file, "utf-8");
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.startsWith(`${name}=`));
  if (at !== -1) {
    lines[at] = line;
    writeFileSync(file, lines.join("\n"));
    return;
  }
  writeFileSync(file, `${text}${text === "" || text.endsWith("\n") ? "" : "\n"}${line}\n`);
}
