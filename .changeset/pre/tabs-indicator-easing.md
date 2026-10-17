---
"@osuki-dev/ui": patch
---

The `Tabs` sliding indicator now travels on the theme's `motion.segmented.easing` as well as its `duration`, instead of Reanimated's default curve; it still lands without travelling under reduce motion. `MotionTokens` widens readonly number tuples, so a theme override can set `motion.segmented.easing` (and the other bezier presets) to any four values.
