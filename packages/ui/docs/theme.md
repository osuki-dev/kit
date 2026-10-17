# Theme

This file answers one question: where does a colour, a gap or a font size come
from, and how do I change it for my app without forking a component.

## The shape of a theme

`useThemeTokens()` returns one object. Everything a component reads is on it.

```tsx
import { useThemeTokens } from "@osuki-dev/ui";

const {
	name, // "osuki-light" | "osuki-dark", or your preset's name
	mode, // "light" | "dark" — already resolved, never "system"
	colors, // the 17 colour tokens below
	spacing, // the 9-step gap scale
	radius, // the 6-step corner scale
	motion, // durations and easings
	shadow, // three ambient lifts
	iconography, // stroke width, base size
	typeStyles, // the 11 type presets
	typography, // alias of typeStyles
	fonts, // display / body / label role map
	semantic, // role -> colour token name
	commerce, // commerce role -> colour or radius token name
	components, // per-component token blocks
} = useThemeTokens();
```

Two of those need explaining before the rest makes sense.

`semantic` and `commerce` do **not** hold colours. They hold the _names_ of
colour tokens, so a product can rename a role without touching every call site:

```tsx
const { colors, semantic } = useThemeTokens();
const okColor = colors[semantic.positive]; // semantic.positive === "success"
```

## Colours

Seventeen tokens, each defined for both modes. These are the only colours in the
system; there is no palette underneath that you are meant to reach into.

| Token           | Light       | Dark        | Use it for                                      |
| --------------- | ----------- | ----------- | ----------------------------------------------- |
| `background`    | `#FCFBFA`   | `#050B12`   | The page behind everything.                     |
| `surface`       | `#FFFFFF`   | `#101821`   | Cards, sheets, bars.                            |
| `surfaceRaised` | `#F6F7F9`   | `#172231`   | A layer above `surface`: inputs, selected rows. |
| `border`        | `#E7E8EC`   | `#263244`   | Hairlines and dividers.                         |
| `borderStrong`  | `#C9CED8`   | `#3D485A`   | Input outlines, sheet handles.                  |
| `text`          | `#050B12`   | `#FCFBFA`   | Body and headings.                              |
| `textMuted`     | `#667085`   | `#D2D7E0`   | Supporting text under a title.                  |
| `textSubtle`    | `#8A93A3`   | `#A6AFBE`   | Metadata, timestamps.                           |
| `textDisabled`  | `#B6BDC8`   | `#7F899A`   | Placeholders and unavailable controls.          |
| `primary`       | `#FF5A4A`   | `#FF5A4A`   | The one action colour.                          |
| `onPrimary`     | `#FCFBFA`   | `#050B12`   | Text and icons sitting on `primary`.            |
| `primarySubtle` | 14% primary | 24% primary | Tinted backgrounds behind the brand.            |
| `danger`        | `#D92D20`   | `#F97066`   | Destructive and failed.                         |
| `dangerSubtle`  | 12% danger  | 16% danger  | Tinted background behind danger.                |
| `success`       | `#12B76A`   | `#32D583`   | Completed, in stock, healthy.                   |
| `warning`       | `#F79009`   | `#FDB022`   | Needs attention, not yet broken.                |
| `info`          | `#3E63FF`   | `#3E63FF`   | Neutral notice.                                 |

Reading them:

```tsx
const { colors } = useThemeTokens();
<View style={{ backgroundColor: colors.surfaceRaised }} />;
```

For `Text`, prefer `colorKey`, which takes the token name directly and skips the
hook read:

```tsx
<Text variant="bodySmall" colorKey="textMuted">
	Updated 2 minutes ago
</Text>
```

## Spacing

An 8pt grid with two escapes: a 2pt optical nudge at the bottom and a 96pt hero
gap at the top.

| Token | Value | Means                                 |
| ----- | ----- | ------------------------------------- |
| `2xs` | 2     | Optical adjustment only.              |
| `xs`  | 4     | Icon-to-label.                        |
| `sm`  | 8     | Inside one component.                 |
| `md`  | 16    | Standard padding, gap between fields. |
| `lg`  | 24    | Between groups.                       |
| `xl`  | 32    | Between sections.                     |
| `2xl` | 48    | Major break.                          |
| `3xl` | 64    | Page-level rhythm.                    |
| `4xl` | 96    | Hero breathing room.                  |

The scale carries meaning, and that is the point: tight (4–8) says "these belong
together", medium (16) says "same group, different items", wide (32–48) says "a
new group starts here".

Components that take a gap accept the token name or a raw number —
`<Stack gap="md">` and `<Stack gap={16}>` are both valid. Prefer the token.

## Radius

| Token  | Value | Used by                          |
| ------ | ----- | -------------------------------- |
| `none` | 0     | Flush edges.                     |
| `xs`   | 4     | Compact cards, technical inputs. |
| `sm`   | 8     | Standard inputs.                 |
| `md`   | 12    | Cards.                           |
| `lg`   | 16    | Large cards, bottom sheets.      |
| `pill` | 999   | Buttons, tags.                   |

## Typography

Eleven presets. `Text` takes the name as `variant`; the `Font role` column says
which of the three font roles it resolves against.

| Variant      | Font role | Size | Weight | Notes                     |
| ------------ | --------- | ---- | ------ | ------------------------- |
| `hero`       | display   | 72   | 700    | One number, one screen.   |
| `display`    | display   | 48   | 400    | Section heroes.           |
| `dataLarge`  | label     | 36   | 700    | Big readouts.             |
| `heading`    | body      | 24   | 500    | Section titles.           |
| `subheading` | body      | 18   | 400    | Subsection titles.        |
| `body`       | body      | 16   | 400    | Default.                  |
| `data`       | label     | 16   | 400    | Inline numeric values.    |
| `bodySmall`  | body      | 14   | 400    | Supporting copy.          |
| `caption`    | label     | 12   | 400    | Timestamps, footnotes.    |
| `label`      | label     | 11   | 400    | Uppercased automatically. |
| `button`     | label     | 13   | 400    | Uppercased automatically. |

Line heights are stored as multipliers (`1.5` for `body`) and resolved against
the font size at render. `label` and `button` set `textTransform: "uppercase"`;
pass `transform="none"` on `Text` to opt one instance out.

Colour defaults follow the variant: `hero`, `display`, `heading`, `subheading`,
`body` and `bodySmall` default to `colors.text`; everything else defaults to
`colors.textMuted`. Override with `colorKey`.

### Font roles

Three roles, each independently mappable:

- `display` — hero and display sizes
- `body` — headings through body copy
- `label` — captions, labels, buttons, data readouts

The package ships no font files. Unmapped roles fall back to the platform system
font, so the kit works before you have chosen a typeface. A role takes either a
per-weight map or one family name:

```tsx
const theme = {
	fonts: {
		// per-weight, the shape Expo font packages produce
		body: {
			regular: "Inter_400Regular",
			medium: "Inter_500Medium",
			bold: "Inter_700Bold",
		},
		// or one native / variable family
		display: { family: "Inter" },
	},
};
```

Weights not supplied fall back to the nearest configured weight — asking for
`semibold` when only `bold` and `regular` exist resolves to `bold`, not to
nothing.

### Variable fonts

A variable face is one loaded file with design axes. Name it as `family` and
declare its axes, with the ranges from the font's `fvar` table:

```tsx
const theme = {
	fonts: {
		body: {
			family: "InterVariable",
			axes: {
				wght: { min: 100, max: 900 },
				opsz: { min: 14, max: 32 }, // optional
				wdth: { min: 75, max: 100 }, // optional
			},
			width: 87.5, // optional: the wdth this role is set at
		},
	},
};
```

Every weight of that role then resolves to the one family at native weight
`"400"`, with the requested weight on the `wght` axis:

```ts
resolveFontStyle(theme.fonts, "body", "bold", { fontSize: 16 });
// { fontFamily: "InterVariable", fontWeight: "400",
//   fontVariationSettings: { wght: 700, opsz: 16 } }
```

- `wght` takes the named weight (`bold` is 700) or any number from 1 to 1000
  (`<Text weight={850}>`), clamped to the declared range.
- `opsz` follows the text size when the face has an optical size axis, the
  way CSS `font-optical-sizing: auto` does.
- `wdth` is set only when the role names a `width`.

Why native weight 400: on Android, `expo-font` registers a loaded face under
the normal style only, so a native 700 misses it and falls back to the system
bold. A static family can therefore never reach 700 in an app-loaded face; a
variable one reaches any weight it has through the axis.

Every kit component that draws text resolves through this: `Text` and
everything built on it, the fields (`Input`, `SearchInput`, `Textarea`,
`PromptInput`, `Command`), and the navigation theme. A `fontWeight` in a
`Text` style is treated as a weight request too, unless that style also sets
its own `fontFamily`.

On Android, `Text` keeps the axes off the paragraph and puts them on one inner
run. React Native measures the paragraph with a paint that already carries the
axes, the run's span then sets the same settings again, and Android ignores an
unchanged settings string, so the run would be measured at the font's default
instance and drawn at the requested one: heavier text overflowed its box and
wrapped or lost letters. If you render `fontVariationSettings` yourself in a
React Native `Text`, do the same. The trailing slack, when a role turns it on,
goes after that run at the paragraph's face, so its width does not follow the
requested weight.

Variable fonts need React Native 0.88 or later, which this release requires.

### Trailing slack

Android clips the edge of the last glyph of some italic and wide faces at the
line end. `trailingSlack: true` on a font role appends a thin space to every
kit `Text` in that role, which gives the glyph room without changing the words:

```tsx
const theme = { fonts: { body: { family: "ReaderSerif", trailingSlack: true } } };
```

`Text`'s `hugSlack` overrides the role for one instance. Nested and selectable
text never get the slack, and these kit labels default to `hugSlack={false}`,
because they are centred or hug their own width and the slack would move them
off centre or widen them:

| Component                       | Why it opts out                          |
| ------------------------------- | ---------------------------------------- |
| `Button` (`Button.Label`)       | Centred in the button.                   |
| `Tabs.Label`                    | Centred in its trigger.                  |
| `Tag`, `Tag.Label`              | The chip is as wide as its label.        |
| `Badge`, `Avatar`, `Tabs.Badge` | A count or initials in a box of its own. |

`Button.Label`, `Tabs.Label`, `Tag` and `Tag.Label` take `hugSlack` to turn it
back on.

## Light and dark

`ThemeProvider` resolves the mode. It never hands components `"system"`; by the
time a component reads `theme.mode` it is `"light"` or `"dark"`.

```tsx
<ThemeProvider defaultMode="system">{children}</ThemeProvider>
```

| Prop             | Meaning                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `mode`           | Controlled. Supply this and the provider stops managing its own state.                                                      |
| `defaultMode`    | Uncontrolled starting value. Defaults to `"system"`.                                                                        |
| `theme`          | A `ThemeOverride` — see below.                                                                                              |
| `storageAdapter` | `{ getItem, setItem, removeItem? }`. The provider reads the stored mode on mount and writes on every change. Sync or async. |
| `storageKey`     | Defaults to `"osuki-theme-mode"`.                                                                                           |

Persisting the user's choice is one prop:

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

<ThemeProvider defaultMode="system" storageAdapter={AsyncStorage}>
	{children}
</ThemeProvider>;
```

Reading and changing it:

```tsx
import { useThemeMode } from "@osuki-dev/ui";

const { mode, resolvedMode, setMode, toggleMode } = useThemeMode();
// mode: what the user chose — "system" | "light" | "dark"
// resolvedMode: what is on screen — "light" | "dark"
```

Use `useThemeMode()` in the settings screen and `useThemeTokens()` everywhere
else. `useTheme()` returns both merged, which is convenient in an app shell and
wasteful in a list row.

## Overriding the theme

The `theme` prop takes a deep-partial override. Anything you omit keeps its
default. Top-level keys apply to both modes; `light` and `dark` keys apply after
that, to one mode only.

```tsx
<ThemeProvider
	theme={{
		radius: { lg: 20 },
		light: { colors: { primary: "#087443" } },
		dark: { colors: { primary: "#3CCB7F" } },
	}}
>
	{children}
</ThemeProvider>
```

Overrides reach component tokens too, which is how you change every button in
the app at once without a wrapper:

```tsx
<ThemeProvider
  theme={{
    components: {
      Button: { height: 48, radius: "sm" },
      Input: { radius: "sm", border: "border" },
    },
  }}
>
```

Component token blocks available under `components`: `Button`, `Card`, `Input`,
`Surface`, `Text`, `Sheet`, `ListItem`, `Tabs`, `SegmentedControl`, `Skeleton`.
Their fields hold _token names_, not values — `Button.radius` is `"pill"`,
`Input.border` is `"borderStrong"` — so an override stays inside the system.

The ones that shape an app's whole appearance:

| Token                                                                                       | Controls                                          |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `Button.radius`, `Input.radius`, `Input.searchRadius`                                       | control corners                                   |
| `Button.{variant}.shadow`                                                                   | light-mode lift of a filled button (`ghost` flat) |
| `Card.radius`                                                                               | which radius token each `Card` `radius` maps to   |
| `Tabs.radius`, `Tabs.background`, `Tabs.activeBackground`                                   | the `pill` tabs track and selected trigger        |
| `Tabs.optionRadius`                                                                         | the selected trigger and indicator (`radius`)     |
| `Tabs.activeForeground`, `Tabs.inactiveForeground`, `Tabs.indicator`                        | tab labels and the underline                      |
| `SegmentedControl.radius`, `SegmentedControl.optionRadius`                                  | the `rounded` segmented track and selected option |
| `SegmentedControl.background`, `activeBackground`, `activeForeground`, `inactiveForeground` | segmented fills and labels                        |
| `Input.placeholder`                                                                         | placeholder colour of every field                 |
| `Input.hint`                                                                                | the helper line under a field (`textDisabled`)    |
| `Skeleton.background`                                                                       | placeholder fill under the pulse                  |

Press feedback is a theme setting too. `motion.press` holds the scale each kind
of control settles at while held — `control` (Button), `card` (PressableCard),
`row` (ListItem), `chip` (Tag), `segment` (a `SegmentedControl` option), and
`surface` (the `PressableScale` default). Set one to `1` to turn its dip off.
`PressableScale` and `SegmentedControl` also stay still when the system
reduce-motion setting is on; the selection haptic still plays.

`inMs` and `outMs` time the `PressableScale` dip (and so the segmented
option's), and `easing` is its curve, `Easing.out(Easing.cubic)` by default.
It takes any Reanimated easing, so a bezier works too:

```tsx
import { Easing } from "react-native-reanimated";

<ThemeProvider
	theme={{
		motion: { press: { control: 0.97, surface: 0.96, easing: Easing.bezier(0.2, 0, 0, 1) } },
	}}
>
```

`Button` and `PressableCard` press on springs, `springIn` and `springOut`.

Translucent, image-backed and gradient-backed fills come from the surface
decorator, below.

## Surface decoration

Fills that are translucent, image-backed, or gradient-backed are not tokens.
They come from one provider that every kit surface paints through:

```tsx
import { SurfaceDecoratorProvider, multiplyAlpha, type SurfaceMeta } from "@osuki-dev/ui";

function AppDecorator({ opacity, children }: { opacity: number; children: React.ReactNode }) {
	// Recreated when `opacity` changes: components memoize on its identity.
	const transformBackground = useCallback(
		(color: string, meta: SurfaceMeta) =>
			meta.role === "mark" ? color : multiplyAlpha(color, opacity),
		[opacity],
	);
	const renderDecoration = useCallback(
		(meta: SurfaceMeta) =>
			meta.slot === "cards.decoration" ? <CardArtwork mode={meta.mode} /> : null,
		[],
	);
	return (
		<SurfaceDecoratorProvider
			transformBackground={transformBackground}
			renderDecoration={renderDecoration}
		>
			{children}
		</SurfaceDecoratorProvider>
	);
}
```

The contract:

- `transformBackground(color, meta)` maps one string fill. Keep it a pure
  function of its arguments and create a new function when anything it reads
  changes; components memoize the result on the function's identity. It is
  never called with `transparent`.
- `renderDecoration(meta)` returns artwork for a slot, or `null`. The kit
  places it in an absolute, non-interactive layer clipped to the surface's
  corners.
- Every fill is painted once. A selection drawn over a track (`Tabs` in the
  `pill` variant, `SegmentedControl`) is an `overlay`, and its meta carries the
  resolved fill underneath as `over`, so a translucent policy can avoid
  multiplying itself or return an opaque fill for it.
- `Tabs` can instead lay its fills side by side: `layering="segments"` on
  `Tabs.Root` (or the `Tabs` facade) leaves the list clear and has each idle
  trigger paint `tabs.track` (variant `segment`) and the selected one paint
  `tabs.selected` as a `surface` with no `over`. Nothing is stacked, so a
  translucent fill shows the background once, not twice.
- Use `multiplyAlpha` for opacity, not `withAlpha`: `withAlpha` replaces the
  alpha, so it would make an already translucent token such as `primarySubtle`
  more opaque.

`meta` carries `slot`, `role` (`surface`, `overlay`, `mark`), `over`, `mode`
(the resolved theme mode), `variant`, `baseColor`, `disabled`, `selected` and
`borderRadius`.

### Slots

A slot names a fill. Decorator policies key on these names, so renaming one is
a breaking change, like renaming a token.

| Slot                                  | Painted by                                                | Role                                |
| ------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| `screens.page`                        | `Screen`, `ScrollScreen`, page `Surface`                  | `surface`                           |
| `surfaces.surface`, `surfaces.raised` | `Surface` variants                                        | `surface`                           |
| `cards.decoration`                    | `Card`                                                    | `surface`                           |
| `buttons.{variant}.background`        | `Button` (`primary`, `secondary`, `ghost`, `destructive`) | `surface`                           |
| `inputs.background`, `inputs.search`  | `Input`, `Textarea`, `SearchInput`                        | `surface`                           |
| `inputs.error`                        | the `Input` error pill                                    | `surface`                           |
| `prompt.background`                   | `PromptInput`                                             | `surface`                           |
| `tabs.track`                          | `Tabs.List` (`pill`), or each idle trigger in `segments`  | `surface`                           |
| `tabs.selected`                       | the selected `pill` trigger or indicator                  | `overlay` (`surface` in `segments`) |
| `tabs.badge`                          | `Tabs.Badge`                                              | `mark`                              |
| `segmented.track`                     | `SegmentedControl`                                        | `surface`                           |
| `segmented.selected`                  | the selected segment                                      | `overlay`                           |
| `toggles.track`                       | `Toggle`                                                  | `mark`                              |
| `tags.background`                     | `Tag`                                                     | `surface`                           |
| `badges.background`                   | `Badge`                                                   | `mark`                              |
| `skeleton.fill`                       | `Skeleton`                                                | `surface`                           |
| `empty.icon`                          | the `EmptyState` icon well                                | `surface`                           |
| `alerts.{variant}`                    | `Alert` (`info`, `success`, `warning`, `danger`)          | `surface`                           |
| `code.{variant}`                      | `CodeBlock` (`default`, `diff`, `terminal`, `compact`)    | `surface`                           |
| `sheets.background`, `sheets.action`  | `Sheet` body, `ActionSheet` cancel                        | `surface`                           |
| `dialogs.background`                  | `Modal` and `Dialog` content                              | `surface`                           |
| `popovers.background`                 | `Popover`                                                 | `surface`                           |
| `tooltips.background`                 | `Tooltip`                                                 | `surface`                           |
| `toasts.background`                   | toasts                                                    | `surface`                           |
| `menus.trigger`, `selects.trigger`    | `Menu` and `Select` triggers                              | `surface`                           |
| `rows.background`                     | `ListItem`, when its token sets a fill                    | `surface`                           |

Scrims, pressed tints, handles and other decorative tints are not slots and do
not go through the decorator.

Register your own slots so `SurfaceSlot` keeps checking them:

```ts
declare module "@osuki-dev/ui" {
	interface SurfaceSlotRegistry {
		"composer.dock": true;
	}
}
```

Pass them as `slot` to `Surface`, `Card` or `Button`, or decorate a view the kit
does not own with `<SurfaceDecoration slot="composer.dock" baseColor={fill} borderRadius={16} />`
placed first inside it.

`ScrollScreen` keeps its decoration in a fixed layer behind the scrolling
content, so a backdrop does not scroll away.

### Text plates

Text that stands directly on a decorated background, outside any card or
control, can need a backing to stay legible. Publish one with
`TextPlateProvider`; the kit applies it to field labels and hints, section
titles and descriptions, and empty-state copy, and your own `Text` takes it with
`plated`:

```tsx
<TextPlateProvider plate={overImage ? plateStyle : null}>{children}</TextPlateProvider>
```

The kit never decides when a plate is needed; it only applies the style the
app publishes. Keep the plate object stable.

## Your brand colour

`createThemePreset` builds the override for you. Give it a hex and it derives
`onPrimary` and `primarySubtle` for both modes, at the right opacity for each.

```tsx
import { ThemeProvider, createThemePreset } from "@osuki-dev/ui";

const theme = createThemePreset({
	primary: "#087443",
	density: "compact",
	shape: "sharp",
});

export function Providers({ children }: { children: React.ReactNode }) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

| Option           | Values                                                                                                                                             | Effect                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `primary`        | any hex                                                                                                                                            | The brand colour. Defaults to the `tone`'s colour.                                     |
| `tone`           | `neutral`, `commerce`, `saas`, `finance`, `health`, `education`, `creator`, `fashion`, `beauty`, `grocery`, `restaurant`, `fitness`, `electronics` | Picks a default `primary` and commerce defaults. Defaults to `commerce`.               |
| `density`        | `compact`, `comfortable`, `spacious`                                                                                                               | Rewrites the spacing scale and button/input/card padding. Defaults to `comfortable`.   |
| `shape`          | `sharp`, `soft`, `rounded`                                                                                                                         | Rewrites the radius scale and the button/input/card radius tokens. Defaults to `soft`. |
| `name`           | string                                                                                                                                             | Sets `theme.name`.                                                                     |
| `light` / `dark` | `Partial<ThemeColors>`                                                                                                                             | Per-mode colour escapes applied after derivation.                                      |
| `commerce`       | `Partial<CommerceTokens>`                                                                                                                          | Product card radius, image aspect ratio, grid minimum width.                           |

`density: "compact"` sets `spacing.md` to 12 and the button height to 40;
`spacious` sets them to 18 and 48. `shape: "sharp"` takes `radius.pill` down to
10, which is what turns pill buttons into rounded rectangles.

### Prebuilt presets

Twelve industry presets ship with the package, each a `ThemeOverride` you can
pass straight to `ThemeProvider`:

```tsx
import { ThemeProvider, themePresets } from "@osuki-dev/ui";

<ThemeProvider theme={themePresets.finance}>{children}</ThemeProvider>;
```

- `themePresets` — `Record<IndustryThemePresetId, ThemeOverride>`
- `themePresetRegistry` — the same twelve with `id`, `label`, `description` and
  the `options` they were built from, for a theme picker UI
- `themePresetById` — a `Map` keyed by id
- `resolveThemePresetDefinition(value, fallback?)` — accepts an id or a label,
  falls back to `commerce`, never returns undefined

IDs: `commerce`, `fashion`, `beauty`, `grocery`, `restaurant`, `fitness`,
`electronics`, `saas`, `finance`, `health`, `education`, `creator`.

## Building a theme outside React

`createTheme` is the function `ThemeProvider` calls. Use it directly for tests,
for static style sheets, or anywhere there is no context:

```tsx
import { createTheme, createBaseTheme, extendTheme } from "@osuki-dev/ui";

const dark = createTheme("dark", themePresets.finance);
const bare = createBaseTheme("light"); // no overrides
const tweaked = extendTheme(bare, { spacing: { md: 20 } });
```

`createTheme(mode, override)` applies the top-level override first, then the
mode-specific `light` / `dark` block. `deepMerge` is exported too, if you are
composing overrides yourself.

## Responsive values

Breakpoints are `xs`, `sm`, `md`, `lg`, `xl`. `useResponsiveTheme()` resolves
the current one into ready values:

```tsx
import { useResponsiveTheme } from "@osuki-dev/ui";

const layout = useResponsiveTheme();
// layout.breakpoint, layout.isMobile, layout.isTablet, layout.isDesktop,
// layout.isLandscape, layout.window, layout.containerMaxWidth,
// layout.pagePadding, layout.gridColumns, layout.gap, layout.formMaxWidth,
// layout.formGap, layout.buttonMinWidth, layout.getCardPadding("compact"),
// layout.emptyState
```

`ResponsiveContainer` and `ResponsiveGrid` also take breakpoint maps directly,
which is usually less code than reading the hook:

```tsx
<ResponsiveContainer maxWidth={{ xs: "100%", md: 720, lg: 960 }}>
	<ResponsiveGrid columns={{ xs: 1, md: 2, lg: 3 }} gap={16}>
		{cards}
	</ResponsiveGrid>
</ResponsiveContainer>
```

## Navigation

`useNavigationTheme()` derives a React Navigation theme and a screen-options
object from the current tokens, so the navigator header stops being the one part
of the app that ignores the theme.

```tsx
import { useNavigationTheme } from "@osuki-dev/ui";
import { Stack } from "expo-router";

export function Navigator() {
	const { screenOptions } = useNavigationTheme();
	return <Stack screenOptions={screenOptions} />;
}
```

It returns `{ theme, screenOptions, colors, mode }`. `createNavigationTheme` and
`getNavigationScreenOptions` are exported for use outside React. All three
require `expo-router` to be installed.

## Where to go next

- [conventions.md](./conventions.md) — the rules that keep tokens from being
  bypassed.
- [components.md](./components.md) — which component reads which tokens.
