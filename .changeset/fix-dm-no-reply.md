---
"mercury": patch
---

Fix: a plain greeting or short message sent to Mercury in a Google Chat direct message could get silently dropped. The "only reply if this message is clearly directed at you" caution meant for shared multi-person spaces was being applied to every conversation, DMs included — where by definition everything you send is directed at Mercury. DMs are now recognized as such and always get a reply.
