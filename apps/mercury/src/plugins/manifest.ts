/**
 * Builds the read-only installation manifest the HTTP surface exposes (4b):
 * what this instance actually loaded — the core's plugin apiVersion, each
 * plugin (name, declared apiVersion, whether it activated, the skills it
 * contributes, whether it has a `build()`), the active CLI binaries, and the
 * skill descriptors. Pure and side-effect-free so it's unit-tested directly.
 *
 * A plugin no longer exposes a central config, so activation is reported from
 * the loader's `activated` set rather than inferred from a config map. The
 * active CLI binaries are the activated plugins plus the file-based CLIs (the
 * residual with no owning plugin).
 */
import { PLUGIN_API_VERSION, type Plugin, type Skill } from "@mercury/plugin-types";

export type PluginManifest = {
  coreApiVersion: number;
  plugins: Array<{
    name: string;
    apiVersion: number;
    active: boolean;
    skills: string[];
    hasBuild: boolean;
  }>;
  activeClis: string[];
  skills: Array<{ name: string; description: string }>;
};

export function buildPluginManifest(
  plugins: Plugin[],
  activatedPluginNames: string[],
  fileCliBinaries: string[],
  skills: Skill[],
): PluginManifest {
  const activated = new Set(activatedPluginNames);
  return {
    coreApiVersion: PLUGIN_API_VERSION,
    plugins: plugins.map((p) => ({
      name: p.name,
      apiVersion: p.apiVersion,
      active: activated.has(p.name),
      skills: (p.skills ?? []).map((s) => s.name),
      hasBuild: Boolean(p.build),
    })),
    activeClis: [...activatedPluginNames, ...fileCliBinaries].sort(),
    skills: skills.map((s) => ({ name: s.name, description: s.description })),
  };
}
