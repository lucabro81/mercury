/**
 * `mfw google-chat set-key` on a temporary app (a manifest with the Google
 * Chat channel among its dependencies, an env file as `mfw create` leaves it)
 * and a key file around a key generated here: what ends up in the env file,
 * what's printed (never the key), and what's refused before writing anything.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appCommands, type AppDeps } from "./commands.ts";

const SUBSCRIPTION = "projects/proj/subscriptions/mercury-chat-sub";
const EMAIL = "bot@proj.iam.gserviceaccount.com";
/** The env file as `mfw create` writes its example, Google Chat's lines empty. */
const SCAFFOLDED = [
  "OLLAMA_HOST=http://host.docker.internal:11434",
  "# Google Chat",
  "GOOGLE_CHAT_PUBSUB_SUBSCRIPTION=",
  "GOOGLE_CHAT_APP_CLIENT_EMAIL=",
  "GOOGLE_CHAT_APP_PRIVATE_KEY=",
  "QDRANT_URL=http://qdrant:6333",
  "",
].join("\n");

let base: string;
let app: { dir: string; name: string };
let envFile: string;
let keyFile: string;
let pem: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-google-chat-cmd-"));
  app = { dir: join(base, "my-agent"), name: "my-agent" };
  mkdirSync(app.dir);
  writeFileSync(
    join(app.dir, "package.json"),
    JSON.stringify({
      name: "my-agent",
      dependencies: { "@mercury-fw/core": "^0.27.0", "@mercury-fw/channel-google-chat": "^0.1.0" },
    }),
  );
  envFile = join(app.dir, [".", "env"].join(""));
  writeFileSync(envFile, SCAFFOLDED, { mode: 0o600 });
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  keyFile = join(base, "key.json");
  writeFileSync(keyFile, JSON.stringify({ type: "service_account", private_key: pem, client_email: EMAIL }));
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

/** Deps that record docker calls and printed lines. */
function fake() {
  const runs: string[][] = [];
  const printed: string[] = [];
  const deps: AppDeps = {
    run: async (argv) => {
      runs.push(argv);
      return 0;
    },
    capture: async () => "",
    ask: async () => "",
    print: (line) => void printed.push(line),
    home: join(base, "home"),
  };
  return { deps, runs, printed };
}

/** The env file's value for `name`, as the channel reads it. */
function envValue(name: string): string | undefined {
  const line = readFileSync(envFile, "utf-8")
    .split("\n")
    .find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1);
}

describe("google-chat set-key", () => {
  test("fills the scaffolded lines in place: email, key on one line, subscription; the rest untouched", async () => {
    const f = fake();
    expect(await appCommands(app, f.deps).googleChatSetKey(keyFile, { subscription: SUBSCRIPTION })).toBe(0);
    const lines = readFileSync(envFile, "utf-8").split("\n");
    expect(lines.length).toBe(SCAFFOLDED.split("\n").length);
    expect(lines[0]).toBe("OLLAMA_HOST=http://host.docker.internal:11434");
    expect(lines[1]).toBe("# Google Chat");
    expect(lines[2]).toBe(`GOOGLE_CHAT_PUBSUB_SUBSCRIPTION=${SUBSCRIPTION}`);
    expect(lines[3]).toBe(`GOOGLE_CHAT_APP_CLIENT_EMAIL=${EMAIL}`);
    expect(lines[4]).toStartWith("GOOGLE_CHAT_APP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\n");
    expect(lines[5]).toBe("QDRANT_URL=http://qdrant:6333");
    // The channel's own unescape gives back the key, usable as such.
    const key = envValue("GOOGLE_CHAT_APP_PRIVATE_KEY")!.replace(/\\n/g, "\n");
    expect(key).toBe(pem);
    expect(createPrivateKey(key).asymmetricKeyType).toBe("rsa");
    expect(f.runs).toEqual([]);
  });

  test("says what it wrote and what's left to do, never printing the key", async () => {
    const f = fake();
    await appCommands(app, f.deps).googleChatSetKey(keyFile, { subscription: SUBSCRIPTION });
    expect(f.printed).toEqual([
      `GOOGLE_CHAT_APP_CLIENT_EMAIL, GOOGLE_CHAT_APP_PRIVATE_KEY and GOOGLE_CHAT_PUBSUB_SUBSCRIPTION set in ${envFile}, from ${keyFile}.`,
      `Delete ${keyFile} now, the env file holds the key. mfw start applies it to a running app.`,
    ]);
    const all = f.printed.join("\n");
    expect(all).not.toContain("PRIVATE KEY-----");
    expect(all).not.toContain(envValue("GOOGLE_CHAT_APP_PRIVATE_KEY")!.slice(40, 80));
  });

  test("without --subscription, the subscription line stays as it was", async () => {
    writeFileSync(envFile, SCAFFOLDED.replace("GOOGLE_CHAT_PUBSUB_SUBSCRIPTION=", `GOOGLE_CHAT_PUBSUB_SUBSCRIPTION=${SUBSCRIPTION}`));
    const f = fake();
    expect(await appCommands(app, f.deps).googleChatSetKey(keyFile, {})).toBe(0);
    expect(envValue("GOOGLE_CHAT_PUBSUB_SUBSCRIPTION")).toBe(SUBSCRIPTION);
    expect(envValue("GOOGLE_CHAT_APP_CLIENT_EMAIL")).toBe(EMAIL);
    expect(f.printed[0]).toBe(`GOOGLE_CHAT_APP_CLIENT_EMAIL and GOOGLE_CHAT_APP_PRIVATE_KEY set in ${envFile}, from ${keyFile}.`);
  });

  test("replaces an older key", async () => {
    const f = fake();
    await appCommands(app, f.deps).googleChatSetKey(keyFile, { subscription: SUBSCRIPTION });
    writeFileSync(keyFile, JSON.stringify({ type: "service_account", private_key: "-----NEW-----\n", client_email: "new@proj.iam.gserviceaccount.com" }));
    await appCommands(app, f.deps).googleChatSetKey(keyFile, {});
    expect(envValue("GOOGLE_CHAT_APP_CLIENT_EMAIL")).toBe("new@proj.iam.gserviceaccount.com");
    expect(envValue("GOOGLE_CHAT_APP_PRIVATE_KEY")).toBe("-----NEW-----\\n");
    expect(readFileSync(envFile, "utf-8").match(/^GOOGLE_CHAT_APP_PRIVATE_KEY=/gm)?.length).toBe(1);
  });

  describe("refuses before writing anything", () => {
    test("an app without the Google Chat channel", async () => {
      writeFileSync(join(app.dir, "package.json"), JSON.stringify({ name: "my-agent", dependencies: { "@mercury-fw/core": "^0.27.0" } }));
      await expect(appCommands(app, fake().deps).googleChatSetKey(keyFile, { subscription: SUBSCRIPTION })).rejects.toThrow(
        "my-agent doesn't have the Google Chat channel (@mercury-fw/channel-google-chat) among its dependencies.",
      );
      expect(readFileSync(envFile, "utf-8")).toBe(SCAFFOLDED);
    });

    test("a subscription that isn't projects/<project>/subscriptions/<name>", async () => {
      for (const subscription of ["mercury-chat-sub", "projects/proj/topics/t", "projects//subscriptions/s", "projects/p/subscriptions/s/x"]) {
        await expect(appCommands(app, fake().deps).googleChatSetKey(keyFile, { subscription })).rejects.toThrow(
          `--subscription takes projects/<project>/subscriptions/<name> (got "${subscription}").`,
        );
      }
      expect(readFileSync(envFile, "utf-8")).toBe(SCAFFOLDED);
    });

    test("a key file that isn't a service account key", async () => {
      writeFileSync(keyFile, JSON.stringify({ type: "authorized_user" }));
      await expect(appCommands(app, fake().deps).googleChatSetKey(keyFile, { subscription: SUBSCRIPTION })).rejects.toThrow(
        `${keyFile} isn't a service account key`,
      );
      expect(readFileSync(envFile, "utf-8")).toBe(SCAFFOLDED);
    });
  });
});
