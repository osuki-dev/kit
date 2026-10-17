# @osuki-dev/ui Changelog

## 2.0.0-beta.0

### Major Changes

- [#12](https://github.com/osuki-dev/kit/pull/12) [`5c65316`](https://github.com/osuki-dev/kit/commit/5c65316218a1145a06756745bd4910f765afc7bd) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Release 2.0: composition theming, a pluggable icon pipeline, new visual primitives, and AI elements, on Expo SDK 58. Breaking for 1.x consumers:

  - The peer floor moves to the Expo SDK 58 line: React Native 0.88, React 19.3, Reanimated 4.7, `@expo/ui`, `expo-font`, `expo-image` and `expo-router` 58. `lucide-react-native` and `react-native-svg` become optional peers.
  - `Surface`, `Card`, `Button` and the other containers split into compound parts (`Card.Root`, `Card.Background`, `Button.Label`, ...). The short forms remain and are built from the same parts. Fills now go through `SurfaceDecoratorContext`, painted once on a background layer.
  - `Card` no longer clips its children, and the borders on `Card`, `Button` and the underline `Tabs` list are hairlines instead of 1pt. Pass `style={{ overflow: "hidden" }}` or `style={{ borderWidth: 1 }}` for the 1.x look.
  - `ButtonProps.style` is `StyleProp<ViewStyle>`, and `IconProps` extends `ViewProps` instead of the SVG props. Icons resolve through `IconProvider`, theme chrome names, then Lucide; register custom names on `IconNameRegistry` to keep them type-checked.
  - `@osuki-dev/kit-community` requires `@osuki-dev/ui` 2, and `CartScreen`'s `emptyArtwork` takes the kit `Image` source type.

  See `docs/migrating-to-2.0.md` for every change with before and after code.

### Minor Changes

- [#12](https://github.com/osuki-dev/kit/pull/12) [`ff680c9`](https://github.com/osuki-dev/kit/commit/ff680c95d0a9bef1537bb4af773afe267cc4ea60) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Move the remaining appearance choices into the theme so an app does not need wrapper components: `SegmentedControl` and `Skeleton` get component tokens, `Tabs` now reads its existing tokens (its `activeForeground` default becomes `text`, matching what it drew) plus a new `indicator`, `Input.searchRadius` sets the `SearchInput` corners, `motion.press` sets how far `Button`, `PressableCard`, `ListItem`, `Tag` and `PressableScale` dip while pressed, and a font role's `trailingSlack` turns the Android `hugSlack` on for every kit `Text` in that role. `PressableScale` stays still under reduce motion.

- [#12](https://github.com/osuki-dev/kit/pull/12) [`5bf18bd`](https://github.com/osuki-dev/kit/commit/5bf18bdd65b60515238b89ec5caca1f5b515a32c) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Add accordion, popover, command, combobox, field, input group, button group, calendar, attachment, and message primitives for any app to compose.

- [#12](https://github.com/osuki-dev/kit/pull/12) [`5bf18bd`](https://github.com/osuki-dev/kit/commit/5bf18bdd65b60515238b89ec5caca1f5b515a32c) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Paint each control fill once through the surface decorator, and draw field placeholders with the same text component as the value.

- [#12](https://github.com/osuki-dev/kit/pull/12) [`1b3b3ba`](https://github.com/osuki-dev/kit/commit/1b3b3ba1905a95a8f5e30c3b9db678b6a4c009b5) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Give the surface decorator a stable contract. Slots are a typed `SurfaceSlot` union, listed with their roles in `docs/theme.md`, and apps register their own through `SurfaceSlotRegistry`. `SurfaceMeta` gains `role` (`surface`, `overlay`, `mark`), `over` (the fill an overlay sits on) and `mode`. `Tabs` and `SegmentedControl` follow one layering rule: the track is painted once and the selection is an overlay. `Tabs.Root` takes `indicator="slide"` for a selection that travels between triggers, `Tabs.Label` passes `transform`, `weight` and `numberOfLines` through, and labels on `Button`, `Tabs` and `SegmentedControl` take their casing from the type style. Sheets, dialogs, popovers, tooltips, toasts, menu and select triggers and list rows now paint through the decorator, `Skeleton` sends a `style.backgroundColor` override through it too, and `ScrollScreen` keeps its decoration fixed behind the scrolling content. New: `SurfaceDecoration` for views the kit does not own, `TextPlateProvider` and the `plated` prop on `Text` for text over a decorated background, `multiplyAlpha` for opacity policies, and `motion.press` springs and timings that `Button`, `PressableCard` and `PressableScale` read, with reduce motion honored. The fill cache and its helpers are no longer exported.

- [#12](https://github.com/osuki-dev/kit/pull/12) [`cdcc835`](https://github.com/osuki-dev/kit/commit/cdcc8355fd48630401f196a59c4aadfe2e67a0ad) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Support variable fonts in the theme. A font role can declare its face's axes (`{ family, axes: { wght, opsz?, wdth? } }`), and `resolveFontStyle` then returns that family at native weight 400 with the weight, and the optical size when the face has one, as `fontVariationSettings`, so weights of 700 and above render on Android. `Text` and `resolveFontStyle` accept numeric weights, a `fontWeight` in a `Text` style resolves through the theme, the fields and the AI elements now draw in the theme's faces, and on Android `Text` puts the axes on an inner run so heavier weights are measured as drawn. The Android thin-space slack on `Text` is now opt-in through `hugSlack`.

## 1.1.0

### Minor Changes

- [#8](https://github.com/osuki-dev/kit/pull/8) [`1f2b525`](https://github.com/osuki-dev/kit/commit/1f2b525f5cee239fb854016c420ad8600079357f) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Let consumers override the fill of the three surfaces that owned it outright: `ToastProvider` takes `toastStyle` and `showToast` takes `style`, both merged onto the toast body after the variant fill; `Skeleton` sends a `style.backgroundColor` override to its lines instead of its wrapper when `lines` is above 1; and `KeyboardToolbar` takes `backgroundColor`, since its native props accept no `style`.

## 1.0.1

### Patch Changes

- [#6](https://github.com/osuki-dev/kit/pull/6) [`c0c08a3`](https://github.com/osuki-dev/kit/commit/c0c08a3060f4b705e40b5c5b512d398bdc424532) Thanks [@BANG88](https://github.com/BANG88)! - Two fixes carried by muqun as a patch file, now upstream so the patch can go.

  `ToastProvider` takes a `maxWidth`. Toasts were `width: "100%"` with the theme's
  horizontal margin, which is right on a phone and wrong on a tablet or in
  landscape, where a three-word notice became a banner the width of the screen.
  The viewport aligns cards to the trailing edge so a capped card sits where a
  notification is expected rather than centred in empty space.

  `SegmentedControl` renders the design system's own segments on Android. The
  native `@expo/ui` control is `UISegmentedControl` on iOS, compact enough to sit
  inside the decorative track this component draws; on Android it is Material's
  `SegmentedButtonRow`, which brings a full outlined track of its own, wants more
  height than the padding leaves it, and so drew the selected segment taller
  than the control and pushed the last option past the track's corner. The JS
  segments were already what the documented design rules describe and were
  reachable only when an option was disabled; Android takes them now, iOS keeps
  the native widget.

## 1.0.0

### Minor Changes

- [#2](https://github.com/osuki-dev/kit/pull/2) [`cd9ad00`](https://github.com/osuki-dev/kit/commit/cd9ad0053ed2b7256ded0c51b8ef88e4c68094bf) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Let the host app own every shared runtime library.

  `@osuki-dev/kit-community` moved `@tanstack/react-form` from `dependencies` to
  `peerDependencies`. It is only used by `TanstackForm`, and shipping it as a hard
  dependency meant an app that already used TanStack Form could end up with two
  copies and a broken form context. Apps using `TanstackForm` must now install
  `@tanstack/react-form` themselves.

  `@osuki-dev/ui` dropped `react-native-worklets` from `peerDependencies`. No
  source file in the package imports it — Reanimated 4 declares it as its own
  peer, so listing it here only forced a redundant install.

## 0.3.0

### Minor Changes

- [`ba6fa6a`](https://github.com/osuki-dev/kit/commit/ba6fa6ada2e4d1e446017816aad8ef8e865617c5) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Promote three components out of a product app: `PressableScale`, `ChoiceRow` with `ChoiceList`, and `InlineActivity`.
  - `PressableScale` is the press affordance for surfaces that are not cards -- header buttons, tiles, keys, product-drawn rows. `pressedScale` tunes the dip per target size, and `feedback` selects the haptic or `"none"`. The haptic itself resolves through `HapticsProvider`, so the component never reaches for a haptics engine of its own.
  - `ChoiceRow` and `ChoiceList` draw the rows a user picks from: permission answers, commands, files. `ListItem` was the near-miss they replace -- a 52px navigation row with an uppercased subtitle. `emphasis="plain" | "headline"` selects whether the label wraps or reads as a headline, and `ChoiceList` owns the single shared state, `loadingId`, which spins one row and locks the rest.
  - `InlineActivity` is the one-line busy row: a small spinner and a caption naming what is being waited on. `LoadingView` still owns the case where a whole section has nothing to show yet.

### Patch Changes

- [`ba6fa6a`](https://github.com/osuki-dev/kit/commit/ba6fa6ada2e4d1e446017816aad8ef8e865617c5) Thanks [@ryuhzk](https://github.com/ryuhzk)! - `InlineActivity` now keeps its width when `active` flips, not just its height.

  The row is a flex row with a gap, so unmounting the spinner also took the gap that followed it, and the caption slid left by a spinner plus a gap the moment the work ended -- 24px at `size="sm"`, 40px at `size="lg"`. The docstring had promised for as long as the component existed that a row reporting both states does not jump. It now holds an inert, same-sized box in the spinner's slot while idle, hidden from assistive technology and from touches, so the caption starts at the same x in both states. The box is empty rather than a faded spinner, so nothing keeps animating off screen.

  `Spinner` and `InlineActivity` read those dimensions from one shared map instead of each carrying its own copy, so the reserved box cannot drift from the spinner it stands in for.

## 0.0.1

- Prepare the Expo and React Native UI primitive package for open-source distribution.
- Include theme tokens, base components, responsive helpers, generic font loading, and navigation theme integration.
- Keep font files application-owned and allow semantic font roles to resolve to any loaded family.
