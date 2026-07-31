---
"mercury": patch
---

Fix: during the nightly wiki self-review, Mercury could write an `index.md` line for a curated doc that looked fine but wasn't actually recognized as referencing it — that doc would then get flagged as orphaned again on every subsequent run, forever. Adding or removing an index entry is now a dedicated, deterministic operation instead of free-form text the model had to get exactly right.
