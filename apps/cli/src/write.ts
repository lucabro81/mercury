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
  if (existsSync(dir)) {
    if (!statSync(dir).isDirectory()) {
      throw new Error(`${dir} is not a folder`);
    }
    if (readdirSync(dir).length > 0) {
      throw new Error(`${dir} is not empty`);
    }
  }
  for (const [path, content] of files) {
    const target = join(dir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}
