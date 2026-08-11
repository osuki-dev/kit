---
"@osuki-dev/ui": minor
---

Promote three components out of a product app: `PressableScale`, `ChoiceRow` with `ChoiceList`, and `InlineActivity`.

- `PressableScale` is the press affordance for surfaces that are not cards -- header buttons, tiles, keys, product-drawn rows. `pressedScale` tunes the dip per target size, and `feedback` selects the haptic or `"none"`. The haptic itself resolves through `HapticsProvider`, so the component never reaches for a haptics engine of its own.
- `ChoiceRow` and `ChoiceList` draw the rows a user picks from: permission answers, commands, files. `ListItem` was the near-miss they replace -- a 52px navigation row with an uppercased subtitle. `emphasis="plain" | "headline"` selects whether the label wraps or reads as a headline, and `ChoiceList` owns the single shared state, `loadingId`, which spins one row and locks the rest.
- `InlineActivity` is the one-line busy row: a small spinner and a caption naming what is being waited on. `LoadingView` still owns the case where a whole section has nothing to show yet.
