/**
 * Targeted single-key rewrite of a `.env` file's raw text — used by the
 * admin panel's allowlisted env editor (see `env-routes.ts`). Only the
 * matched key's own line changes; every other line (including any secret
 * sitting right next to it) is passed through byte-identical. `content`
 * in, `content` out — no filesystem access here, so it's trivially testable.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function setEnvValue(content: string, key: string, value: string): string {
  const linePattern = new RegExp(`^${escapeRegExp(key)}=`);
  let found = false;
  const lines = content.split("\n").map((line) => {
    if (!found && linePattern.test(line)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (found) {
    return lines.join("\n");
  }

  const needsNewlineBefore = content.length > 0 && !content.endsWith("\n");
  return `${content}${needsNewlineBefore ? "\n" : ""}${key}=${value}\n`;
}
