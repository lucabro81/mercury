---
"@mercury-fw/cli": minor
---

- `mfw create` runs `bun install` in the new app, showing its output as it goes (`--no-install` to skip it).
- `mfw create` creates a git repository on `main` with a first commit, lockfile included (`--no-git` to skip it); inside another repository it is skipped, and when git refuses a step or is missing, the message reports why and lists the commands to finish by hand.
- `mfw create` adds `origin` when given one, in the wizard or with `--git-remote`; nothing is pushed.
- The message at the end of `mfw create` lists what each step did and only the steps left to run.
