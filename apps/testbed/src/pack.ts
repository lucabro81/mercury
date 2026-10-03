/**
 * `bun run pack`: packs every public workspace of this repo into
 * `apps/testbed/.packs/`, the way publishing does (type declarations built
 * first, then `bun pm pack`, which turns `workspace:*` into versions), so a
 * test bed app installs what would go to npm. `--no-types` skips the
 * declarations, which only an app's typecheck needs, when speed matters more.
 */
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pack } from "../../../scripts/publish.ts";
import { publicWorkspacesInOrder, run } from "../../../scripts/workspaces.ts";

/** Where the tarballs go, and where `mfw local-packages` takes them from. */
export const PACKS_DIR = join(import.meta.dir, "..", ".packs");

/** Packs every public workspace into `PACKS_DIR`, replacing what was there;
 * returns how many. */
export function packAll({ types }: { types: boolean }): number {
  if (types) run(["bun", "scripts/build-types.ts"]);
  rmSync(PACKS_DIR, { recursive: true, force: true });
  mkdirSync(PACKS_DIR, { recursive: true });
  const workspaces = publicWorkspacesInOrder();
  for (const { dir } of workspaces) pack(dir, PACKS_DIR);
  return workspaces.length;
}

if (import.meta.main) {
  const count = packAll({ types: !process.argv.includes("--no-types") });
  console.log(`${count} packages in ${PACKS_DIR}`);
}
