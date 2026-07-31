---
"mercury": patch
---

Fix: Mercury could get stuck trying to fetch the formatted issue list via `--select formattedList` — that field doesn't exist in Jira's own response, it's added afterward, so the attempt silently returned nothing and left Mercury guessing. It's now told plainly (in the tool result itself, not just the prompt) that formattedList can't be selected that way, so it recovers in one step instead of retrying the same dead end.
