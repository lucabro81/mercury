/**
 * Resolves a Chat user by email against the cache populated by the Chat
 * provider's own `[Da: X]` resolution — used by the `notifyUser` tool
 * (`src/tools/notify-user.ts`) to turn "message X" into a Chat user id.
 *
 * Scans `inferred/users/*\/resolved-name.md` directly on disk, same
 * "deterministic, not model-decided" pattern as the rest of this
 * identity plumbing — not routed through wiki-read.ts's `readWikiFile`,
 * since that scopes `inferred/` reads to the *caller's own* userId and
 * this needs to search across every cached Chat user.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

export async function findChatUserByEmail(vaultPath: string, email: string): Promise<{ userId: string; displayName: string } | null> {
  const glob = new Bun.Glob("inferred/users/*/resolved-name.md");
  const normalizedEmail = email.toLowerCase();

  for await (const relPath of glob.scan({ cwd: vaultPath })) {
    const text = await readFile(join(vaultPath, relPath), "utf-8");
    const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
    if (!match) continue;

    const frontmatter = parseYaml(match[1] as string) as { email?: unknown; display_name?: unknown };
    if (typeof frontmatter.email !== "string" || frontmatter.email.toLowerCase() !== normalizedEmail) {
      continue;
    }

    const encodedUserId = relPath.split("/")[2] as string; // inferred/users/<encoded>/resolved-name.md
    return {
      userId: decodeURIComponent(encodedUserId),
      displayName: typeof frontmatter.display_name === "string" ? frontmatter.display_name : decodeURIComponent(encodedUserId),
    };
  }
  return null;
}
