---
"@osuki-dev/ui": patch
---

`Button` labels, `Tabs.Label` and `Tag` no longer take the Android trailing slack from a font role's `trailingSlack`: they are centred or as wide as their label, and the slack moved them off centre or widened the chip. Each takes `hugSlack` to turn it back on (`Tag.Label` and `Tag` gained the prop, with a `TagLabelProps` type).
