---
"@osuki-dev/ui": minor
"@osuki-dev/kit-community": minor
---

Support variable fonts in the theme. A font role can declare its face's axes (`{ family, axes: { wght, opsz?, wdth? } }`), and `resolveFontStyle` then returns that family at native weight 400 with the weight, and the optical size when the face has one, as `fontVariationSettings`, so weights of 700 and above render on Android. `Text` and `resolveFontStyle` accept numeric weights, a `fontWeight` in a `Text` style resolves through the theme, the fields and the AI elements now draw in the theme's faces, and on Android `Text` puts the axes on an inner run so heavier weights are measured as drawn. The Android thin-space slack on `Text` is now opt-in through `hugSlack`.
