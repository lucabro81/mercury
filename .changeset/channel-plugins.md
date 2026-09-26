---
"mercury": minor
---

Channels are now plugins, loaded the same way tools are. Google Chat moves into its own package (`@mercury/channel-google-chat`), built through a channel loader from `mercury.config.ts` and gated by `MERCURY_CHANNELS`; its channel contract lives in the shared `@mercury/channel-types`, and the confirmation capability is injected by the core rather than imported by the channel. The last file-based CLI (atlassian-admin) becomes a plugin too, so the file-based CLI config bucket and its residual `runCommand` are gone: every CLI and every channel the core runs is a plugin (terminal and HTTP aside). The unused google-chat CLI tool is removed.
