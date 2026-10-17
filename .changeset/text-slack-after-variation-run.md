---
"@osuki-dev/ui": patch
---

On Android, `Text` now appends the trailing slack after the inner `fontVariationSettings` run, at the paragraph's face, instead of inside it. Inside the run its advance followed the requested weight, so centred labels in a variable face moved by a fraction of a point.
