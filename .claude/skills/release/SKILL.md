---
name: release
description: Automates cutting a release in the Mercury repo — drafts a Changesets entry and runs the full version-bump / CHANGELOG.md / commit / git-tag cycle without any interactive prompts. Trigger on "release this", "cut a release", "tag this", "ship this version", "bump the version", "make a changeset", or whenever a piece of work in this repo looks finished and release-worthy — proactively, not only when the user names the skill.
---

## Why this exists

Mercury versions with [Changesets](https://github.com/changesets/changesets): one changeset per relevant change, released individually (no batching) — see `CLAUDE.md`'s "Versioning & changelog" section, the source of truth for the convention. That section can change; re-read it if anything here seems to contradict it.

`changeset add` is normally interactive (prompts for bump type + description). Never run it, and never run `bun run changeset` — write the changeset file directly instead. That's the only piece this skill needs to replace; `bun run release` (`changeset version` + `scripts/tag-release.sh`) is already scripted and non-interactive, so just invoke it.

## Steps

**1. Establish scope.** Run `git status` and `git log <last-tag>..HEAD` (last tag from `git tag -l 'v*' --sort=-v:refname | head -1`) to see what this release actually covers: uncommitted work plus anything already committed since the last tag.

**2. Get the actual change committed first.** `scripts/tag-release.sh` only stages `package.json`, `CHANGELOG.md`, and `.changeset` — it does *not* pick up unrelated working-tree changes. If the work being released isn't committed yet, commit it now (small atomic commits per logical unit, same as any other commit in this repo). Only after that do you write the changeset — the changeset describes committed history, not a promise of what's still sitting in the working tree.

**3. Pick the bump type.** Mercury is `"private": true`, never published to a registry — "breaking" in the npm sense doesn't apply here. Use ordinary judgment instead:
- `patch` — internal/tooling change, bug fix, refactor, doc update: nothing a user of Mercury would notice as new capability.
- `minor` — new capability or user-visible behavior (new tool, new channel, new memory layer, etc.).
- `major` — reserved for a genuinely large behavior change you'd want called out loudly. Default away from this; only use it if it's obviously warranted or the user says so explicitly.

**4. Write a public-safe description.** One or two sentences, plain feature language. `CHANGELOG.md` has the same audience as `README.md`/`ARCHITECTURE.md` — no `D-XX`/`S-XX` decision-log references, no milestone labels (`M0`, `M1`, `M2`...), no other internal-only context. Describe what changed the way you'd describe it to someone who cloned the repo cold.

**5. Write the changeset file.** Create `.changeset/<kebab-case-slug>.md`:

```
---
"mercury": <major|minor|patch>
---

<description from step 4>
```

**6. Release it.** Run `bun run release`. This bumps `package.json`, writes the `CHANGELOG.md` entry, commits `package.json` + `CHANGELOG.md` + `.changeset`, and creates a local `git tag vX.Y.Z` — all expected, agreed-on behavior of this command. Don't caveat or ask before it runs; that conversation already happened when this workflow was set up. It never pushes anything.

**7. Report the result.** New version, the tag, one line on what's in it. That's the whole loop — no further confirmation needed unless something below applies.

## When to stop and ask instead of guessing

- Nothing changed since the last tag — say so, don't manufacture a release.
- The working tree mixes the finished change with unrelated or half-finished stuff (scratch files, an unrelated WIP diff) — ask what belongs in this release rather than silently bundling or dropping something.
- It's genuinely unclear whether the change is complete (e.g. mid-refactor, a TODO left in the diff) — ask before treating it as release-worthy.
