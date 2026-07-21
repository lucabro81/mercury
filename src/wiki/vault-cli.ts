#!/usr/bin/env bun
/**
 * Maintenance CLI for the wiki vault — runs INSIDE the Mercury container
 * (the vault is a Docker named volume, not a host path, see `scripts/vault.sh`
 * and CLAUDE.md § "Manutenzione della vault wiki"). Thin argv wrapper around
 * functions that already exist and are already tested (`wiki-note.ts`,
 * `vault-init.ts`) — no new write/read logic here, only routing.
 *
 * Deliberately does NOT expose `writeInferredNote` — that writer is
 * reserved exclusively for a deterministic, mechanical consolidation
 * process (see its own docstring in `wiki-note.ts`); a manual CLI writing
 * "agent-sourced" notes by hand would defeat that guarantee.
 *
 * `write-raw` has no `--author`/frontmatter options, unlike `write-curated`
 * — raw/ content is verbatim, un-triaged material (a pasted README, notes),
 * and its provenance is recovered from git history rather than a
 * schema field. The nightly self-review job (`self-review-tools.ts`) is
 * the only thing that reads raw/ back to triage it into curated/.
 *
 * `list`/`read`/`grep` intentionally bypass `wiki-read.ts`'s per-user
 * scoping (`allowedRoots`) — that scoping exists to isolate what the
 * MODEL can see per caller; a maintainer running this CLI is already a
 * trusted admin context with no such boundary, so these just walk the
 * whole vault directly.
 */
import { initVault } from "./vault-init.ts";
import { writeCuratedNote, writeRawEntry } from "./wiki-note.ts";

function usage(): never {
  console.error(
    [
      "Usage: vault-cli <command> [args]",
      "",
      "Commands:",
      "  write-curated <curated/...path.md> [--author NAME]   body read from stdin",
      "  write-raw <raw/...path.md>                           body read from stdin",
      "  read <path>",
      "  list",
      "  grep <pattern>",
      "",
      "Every path is relative to the vault root (as printed by `list`), including",
      "the leading `curated/`/`raw/` — write-curated/write-raw require it too, so",
      "paths are consistent across every command instead of meaning different things.",
    ].join("\n"),
  );
  process.exit(1);
}

async function readStdin(): Promise<string> {
  return await Bun.stdin.text();
}

async function main(): Promise<void> {
  const vaultPath = process.env.WIKI_VAULT_PATH;
  if (!vaultPath) {
    console.error("WIKI_VAULT_PATH is not set");
    process.exit(1);
  }
  await initVault(vaultPath);

  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "write-curated": {
      const vaultRelativePath = args[0];
      if (!vaultRelativePath) usage();
      if (!vaultRelativePath.startsWith("curated/")) {
        console.error(`path must start with "curated/" (got "${vaultRelativePath}") — see \`list\` for real examples`);
        process.exit(1);
      }
      const curatedRelativePath = vaultRelativePath.slice("curated/".length);
      const authorFlagIndex = args.indexOf("--author");
      const author = authorFlagIndex !== -1 ? args[authorFlagIndex + 1] : undefined;
      const body = await readStdin();
      if (!body.trim()) {
        console.error("empty body on stdin — nothing to write");
        process.exit(1);
      }
      await writeCuratedNote(vaultPath, curatedRelativePath, { author }, body.trimEnd());
      console.log(`wrote ${vaultRelativePath}`);
      break;
    }

    case "write-raw": {
      const vaultRelativePath = args[0];
      if (!vaultRelativePath) usage();
      if (!vaultRelativePath.startsWith("raw/")) {
        console.error(`path must start with "raw/" (got "${vaultRelativePath}")`);
        process.exit(1);
      }
      const rawRelativePath = vaultRelativePath.slice("raw/".length);
      const body = await readStdin();
      if (!body.trim()) {
        console.error("empty body on stdin — nothing to write");
        process.exit(1);
      }
      await writeRawEntry(vaultPath, rawRelativePath, body.trimEnd());
      console.log(`wrote ${vaultRelativePath}`);
      break;
    }

    case "read": {
      const relativePath = args[0];
      if (!relativePath) usage();
      console.log(await Bun.file(`${vaultPath}/${relativePath}`).text());
      break;
    }

    case "list": {
      const glob = new Bun.Glob("**/*.md");
      for await (const file of glob.scan({ cwd: vaultPath })) {
        console.log(file);
      }
      break;
    }

    case "grep": {
      const pattern = args[0];
      if (!pattern) usage();
      const regex = new RegExp(pattern);
      const glob = new Bun.Glob("**/*.md");
      for await (const file of glob.scan({ cwd: vaultPath })) {
        const content = await Bun.file(`${vaultPath}/${file}`).text();
        content.split("\n").forEach((line, i) => {
          if (regex.test(line)) {
            console.log(`${file}:${i + 1}:${line}`);
          }
        });
      }
      break;
    }

    default:
      usage();
  }
}

await main();
