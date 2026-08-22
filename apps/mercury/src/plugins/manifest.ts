/**
 * Builds the read-only installation manifest the HTTP surface exposes (4b):
 * what this instance actually loaded — the core's plugin apiVersion, each
 * plugin (name, its declared apiVersion, whether its CLI activated, the skills
 * it contributes, whether it has runtime contributions or a custom status), the
 * active CLI binaries, and the skill descriptors. Pure and side-effect-free so
 * it's unit-tested directly; the composition root passes it the same `plugins`
 * list and `activeCliConfigs` it wired everything else from.
 */
import { PLUGIN_API_VERSION, type Plugin, type Skill } from "@mercury/plugin-types";
import type { CliConfig } from "../tools/cli-tool.ts";

export type PluginManifest = {
  coreApiVersion: number;
  plugins: Array<{
    name: string;
    apiVersion: number;
    active: boolean;
    skills: string[];
    hasBuild: boolean;
    customStatus: boolean;
  }>;
  activeClis: string[];
  skills: Array<{ name: string; description: string }>;
};

export function buildPluginManifest(
  plugins: Plugin[],
  activeCliConfigs: Record<string, CliConfig>,
  skills: Skill[],
): PluginManifest {
  return {
    coreApiVersion: PLUGIN_API_VERSION,
    plugins: plugins.map((p) => ({
      name: p.name,
      apiVersion: p.apiVersion,
      // A plugin is active when its declared binary reached the allowlist; for
      // today's plugins the binary equals the name.
      active: Boolean(activeCliConfigs[p.name]),
      skills: (p.skills ?? []).map((s) => s.name),
      hasBuild: Boolean(p.build),
      customStatus: Boolean(p.describeStatus),
    })),
    activeClis: Object.keys(activeCliConfigs).sort(),
    skills: skills.map((s) => ({ name: s.name, description: s.description })),
  };
}
