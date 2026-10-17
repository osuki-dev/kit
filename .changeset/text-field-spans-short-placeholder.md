---
"@osuki-dev/ui": minor
---

`TextField` fits a controlled field drawn as spans: with `children` it no longer passes `value` to the native input (React Native refuses both), and still uses it to decide whether the placeholder shows. It gains `shortPlaceholder`, shown when the full placeholder would wrap at the field's width. Breaking for beta.1 `TextField` callers: a style that names no `fontFamily` is no longer set in the theme's body face (name the family to keep it), and the placeholder line is sized from the style's `fontSize`, falling back to the theme's body size rather than a fixed 16. `Input`, `Textarea`, `SearchInput`, `PromptInput`, `InputGroup` and `Command` keep the body face.
