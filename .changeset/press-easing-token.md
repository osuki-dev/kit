---
"@osuki-dev/ui": minor
---

Add `motion.press.easing`, the curve of the `PressableScale` dip (and so of `SegmentedControl` options), `Easing.out(Easing.cubic)` by default. It takes any Reanimated easing, such as `Easing.bezier(0.2, 0, 0, 1)`; `PressEasing` is exported. `DeepPartial` now keeps a function member of a union whole, so a theme override can set it. A hand-built `OsukiTheme` must add `motion.press.easing`; `createTheme` and `ThemeProvider` fill it in.
