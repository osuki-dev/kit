---
"@osuki-dev/ui": minor
---

Add `components.Input.hint`, the colour of the helper line under a field (default `textDisabled`, as before). The `Input` error pill now appears without its drop-in and layout spring when the system reduce-motion setting is on. A hand-built `ComponentTokens` object must add `Input.hint`; `createTheme` and `ThemeProvider` fill it in.
