# @osuki-dev/kit-community Changelog

## 2.0.0-beta.6

No changes in this release.

## 2.0.0-beta.5

No changes in this release.

## 2.0.0-beta.4

No changes in this release.

## 2.0.0-beta.3

No changes in this release.

## 2.0.0-beta.2

No changes in this release.

## 2.0.0-beta.1

No changes in this release.

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

### Patch Changes

- Updated dependencies [[`ff680c9`](https://github.com/osuki-dev/kit/commit/ff680c95d0a9bef1537bb4af773afe267cc4ea60), [`5bf18bd`](https://github.com/osuki-dev/kit/commit/5bf18bdd65b60515238b89ec5caca1f5b515a32c), [`5bf18bd`](https://github.com/osuki-dev/kit/commit/5bf18bdd65b60515238b89ec5caca1f5b515a32c), [`1b3b3ba`](https://github.com/osuki-dev/kit/commit/1b3b3ba1905a95a8f5e30c3b9db678b6a4c009b5), [`5c65316`](https://github.com/osuki-dev/kit/commit/5c65316218a1145a06756745bd4910f765afc7bd), [`cdcc835`](https://github.com/osuki-dev/kit/commit/cdcc8355fd48630401f196a59c4aadfe2e67a0ad)]:
  - @osuki-dev/ui@2.0.0-beta.0

## 1.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [[`c0c08a3`](https://github.com/osuki-dev/kit/commit/c0c08a3060f4b705e40b5c5b512d398bdc424532)]:
  - @osuki-dev/ui@1.0.1

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

### Patch Changes

- Updated dependencies [[`cd9ad00`](https://github.com/osuki-dev/kit/commit/cd9ad0053ed2b7256ded0c51b8ef88e4c68094bf)]:
  - @osuki-dev/ui@1.0.0

## 0.3.0

### Patch Changes

- [`d1b6048`](https://github.com/osuki-dev/kit/commit/d1b6048d6dadf8b7fede5883a314b18dd5c770d7) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Widen the `@osuki-dev/ui` peer range to admit every `0.x` release.

  The range was `^0.2.0`. Under semver a caret on a `0.x` version means
  `>=0.2.0 <0.3.0` — every `0.x` minor counts as breaking — so a consumer on
  `@osuki-dev/ui@0.3.0` got a peer conflict against a package built to be released
  alongside it. `>=0.2.0 <1.0.0` admits the whole `0.x` line and still excludes
  the eventual `1.0.0`. The two packages ship together on one version, which is
  what makes the wider range safe to state.

  This does not change how the release is versioned. Changesets bumps a package
  whose peer dependency is in the same release batch, regardless of whether the
  new version falls inside the declared range, and `onlyUpdatePeerDependentsWhenOutOfRange`
  does not suppress it — the version numbers for this release were set explicitly.

- [`867d3f7`](https://github.com/osuki-dev/kit/commit/867d3f7a84ed0ea7972ca37e1ac987800e884750) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Fix an unpublishable `zod` range, and move `zod` to a peer dependency.

  `0.2.0` shipped with `"zod": "catalog:"` in `dependencies`. `catalog:` is a bun workspace protocol that `bun publish` resolves to a real range at pack time -- but this repo releases through `changeset publish`, which shells out to npm, and npm writes the literal string into the tarball. Every consumer, on every package manager, failed to install `0.2.0`: the range is not valid semver and does not resolve. The package has been broken since it was published.

  `zod` is also the wrong kind of dependency here. It is part of the public surface, not an implementation detail -- `parseEntity` and `useForm` take a caller-supplied `z.ZodType<T>`, and `useForm` narrows it with `schema instanceof z.ZodObject`. A consumer resolving its own copy of zod alongside a bundled one makes that `instanceof` return `false` against a schema that is, by every other measure, a `ZodObject`; the field-level branch silently stops running and nothing reports an error. Declaring the peer keeps one copy in the tree and makes a version conflict a resolution-time complaint instead of a runtime mystery. It ships now because a package nobody can install has no upgrade path to break.

  `smoke:public-packages` already refused `workspace:` in publishable ranges; it now refuses `catalog:` on the same grounds, so the next bun-only protocol to reach a runtime dependency fails the check rather than the install.

- Updated dependencies [[`ba6fa6a`](https://github.com/osuki-dev/kit/commit/ba6fa6ada2e4d1e446017816aad8ef8e865617c5), [`ba6fa6a`](https://github.com/osuki-dev/kit/commit/ba6fa6ada2e4d1e446017816aad8ef8e865617c5)]:
  - @osuki-dev/ui@0.3.0

## 0.0.1

- Establish the community package boundary for reusable Osuki screen templates.
- Keep production Shopify OAuth, billing, webhook, and entitlement logic out of the public package.
