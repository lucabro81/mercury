---
"@mercury-fw/cli": minor
---

- `mfw create` runs `bun install` in the new app (`--no-install` to skip it).
- `mfw create` creates a git repository on `main` with a first commit, lockfile included (`--no-git` to skip it); it is skipped, saying why, when git is missing, has no identity, or the folder is already inside a repository.
- `mfw create` adds `origin` when given one, in the wizard or with `--git-remote`; nothing is pushed.
- The message at the end of `mfw create` lists what each step did and only the steps left to run.
