/**
 * Finds the Mercury app the app commands (`mfw start`, `mfw vault`, …) act
 * on: the nearest folder, from `from` upwards, holding `mercury.config.ts`.
 * Its `package.json` name is the app's name (what `mfw reset` asks to type).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export type App = { dir: string; name: string };

/** The app containing `from`; throws when there's none, or when its manifest has no name. */
export function findApp(from: string): App {
  const start = resolve(from);
  for (let dir = start; ; dir = dirname(dir)) {
    if (existsSync(join(dir, "mercury.config.ts"))) {
      const manifest = join(dir, "package.json");
      const name = existsSync(manifest) ? (JSON.parse(readFileSync(manifest, "utf-8")) as { name?: unknown }).name : undefined;
      if (typeof name !== "string" || name === "") throw new Error(`${manifest} has no name`);
      return { dir, name };
    }
    if (dirname(dir) === dir) {
      throw new Error(`Not inside a Mercury app: no mercury.config.ts in ${start} or any folder above it`);
    }
  }
}
