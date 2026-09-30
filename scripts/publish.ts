/**
 * Publishes every public workspace whose current version isn't on the
 * registry yet, dependencies before their dependents. Run from the repo root
 * after `bun run release`:
 *
 *   bun scripts/publish.ts [--registry <url>] [--tag <dist-tag>] [--dry-run]
 *
 * `bun publish`, not `changeset publish`: the latter runs `npm publish`, which
 * leaves `workspace:*` in the published manifests. Authentication is the
 * registry's usual one (an `.npmrc` token, or `NPM_CONFIG_TOKEN`). The pack
 * check (`scripts/check-pack.ts`) runs first and stops everything on a problem.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

type Manifest = {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
type Workspace = { dir: string; pkg: Manifest };

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    registry: { type: "string", default: "https://registry.npmjs.org" },
    tag: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
});
const registry = (values.registry as string).replace(/\/$/, "");
const root = join(import.meta.dir, "..");

/** Runs `cmd` in `cwd`, inheriting output; throws when it fails. */
function run(cmd: string[], cwd: string): void {
  const proc = Bun.spawnSync(cmd, { cwd, stdout: "inherit", stderr: "inherit" });
  if (proc.exitCode !== 0) {
    throw new Error(`${cmd.join(" ")} failed in ${cwd}`);
  }
}

/** The public workspaces, each after the workspaces it depends on. */
function publicWorkspaces(): Workspace[] {
  const proc = Bun.spawnSync(["git", "ls-files", "--", "*package.json"], { cwd: root, stdout: "pipe" });
  const all = proc.stdout
    .toString()
    .split("\n")
    .filter((f) => f && f !== "package.json")
    .map((f) => ({ dir: join(root, dirname(f)), pkg: JSON.parse(readFileSync(join(root, f), "utf-8")) as Manifest }))
    .filter((w) => !w.pkg.private);
  const byName = new Map(all.map((w) => [w.pkg.name, w]));
  const ordered: Workspace[] = [];
  const seen = new Set<string>();
  const visit = (w: Workspace) => {
    if (seen.has(w.pkg.name)) return;
    seen.add(w.pkg.name);
    for (const dep of Object.keys({ ...w.pkg.dependencies, ...w.pkg.peerDependencies })) {
      const target = byName.get(dep);
      if (target) visit(target);
    }
    ordered.push(w);
  };
  all.forEach(visit);
  return ordered;
}

/** Whether `name@version` is already on the registry. */
async function isPublished(name: string, version: string): Promise<boolean> {
  const res = await fetch(`${registry}/${name.replace("/", "%2F")}/${version}`);
  return res.ok;
}

run(["bun", "scripts/check-pack.ts"], root);
for (const { dir, pkg } of publicWorkspaces()) {
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
