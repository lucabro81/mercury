/**
 * Publishes every public workspace whose current version isn't on the
 * registry yet, dependencies before their dependents. Run from the repo root
 * after `bun run release`:
 *
 *   bun scripts/publish.ts [--registry <url>] [--tag <dist-tag>] [--dry-run]
 *
 * First it emits the type declarations (`scripts/build-types.ts`) and checks
 * every pack with them (`scripts/check-pack.ts --types`); a problem stops
 * everything before anything is published. Then `bun publish`, not
 * `changeset publish`: the latter runs `npm publish`, which leaves
 * `workspace:*` in the published manifests. Authentication is the registry's
 * usual one (an `.npmrc` token, or `NPM_CONFIG_TOKEN`).
 */
import { parseArgs } from "node:util";
import { publicWorkspacesInOrder, run } from "./workspaces.ts";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    registry: { type: "string", default: "https://registry.npmjs.org" },
    tag: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
});
const registry = (values.registry as string).replace(/\/+$/, "");

/** Whether `name@version` is already on the registry. */
async function isPublished(name: string, version: string): Promise<boolean> {
  const res = await fetch(`${registry}/${name.replace("/", "%2F")}/${version}`);
  return res.ok;
}

run(["bun", "scripts/build-types.ts"]);
run(["bun", "scripts/check-pack.ts", "--types"]);
for (const { dir, pkg } of publicWorkspacesInOrder()) {
  if (await isPublished(pkg.name, pkg.version)) {
    console.log(`skip ${pkg.name}@${pkg.version}: already on ${registry}`);
    continue;
  }
  const cmd = ["bun", "publish", "--access", "public", `--registry=${registry}`];
  if (values.tag) cmd.push(`--tag=${values.tag}`);
  if (values["dry-run"]) cmd.push("--dry-run");
  console.log(`publish ${pkg.name}@${pkg.version}`);
  run(cmd, dir);
}
