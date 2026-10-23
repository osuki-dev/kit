---
"@osuki-dev/ui": minor
---

`ToastProvider` takes `durationByVariant`, a per-variant default duration, so errors can stay on screen longer than confirmations. A toast's duration now resolves as its own `durationMs`, then `durationByVariant[variant]`, then `defaultDurationMs` (still 3600 ms by default). A variant left out of the map keeps the old behaviour.
