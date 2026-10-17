---
"@osuki-dev/ui": minor
---

Add `layering` to `Tabs.Root` and the `Tabs` facade. The default, `overlay`, keeps the 2.0 behaviour: the list paints the `pill` track and the selection is an overlay on it. `segments` leaves the list clear and has each trigger paint its own fill, `tabs.track` (variant `segment`) when idle and `tabs.selected` as a `surface` when selected, so a translucent fill is never stacked on itself. `TabsLayering` is exported.
