# @osuki-dev/ui

Osuki UI is the open-source primitive layer for Osuki Expo and React Native apps.

It provides configurable typography, semantic theme tokens, native-feeling controls, responsive helpers, and stable component contracts for app templates.

## Features

- **Font-Agnostic**: Uses system fonts by default and accepts any app-owned font family
- **Dark & Light Modes**: Equal rigor for both themes
- **Fully Typed**: TypeScript support throughout
- **Accessible**: 44px touch targets, semantic colors
- **Responsive**: Breakpoint-aware components

## Installation

```bash
bun add @osuki-dev/ui
```

Peer dependencies are intentionally external — the app owns their versions, and
there are twelve of them:

| Peer                                               | Needed for                                 |
| -------------------------------------------------- | ------------------------------------------ |
| `react`, `react-native`                            | everything                                 |
| `react-native-reanimated`, `react-native-worklets` | motion, sheets, skeletons                  |
| `react-native-safe-area-context`                   | `Screen`, `ScrollScreen`, sheets           |
| `react-native-svg`                                 | icon rendering                             |
| `lucide-react-native`                              | `Icon`, and every component that takes one |
| `react-native-keyboard-controller`                 | the four keyboard components               |
| `expo-font`                                        | `FontLoader`                               |
| `expo-image`                                       | `Image`                                    |
| `expo-router`                                      | the navigation helpers                     |
| `@expo/ui`                                         | the native pickers behind `DateInput`      |

In an Expo app install them with `npx expo install` so the versions match the
SDK. `react-native-gesture-handler` is **not** required: sheets and pressables
are built on React Native's own `Pressable` with Reanimated.

The package contains no font binaries. Install and load fonts in the application
only when its brand needs them.

## Documentation

The full documentation ships inside this package, under
[`docs/`](./docs/README.md) — readable offline, and unable to drift from the
version installed:
[getting started](./docs/getting-started.md) ·
[component catalogue](./docs/components.md) ·
[theming](./docs/theme.md) ·
[screen patterns](./docs/patterns.md) ·
[conventions](./docs/conventions.md)

## Components

### Core Components

| Component       | Description                          | Props                                   |
| --------------- | ------------------------------------ | --------------------------------------- |
| `Text`          | Typography and overflow primitive    | `variant`, `transform`, `overflowMode`  |
| `Button`        | Action buttons with 4 variants       | `variant`, `disabled`, `onPress`        |
| `Card`          | Content containers                   | `variant`, `border`, `padding`          |
| `Surface`       | Visual background container          | `variant`                               |
| `Screen`        | Full-screen native layout            | `variant`, `safeArea`                   |
| `ScrollScreen`  | Full-screen scroll owner             | `variant`, `safeArea`, scroll props     |
| `Input`         | Form text inputs                     | `variant`, `label`, `secureTextEntry`   |
| `Textarea`      | Multi-line text input                | `label`, `minRows`, `maxRows`           |
| `SearchInput`   | Search field with clear action       | `value`, `onChangeText`, `onClear`      |
| `Select`        | Bottom-sheet option picker           | `options`, `value`, `onChange`          |
| `DateInput`     | Date, time, and datetime picker      | `mode`, `value`, `onChange`             |
| `Menu`          | Triggered option/action menu         | `items`, `selectedId`, `onSelect`       |
| `RadioGroup`    | Single-select choice list            | `options`, `value`, `onChange`          |
| `OtpInput`      | One-time-code entry cells            | `length`, `value`, `onChange`           |
| `Stepper`       | Numeric stepper control              | `value`, `min`, `max`, `onChange`       |
| `FieldGroup`    | Form field wrapper                   | `label`, `helper`, `error`              |
| `Tabs`          | Composable section switching         | `Root`, `List`, `Trigger`, `Label`      |
| `Alert`         | Inline status messages               | `variant`, `title`, `message`           |
| `ToastProvider` | App-level toast notifications        | `placement`, `maxToasts`                |
| `Modal`         | Composable centered overlay          | `Root`, `Trigger`, `Content`, `Close`   |
| `Dialog`        | Composable decision modal            | `Root`, `Content`, `Actions`, `Close`   |
| `Sheet`         | Composable bottom overlay primitives | `Root`, `Trigger`, `Content`, `Body`    |
| `BottomSheet`   | Convenient composed sheet            | `maxHeight`, `bodyStyle`, `bottomInset` |
| `ActionSheet`   | Mobile action list                   | `actions`, `onAction`, `visible`        |
| `Tooltip`       | Inline help popover                  | `content`, `children`, `visible`        |
| `TopBar`        | Screen title bar                     | `title`, `onBack`, `actions`            |
| `Toolbar`       | Icon action toolbar                  | `actions`, `variant`, `density`         |
| `Stack`         | Token-based layout stack             | `direction`, `flow`, `widthMode`        |
| `Section`       | Reusable screen section              | `title`, `description`, `action`        |
| `EmptyState`    | Reusable no-data state               | `title`, `message`, `actionLabel`       |
| `ErrorView`     | Reusable failure state               | `message`, `onRetry`                    |
| `LoadingView`   | Full-section loading state           | `label`, `size`                         |

### Data Display

| Component              | Description               | Props                                               |
| ---------------------- | ------------------------- | --------------------------------------------------- |
| `Icon`                 | Lucide icons wrapper      | `name`, `size`, `color`                             |
| `Tag`                  | Labels and badges         | `variant` (default/active/pill/technical)           |
| `Badge`                | Notification counters     | `variant`, `display`                                |
| `Avatar`               | User profile images       | `source`, `initials`, `size`, `isOnline`            |
| `AvatarGroup`          | Stacked avatars           | `items`, `max`, `size`                              |
| `StatRow`              | Key-value statistics      | `label`, `value`, `status`                          |
| `DataRow`              | Settings/data row         | `label`, `value`, `description`                     |
| `DataTable`            | Typed table/list grid     | `columns`, `data`, `getRowId`, `sort`, `renderMode` |
| `MetricCard`           | Compact metric block      | `label`, `value`, `tone`                            |
| `Timeline`             | Event timeline            | `items`, item `status`                              |
| `ProgressBar`          | Continuous progress       | `value`, `tone`, `valueDisplay`, `shape`            |
| `SegmentedProgressBar` | Progress indicator        | `value`, `status`, `valueDisplay`                   |
| `Spinner`              | Loading indicator         | `size`, `color`                                     |
| `InlineActivity`       | Inline busy row           | `label`, `active`, `size`, `widthMode`              |
| `Skeleton`             | Loading placeholder       | `variant`, `lines`, `motion`                        |
| `ListItem`             | List row with icon        | `icon`, `title`, `separator`, `trailing`            |
| `ChoiceRow`            | Pickable option row       | `label`, `emphasis`, `loading`, `tag`               |
| `SheetListItem`        | Row for inside a sheet    | `label`, `description`, `icon`, `selected`, `tone`  |
| `ChoiceList`           | Pickable option list      | `items`, `onSelect`, `loadingId`                    |
| `Divider`              | Visual separator          | `variant` (full/inset/middle)                       |
| `Image`                | Cached remote/local image | `source`, `contentFit`, `cachePolicy`, `transition` |

### Form Controls

| Component          | Description           | Props                          |
| ------------------ | --------------------- | ------------------------------ |
| `SegmentedControl` | Tab-like selection    | `options`, `value`, `onChange` |
| `Select`           | Option picker         | `options`, `value`, `onChange` |
| `DateInput`        | Date/time input       | `mode`, `value`, `onChange`    |
| `Menu`             | Menu picker           | `items`, `selectedId`          |
| `Toggle`           | Boolean switch        | `value`, `onValueChange`       |
| `Checkbox`         | Multi-select checkbox | `checked`, `onToggle`          |
| `RadioGroup`       | Single-select list    | `options`, `value`, `onChange` |
| `OtpInput`         | One-time-code input   | `length`, `value`, `onChange`  |
| `Stepper`          | Numeric input control | `value`, `onChange`, `step`    |
| `FieldGroup`       | Field label wrapper   | `label`, `helper`, `error`     |
| `Textarea`         | Notes and messages    | `label`, `error`, `helper`     |
| `SearchInput`      | Search/filter input   | `value`, `onChangeText`        |
| `Tabs`             | Section switching     | `Root`, `List`, `Trigger`      |

### Layout

| Component             | Description       | Props                                     |
| --------------------- | ----------------- | ----------------------------------------- |
| `Stack`               | Layout stack      | `direction`, `flow`, `widthMode`          |
| `Section`             | Screen section    | `title`, `description`, `action`          |
| `ResponsiveContainer` | Max-width wrapper | `maxWidth`, `alignment`, `widthMode`      |
| `ResponsiveGrid`      | Grid layout       | `columns`, `gap`                          |
| `Pagination`          | Page controls     | `page`, `pageCount`, `onPageChange`       |
| `PressableCard`       | Tappable card     | `variant` (default/raised/flat), `border` |
| `PressableScale`      | Press-dip target  | `pressedScale`, `feedback`                |

### Keyboard

Thin wrappers over `react-native-keyboard-controller`, re-exported so an app has
one keyboard strategy instead of mixing libraries. Props pass through unchanged;
only `KeyboardToolbar` adds theming.

| Component                 | Description                               |
| ------------------------- | ----------------------------------------- |
| `KeyboardAvoidingView`    | Moves content out from under the keyboard |
| `KeyboardAwareScrollView` | Scrolls the focused field into view       |
| `KeyboardStickyView`      | Pins content to the keyboard's top edge   |
| `KeyboardToolbar`         | Themed accessory bar above the keyboard   |

### Platform Feedback

| Component         | Description          | Props     |
| ----------------- | -------------------- | --------- |
| `HapticsProvider` | Haptic feedback root | `enabled` |

Haptics are **off unless `enabled` is set**, so the host app opts in once rather
than each component guessing. Read the controller with `useHaptics()`:

```tsx
const haptics = useHaptics();
haptics.feedback("selection");
```

Without a provider the controller is a no-op, so components may call it
unconditionally.

### Overlays

| Component     | Description       | Props                                   |
| ------------- | ----------------- | --------------------------------------- |
| `Modal`       | Compound overlay  | `Root`, `Trigger`, `Content`, `Close`   |
| `Dialog`      | Compound decision | `Root`, `Content`, `Actions`, `Close`   |
| `Sheet`       | Compound sheet    | `Root`, `Trigger`, `Content`, `Body`    |
| `BottomSheet` | Bottom sheet      | `maxHeight`, `bodyStyle`, `bottomInset` |
| `ActionSheet` | Action menu sheet | `actions`, `onAction`, `visible`        |
| `Tooltip`     | Inline help       | `content`, `children`, `visible`        |

Compose product-specific sheets from the shared state and accessibility primitives:

```tsx
<Sheet.Root open={open} onOpenChange={setOpen}>
	<Sheet.Trigger accessibilityLabel="Choose an option">
		<Text>Choose</Text>
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Handle />
		<Sheet.Header>
			<Sheet.HeaderText>
				<Sheet.Title>Options</Sheet.Title>
			</Sheet.HeaderText>
			<Sheet.Close />
		</Sheet.Header>
		<Sheet.Body>{options}</Sheet.Body>
	</Sheet.Content>
</Sheet.Root>
```

Tabs and modals expose the same stable compound contract. Product code composes
the layout while Osuki UI owns selection, visibility, accessibility, and motion:

```tsx
<Tabs.Root value={tab} onValueChange={setTab} variant="pill">
	<Tabs.List>
		<Tabs.Trigger value="products"><Tabs.Label>Products</Tabs.Label></Tabs.Trigger>
		<Tabs.Trigger value="orders"><Tabs.Label>Orders</Tabs.Label></Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>

<Modal.Root open={open} onOpenChange={setOpen}>
	<Modal.Trigger><Text>Open details</Text></Modal.Trigger>
	<Modal.Content>
		<Modal.Header>
			<Modal.HeaderText><Modal.Title>Details</Modal.Title></Modal.HeaderText>
			<Modal.Close />
		</Modal.Header>
		<Modal.Body>{content}</Modal.Body>
	</Modal.Content>
</Modal.Root>
```

Compose decisions with explicit close behavior instead of action configuration:

```tsx
<Dialog.Root open={open} onOpenChange={setOpen} tone="danger">
	<Dialog.Trigger accessibilityLabel="Remove address">
		<Text>Remove</Text>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Icon />
			<Dialog.HeaderText>
				<Dialog.Title>Remove address?</Dialog.Title>
				<Dialog.Description>This cannot be undone.</Dialog.Description>
			</Dialog.HeaderText>
		</Dialog.Header>
		<Dialog.Actions>
			<Dialog.Close>Cancel</Dialog.Close>
			<Dialog.Close variant="destructive" onPress={removeAddress}>
				Remove
			</Dialog.Close>
		</Dialog.Actions>
	</Dialog.Content>
</Dialog.Root>
```

## Hooks

| Hook                     | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `useThemeTokens`         | Read visual tokens without mode-action updates    |
| `useThemeMode`           | Read and update the selected color mode           |
| `useTheme`               | App-level access to tokens and mode actions       |
| `useNavigationTheme`     | The tokens shaped for React Navigation            |
| `useResponsiveTheme`     | Responsive values: `isMobile`, breakpoints        |
| `useResponsiveLayout`    | The current breakpoint and layout decisions       |
| `useResponsiveValue`     | Pick a value per breakpoint                       |
| `useResponsiveGrid`      | Column count for the current width                |
| `useResponsiveFontScale` | Type scaling for the current width                |
| `useResponsiveSafeArea`  | Safe-area insets, breakpoint aware                |
| `useToast`               | Raise a toast from anywhere under `ToastProvider` |
| `useHaptics`             | Fire the kit's haptic feedback kinds              |
| `useTabs`                | The state a composed `Tabs` shares                |
| `useModal`               | The state a composed `Modal` shares               |
| `useDialog`              | The state a composed `Dialog` shares              |
| `useSheet`               | The state a composed `Sheet` shares               |

The last four are for building against the composable versions of those
components; the convenience wrappers (`BottomSheet`, and `Dialog` used with its
own props) manage their state themselves.

## Fonts

The default theme uses the platform system font. To use a custom font, install it in the app, pass its sources to `FontLoader`, and map the loaded names to the semantic `display`, `body`, and `label` roles:

```tsx
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { FontLoader, ThemeProvider } from "@osuki-dev/ui";

const fontSources = { Inter_400Regular, Inter_700Bold };
const theme = {
	fonts: {
		display: { regular: "Inter_400Regular", bold: "Inter_700Bold" },
		body: { regular: "Inter_400Regular", bold: "Inter_700Bold" },
		label: { regular: "Inter_400Regular", bold: "Inter_700Bold" },
	},
};

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<FontLoader fonts={fontSources}>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</FontLoader>
	);
}
```

Each role also accepts a single native or variable family with `{ family: "Inter" }`. Missing roles and weights fall back safely to the system font or the nearest configured weight.

## Theme Tokens

### Customization

Use `createThemePreset` when an app needs a different brand, density, or shape
without forking components:

```tsx
import { ThemeProvider, createThemePreset } from "@osuki-dev/ui";

const theme = createThemePreset({
	tone: "finance",
	primary: "#087443",
	density: "compact",
	shape: "sharp",
});

export function Providers({ children }: { children: React.ReactNode }) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

### Colors

Seventeen tokens, each defined in both modes. No component reaches past this
list, and neither should application code.

```typescript
const { colors } = useThemeTokens();

// Surfaces, from the page upward
// colors.background     - the page itself
// colors.surface        - a card or sheet resting on it
// colors.surfaceRaised  - the layer above that: menus, popovers, raised rows
// colors.border         - hairlines and dividers
// colors.borderStrong   - a border meant to be seen: inputs, focus, selection

// Text, in descending emphasis
// colors.text           - body and headings
// colors.textMuted      - supporting text
// colors.textSubtle     - metadata, timestamps
// colors.textDisabled   - disabled controls and placeholder text

// Brand
// colors.primary        - the action color
// colors.onPrimary      - text and icons drawn on top of primary
// colors.primarySubtle  - primary at low alpha: selected rows, tinted chips

// Status
// colors.danger         - destructive actions and errors
// colors.dangerSubtle   - danger at low alpha, same job as primarySubtle
// colors.success        - green
// colors.warning        - amber
// colors.info           - blue
```

### Typography Variants

Eleven, and `<Text variant>` takes any of them.

| Variant      | Font role | Size | Weight | Use case                         |
| ------------ | --------- | ---- | ------ | -------------------------------- |
| `hero`       | display   | 72px | 700    | The one number a screen is about |
| `display`    | display   | 48px | 400    | Section heroes, percentages      |
| `dataLarge`  | label     | 36px | 700    | Large monospace figures          |
| `heading`    | body      | 24px | 500    | Page and section titles          |
| `subheading` | body      | 18px | 400    | Subsections                      |
| `body`       | body      | 16px | 400    | Body text                        |
| `data`       | label     | 16px | 400    | Monospace values in a column     |
| `bodySmall`  | body      | 14px | 400    | Secondary body, helper text      |
| `button`     | label     | 13px | 400    | Button text                      |
| `caption`    | label     | 12px | 400    | Timestamps, footnotes            |
| `label`      | label     | 11px | 400    | All-caps instrument labels       |

The `label` role is the monospace family: `label`, `caption`, `button`, `data`
and `dataLarge` are set in it, which is what makes a column of numbers line up
and a row of chips read as an instrument panel rather than as prose.

### Spacing Tokens

```typescript
const { spacing } = useThemeTokens();
// spacing['2xs'] //  2px - optical adjustments only
// spacing.xs     //  4px - icon-to-label gaps, tight padding
// spacing.sm     //  8px - component internals
// spacing.md     // 16px - standard padding and element gaps
// spacing.lg     // 24px - group separation
// spacing.xl     // 32px - section margins
// spacing['2xl'] // 48px - major section breaks
// spacing['3xl'] // 64px - page-level vertical rhythm
// spacing['4xl'] // 96px - hero breathing room
```

## Usage Example

```tsx
import { useState } from "react";
import { Button, Card, Screen, SearchInput, Stack, Text, useThemeTokens } from "@osuki-dev/ui";

function MyScreen() {
	const { colors } = useThemeTokens();
	const [query, setQuery] = useState("");

	return (
		<Screen variant="page">
			<Card variant="raised" border="subtle" padding="lg">
				<Text variant="heading" color={colors.text}>
					Hello World
				</Text>
				<Text variant="body" color={colors.textMuted}>
					Welcome to Osuki UI
				</Text>
				<Stack direction="vertical" gap="md">
					<SearchInput value={query} onChangeText={setQuery} />
					<Button variant="primary" onPress={() => {}}>
						GET STARTED
					</Button>
				</Stack>
			</Card>
		</Screen>
	);
}
```

`Stack` rather than React Native's `View`: it takes the spacing tokens by name,
which is the whole argument of the scale. Everything used above is exported from
the package root — the previous version of this example imported `Surface` it
never used and reached for `Screen` and `View` without importing either.

## Design Principles

1. **Typography is the UI**: Clear hierarchy and CJK-friendly font choices.
2. **Space is functional**: Dense enough for real products without crowding.
3. **Motion is restrained**: Feedback should clarify state, not distract.
4. **Color is semantic**: Brand color is a signal, not wallpaper.
5. **Touch targets matter**: Minimum 44px for interactive elements.

## License

MIT
