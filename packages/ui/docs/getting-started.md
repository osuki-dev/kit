# Getting started

This file answers one question: what do I have to install and mount before a
component from this kit renders correctly, and what does the first screen look
like once it does.

## Install

```sh
npm install @osuki-dev/ui
# or: bun add @osuki-dev/ui
```

## Peer dependencies

Nothing is bundled. The kit expects the host app to own every native module it
touches, so that an app has one copy of Reanimated, one copy of safe-area
context, and one keyboard strategy.

| Package                            | Range                  | Needed for                                                 |
| ---------------------------------- | ---------------------- | ---------------------------------------------------------- |
| `react`                            | `>=19.2.3`             | everything                                                 |
| `react-native`                     | `>=0.85.0`             | everything                                                 |
| `react-native-safe-area-context`   | `>=5.7.0`              | `Screen`, `ScrollScreen`, `TopBar`, sheets                 |
| `react-native-reanimated`          | `>=4.3.1`              | `Text` marquee, `PressableScale`, sheets, toasts, skeleton |
| `react-native-svg`                 | `>=15.15.4`            | `Icon`                                                     |
| `lucide-react-native`              | `^0.487.0 \|\| ^1.0.0` | `Icon`                                                     |
| `react-native-keyboard-controller` | `>=1.21.6`             | the four `Keyboard*` components                            |
| `expo-font`                        | `>=57.0.0`             | `FontLoader`                                               |
| `expo-image`                       | `>=56.0.0`             | `Image`                                                    |
| `expo-router`                      | `>=57.0.4`             | `createNavigationTheme`, `useNavigationTheme`              |
| `@expo/ui`                         | `>=57.0.4`             | `DateInput`                                                |

`react-native-worklets` is not listed above because Reanimated 4 declares it
itself — install it alongside Reanimated, not because of this kit.

In an Expo project install them with `npx expo install` so the versions match
the SDK:

```sh
npx expo install react-native-safe-area-context react-native-reanimated \
  react-native-worklets react-native-svg lucide-react-native \
  react-native-keyboard-controller expo-font expo-image
```

There is no `react-native-gesture-handler` requirement. Sheets and pressables
are built on React Native's own `Pressable` and on Reanimated.

## Mount the providers

Two providers matter, and their order matters.

`FontLoader` goes outside, because it decides whether the font files are ready.
`ThemeProvider` goes inside, because the theme maps loaded font names onto the
`display` / `body` / `label` roles that every component reads.

```tsx
// app/_layout.tsx
import { FontLoader, ThemeProvider } from "@osuki-dev/ui";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<FontLoader>
			<ThemeProvider defaultMode="system">
				<Stack />
			</ThemeProvider>
		</FontLoader>
	);
}
```

That is the whole minimum. `FontLoader` with no `fonts` prop renders its
children immediately and the theme falls back to the platform system font, so
you can ship a screen before you have chosen a typeface.

### Safe area

`Screen`, `ScrollScreen` and `TopBar` read `useSafeAreaInsets()`. Expo Router
mounts `SafeAreaProvider` for you. In a bare React Native app, mount it
yourself, outside `ThemeProvider`:

```tsx
import { SafeAreaProvider } from "react-native-safe-area-context";

<SafeAreaProvider>
	<FontLoader>
		<ThemeProvider>{children}</ThemeProvider>
	</FontLoader>
</SafeAreaProvider>;
```

### Optional providers

Add these only when you use the feature they serve. Both are cheap, and both
are no-ops when absent, so components may call into them unconditionally.

```tsx
import { HapticsProvider, ThemeProvider, ToastProvider } from "@osuki-dev/ui";
import * as Haptics from "expo-haptics";
import { KeyboardProvider } from "react-native-keyboard-controller";

<ThemeProvider>
	<KeyboardProvider>
		<HapticsProvider
			enabled
			feedback={(kind) => {
				if (kind === "selection") return Haptics.selectionAsync();
				return Haptics.impactAsync();
			}}
		>
			<ToastProvider placement="bottom" maxToasts={3}>
				{children}
			</ToastProvider>
		</HapticsProvider>
	</KeyboardProvider>
</ThemeProvider>;
```

- `ToastProvider` is required before `useToast()` will work; without it the hook
  throws.
- `HapticsProvider` is off unless `enabled` is set, and it does nothing unless
  you hand it a `feedback` implementation. The kit does not depend on
  `expo-haptics`; you supply the driver. Without the provider, `useHaptics()`
  returns a no-op controller.
- `KeyboardProvider` comes from `react-native-keyboard-controller`, not from
  this kit, and is required by `KeyboardAwareScrollView`, `KeyboardStickyView`
  and `KeyboardToolbar`.

## Loading a font

The package ships no font binaries. Install the family in the app, hand the
sources to `FontLoader`, and map the loaded names onto the three semantic roles.

```tsx
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { FontLoader, ThemeProvider } from "@osuki-dev/ui";

const fontSources = { Inter_400Regular, Inter_500Medium, Inter_700Bold };

const theme = {
	fonts: {
		display: { regular: "Inter_400Regular", bold: "Inter_700Bold" },
		body: {
			regular: "Inter_400Regular",
			medium: "Inter_500Medium",
			bold: "Inter_700Bold",
		},
		label: { regular: "Inter_400Regular", medium: "Inter_500Medium" },
	},
};

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<FontLoader fonts={fontSources} fallback={null}>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</FontLoader>
	);
}
```

A role may also point at one native or variable family with
`{ family: "Inter" }`. Weights that are not supplied fall back to the nearest
configured weight, and roles that are not supplied fall back to the system font,
so a partial map is safe.

`FontLoader` takes `fonts`, and an optional `fallback` element rendered while
the files load. If you omit `fallback` it renders children immediately, which
means a brief flash of system font instead of a blank screen. Pick whichever
failure you prefer.

## The first screen

Everything below is real: every import exists in the package root, every prop
name is the one the component declares.

```tsx
import {
	Button,
	Card,
	Icon,
	Screen,
	SearchInput,
	Section,
	Stack,
	Text,
	useThemeTokens,
} from "@osuki-dev/ui";
import { useState } from "react";

export default function HomeScreen() {
	const { colors, spacing } = useThemeTokens();
	const [query, setQuery] = useState("");

	return (
		<Screen variant="page" safeArea="both" style={{ padding: spacing.md }}>
			<Stack direction="vertical" gap="lg">
				<Stack direction="horizontal" gap="sm" align="center">
					<Icon name="Compass" size={20} color={colors.primary} />
					<Text variant="heading">Today</Text>
				</Stack>

				<SearchInput
					value={query}
					onChangeText={setQuery}
					onClear={() => setQuery("")}
					placeholder="Search"
				/>

				<Section title="Getting started" description="Three things worth doing before you ship.">
					<Card variant="raised" border="subtle" padding="lg">
						<Stack direction="vertical" gap="sm">
							<Text variant="subheading">Pick a colour mode</Text>
							<Text variant="bodySmall" colorKey="textMuted">
								The theme follows the system by default. Override it per screen only when the design
								calls for it.
							</Text>
						</Stack>
					</Card>
				</Section>

				<Button variant="primary" onPress={() => {}}>
					Continue
				</Button>
			</Stack>
		</Screen>
	);
}
```

Three things in that snippet are worth naming, because they are the habits the
rest of the kit assumes:

1. `colors` and `spacing` come out of `useThemeTokens()`. No literals.
2. `Text` takes `colorKey="textMuted"`, not `color="#667085"`. `colorKey` reads
   the token by name and therefore survives a mode switch.
3. `Button` takes a plain string child. It is not a slot; passing an element
   will not type-check.

## Where to go next

- [components.md](./components.md) — the full catalogue, grouped by what you are
  trying to do.
- [theme.md](./theme.md) — tokens, dark mode, and wiring in a brand colour.
- [patterns.md](./patterns.md) — whole screens, assembled.
- [conventions.md](./conventions.md) — the rules a reviewer will hold you to.
