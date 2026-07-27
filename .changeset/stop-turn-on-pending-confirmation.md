---
"mercury": patch
---

Fix: after staging an irreversible action for confirmation, Mercury could still generate a follow-up reply that repeated the confirmation token back to you. It no longer gets the chance to.
