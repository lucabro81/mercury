/**
 * The version each package of a new app is written against. The framework
 * packages move in lockstep with this CLI, so they take its own version; a
 * plugin or channel is versioned on its own, so it takes the registry's
 * `latest` (asked only for the ones chosen).
 */
import pkg from "../package.json";

/** The framework packages a new app can depend on: always at the CLI's version. */
export const FRAMEWORK_PACKAGES = ["@mercury-fw/cli", "@mercury-fw/core", "@mercury-fw/formatter"];

/** The registry asked when `MFW_REGISTRY` doesn't name another. */
export const DEFAULT_REGISTRY = "https://registry.npmjs.org";

/** The registry to ask: `value` (from `MFW_REGISTRY`) unless it's unset or
 * blank, the default otherwise. */
export function registryFrom(value: string | undefined): string {
  return value?.trim() ? value.trim() : DEFAULT_REGISTRY;
}

/** This CLI's version, which is the framework's. */
export function cliVersion(): string {
  return pkg.version;
}

/** Maps the framework packages to the CLI's version and each of `packages`
 * (plugins and channels) to the registry's `latest`. Rejects naming the
 * package the registry doesn't have, or saying the registry can't be reached. */
export async function appVersions(
  packages: string[],
  opts: { registry: string; fetchFn?: typeof fetch },
): Promise<Record<string, string>> {
  const registry = opts.registry.replace(/\/+$/, "");
  const fetchFn = opts.fetchFn ?? fetch;
  const versions: Record<string, string> = Object.fromEntries(FRAMEWORK_PACKAGES.map((p) => [p, cliVersion()]));
  const latest = await Promise.all(
    packages.map(async (name) => {
      let res: Response;
      try {
        res = await fetchFn(`${registry}/${name.replace("/", "%2F")}/latest`);
      } catch {
        throw new Error(`Can't reach ${registry} to look up ${name}`);
      }
      if (!res.ok) {
        throw new Error(`${name} is not on ${registry}`);
      }
      const body = (await res.json().catch(() => undefined)) as { version?: unknown } | undefined;
      if (typeof body?.version !== "string") {
        throw new Error(`${registry} gave no version for ${name}`);
      }
      return [name, body.version] as const;
    }),
  );
  for (const [name, version] of latest) {
    versions[name] = version;
  }
  return versions;
}
