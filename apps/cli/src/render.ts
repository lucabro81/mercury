/**
 * Turns the wizard's answers into the new app's files, as a `path → content`
 * map, without touching the disk (`write.ts` does that). The static files come
 * from `template/` imported as text, so they are bundled with the CLI; the
 * config, the manifest, the env example, the compose file, the persona and the
 * README are generated from the selection. Channels and plugins are always
 * written in catalog order, whatever order they were chosen in.
 */
import { DEFAULT_PERSONA_TONE } from "@mercury/core";
import { CATALOG, type CatalogEntry, type EnvVar } from "./catalog.ts";
import indexTs from "../template/src/index.ts.tpl" with { type: "text" };
import replTs from "../template/src/repl.ts.tpl" with { type: "text" };
import markdownDts from "../template/markdown.d.ts.tpl" with { type: "text" };
import tsconfigJson from "../template/tsconfig.json.tpl" with { type: "text" };
import gitignore from "../template/gitignore.tpl" with { type: "text" };
import dockerignore from "../template/dockerignore.tpl" with { type: "text" };
import dockerfile from "../template/Dockerfile.tpl" with { type: "text" };

/** What the new app is made of. `versions` maps each package the app depends
 * on to the version its range is written against. */
export type RenderInput = {
  name: string;
  assistantName: string;
  role: string;
  channels: string[];
  plugins: string[];
  versions: Record<string, string>;
};

/** An app name that is a valid unscoped npm name and a valid prefix for the
 * compose volume names. */
const APP_NAME = /^[a-z0-9][a-z0-9._-]*$/;
const APP_NAME_MAX = 214;

/** The variables the core reads, first in every app's env example. */
const CORE_ENV: EnvVar[] = [
  {
    name: "OLLAMA_HOST",
    comment: "Model endpoint (Ollama-compatible). Ollama running on the Docker host is host.docker.internal.",
    value: "http://host.docker.internal:11434",
  },
  { name: "OLLAMA_MODEL", comment: "Chat model the assistant runs on" },
  { name: "OLLAMA_EMBEDDING_MODEL", comment: "Embedding model for the episodic memory", value: "nomic-embed-text" },
  { name: "QDRANT_URL", comment: "Qdrant, the compose service", value: "http://qdrant:6333" },
  { name: "WIKI_VAULT_PATH", comment: "Wiki vault, the named volume's mount point", value: "/app/wiki-vault" },
];

const CONFIG_HEADER = `/**
 * This app's composition: the tool plugins and channels it runs, how the lists
 * its plugins hand over read, and the assistant's persona. The entrypoints
 * (\`src/index.ts\`, \`src/repl.ts\`) hand this config to \`composeMercury\`.
 *
 * A tool plugin contributes only when it's also listed in MERCURY_CLIS; a
 * channel is active as soon as it's declared here.
 */`;

/** Builds every file of the new app. Throws on an invalid app name, an empty
 * assistant name or role, an id the catalog doesn't have, or a package with no
 * version in `input.versions`. */
export function renderApp(input: RenderInput): Map<string, string> {
  validate(input);
  const channels = selected("channel", input.channels);
  const tools = selected("tool", input.plugins);
  const assistantName = input.assistantName.trim();

  return new Map([
    [".dockerignore", dockerignore],
    [".env.example", renderEnv(channels, tools)],
    [".gitignore", gitignore],
    ["Dockerfile", dockerfile],
    ["README.md", renderReadme(input.name, channels, tools)],
    ["docker-compose.yml", renderCompose(input.name, tools.length > 0)],
    ["markdown.d.ts", markdownDts],
    ["mercury.config.ts", renderConfig(channels, tools)],
    ["package.json", renderPackageJson(input.name, channels, tools, input.versions)],
    ["persona/identity.md", `You are ${assistantName}, ${input.role.trim()}.\n`],
    ["persona/tone.md", `${DEFAULT_PERSONA_TONE.replaceAll("Mercury", assistantName)}\n`],
    ["src/index.ts", indexTs],
    ["src/repl.ts", replTs],
    ["tsconfig.json", tsconfigJson],
  ]);
}

/** Rejects what would produce a broken app, naming the valid choices. */
function validate(input: RenderInput): void {
  if (!APP_NAME.test(input.name) || input.name.length > APP_NAME_MAX) {
    throw new Error(
      `Invalid app name "${input.name}": lowercase letters, digits, ".", "_" and "-", starting with a letter or digit`,
    );
  }
  if (!input.assistantName.trim()) {
    throw new Error("The assistant name can't be empty");
  }
  if (!input.role.trim()) {
    throw new Error("The assistant's role can't be empty");
  }
  for (const [kind, ids] of [
    ["channel", input.channels],
    ["tool", input.plugins],
  ] as const) {
    const valid = CATALOG.filter((e) => e.kind === kind).map((e) => e.id);
    const unknown = ids.find((id) => !valid.includes(id));
    if (unknown !== undefined) {
      const label = kind === "channel" ? "channel" : "plugin";
      throw new Error(`Unknown ${label} "${unknown}" (valid: ${valid.join(", ")})`);
    }
  }
}

/** The catalog entries of `kind` among `ids`, deduplicated, in catalog order. */
function selected(kind: CatalogEntry["kind"], ids: string[]): CatalogEntry[] {
  return CATALOG.filter((e) => e.kind === kind && ids.includes(e.id));
}

/** `mercury.config.ts`: imports, the formatter helpers of the plugins that have
 * any, then the config with each plugin (wrapped in the formatter when it has
 * starting rules) and channel. */
function renderConfig(channels: CatalogEntry[], tools: CatalogEntry[]): string {
  const withRules = tools.filter((t) => t.formatter);
  const imports = ['import { defineMercuryConfig } from "@mercury/core";'];
  if (withRules.length > 0) {
    imports.push('import { formatterPlugin, formatter } from "@mercury/formatter";');
  }
  for (const t of tools) {
    const names = t.formatter ? `${t.exportName}, type ${t.formatter.displaysType}` : t.exportName;
    imports.push(`import { ${names} } from "${t.package}";`);
  }
  for (const c of channels) {
    imports.push(`import { ${c.exportName} } from "${c.package}";`);
  }
  imports.push('import identity from "./persona/identity.md" with { type: "text" };');
  imports.push('import tone from "./persona/tone.md" with { type: "text" };');

  const helpers = withRules.map((t) => `${t.formatter?.helpers}\n\n`).join("");

  const plugins =
    tools.length === 0
      ? "  plugins: [],"
      : ["  plugins: [", ...tools.map(renderPluginEntry), "  ],"].join("\n");
  const channelList = `  channels: [${channels.map((c) => c.exportName).join(", ")}],`;

  return [
    CONFIG_HEADER,
    ...imports,
    "",
    `${helpers}export default defineMercuryConfig({`,
    "  persona: { identity, tone },",
    plugins,
    channelList,
    "});",
    "",
  ].join("\n");
}

/** One element of the config's `plugins` array. */
function renderPluginEntry(t: CatalogEntry): string {
  if (!t.formatter) {
    return `    ${t.exportName},`;
  }
  return [
    "    formatterPlugin(",
    `      ${t.exportName},`,
    `      formatter<${t.formatter.displaysType}>({`,
    ...t.formatter.rules.map((r) => `        ${r}`),
    "      }),",
    "    ),",
  ].join("\n");
}

/** `package.json`: the core, the formatter when a plugin is wrapped in it, the
 * chosen packages, and every tool plugin trusted to run its postinstall (it
 * downloads the plugin's CLI). */
function renderPackageJson(
  name: string,
  channels: CatalogEntry[],
  tools: CatalogEntry[],
  versions: Record<string, string>,
): string {
  const packages = ["@mercury/core", ...channels.map((c) => c.package), ...tools.map((t) => t.package)];
  if (tools.some((t) => t.formatter)) {
    packages.push("@mercury/formatter");
  }
  const dependencies: Record<string, string> = {};
  for (const pkg of packages.sort()) {
    const version = versions[pkg];
    if (version === undefined) {
      throw new Error(`No version known for ${pkg}`);
    }
    dependencies[pkg] = `^${version}`;
  }
  const manifest: Record<string, unknown> = {
    name,
    version: "0.1.0",
    type: "module",
    private: true,
    scripts: { start: "bun src/index.ts", repl: "bun src/repl.ts", typecheck: "tsc --noEmit" },
    dependencies,
    devDependencies: { "@types/bun": "1.4.0", typescript: "6.0.3" },
  };
  if (tools.length > 0) {
    manifest.trustedDependencies = tools.map((t) => t.package).sort();
  }
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/** The env example: the core's variables, MERCURY_CLIS when a tool plugin was
 * chosen, then a section per chosen entry that reads any variable. */
function renderEnv(channels: CatalogEntry[], tools: CatalogEntry[]): string {
  const block = (vars: EnvVar[]) => vars.map((v) => `# ${v.comment}\n${v.name}=${v.value ?? ""}`).join("\n");
  const sections = [block(CORE_ENV)];
  if (tools.length > 0) {
    sections.push(
      block([
        {
          name: "MERCURY_CLIS",
          comment: "Tool plugins this instance enables (their ids, comma-separated)",
          value: tools.map((t) => t.id).join(","),
        },
      ]),
    );
  }
  for (const entry of [...channels, ...tools]) {
    if (entry.env.length > 0) {
      sections.push(`# --- ${entry.id}\n${block(entry.env)}`);
    }
  }
  return `${sections.join("\n\n")}\n`;
}

/** `docker-compose.yml`: the app and Qdrant, with named volumes prefixed by the
 * app's name; the CLI credentials volume only when a tool plugin was chosen. */
function renderCompose(name: string, hasTools: boolean): string {
  const credentialsMount = hasTools
    ? [
        "      # The tool plugins' CLI credentials: kept on a volume so the refresh",
        "      # tokens a CLI writes back survive a redeploy.",
        "      - cli-credentials:/home/mercury/.config",
      ]
    : [];
  const credentialsVolume = hasTools ? ["  cli-credentials:", `    name: ${name}_cli-credentials`] : [];
  return [
    "services:",
    "  mercury:",
    "    build: .",
    "    env_file:",
    "      - path: .env",
    "        required: false",
    "    volumes:",
    "      - wiki-vault:/app/wiki-vault",
    ...credentialsMount,
    "    extra_hosts:",
    '      - "host.docker.internal:host-gateway"',
    "    depends_on:",
    "      - qdrant",
    "",
    "  qdrant:",
    "    image: qdrant/qdrant:v1.19.0",
    "    volumes:",
    "      - qdrant-data:/qdrant/storage",
    "",
    "volumes:",
    "  wiki-vault:",
    `    name: ${name}_wiki-vault`,
    "  qdrant-data:",
    `    name: ${name}_qdrant-data`,
    ...credentialsVolume,
    "",
  ].join("\n");
}

/** The app's README: what it was scaffolded with, how to run it, and that the
 * packages it depends on aren't published yet. */
function renderReadme(name: string, channels: CatalogEntry[], tools: CatalogEntry[]): string {
  const list = (entries: CatalogEntry[]) => (entries.length > 0 ? entries.map((e) => e.id).join(", ") : "none");
  return `# ${name}

A Mercury app, scaffolded by \`mercury create\`.

- Channels: ${list(channels)}
- Tool plugins: ${list(tools)}

## Layout

- \`mercury.config.ts\`: what the app is made of (tool plugins, channels, how their lists read) and the assistant's persona.
- \`persona/identity.md\`, \`persona/tone.md\`: who the assistant is and how it answers. Edit them freely.
- \`src/index.ts\`: the service (channels, crons). \`src/repl.ts\`: an interactive terminal for trying things out.
- \`.env.example\`: every variable the app reads. Copy it to \`.env\` and fill it in.

## Running it

\`\`\`bash
cp .env.example .env
docker compose up --build
docker compose run --rm mercury bun run repl
\`\`\`

> The \`@mercury/*\` packages this app depends on are not published yet, so \`bun install\` (and the image build) won't find them until they are.
`;
}
