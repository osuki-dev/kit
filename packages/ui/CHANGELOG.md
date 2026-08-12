# @osuki-dev/ui Changelog

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
