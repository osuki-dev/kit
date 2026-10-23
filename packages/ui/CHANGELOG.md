# @osuki-dev/ui Changelog

## 2.0.0-beta.6

### Minor Changes

- [#24](https://github.com/osuki-dev/kit/pull/24) [`9661362`](https://github.com/osuki-dev/kit/commit/96613627c55f014b60cc7e58d11685ec84728f5b) Thanks [@ryuhzk](https://github.com/ryuhzk)! - `Icon` no longer looks up `lucide-react-native` on its own. The kit dropped its `require("lucide-react-native")`, so an app that does not install Lucide no longer has Metro try to resolve it at bundle time. An app that renders Lucide names now passes its own module once, near the root: `import * as lucide from "lucide-react-native"` and `<IconProvider lucide={lucide}>`. Nested providers inherit it, and the resolver, the `icons` map and the theme chrome fallbacks still run first. Without it, a Lucide name renders the `fallback`, or nothing with a development warning. The new `LucideIconModule` type describes the prop.

## 2.0.0-beta.5

### Patch Changes

- [#22](https://github.com/osuki-dev/kit/pull/22) [`ca3aae5`](https://github.com/osuki-dev/kit/commit/ca3aae592b659897e1fb80f99e6a10ec525b9236) Thanks [@ryuhzk](https://github.com/ryuhzk)! - `PressableScale` and `PressableCard` use React Native's own `Pressable` on iOS
  again and keep gesture handler's native press recognition on Android only.
  `react-native-gesture-handler` 3.4's iOS button marks both its host view and
  the inner button as accessibility elements with the same label, so VoiceOver
  and UI test tooling saw every press surface twice. The Android press problem
  the native recognition fixed never occurred on iOS.

## 2.0.0-beta.4

### Minor Changes

- [#20](https://github.com/osuki-dev/kit/pull/20) [`1d5970b`](https://github.com/osuki-dev/kit/commit/1d5970b2a0644a33a5cda331a38dd148cbe7726f) Thanks [@ryuhzk](https://github.com/ryuhzk)! - `PressableScale` and `PressableCard` now recognise presses natively through
  `react-native-gesture-handler`'s `Pressable` instead of the JS responder
  system. On Android, React Native's `ScrollView` can keep capturing every touch
  after a fling is stopped by a tap, and a stale layout measurement can cancel a
  press on the slightest finger movement; both left a scrolled list visibly
  normal but impossible to press. Native recognition is not subject to either.

  `react-native-gesture-handler` >= 3.4.0 is now a required peer dependency, and
  the app must be wrapped in `GestureHandlerRootView`. `Modal`, `BottomSheet` and
  `Popover` wrap their content in their own root, because Android draws a modal
  in a separate window; an app rendering React Native's `Modal` directly must do
  the same around kit press components. Press callbacks receive
  gesture handler's `PressableEvent` instead of `GestureResponderEvent`.

## 2.0.0-beta.3

### Patch Changes

- [#18](https://github.com/osuki-dev/kit/pull/18) [`342eecd`](https://github.com/osuki-dev/kit/commit/342eecd3858b712edbb0790638dc9b0586aca0bd) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Play PressableScale, PressableCard, Button, ListItem and Tag haptics only on confirmed presses or handled long presses. Scrolling and cancelled presses remain silent while press animations and caller press-in/out handlers stay unchanged.

- [#18](https://github.com/osuki-dev/kit/pull/18) [`342eecd`](https://github.com/osuki-dev/kit/commit/342eecd3858b712edbb0790638dc9b0586aca0bd) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Restore `tabs.selected` artwork for static and sliding pill selections. On iOS, use the themed segmented control when radii, component tokens, fills or foreground colours are customized, while preserving the system control for the default appearance.

## 2.0.0-beta.2

### Minor Changes

- [#16](https://github.com/osuki-dev/kit/pull/16) [`056a304`](https://github.com/osuki-dev/kit/commit/056a304742a1b40dd07c45807ed777c59017d5c7) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Add `radius` and `optionRadius` props to `Tabs.Root`, the `Tabs` facade and `SegmentedControl`: radius token names that override `components.Tabs` / `components.SegmentedControl` for that instance only, sliding indicator and `segments` layering included, so one tab group can stay pill-shaped in a theme whose other segmented controls are square. `TabsMeta` gains the matching optional `radius` and `optionRadius`.

- [#16](https://github.com/osuki-dev/kit/pull/16) [`e57a6a5`](https://github.com/osuki-dev/kit/commit/e57a6a50f4b1456706235e9626f8fd217ef2519c) Thanks [@ryuhzk](https://github.com/ryuhzk)! - `TextField` fits a controlled field drawn as spans: with `children` it no longer passes `value` to the native input (React Native refuses both), and still uses it to decide whether the placeholder shows. It gains `shortPlaceholder`, shown when the full placeholder would wrap at the field's width. Breaking for beta.1 `TextField` callers: a style that names no `fontFamily` is no longer set in the theme's body face (name the family to keep it), and the placeholder line is sized from the style's `fontSize`, falling back to the theme's body size rather than a fixed 16. `Input`, `Textarea`, `SearchInput`, `PromptInput`, `InputGroup` and `Command` keep the body face.

### Patch Changes

- [#16](https://github.com/osuki-dev/kit/pull/16) [`172204f`](https://github.com/osuki-dev/kit/commit/172204f3d1da18d39c88396eea9bc7984a9b99fb) Thanks [@ryuhzk](https://github.com/ryuhzk)! - The `Tabs` sliding indicator now travels on the theme's `motion.segmented.easing` as well as its `duration`, instead of Reanimated's default curve; it still lands without travelling under reduce motion. `MotionTokens` widens readonly number tuples, so a theme override can set `motion.segmented.easing` (and the other bezier presets) to any four values.

## 2.0.0-beta.1

### Minor Changes

- [#14](https://github.com/osuki-dev/kit/pull/14) [`cae9956`](https://github.com/osuki-dev/kit/commit/cae99562404f1884e2287e2340df72cba2578875) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Add a per-variant `shadow` token to `components.Button` (`primary`, `secondary` and `destructive` keep `pill`; `ghost` is `none`). A ghost button given a fill through `components.Button.ghost.background` now stays flat instead of gaining the light-mode pill shadow. `ShadowToken` is exported.

- [#14](https://github.com/osuki-dev/kit/pull/14) [`aee2309`](https://github.com/osuki-dev/kit/commit/aee2309bac548207fd4710bc8ab6eaa9c47a1367) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Export `TextField` and `TextFieldProps`: the bare field under the kit's inputs, a `TextInput` set in the theme's body face (variable axes included) with its placeholder drawn by `Text` in the same face and no chrome. An app can now compose its own fonted field with custom value spans and placeholder without re-implementing it.

- [#14](https://github.com/osuki-dev/kit/pull/14) [`2012410`](https://github.com/osuki-dev/kit/commit/2012410289677c76d4a212120037248b6231829c) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Add `components.Input.hint`, the colour of the helper line under a field (default `textDisabled`, as before). The `Input` error pill now appears without its drop-in and layout spring when the system reduce-motion setting is on. A hand-built `ComponentTokens` object must add `Input.hint`; `createTheme` and `ThemeProvider` fill it in.

- [#14](https://github.com/osuki-dev/kit/pull/14) [`6cce591`](https://github.com/osuki-dev/kit/commit/6cce5916664a3cb6d7db96fb65fe21d438808e96) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Add `motion.press.easing`, the curve of the `PressableScale` dip (and so of `SegmentedControl` options), `Easing.out(Easing.cubic)` by default. It takes any Reanimated easing, such as `Easing.bezier(0.2, 0, 0, 1)`; `PressEasing` is exported. `DeepPartial` now keeps a function member of a union whole, so a theme override can set it. A hand-built `OsukiTheme` must add `motion.press.easing`; `createTheme` and `ThemeProvider` fill it in.

- [#14](https://github.com/osuki-dev/kit/pull/14) [`68ebca6`](https://github.com/osuki-dev/kit/commit/68ebca617c2bb1bbac10b2c5e406744d0fb9b364) Thanks [@ryuhzk](https://github.com/ryuhzk)! - `SegmentedControl` options now dip to the new `motion.press.segment` scale (0.96) while held, through `PressableScale`, and hold still under reduce motion, instead of dimming to a fixed 0.72 opacity. The selection haptic is unchanged. A hand-built `OsukiTheme` must add `motion.press.segment`; `createTheme` and `ThemeProvider` fill it in.

- [#14](https://github.com/osuki-dev/kit/pull/14) [`164cfd6`](https://github.com/osuki-dev/kit/commit/164cfd66ac0215feed912a627c65f4c87a01ef12) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Add `components.Tabs.optionRadius`, the radius of the selected `pill` trigger, the sliding indicator and, with `segments` layering, every trigger, so a 2pt pill can sit inside a 4pt track. It defaults to `Tabs.radius`, so nothing changes until it is set.

- [#14](https://github.com/osuki-dev/kit/pull/14) [`b70425a`](https://github.com/osuki-dev/kit/commit/b70425af0d05a24e6e5d922b008feb1a9f91eb4d) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Add `layering` to `Tabs.Root` and the `Tabs` facade. The default, `overlay`, keeps the 2.0 behaviour: the list paints the `pill` track and the selection is an overlay on it. `segments` leaves the list clear and has each trigger paint its own fill, `tabs.track` (variant `segment`) when idle and `tabs.selected` as a `surface` when selected, so a translucent fill is never stacked on itself. `TabsLayering` is exported.

### Patch Changes

- [#14](https://github.com/osuki-dev/kit/pull/14) [`cb7d1f7`](https://github.com/osuki-dev/kit/commit/cb7d1f72a2b7f5262aa585d05a261cf7b559924d) Thanks [@ryuhzk](https://github.com/ryuhzk)! - The `Button` root is a column again, as in 1.x. The 2.0 row root measured its content against the parent inside a wrapping column, so buttons there grew to twice their width with off-centre labels. `Button.Root` now keeps `Button.Background` as a layer and lays every other part out in one centred row, so compound buttons render as before.

- [#14](https://github.com/osuki-dev/kit/pull/14) [`6b092d6`](https://github.com/osuki-dev/kit/commit/6b092d68109da445c58b5daf688b0de7cb27d1eb) Thanks [@ryuhzk](https://github.com/ryuhzk)! - `Button` labels, `Tabs.Label` and `Tag` no longer take the Android trailing slack from a font role's `trailingSlack`: they are centred or as wide as their label, and the slack moved them off centre or widened the chip. Each takes `hugSlack` to turn it back on (`Tag.Label` and `Tag` gained the prop, with a `TagLabelProps` type).

- [#14](https://github.com/osuki-dev/kit/pull/14) [`2664159`](https://github.com/osuki-dev/kit/commit/2664159b2c551db82d56ba1b7290832279ce55ab) Thanks [@ryuhzk](https://github.com/ryuhzk)! - On Android, `Text` now appends the trailing slack after the inner `fontVariationSettings` run, at the paragraph's face, instead of inside it. Inside the run its advance followed the requested weight, so centred labels in a variable face moved by a fraction of a point.

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
