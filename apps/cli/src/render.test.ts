/**
 * `renderApp` turns the wizard's answers into the new app's files, with no I/O.
 * The generated config, manifest, env example and compose file are compared
 * byte-exact against goldens for representative selections (nothing, http +
 * jira, everything); the rest is checked for what depends on the selection.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { DEFAULT_PERSONA_TONE } from "@mercury/core";
import { renderApp, type RenderInput } from "./render.ts";

const golden = (name: string): string =>
  readFileSync(new URL(`./__fixtures__/render/${name}.golden`, import.meta.url), "utf-8");

const versions: Record<string, string> = {
  "@mercury/core": "0.1.0",
  "@mercury/formatter": "0.1.0",
  "@mercury/channel-google-chat": "0.1.0",
  "@mercury/channel-http": "0.1.0",
  "@mercury/plugin-jira": "0.1.0",
  "@mercury/plugin-bitbucket": "0.1.0",
  "@mercury/plugin-atlassian-admin": "0.1.0",
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
  test("writes the same set of files whatever was chosen", () => {
    for (const choice of [EMPTY, HTTP_JIRA, FULL]) {
      expect([...renderApp(choice).keys()].sort()).toEqual(ALWAYS);
    }
  });

  test("every file ends with exactly one newline", () => {
    for (const [path, content] of renderApp(FULL)) {
      expect(content.endsWith("\n"), path).toBe(true);
      expect(content.endsWith("\n\n"), path).toBe(false);
    }
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
    expect(config.split('from "@mercury/plugin-bitbucket"').length - 1).toBe(1);
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
    expect(pkg.dependencies).toEqual({ "@mercury/core": "^0.1.0" });
    expect(pkg.trustedDependencies).toBeUndefined();
  });

  test("every tool plugin is trusted (it downloads its CLI at install), channels are not", () => {
    const pkg = JSON.parse(renderApp(FULL).get("package.json") ?? "");
    expect(pkg.trustedDependencies).toEqual([
      "@mercury/plugin-atlassian-admin",
      "@mercury/plugin-bitbucket",
      "@mercury/plugin-jira",
    ]);
  });

  test("a package with no known version fails instead of writing a broken range", () => {
    const { ["@mercury/plugin-jira"]: _dropped, ...partial } = versions;
    expect(() => renderApp(input({ plugins: ["jira"], versions: partial }))).toThrow("@mercury/plugin-jira");
  });
});

describe("renderApp: .env.example", () => {
  test("http + jira: core vars, MERCURY_CLIS, then each chosen entry's vars", () => {
    expect(renderApp(HTTP_JIRA).get(".env.example")).toBe(golden("http-jira.env-example"));
  });

  test("nothing chosen: core vars only, no MERCURY_CLIS", () => {
    const env = renderApp(EMPTY).get(".env.example") ?? "";
    expect(env).toContain("OLLAMA_HOST=");
    expect(env).not.toContain("MERCURY_CLIS");
    expect(env).not.toContain("# ---");
  });

  test("MERCURY_CLIS lists every chosen tool plugin; entries without vars get no section", () => {
    const env = renderApp(FULL).get(".env.example") ?? "";
    expect(env).toContain("MERCURY_CLIS=jira,bitbucket,atlassian-admin\n");
    expect(env).toContain("# --- google-chat\n");
    expect(env).not.toContain("# --- bitbucket");
    expect(env).not.toContain("# --- atlassian-admin");
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

  test("the default name reproduces the core's default persona", () => {
    const files = renderApp(EMPTY);
    expect(files.get("persona/identity.md")).toBe("You are Mercury, an internal assistant.\n");
    expect(files.get("persona/tone.md")).toBe(`${DEFAULT_PERSONA_TONE}\n`);
  });
});

describe("renderApp: README.md", () => {
  test("names the app and what it was scaffolded with, and says it can't be installed yet", () => {
    const readme = renderApp(HTTP_JIRA).get("README.md") ?? "";
    expect(readme.startsWith("# demo\n")).toBe(true);
    expect(readme).toContain("Channels: http");
    expect(readme).toContain("Tool plugins: jira");
    expect(readme).toContain("not published yet");
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

  test.each(["demo", "my-app", "app2", "comperio.mercury", "a_b"])("accepts the app name %p", (name) => {
    expect(() => renderApp(input({ name }))).not.toThrow();
  });

  test("rejects an unknown channel or plugin, naming the valid ids", () => {
    expect(() => renderApp(input({ channels: ["slack"] }))).toThrow("google-chat, http");
    expect(() => renderApp(input({ plugins: ["http"] }))).toThrow("jira, bitbucket, atlassian-admin");
  });

  test("rejects an empty assistant name or role", () => {
    expect(() => renderApp(input({ assistantName: "  " }))).toThrow("assistant name");
    expect(() => renderApp(input({ role: "" }))).toThrow("role");
  });
});
