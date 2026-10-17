---
"@osuki-dev/ui": minor
"@osuki-dev/kit-community": minor
---

Move the remaining appearance choices into the theme so an app does not need wrapper components: `SegmentedControl` and `Skeleton` get component tokens, `Tabs` now reads its existing tokens (its `activeForeground` default becomes `text`, matching what it drew) plus a new `indicator`, `Input.searchRadius` sets the `SearchInput` corners, `motion.press` sets how far `Button`, `PressableCard`, `ListItem`, `Tag` and `PressableScale` dip while pressed, and a font role's `trailingSlack` turns the Android `hugSlack` on for every kit `Text` in that role. `PressableScale` stays still under reduce motion.
