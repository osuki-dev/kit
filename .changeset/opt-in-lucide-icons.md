---
"@osuki-dev/ui": minor
---

`Icon` no longer looks up `lucide-react-native` on its own. The kit dropped its `require("lucide-react-native")`, so an app that does not install Lucide no longer has Metro try to resolve it at bundle time. An app that renders Lucide names now passes its own module once, near the root: `import * as lucide from "lucide-react-native"` and `<IconProvider lucide={lucide}>`. Nested providers inherit it, and the resolver, the `icons` map and the theme chrome fallbacks still run first. Without it, a Lucide name renders the `fallback`, or nothing with a development warning. The new `LucideIconModule` type describes the prop.
