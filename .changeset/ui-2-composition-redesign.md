---
"@osuki-dev/ui": major
"@osuki-dev/kit-community": major
---

Release 2.0: composition theming, a pluggable icon pipeline, new visual primitives, and AI elements, on Expo SDK 58. Breaking for 1.x consumers:

- The peer floor moves to the Expo SDK 58 line: React Native 0.88, React 19.3, Reanimated 4.7, `@expo/ui`, `expo-font`, `expo-image` and `expo-router` 58. `lucide-react-native` and `react-native-svg` become optional peers.
- `Surface`, `Card`, `Button` and the other containers split into compound parts (`Card.Root`, `Card.Background`, `Button.Label`, ...). The short forms remain and are built from the same parts. Fills now go through `SurfaceDecoratorContext`, painted once on a background layer.
- `Card` no longer clips its children, and the borders on `Card`, `Button` and the underline `Tabs` list are hairlines instead of 1pt. Pass `style={{ overflow: "hidden" }}` or `style={{ borderWidth: 1 }}` for the 1.x look.
- `ButtonProps.style` is `StyleProp<ViewStyle>`, and `IconProps` extends `ViewProps` instead of the SVG props. Icons resolve through `IconProvider`, theme chrome names, then Lucide; register custom names on `IconNameRegistry` to keep them type-checked.
- `@osuki-dev/kit-community` requires `@osuki-dev/ui` 2, and `CartScreen`'s `emptyArtwork` takes the kit `Image` source type.

See `docs/migrating-to-2.0.md` for every change with before and after code.
