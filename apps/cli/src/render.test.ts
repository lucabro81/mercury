/**
 * `renderApp` turns the wizard's answers into the new app's files, with no I/O.
 * The generated config, manifest, env example and compose file are compared
 * byte-exact against goldens for representative selections (nothing, http +
 * jira, everything); the rest is checked for what depends on the selection.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { DEFAULT_PERSONA_TONE } from "@mercury-fw/core";
import { renderApp, type RenderInput } from "./render.ts";

const golden = (name: string): string =>
  readFileSync(new URL(`./__fixtures__/render/${name}.golden`, import.meta.url), "utf-8");

const versions: Record<string, string> = {
  "@mercury-fw/cli": "0.1.0",
  "@mercury-fw/core": "0.1.0",
  "@mercury-fw/formatter": "0.1.0",
  "@mercury-fw/channel-google-chat": "0.1.0",
  "@mercury-fw/channel-http": "0.1.0",
  "@mercury-fw/plugin-jira": "0.1.0",
  "@mercury-fw/plugin-bitbucket": "0.1.0",
  "@mercury-fw/plugin-atlassian-admin": "0.1.0",
};

const input = (over: Partial<RenderInput> = {}): RenderInput => ({
  name: "demo",
  assistantName: "Mercury",
  role: "an internal assistant",
  channels: [],
  plugins: [],
  versions,
  ...over,
});

const EMPTY = input();
const HTTP_JIRA = input({ channels: ["http"], plugins: ["jira"] });
const FULL = input({ channels: ["google-chat", "http"], plugins: ["jira", "bitbucket", "atlassian-admin"] });

/** Every file the template always writes, whatever was chosen. */
const ALWAYS = [
  ".dockerignore",
  ".env.example",
  ".gitignore",
  "Dockerfile",
  "README.md",
  "docker-compose.yml",
  "markdown.d.ts",
  "mercury.config.ts",
  "package.json",
  "persona/identity.md",
  "persona/tone.md",
  "src/index.ts",
  "src/repl.ts",
  "tsconfig.json",
];

describe("renderApp: files", () => {
  test("the same set of files whatever was chosen, plus the entrypoint with a tool plugin", () => {
    expect([...renderApp(EMPTY).keys()].sort()).toEqual(ALWAYS);
    expect([...renderApp(input({ channels: ["http"] })).keys()].sort()).toEqual(ALWAYS);
    for (const choice of [HTTP_JIRA, FULL]) {
      expect([...renderApp(choice).keys()].sort()).toEqual([...ALWAYS, "docker-entrypoint.sh"].sort());
    }
  });

  test("every file ends with exactly one newline", () => {
    for (const [path, content] of renderApp(FULL)) {
      expect(content.endsWith("\n"), path).toBe(true);
      expect(content.endsWith("\n\n"), path).toBe(false);
    }
  });
});

describe("renderApp: CLI credentials", () => {
  test("the entrypoint materializes each chosen tool plugin's credentials, then starts the service", () => {
    expect(renderApp(FULL).get("docker-entrypoint.sh")).toBe(golden("full.docker-entrypoint.sh"));
  });

  test("only the chosen plugins get a line", () => {
    const entrypoint = renderApp(HTTP_JIRA).get("docker-entrypoint.sh") ?? "";
    expect(entrypoint).toContain("materialize jira-cli JIRA_CLI_CONFIG_TAR_B64\n");
    expect(entrypoint).not.toContain("bitbucket");
  });

  test("with a tool plugin the Dockerfile starts through the entrypoint", () => {
    expect(renderApp(HTTP_JIRA).get("Dockerfile")).toBe(golden("http-jira.Dockerfile"));
  });

  // #131: mfw local-packages puts tarballs in .packs/, which the image needs
  // before bun install, and git doesn't.
  test("copies .packs/ before installing, and git ignores it with the e2e results", () => {
    const dockerfile = renderApp(input({ channels: ["http"] })).get("Dockerfile") ?? "";
    expect(dockerfile).toContain("COPY --chown=mercury:mercury .pack[s] ./.packs/\nRUN bun install --production");
    const gitignore = renderApp(input({ channels: ["http"] })).get(".gitignore") ?? "";
    expect(gitignore.split("\n")).toEqual(expect.arrayContaining([".packs/", "e2e/results/"]));
  });

  test("without one it's the template as it is, starting the service directly", () => {
    const dockerfile = renderApp(input({ channels: ["http"] })).get("Dockerfile") ?? "";
    expect(dockerfile.endsWith('CMD ["bun", "src/index.ts"]\n')).toBe(true);
    expect(dockerfile).not.toContain("docker-entrypoint.sh");
  });
});

describe("renderApp: mercury.config.ts", () => {
  test("nothing chosen: empty plugins and channels, persona only", () => {
    expect(renderApp(EMPTY).get("mercury.config.ts")).toBe(golden("empty.mercury.config.ts"));
  });

  test("http + jira: jira wrapped in the formatter with the example rule", () => {
    expect(renderApp(HTTP_JIRA).get("mercury.config.ts")).toBe(golden("http-jira.mercury.config.ts"));
  });

  test("everything, in catalog order whatever order it was chosen in", () => {
    const shuffled = input({ channels: ["http", "google-chat"], plugins: ["atlassian-admin", "jira", "bitbucket"] });
    expect(renderApp(FULL).get("mercury.config.ts")).toBe(golden("full.mercury.config.ts"));
    expect(renderApp(shuffled).get("mercury.config.ts")).toBe(golden("full.mercury.config.ts"));
  });

  test("a plugin chosen twice is imported and declared once", () => {
    const twice = input({ plugins: ["bitbucket", "bitbucket"] });
    const config = renderApp(twice).get("mercury.config.ts") ?? "";
    expect(config.split('from "@mercury-fw/plugin-bitbucket"').length - 1).toBe(1);
    expect(config).toContain("  plugins: [\n    bitbucketPlugin,\n  ],\n");
  });

  test("without jira there is no formatter at all", () => {
    const config = renderApp(input({ plugins: ["bitbucket"] })).get("mercury.config.ts") ?? "";
    expect(config).not.toContain("formatter");
    expect(config).not.toContain("jiraIssueLine");
  });
});

describe("renderApp: package.json", () => {
  test("http + jira: core, formatter and the chosen packages; the tool plugin trusted for its postinstall", () => {
    expect(renderApp(HTTP_JIRA).get("package.json")).toBe(golden("http-jira.package.json"));
  });

  test("nothing chosen: only the core, no trustedDependencies", () => {
    const pkg = JSON.parse(renderApp(EMPTY).get("package.json") ?? "");
    expect(pkg.dependencies).toEqual({ "@mercury-fw/core": "^0.1.0" });
    expect(pkg.trustedDependencies).toBeUndefined();
  });

  // Regression (#94): a Google Chat app's install reported protobufjs's
  // postinstall (pulled in by @google-cloud/pubsub) as blocked, since only
  // the tool plugins were trusted.
  test("every tool plugin is trusted (it downloads its CLI at install), plus what a chosen entry needs: protobufjs for Google Chat", () => {
    const pkg = JSON.parse(renderApp(FULL).get("package.json") ?? "");
    expect(pkg.trustedDependencies).toEqual([
      "@mercury-fw/plugin-atlassian-admin",
      "@mercury-fw/plugin-bitbucket",
      "@mercury-fw/plugin-jira",
      "protobufjs",
    ]);
  });

  test("Google Chat with no tool plugin still trusts protobufjs, and nothing else", () => {
    const pkg = JSON.parse(renderApp(input({ channels: ["google-chat"] })).get("package.json") ?? "");
    expect(pkg.trustedDependencies).toEqual(["protobufjs"]);
  });

  test("a package with no known version fails instead of writing a broken range", () => {
    const { ["@mercury-fw/plugin-jira"]: _dropped, ...partial } = versions;
    expect(() => renderApp(input({ plugins: ["jira"], versions: partial }))).toThrow("@mercury-fw/plugin-jira");
  });
});

describe("renderApp: .env.example", () => {
  test("http + jira: core vars, then each chosen entry's vars", () => {
    expect(renderApp(HTTP_JIRA).get(".env.example")).toBe(golden("http-jira.env-example"));
  });

  test("nothing chosen: core vars only", () => {
    const env = renderApp(EMPTY).get(".env.example") ?? "";
    expect(env).toContain("OLLAMA_HOST=");
    expect(env).not.toContain("# ---");
  });

  // #142: MERCURY_CLIS repeated the config, and a plugin missing from it
  // was skipped silently.
  test("no MERCURY_CLIS: declaring a plugin is what enables it; each tool plugin's section carries its credentials variable", () => {
    const env = renderApp(FULL).get(".env.example") ?? "";
    expect(env).not.toContain("MERCURY_CLIS");
    expect(env).toContain("# --- google-chat\n");
    expect(env).toMatch(/# --- bitbucket\n# bitbucket-cli's config folder, packed: mfw credentials set bitbucket [^\n]*\nBITBUCKET_CLI_CONFIG_TAR_B64=\n/);
    expect(env).toMatch(/# --- atlassian-admin\n# [^\n]*\nATLASSIAN_ADMIN_CLI_CONFIG_TAR_B64=\n/);
  });
});

describe("renderApp: docker-compose.yml", () => {
  test("everything: volumes named after the app, CLI credentials volume for the tool plugins", () => {
    expect(renderApp(FULL).get("docker-compose.yml")).toBe(golden("full.docker-compose.yml"));
  });

  test("no tool plugin: no CLI credentials volume", () => {
    const compose = renderApp(input({ channels: ["http"] })).get("docker-compose.yml") ?? "";
    expect(compose).not.toContain("cli-credentials");
    expect(compose).toContain("name: demo_wiki-vault");
  });

  // Regression (#105): the HTTP surface listened inside the container only,
  // nothing published its port, so it was unreachable from outside.
  test("HTTP channel: the service publishes HTTP_SURFACE_PORT (4100 when unset) on the host", () => {
    const compose = renderApp(input({ channels: ["http"] })).get("docker-compose.yml") ?? "";
    expect(compose).toContain(
      ['    ports:', '      - "${HTTP_SURFACE_PORT:-4100}:${HTTP_SURFACE_PORT:-4100}"'].join("\n"),
    );
  });

  test("no HTTP channel: no port published", () => {
    const compose = renderApp(input({ channels: ["google-chat"] })).get("docker-compose.yml") ?? "";
    expect(compose).not.toContain("ports:");
  });
});

describe("renderApp: persona", () => {
  test("identity from the assistant's name and role", () => {
    const files = renderApp(input({ assistantName: "Hermes", role: "the platform team's release assistant" }));
    expect(files.get("persona/identity.md")).toBe("You are Hermes, the platform team's release assistant.\n");
  });

  test("tone is the core's default, with the chosen name in place of Mercury", () => {
    const tone = renderApp(input({ assistantName: "Hermes" })).get("persona/tone.md") ?? "";
    expect(tone).toBe(`${DEFAULT_PERSONA_TONE.replaceAll("Mercury", "Hermes")}\n`);
    expect(tone).toContain("DON'T introduce yourself as Hermes unless asked");
    expect(tone).not.toContain("Mercury");
  });

  // Regression: the name went through String.replaceAll as a replacement
  // string, where "$&" and friends are patterns, so tone.md disagreed with
  // identity.md for such a name.
  test("a name with $ patterns lands in the tone verbatim", () => {
    const tone = renderApp(input({ assistantName: "A$&B$'" })).get("persona/tone.md") ?? "";
    expect(tone).toContain("DON'T introduce yourself as A$&B$' unless asked");
  });

  // Regression: a role typed as a sentence ended up with a doubled period.
  test("a role that already ends with a period doesn't get a second one", () => {
    expect(renderApp(input({ role: "a helper." })).get("persona/identity.md")).toBe("You are Mercury, a helper.\n");
  });

  test("the default name reproduces the core's default persona", () => {
    const files = renderApp(EMPTY);
    expect(files.get("persona/identity.md")).toBe("You are Mercury, an internal assistant.\n");
    expect(files.get("persona/tone.md")).toBe(`${DEFAULT_PERSONA_TONE}\n`);
  });
});

describe("renderApp: README.md", () => {
  test("says how to get mfw once, globally, and how to do without", () => {
    const readme = renderApp(HTTP_JIRA).get("README.md") ?? "";
    expect(readme).toContain("bun add -g @mercury-fw/cli");
    expect(readme).toContain("`bunx mfw start`");
  });

  test("HTTP channel: says where the surface listens on the host, and that it has no authentication", () => {
    const readme = renderApp(HTTP_JIRA).get("README.md") ?? "";
    expect(readme).toContain("## HTTP surface");
    expect(readme).toContain("`http://<host>:4100`");
    expect(readme).toContain("`HTTP_SURFACE_PORT`");
    expect(readme).toContain("no authentication");
  });

  test("no HTTP channel: no HTTP surface section", () => {
    expect(renderApp(input({ channels: ["google-chat"] })).get("README.md") ?? "").not.toContain("## HTTP surface");
  });

  test("names the app and what it was scaffolded with, and starts from installing it", () => {
    const readme = renderApp(HTTP_JIRA).get("README.md") ?? "";
    expect(readme.startsWith("# demo\n")).toBe(true);
    expect(readme).toContain("Channels: http");
    expect(readme).toContain("Tool plugins: jira");
    expect(readme).toContain("bun install\ncp .env.example .env\n");
    expect(readme).not.toContain("published");
  });

  test("runs the app through mfw, not raw docker commands", () => {
    const readme = renderApp(HTTP_JIRA).get("README.md") ?? "";
    expect(readme).toContain("bun install\ncp .env.example .env\nmfw start\nmfw repl\n");
    expect(readme).toContain("mfw --help");
    expect(readme).not.toContain("docker compose up");
    expect(readme).not.toContain("docker compose run --rm mercury bun run repl");
  });

  test("with a tool plugin it explains how its CLI gets credentials; without, nothing", () => {
    const withTools = renderApp(HTTP_JIRA).get("README.md") ?? "";
    expect(withTools).toContain("## CLI credentials");
    expect(withTools).toContain("mfw credentials set jira");
    expect(withTools).toContain("mfw credentials reset jira");
    expect(withTools).not.toContain("starts empty");
    expect(renderApp(input({ channels: ["http"] })).get("README.md")).not.toContain("CLI credentials");
  });

  test("an empty selection says so instead of listing nothing", () => {
    const readme = renderApp(EMPTY).get("README.md") ?? "";
    expect(readme).toContain("Channels: none");
    expect(readme).toContain("Tool plugins: none");
  });
});

describe("renderApp: validation", () => {
  test.each(["Demo", "my app", "@scope/demo", "", ".demo", "_demo", "a".repeat(215)])(
    "rejects the app name %p",
    (name) => {
      expect(() => renderApp(input({ name }))).toThrow("app name");
    },
  );

  test.each(["demo", "my-app", "app2", "acme.mercury", "a_b"])("accepts the app name %p", (name) => {
    expect(() => renderApp(input({ name }))).not.toThrow();
  });

  test("rejects an unknown channel or plugin, naming the valid ids", () => {
    expect(() => renderApp(input({ channels: ["slack"] }))).toThrow("google-chat, http");
    expect(() => renderApp(input({ plugins: ["http"] }))).toThrow("jira, bitbucket, atlassian-admin");
  });

  test("rejects a line break in the assistant name or role (each is one line of the persona)", () => {
    expect(() => renderApp(input({ assistantName: "Her\nmes" }))).toThrow("one line");
    expect(() => renderApp(input({ role: "a\nhelper" }))).toThrow("one line");
  });

  test("rejects an empty assistant name or role", () => {
    expect(() => renderApp(input({ assistantName: "  " }))).toThrow("assistant name");
    expect(() => renderApp(input({ role: "" }))).toThrow("role");
  });
});
