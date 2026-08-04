---
type: curated
last_updated: 2026-08-02
---

jira-cli --select notes.

`--select` takes a dot-notation path into the command's own JSON output
(e.g. `--select issues.0.key`). A path that doesn't match anything real
in that JSON returns a bare `{}` — not an error, not "no matches", just
an empty object. If you get `{}` back from `issue search`, don't treat
it as zero results: retry either without --select, or with
--select-all, to see the real data.

