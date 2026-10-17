---
"@osuki-dev/ui": minor
---

`SegmentedControl` options now dip to the new `motion.press.segment` scale (0.96) while held, through `PressableScale`, and hold still under reduce motion, instead of dimming to a fixed 0.72 opacity. The selection haptic is unchanged. A hand-built `OsukiTheme` must add `motion.press.segment`; `createTheme` and `ThemeProvider` fill it in.
