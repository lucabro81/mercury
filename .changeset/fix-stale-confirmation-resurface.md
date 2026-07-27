---
"mercury": patch
---

Fix: after a restart, Mercury could bring up an old, already-resolved confirmation request out of nowhere — sometimes even inventing a confirmation token that was never real. Resolved and abandoned confirmations are now tracked properly and never resurface as if still pending.
