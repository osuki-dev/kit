# UI Customization

`@osuki-dev/ui` should work across commerce, SaaS, finance, health, education,
creator, and internal operations apps without forking components.

## Fonts belong to the app

The UI package uses platform system fonts by default and ships no font binaries. Applications own
font licensing, installation, and loading. Map any loaded family to the theme's semantic `display`,
`body`, and `label` roles; reusable components resolve those roles instead of naming a brand font.

```tsx
const appTheme = {
	fonts: {
		display: { family: "Brand Display" },
		body: { family: "Brand Text" },
		label: { family: "Brand Text" },
	},
};
```

For Expo font packages that expose one registered name per weight, provide `regular`, `medium`, and
`bold` names instead. Use the generic `FontLoader` when runtime loading is needed.

The intended customization layers are:

1. Theme preset: brand color, density, shape, and semantic tone.
2. Theme override: exact token replacement for a specific product.
3. Component props: local layout, copy, icon, and state control.
4. Business composition: app-specific screens outside `packages/ui`.

## Theme Presets

Use `createThemePreset` for most apps:

```tsx
import { ThemeProvider, createThemePreset } from "@osuki-dev/ui";

const theme = createThemePreset({
	name: "acme-commerce",
	tone: "commerce",
	primary: "#E5484D",
	density: "comfortable",
	shape: "rounded",
});

export function AppProviders({ children }: { children: React.ReactNode }) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

Available tone starting points:

- `commerce`
- `saas`
- `finance`
- `health`
- `education`
- `creator`
- `neutral`

Available density modes:

- `compact`: dashboards, settings, data-heavy operations.
- `comfortable`: default app UX.
- `spacious`: editorial, creator, onboarding, and content-heavy screens.

Available shape modes:

- `sharp`: dense professional tools.
- `soft`: default balanced shape.
- `rounded`: consumer, wellness, creator, and education apps.

## Direct Overrides

When a product needs exact control, use normal theme overrides:

```tsx
<ThemeProvider
	theme={{
		light: {
			colors: {
				primary: "#0055FF",
				primarySubtle: "rgba(0, 85, 255, 0.12)",
			},
		},
		components: {
			Button: { height: 48 },
			Input: { radius: "md" },
		},
	}}
>
	<App />
</ThemeProvider>
```

## Boundary

Do not create industry-specific UI inside `packages/ui`. A finance app and a
commerce app both need `MetricCard`, `DataRow`, `Section`, `Tabs`, and
`RadioGroup`. The product-specific meaning belongs in app code or
`kit-community`.
