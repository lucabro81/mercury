/**
 * The two halves of `mfw credentials set`: packing a CLI's config folder into
 * its credentials variable (a base64 tar.gz with the folder at its root, what
 * the app's `docker-entrypoint.sh` unpacks into `~/.config` on the volume), and
 * writing that variable into the app's env file. Also reading a service
 * account key file, for `mfw google-chat set-key`.
 */
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

/** `from` packed as `<folder>/…` into a base64 tar.gz on one line. The real
 * folder behind `from` is archived through a symlink named `folder` and
 * dereferenced (`-h`): whatever `from` is called, and even when it's itself a
 * symlink (dotfiles), the archive holds the files under the CLI's folder name. */
export async function packCredentials(from: string, folder: string): Promise<string> {
  const source = resolve(from);
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    throw new Error(`No folder at ${source}`);
  }
  const staging = mkdtempSync(join(tmpdir(), "mfw-credentials-"));
  symlinkSync(realpathSync(source), join(staging, folder));
  try {
    // COPYFILE_DISABLE: macOS's tar would otherwise add ._ files for metadata.
    const proc = Bun.spawn(["tar", "-czh", "--no-xattrs", "-f", "-", "-C", staging, folder], {
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
    rmSync(staging, { recursive: true, force: true });
  }
}

/** Sets `name=value` in the env file at `file`. Every line that assigns
 * `name` (`export name=` and spaces around `=` included) gives way to one
 * line, where the first was; with none, it's appended. Every other line stays
 * as it was. The file is replaced whole through a temporary file next to it,
 * keeping its permissions, so a failed write never leaves it half written; a
 * missing file is created readable by its owner only. */
export function setEnvVar(file: string, name: string, value: string): void {
  const line = `${name}=${value}`;
  if (!existsSync(file)) {
    writeFileSync(file, `${line}\n`, { mode: 0o600 });
    return;
  }
  const text = readFileSync(file, "utf-8");
  const assigns = new RegExp(`^\\s*(export\\s+)?${name}\\s*=`);
  const lines = text.split("\n");
  const first = lines.findIndex((l) => assigns.test(l));
  let next: string;
  if (first === -1) {
    next = `${text}${text === "" || text.endsWith("\n") ? "" : "\n"}${line}\n`;
  } else {
    next = lines
      .flatMap((l, i) => (i === first ? [line] : assigns.test(l) ? [] : [l]))
      .join("\n");
  }
  const temporary = join(dirname(file), `.${name}.${process.pid}.tmp`);
  const mode = statSync(file).mode & 0o777;
  writeFileSync(temporary, next, { mode });
  // The umask may have narrowed `mode` on creation.
  chmodSync(temporary, mode);
  renameSync(temporary, file);
}

/** The two values of a Google Cloud service account key file (the JSON
 * `gcloud iam service-accounts keys create` writes) that an app needs: its
 * email, and its private key on one line with literal `\n`, the form an env
 * file holds and the Google Chat channel unescapes. Throws naming `file` when
 * it's missing or isn't such a key. */
export function readServiceAccountKey(file: string): { clientEmail: string; privateKey: string } {
  const invalid = () => new Error(`${file} isn't a service account key: it needs "type": "service_account", "client_email" and "private_key".`);
  let key: { type?: unknown; client_email?: unknown; private_key?: unknown };
  try {
    key = JSON.parse(readFileSync(file, "utf-8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`${file} doesn't exist.`);
    throw invalid();
  }
  if (key?.type !== "service_account" || typeof key.client_email !== "string" || typeof key.private_key !== "string") {
    throw invalid();
  }
  return { clientEmail: key.client_email, privateKey: key.private_key.replace(/\n/g, "\\n") };
}
