/**
 * Makes this repo's publish workflow a trusted publisher of every public
 * workspace on npm, so CI publishes through OIDC with no token. Run by a
 * maintainer, once per package, after that package's first version exists on
 * npm (trusted publishing can't be configured on a name that isn't there yet):
 *
 *   npm login
 *   bun scripts/trust-publishers.ts [<package>...]
 *
 * Needs npm 11.15.0 or later. npm asks for 2FA on the first package and offers
 * to skip it for the next five minutes, which covers the whole loop. Without
 * arguments it goes through every public workspace; a package that fails is
 * reported at the end and doesn't stop the others.
 */
import { publicWorkspacesInOrder, run } from "./workspaces.ts";

/** The `npm trust` argv that lets `publish.yml` in this repo publish `name`. */
export function trustCommand(name: string): string[] {
  return [
    "npm",
    "trust",
    "github",
    name,
    "--file",
    "publish.yml",
    "--repo",
    "lucabro81/mercury-fw",
    "--allow-publish",
    "--yes",
  ];
}

if (import.meta.main) {
  const names = process.argv.length > 2 ? process.argv.slice(2) : publicWorkspacesInOrder().map((w) => w.pkg.name);
  const failed: string[] = [];
  for (const name of names) {
    console.log(`trust ${name}`);
    try {
      run(trustCommand(name));
    } catch {
      failed.push(name);
    }
  }
  if (failed.length > 0) {
    console.error(`Not trusted: ${failed.join(", ")}`);
    process.exit(1);
  }
}
