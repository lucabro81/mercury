/**
 * Writes a rendered app (`render.ts`) to disk. The target must be missing or an
 * empty folder: scaffolding never writes over an existing project, and the
 * check happens before any file is written.
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Writes every `path → content` of `files` under `dir`, creating the folders
 * they need. Throws, writing nothing, when `dir` is a file or a non-empty
 * folder (hidden entries count). */
export function writeApp(dir: string, files: Map<string, string>): void {
  const error = targetError(dir);
  if (error !== undefined) {
    throw new Error(error);
  }
  for (const [path, content] of files) {
    const target = join(dir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

/** Why `dir` can't receive a new app (a file, or a folder with something in
 * it), or undefined when it's missing or empty. Shared with the command, which
 * checks the target before asking anything. */
export function targetError(dir: string): string | undefined {
  if (!existsSync(dir)) {
    return undefined;
  }
  if (!statSync(dir).isDirectory()) {
    return `${dir} is not a folder`;
  }
  if (readdirSync(dir).length > 0) {
    return `${dir} is not empty`;
  }
  return undefined;
}
