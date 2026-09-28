import { describe, it, expect } from "bun:test";
import { resolvePlatform, binaryAssetUrl, readPinnedBinary } from "@mercury/utils";

/**
 * The pure half of the shared CLI-binary provisioning (`@mercury/utils`) every
 * plugin's postinstall relies on — the platform→asset mapping and the
 * release-URL construction. These are the parts most likely to silently produce
 * a 404 (a wrong asset name, a mis-built tag), so they're pinned exactly rather
 * than left to the one integration point (the real download, verified in the
 * built container). The IO half (`downloadPinnedBinary`: fetch + write + chmod)
 * isn't unit-tested — it's exercised for real by each plugin's Docker build.
 */
describe("resolvePlatform", () => {
  it("maps the three platforms that have a published asset", () => {
    expect(resolvePlatform("linux", "x64")).toBe("linux-x86_64");
    expect(resolvePlatform("linux", "arm64")).toBe("linux-arm64");
    expect(resolvePlatform("darwin", "arm64")).toBe("macos-arm64");
  });

  it("rejects an Intel Mac — there is no macos-x86_64 asset", () => {
    expect(() => resolvePlatform("darwin", "x64")).toThrow();
  });

  it("rejects an unsupported OS or architecture", () => {
    expect(() => resolvePlatform("win32", "x64")).toThrow();
    expect(() => resolvePlatform("linux", "ppc64")).toThrow();
  });
});

describe("binaryAssetUrl", () => {
  it("builds the per-crate release download URL from the pinned config", () => {
    expect(
      binaryAssetUrl({ repo: "lucabro81/CLI-monorepo", crate: "jira", version: "0.8.0" }, "linux-arm64"),
    ).toBe("https://github.com/lucabro81/CLI-monorepo/releases/download/jira-v0.8.0/jira-linux-arm64");
  });
});

describe("readPinnedBinary", () => {
  it("extracts and validates the pin from a package.json-shaped object", () => {
    const pin = readPinnedBinary({ mercury: { cliBinary: { repo: "r/x", crate: "jira", version: "1.2.3" } } });
    expect(pin).toEqual({ repo: "r/x", crate: "jira", version: "1.2.3" });
  });

  it("throws a clear error when the pin is missing or malformed", () => {
    expect(() => readPinnedBinary({})).toThrow();
    expect(() => readPinnedBinary({ mercury: { cliBinary: { crate: "jira", version: "1.0.0" } } })).toThrow();
    expect(() => readPinnedBinary({ mercury: { cliBinary: { repo: "r/x", crate: "jira", version: "" } } })).toThrow();
  });
});
