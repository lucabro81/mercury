---
"mercury": minor
---

- A new opt-in HTTP channel: `POST /turn` runs a conversation and streams the reply back as Server-Sent Events (reasoning, tool activity, text, and the confirmation token when an irreversible action is staged), resolving a confirmation through the same path every channel uses. Off by default, no authentication, and meant to stay unreachable from outside the container network — the same posture as the admin panel.
- Read-only HTTP introspection on the same server: a manifest of the loaded plugins, their apiVersion and skills, and the active CLIs; the currently staged confirm-required actions with their tokens redacted; and the wiki, episodic/semantic memory, tool log, and health, reusing the admin panel's own functions.
