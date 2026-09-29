---
"mercury": minor
---

- The assistant's persona is set in the instance config: `persona.identity` replaces the opening line of the system prompt and `persona.tone` its closing block of rules; either one left out keeps the default.
- The default persona is exported (`DEFAULT_PERSONA_IDENTITY`, `DEFAULT_PERSONA_TONE`), so an app can start from it.
