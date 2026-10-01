---
"@mercury-fw/cli": patch
---

An app created with the HTTP channel publishes the surface's port on the host (`HTTP_SURFACE_PORT`, 4100 when unset), so it's reachable from outside the container; its README says where it listens and that it has no authentication.
