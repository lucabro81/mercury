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
 * usual one (an `.npmrc` token, or `NPM_CONFIG_TOKEN`). Without `--tag`,
 * versions go to `latest`, which is where the CLI looks plugins up.
 */
import { parseArgs } from "node:util";
import { publicWorkspacesInOrder, run } from "./workspaces.ts";

/** Whether `name@version` is on `registry`: a 404 means it isn't, a success
 * that it is. Anything else (an auth error, rate limiting, an outage) throws,
 * so a registry problem never passes for a version waiting to be published. */
export async function isPublished(
  name: string,
  version: string,
  registry: string,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  let res: Response;
  try {
    res = await fetchFn(`${registry}/${name.replace("/", "%2F")}/${version}`);
  } catch {
    throw new Error(`Can't reach ${registry} to check ${name}@${version}`);
  }
  if (res.status === 404) return false;
  if (res.ok) return true;
  throw new Error(`${registry} answered ${res.status} checking ${name}@${version}: stopping`);
}

if (import.meta.main) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      registry: { type: "string", default: "https://registry.npmjs.org" },
      tag: { type: "string" },
      "dry-run": { type: "boolean", default: false },
    },
  });
  const registry = (values.registry as string).replace(/\/+$/, "");
  try {
    run(["bun", "scripts/build-types.ts"]);
    run(["bun", "scripts/check-pack.ts", "--types"]);
    for (const { dir, pkg } of publicWorkspacesInOrder()) {
      if (await isPublished(pkg.name, pkg.version, registry)) {
        console.log(`skip ${pkg.name}@${pkg.version}: already on ${registry}`);
        continue;
      }
      const cmd = ["bun", "publish", "--access", "public", `--registry=${registry}`];
      if (values.tag) cmd.push(`--tag=${values.tag}`);
      if (values["dry-run"]) cmd.push("--dry-run");
      console.log(`publish ${pkg.name}@${pkg.version}`);
      run(cmd, dir);
    }
  } catch (err) {
    // What's published stays published; rerunning skips it and carries on.
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
