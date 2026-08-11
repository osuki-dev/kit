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
`Surface`, `Text`, `Sheet`, `ListItem`, `Tabs`. Their fields hold _token names_,
not values — `Button.radius` is `"pill"`, `Input.border` is `"borderStrong"` —
so an override stays inside the system.

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
