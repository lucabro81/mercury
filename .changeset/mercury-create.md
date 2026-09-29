---
"mercury": minor
---

- New `mercury create <folder>` command that scaffolds a Mercury app: it asks for the app name, the assistant's name and role, the channels and the tool plugins, and writes the config, persona files, entrypoints, Dockerfile, compose file and env example for that selection.
- `--yes` with `--name`, `--assistant-name`, `--role`, `--channels` and `--plugins` scaffolds without questions.
- It only writes the files for now: the packages a new app depends on aren't published yet.
