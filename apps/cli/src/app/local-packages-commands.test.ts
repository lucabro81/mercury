/**
 * `mfw local-packages <folder>` and `--off` on a temporary app, with real
 * tarballs shaped like `bun pm pack`'s: what lands in `.packs/`, what the
 * manifest says, and the install that follows.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appCommands, type AppDeps } from "./commands.ts";

let base: string;
let app: { dir: string; name: string };
let packs: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-local-packages-cmd-"));
  app = { dir: join(base, "my-agent"), name: "my-agent" };
  mkdirSync(app.dir);
  writeFileSync(
    join(app.dir, "package.json"),
    JSON.stringify({ name: "my-agent", dependencies: { "@mercury-fw/core": "^0.30.0" }, overrides: { "some-lib": "1.2.3" } }, null, 2) + "\n",
  );
  packs = join(base, "packs");
  mkdirSync(packs);
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

/** Writes a tarball named `file` into `packs`, holding a package called `name`. */
async function pack(name: string, file: string): Promise<void> {
  const work = mkdtempSync(join(base, "pack-"));
  mkdirSync(join(work, "package"));
  writeFileSync(join(work, "package", "package.json"), JSON.stringify({ name, version: "0.30.0" }));
  expect(await Bun.spawn(["tar", "czf", join(packs, file), "-C", work, "package"]).exited).toBe(0);
}

/** Deps that record the commands run and the printed lines; the install answers `installCode`. */
function fake(installCode = 0) {
  const runs: Array<{ argv: string[]; cwd: string }> = [];
  const printed: string[] = [];
  const deps: AppDeps = {
    run: async (argv, { cwd }) => {
      runs.push({ argv, cwd });
      return installCode;
    },
    capture: async () => "",
    ask: async () => "",
    print: (line) => void printed.push(line),
    home: join(base, "home"),
  };
  return { deps, runs, printed };
}

const manifest = () => JSON.parse(readFileSync(join(app.dir, "package.json"), "utf-8"));

describe("local-packages <folder>", () => {
  test("copies the tarballs into .packs/, overrides each package with its own, then installs", async () => {
    await pack("@mercury-fw/core", "mercury-fw-core-0.30.0.tgz");
    await pack("@mercury-fw/plugin-types", "mercury-fw-plugin-types-0.30.0.tgz");
    const f = fake();
    expect(await appCommands(app, f.deps).localPackages(packs)).toBe(0);
    expect(readdirSync(join(app.dir, ".packs")).sort()).toEqual(["mercury-fw-core-0.30.0.tgz", "mercury-fw-plugin-types-0.30.0.tgz"]);
    expect(manifest().overrides).toEqual({
      "some-lib": "1.2.3",
      "@mercury-fw/core": "file:./.packs/mercury-fw-core-0.30.0.tgz",
      "@mercury-fw/plugin-types": "file:./.packs/mercury-fw-plugin-types-0.30.0.tgz",
    });
    expect(f.runs).toEqual([{ argv: ["bun", "install"], cwd: app.dir }]);
    expect(f.printed).toEqual([`2 local packages in ${join(app.dir, ".packs")}: @mercury-fw/core, @mercury-fw/plugin-types.`]);
  });

  test("a second run replaces the tarballs and overrides of the first", async () => {
    await pack("@mercury-fw/core", "mercury-fw-core-0.30.0.tgz");
    await pack("@mercury-fw/kit", "mercury-fw-kit-0.30.0.tgz");
    await appCommands(app, fake().deps).localPackages(packs);
    rmSync(join(packs, "mercury-fw-kit-0.30.0.tgz"));
    await appCommands(app, fake().deps).localPackages(packs);
    expect(readdirSync(join(app.dir, ".packs"))).toEqual(["mercury-fw-core-0.30.0.tgz"]);
    expect(Object.keys(manifest().overrides)).toEqual(["some-lib", "@mercury-fw/core"]);
  });

  test("the install's exit code comes back", async () => {
    await pack("@mercury-fw/core", "mercury-fw-core-0.30.0.tgz");
    expect(await appCommands(app, fake(1).deps).localPackages(packs)).toBe(1);
  });

  test("a folder without tarballs is an error, and the app is left alone", async () => {
    const before = readFileSync(join(app.dir, "package.json"), "utf-8");
    const f = fake();
    await expect(appCommands(app, f.deps).localPackages(packs)).rejects.toThrow(`No .tgz in ${packs}`);
    expect(readFileSync(join(app.dir, "package.json"), "utf-8")).toBe(before);
    expect(f.runs).toEqual([]);
  });

  // #131 review: pointed at the app's own .packs/, it deleted the tarballs
  // before copying them.
  test("the app's own .packs/ is refused, and left as it is", async () => {
    await pack("@mercury-fw/core", "mercury-fw-core-0.30.0.tgz");
    await appCommands(app, fake().deps).localPackages(packs);
    const f = fake();
    await expect(appCommands(app, f.deps).localPackages(join(app.dir, ".packs"))).rejects.toThrow("is the app's own .packs/");
    expect(readdirSync(join(app.dir, ".packs"))).toEqual(["mercury-fw-core-0.30.0.tgz"]);
    expect(f.runs).toEqual([]);
  });

  // #131 review: .packs/ was replaced before the manifest was read, so a
  // broken package.json left the app half changed.
  test("a package.json it can't read: an error, and .packs/ untouched", async () => {
    await pack("@mercury-fw/core", "mercury-fw-core-0.30.0.tgz");
    mkdirSync(join(app.dir, ".packs"));
    writeFileSync(join(app.dir, ".packs", "old.tgz"), "old");
    writeFileSync(join(app.dir, "package.json"), "{ not json");
    await expect(appCommands(app, fake().deps).localPackages(packs)).rejects.toThrow();
    expect(readdirSync(join(app.dir, ".packs"))).toEqual(["old.tgz"]);
  });

  test("a missing folder is an error naming it", async () => {
    await expect(appCommands(app, fake().deps).localPackages(join(base, "nope"))).rejects.toThrow(join(base, "nope"));
  });
});

describe("local-packages --off", () => {
  test("drops the local overrides and .packs/, keeps the user's own, then installs from the registry", async () => {
    await pack("@mercury-fw/core", "mercury-fw-core-0.30.0.tgz");
    await appCommands(app, fake().deps).localPackages(packs);
    const f = fake();
    expect(await appCommands(app, f.deps).localPackagesOff()).toBe(0);
    expect(existsSync(join(app.dir, ".packs"))).toBe(false);
    expect(manifest().overrides).toEqual({ "some-lib": "1.2.3" });
    expect(f.runs).toEqual([{ argv: ["bun", "install"], cwd: app.dir }]);
    expect(f.printed).toEqual(["Local packages removed: installing from the registry."]);
  });
});
