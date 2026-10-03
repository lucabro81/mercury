/**
 * What `mfw local-packages` writes: the app's `package.json` with `overrides`
 * pointing packages at local tarballs (`bun pm pack`) copied into `.packs/`,
 * which the image copies before `bun install`. Overrides, and not the
 * dependencies themselves, because a packed package names its siblings by
 * version, which the registry has too: only an override sends those
 * transitive dependencies to the tarballs as well.
 */

/** The tarballs' folder inside the app, as the Dockerfile copies it. */
export const LOCAL_PACKS_DIR = ".packs";

/** The prefix of every override this command writes, how it tells them from the user's own. */
const LOCAL_OVERRIDE = `file:./${LOCAL_PACKS_DIR}/`;

type Manifest = Record<string, unknown> & { overrides?: Record<string, string> };

/** The user's own overrides in `pkg`: every one this command didn't write. */
function ownOverrides(pkg: Manifest): Record<string, string> {
  return Object.fromEntries(Object.entries(pkg.overrides ?? {}).filter(([, spec]) => !spec.startsWith(LOCAL_OVERRIDE)));
}

/** `pkg` with each of `packs` (a package name and its tarball's file name in
 * `.packs/`) as an override, in place of any left by an earlier run. */
export function withLocalOverrides(pkg: Manifest, packs: Array<{ name: string; file: string }>): Manifest {
  const local = Object.fromEntries(packs.map((p) => [p.name, `${LOCAL_OVERRIDE}${p.file}`]));
  return { ...pkg, overrides: { ...ownOverrides(pkg), ...local } };
}

/** `pkg` without the overrides this command writes; without `overrides` at
 * all when none of the user's own is left. */
export function withoutLocalOverrides(pkg: Manifest): Manifest {
  const { overrides: _, ...rest } = pkg;
  const own = ownOverrides(pkg);
  return Object.keys(own).length > 0 ? { ...rest, overrides: own } : rest;
}

/** The package name in a `bun pm pack` tarball, read from its
 * `package/package.json`. */
export async function packageNameOf(tarball: string): Promise<string> {
  const proc = Bun.spawn(["tar", "-xOzf", tarball, "package/package.json"], { stdout: "pipe", stderr: "pipe" });
  const [manifest, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  try {
    if (code !== 0) throw new Error(`tar exited with ${code}`);
    const name = (JSON.parse(manifest) as { name?: unknown }).name;
    if (typeof name !== "string") throw new Error("no name in its package.json");
    return name;
  } catch (err) {
    throw new Error(`${tarball} isn't a package tarball: ${err instanceof Error ? err.message : String(err)}`);
  }
}
