# Migrating to 2.0

This guide lists every change a `1.x` consumer of `@osuki-dev/ui` and
`@osuki-dev/kit-community` has to make, and what 2.0 lets you delete. Nothing
was removed from either package's export list: every 1.x import still
resolves. The breaks are in peer dependencies, a few prop types, and some
default looks.

The first 2.0 release is a beta. Install it explicitly:

```sh
npx expo install @osuki-dev/ui@beta @osuki-dev/kit-community@beta
```

A plain `@osuki-dev/ui` keeps resolving the latest 1.x until `2.0.0` is
released. Betas may break each other; each break is listed in the changelog
(see [releasing.md](./releasing.md#what-a-beta-promises)).

## 1. Upgrade to Expo SDK 58

2.0 supports one SDK, like every release line before it.

| Peer                               | 1.x         | 2.0                   |
| ---------------------------------- | ----------- | --------------------- |
| `react`                            | `>=19.2.3`  | `>=19.3.0`            |
| `react-native`                     | `>=0.85.0`  | `>=0.88.0`            |
| `react-native-reanimated`          | `>=4.3.1`   | `>=4.7.0`             |
| `react-native-safe-area-context`   | `>=5.7.0`   | `>=5.10.0`            |
| `react-native-keyboard-controller` | `>=1.21.6`  | `>=1.22.0`            |
| `@expo/ui`                         | `>=57.0.4`  | `>=58.0.0`            |
| `expo-font`                        | `>=57.0.0`  | `>=58.0.0`            |
| `expo-image`                       | `>=56.0.0`  | `>=58.0.0`            |
| `expo-router`                      | `>=57.0.4`  | `>=58.0.0`            |
| `lucide-react-native`              | required    | optional              |
| `react-native-svg`                 | `>=15.15.4` | optional, `>=15.16.0` |
| `react-native-nano-icons`          | —           | optional, `>=1.0.0`   |
| `expo-glass-effect`, `expo-blur`   | —           | optional, `>=58.0.0`  |
| `@osuki-dev/ui` (kit-community)    | `^1.0.1`    | `^2.0.0-beta.0`       |

Keep `lucide-react-native` and `react-native-svg` installed if you use Lucide
names with `Icon`; they only became optional so an app with its own icon set
does not need them.

React Native 0.88 changes some types in your own code too. The kit itself
moved to these:

```ts
// before
const list = useRef<ScrollView>(null);
const field = useRef<TextInput>(null);
const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {};

// after
const list = useRef<ScrollViewInstance>(null);
const field = useRef<TextInputInstance>(null);
const onKeyPress = (e: TextInputKeyPressEvent) => {};
```

`StyleSheet.flatten` may now return `null`, style objects are `readonly`, and
`StatusBar.setTranslucent` / `setBackgroundColor` are gone (edge-to-edge is
always on).

## 2. Changes that can break a build

### `Button.style` is a `StyleProp<ViewStyle>`

1.x typed it as a plain `ViewStyle`, so code that read fields off it compiled.
It now accepts arrays and registered styles, which means reading it needs a
flatten:

```tsx
// before
const fill = props.style?.backgroundColor;

// after
const fill = StyleSheet.flatten(props.style)?.backgroundColor;
```

`Button` `children` also widened from `string` to `ReactNode`, which breaks
nothing.

### `IconProps` extends `ViewProps`, not the SVG props

```tsx
// before: SVG props reached the Lucide component
<Icon name="Search" fill="none" opacity={0.5} />

// after: Icon takes size, color, strokeWidth, direction, renderMode,
// fallback, and view props such as style and testID
<Icon name="Search" style={{ opacity: 0.5 }} />
```

`IconName` is still the Lucide export names, plus the theme chrome names
(`chrome.back`, `chrome.send`, ...). Names from your own icon set are
registered once:

```ts
declare module "@osuki-dev/ui" {
	interface IconNameRegistry {
		"brand.logo": true;
	}
}
```

A named `Icon` renders the glyph without a wrapper `View`; it adds one only for
a `direction`, a `style`, or view props.

### `CartScreen` `emptyArtwork`

It takes the kit `Image` source type (`ImageProps["source"]`) instead of React
Native's `ImageSourcePropType`. Plain `require()` assets and `{ uri }` objects
are unchanged; a readonly array of sources is no longer accepted.

### Hand-built theme objects

If you construct a whole `OsukiTheme` or `ComponentTokens` object yourself
rather than passing an override, add the new blocks: `components.SegmentedControl`,
`components.Skeleton`, `components.Input.searchRadius`,
`components.Tabs.indicator`, and `motion.press`. `createTheme`, `ThemeProvider`
and `createThemePreset` fill these in for you.

## 3. Changes in how things look

These compile unchanged but render differently. Each has a one-line way back.

| Change                                                                                                                                                     | Get the 1.x look                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card` no longer clips its children (`overflow` is always `visible`, so the light-mode shadow is never cut off).                                           | `style={{ overflow: "hidden" }}` on the card (iOS then clips the shadow too).                                                                                                                                                      |
| Borders on `Card`, `Button` and the underline `Tabs` list are hairlines instead of 1pt.                                                                    | `style={{ borderWidth: 1 }}` on `Card` or `Button`; `style={{ borderBottomWidth: 1 }}` on `Tabs`.                                                                                                                                  |
| `SegmentedControl` `rounded` track radius follows `radius.lg` (16) instead of a fixed 14.                                                                  | `theme={{ components: { SegmentedControl: { radius: "md" } } }}`.                                                                                                                                                                  |
| `Tabs` `pill`: the list paints the track and the selected trigger paints over it, instead of each trigger painting its own segment. Identical when opaque. | Nothing to do unless you drew your own pill inside `Tabs.List`; then pass `indicator="slide"` to `Tabs.Root` and drop yours, or keep yours and stop the kit's by giving the triggers `style={{ backgroundColor: "transparent" }}`. |
| A `fontWeight` in a `Text` style now resolves through the theme's fonts (a loaded `bold` face is used instead of a synthetic bold of the regular face).    | Name the face yourself: a style that sets `fontFamily` is left alone.                                                                                                                                                              |
| Labels in `Button`, `Tabs.Label` and `SegmentedControl` take their casing from the `button` and `label` type styles (still uppercase by default).          | Nothing, unless you changed those type styles' `textTransform`.                                                                                                                                                                    |
| `PressableScale` holds still when the system reduce-motion setting is on.                                                                                  | None: this is an accessibility fix.                                                                                                                                                                                                |

## 4. Applying a custom theme

Everything an app used to wrap kit components for now goes through the theme:

- **Radii and geometry**: `radius` values and component tokens
  (`Button.radius`, `Card.radius`, `Input.radius`, `Input.searchRadius`,
  `Tabs.radius`, `SegmentedControl.radius` / `optionRadius` / `height` /
  `padding`).
- **Press feedback**: `motion.press` (`control`, `card`, `row`, `chip`,
  `surface`, `inMs`, `outMs`, `springIn`, `springOut`). Set a scale to `1` to
  turn its dip off.
- **Translucent and image-backed fills**: `SurfaceDecoratorProvider`. Its
  `transformBackground` maps every fill (use `multiplyAlpha`, not
  `withAlpha`), its `renderDecoration` paints artwork per slot. Each slot has a
  role (`surface`, `overlay`, `mark`) so one policy can keep marks opaque and
  avoid stacking an overlay's opacity on its track. The slot table is in
  [theme.md](../packages/ui/docs/theme.md#slots).
- **Text over a decorated background**: `TextPlateProvider` publishes a plate
  that field labels and hints, section titles and empty-state copy apply; your
  own text opts in with `<Text plated>`.
- **Fonts**: a font role can declare a variable face's `axes`, and
  `trailingSlack: true` gives every kit `Text` in that role the Android thin
  space that keeps an overhanging last glyph from being clipped. See
  [theme.md](../packages/ui/docs/theme.md#variable-fonts).

```tsx
const profile: ThemeOverride = {
	radius: { sm: 4, md: 4, lg: 6 },
	components: { Button: { radius: "sm" }, SegmentedControl: { radius: "sm", optionRadius: "xs" } },
	motion: { press: { control: 1, surface: 0.97 } },
};

<ThemeProvider theme={profile}>
	<SurfaceDecoratorProvider transformBackground={transform} renderDecoration={artwork}>
		<TextPlateProvider plate={plate}>
			<App />
		</TextPlateProvider>
	</SurfaceDecoratorProvider>
</ThemeProvider>;
```

`apps/showcase/app/custom-theme.tsx` is a working example of all of it.

## 5. New in 2.0, nothing to migrate

- Compound parts for `Surface`, `Card`, `Button`, `Tag`, `Toast`, and the AI
  elements, with the 1.x short forms built from the same parts.
- Components: `Accordion`, `Attachment`, `ButtonGroup`, `Calendar`,
  `CodeBlock`, `Collapsible`, `Combobox`, `Command`, `EdgeFade`, `Field`,
  `GlassSurface`, `InputGroup`, `MarqueeText`, `Message`, `MessageScroller`,
  `Popover`, `PromptInput`, `Reasoning`, `Slider`, `StatusDot`, `ToolCall`,
  `Trace`, `TransientPill`, `TwoStepAction`, `SurfaceDecoration`.
- `IconProvider` and `createNanoIconSet` for custom icon resolvers and native
  glyph sets.
- `Tabs` `indicator="slide"`.
- Numeric font weights (`<Text weight={650}>`) and variable fonts.

## 6. The Muqun app

What Muqun, the kit's main consumer (Expo SDK 58, on `@osuki-dev/ui ^1.1.0`), has to
change, by category. It already meets the SDK 58 floor.

### Required for the build

- `components/themed-button.tsx`: the seven type errors are all reads of
  `style?.backgroundColor`, `style?.borderRadius` and the corner radii off
  `ButtonProps.style`. Flatten first, or delete the file (below).
- `package.json`: `"@osuki-dev/ui": "^2.0.0-beta.0"`.

Everything else the app imports from the package (`useThemeTokens`,
`useToast`, `useThemeMode`, `Spinner`, `Icon`, `Dialog`, `ThemeOverride`,
`Tag`, `ThemeProvider`, `Text`, `Tabs`, `Skeleton`, `SegmentedControl`,
`Card`, `KeyboardToolbar`, `resolveFontStyle`, `motion`, `IconName`,
`FontWeight`, `FontRegistry`, `createThemePreset`, and the `*Props` types)
keeps its 1.x shape; `resolveFontStyle`, `Text`'s `weight` and `motion` only
gained fields. The app's `Icon` call sites pass `name`, `size`, `color` and
`strokeWidth` only, so the `IconProps` change does not reach them, and its
`IconName` uses are Lucide names, which still type-check.

### Review for the new looks

- Kit `Card` used directly in `app/commands.tsx`, `app/explore.tsx`,
  `components/approval-banner.tsx`, `components/composer-popup.tsx`,
  `components/settings-chrome.tsx`, `components/home-overview.tsx`,
  `components/server-terminal-workspace.tsx` and `lib/markdown-style.ts`:
  check any card with edge-to-edge media now that cards do not clip.
- `components/settings-segmented.tsx` draws its own sliding pill inside
  `Tabs.List`. In 2.0 the static `pill` trigger paints a selection too, so the
  pill would be doubled: pass `indicator="slide"` to `Tabs.Root` and delete the
  app's pill and its measuring, or give each `Tabs.Trigger`
  `style={{ backgroundColor: "transparent" }}`.

### Wrappers a 1.x consumer can delete

Each wrapper, what replaces it in 2.0, and what is honestly still missing.
`useSurfaceBackground` maps to a `transformBackground` that calls
`multiplyAlpha(color, opacity)` and exempts slots by role; the appearance
profile maps to a `ThemeOverride` as in section 4.

| File                                      | Replaced by                                                                                                                                                                                                                                                                                                               | Still missing                                                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/themed-card.tsx`              | Kit `Card`: fill through the decorator (`cards.decoration`), hairline border by default, radius from `components.Card.radius` (map `profile.chrome.card` there).                                                                                                                                                          | Nothing.                                                                                                                                                                                                                                                                                            |
| `components/themed-skeleton.tsx`          | Kit `Skeleton`: fill through the decorator (`skeleton.fill`), including a `style.backgroundColor` override; `components.Skeleton.background` sets the token.                                                                                                                                                              | Nothing.                                                                                                                                                                                                                                                                                            |
| `components/themed-search-input.tsx`      | Kit `SearchInput`: control fill through the decorator (`inputs.search`), radius from `Input.searchRadius`, placeholder from `Input.placeholder`, the theme's (variable) body face.                                                                                                                                        | Nothing. It has no importers today.                                                                                                                                                                                                                                                                 |
| `components/themed-input.tsx`             | Kit `Input`: fills `inputs.background` and `inputs.error`, theme face on value and placeholder (drawn with `Text`), label and hint plated through `TextPlateProvider` (publish `useSheetGroundPlate()`'s style there).                                                                                                    | The app's own entrance and layout animations on the error pill (`fadeInDown`, `listLayout`) are not tokens; the kit's error pill appears without them.                                                                                                                                              |
| `components/themed-textarea.tsx`          | Kit `Textarea`.                                                                                                                                                                                                                                                                                                           | Nothing.                                                                                                                                                                                                                                                                                            |
| `components/themed-tabs.tsx`              | Kit `Tabs`: the track is painted once and the selection is an `overlay` slot with `over`, badge fill through `tabs.badge` (`mark`).                                                                                                                                                                                       | Nothing.                                                                                                                                                                                                                                                                                            |
| `components/themed-segmented-control.tsx` | Kit `SegmentedControl`: radii, height and padding from `components.SegmentedControl`, track and selection through the decorator with the selection as an `overlay`, reduce motion respected by the kit's press feedback.                                                                                                  | The app forces the non-native layout on iOS; the kit uses the system control on iOS whenever no decorator is mounted. With the app's decorator mounted this matches.                                                                                                                                |
| `components/themed-surface.tsx`           | Kit `Surface` with `slot`, `disabled` and `selected` for the plane; `SurfaceDecoration` (`<SurfaceDecoration slot baseColor selected disabled />`) where `ThemedSurfaceArtwork` is mounted on its own (`home-overview`, `pad-server-rail`, `settings-segmented`). Register the app's slot names on `SurfaceSlotRegistry`. | The contrast-limited artwork opacity stays in the app's `renderDecoration`, which receives `baseColor`, `mode`, `selected` and `disabled` to compute it.                                                                                                                                            |
| `components/themed-button.tsx`            | Kit `Button`: fill and primary artwork through the decorator (`buttons.primary.background`), radius from `components.Button.radius`, press springs from `motion.press.springIn` / `springOut` with reduce motion inside, label casing from the `button` type style.                                                       | The protective base under a transparent button while a pack is active is a theme decision: override `components.Button.ghost.background` (for example to `"surfaceRaised"`) in the pack's `ThemeOverride`. The app's exact press curve (`kitButtonPressMotion`) must be expressed as spring tokens. |
| `components/pressable-scale.tsx`          | Kit `PressableScale`: `pressedScale` defaults to `motion.press.surface` (the profile's `pressedScale`), timings from `motion.press.inMs` / `outMs`, reduce motion inside, haptics through `HapticsProvider`.                                                                                                              | The app's `feedback={false}` is the kit's `feedback="none"`; `FeedbackKind` values must map onto `HapticFeedbackKind` in the app's `HapticsProvider`. A codemod over the 99 call sites.                                                                                                             |
| `components/text.tsx` (hug slack)         | `trailingSlack: true` on each font role while a user font file is active; every kit `Text`, including labels inside kit components, then gets the slack, nested and selectable text excluded, `hugSlack={false}` to opt out (badges and avatars already do).                                                              | Nothing.                                                                                                                                                                                                                                                                                            |
| `components/text.tsx` (variable weights)  | Declare `axes: { wght: { min, max } }` (from the app's `FontAxis`) on the role's `FontDefinition`; `resolveFontStyle` and `Text` emit `fontVariationSettings`, and `Text` already moves them onto an inner run on Android.                                                                                                | Nothing. `FontedTextInput` and `resolveUserFontStyle` go with it, since kit fields resolve the same way.                                                                                                                                                                                            |

Two app concerns stay in the app by design: pack parsing, artwork and the
opacity policy (they reach the kit only through the decorator), and the
app-only chrome tokens of its appearance profile (rail, composer dock,
navigation pill).
