# Spec: template-style-overrides

Scope: feature

# Template Style Override Specification

## Overview

Provide a unified style override capability for all templates, covering container, header, and content area styles as well as specific component styles.

## Core interfaces

### BaseStyleOverrides

The base style override interface shared by all templates:

```typescript
interface BaseStyleOverrides {
	// Outermost container style
	container?: ViewStyle;
	// Header area style (contains the title, subtitle, and action buttons)
	header?: ViewStyle;
	// Content area style
	content?: ViewStyle;
	// Footer area style (usually contains action buttons)
	footer?: ViewStyle;
	// Scroll view style
	scrollView?: ScrollViewProps["style"];
	// Content container padding
	contentPadding?: ResponsiveValue<number>;
}
```

### ComponentStyleOverrides

The map of overridable component styles:

```typescript
interface ComponentStyleOverrides {
	// Button style overrides
	button?: {
		variant?: ButtonVariant;
		size?: ButtonSize;
		style?: ViewStyle;
	};
	// Card style overrides
	card?: {
		variant?: CardVariant;
		padding?: SpacingToken;
		style?: ViewStyle;
	};
	// Input style overrides
	input?: {
		variant?: InputVariant;
		size?: InputSize;
		style?: ViewStyle;
	};
	// Text style overrides
	text?: {
		variant?: TextVariant;
		style?: TextStyle;
	};
	// List item style overrides
	listItem?: {
		style?: ViewStyle;
		iconSize?: number;
	};
}
```

### TemplateProps base

All template props extend this base:

```typescript
interface TemplateProps {
	// Style override configuration
	styleOverrides?: BaseStyleOverrides & {
		components?: ComponentStyleOverrides;
	};
	// Theme override (local theme)
	themeOverride?: Partial<Theme>;
	// Whether to disable the default styles
	disableDefaultStyles?: boolean;
}
```

## Template-specific overrides

### ProductScreen additional overrides

```typescript
interface ProductScreenStyleOverrides extends BaseStyleOverrides {
	// Product image section
	imageSection?: ViewStyle;
	// Product info section (title, price, description)
	infoSection?: ViewStyle;
	// Spec selection section
	specsSection?: ViewStyle;
	// Purchase button section
	purchaseSection?: ViewStyle;
	// Recommended products section
	recommendationsSection?: ViewStyle;
}
```

### CartScreen additional overrides

```typescript
interface CartScreenStyleOverrides extends BaseStyleOverrides {
	// Item style
	item?: ViewStyle;
	// Item image style
	itemImage?: ViewStyle;
	// Item info style
	itemInfo?: ViewStyle;
	// Quantity controls style
	quantityControls?: ViewStyle;
	// Checkout summary section
	summarySection?: ViewStyle;
}
```

### ArticleScreen additional overrides

```typescript
interface ArticleScreenStyleOverrides extends BaseStyleOverrides {
	// Article title style
	title?: TextStyle;
	// Author info section
	authorSection?: ViewStyle;
	// Article body style
	body?: TextStyle;
	// Image style
	image?: ImageStyle;
	// Tags section style
	tagsSection?: ViewStyle;
}
```

### CalendarScreen additional overrides

```typescript
interface CalendarScreenStyleOverrides extends BaseStyleOverrides {
	// Calendar header (year and month, navigation buttons)
	calendarHeader?: ViewStyle;
	// Weekday header row
	weekDaysHeader?: ViewStyle;
	// Day cell style
	dayCell?: ViewStyle;
	// Selected day style
	selectedDay?: ViewStyle;
	// Today cell style
	todayCell?: ViewStyle;
	// Event indicator style
	eventIndicator?: ViewStyle;
}
```

## Style precedence

Styles are applied in the following order of precedence (highest to lowest):

1. **Inline dynamic styles** - the most specific styles, computed by the component at runtime
2. **styleOverrides** - custom styles passed in by the user
3. **themeOverride** - a local theme passed in by the user
4. **Default template styles** - the template's built-in default styles
5. **Global theme** - the app-level theme configuration

## Usage examples

### Basic style overrides

```tsx
<ProductScreen
	config={productConfig}
	styleOverrides={{
		container: { backgroundColor: "#f5f5f5" },
		header: { paddingTop: 20 },
		content: { gap: 16 },
	}}
/>
```

### Component style overrides

```tsx
<CartScreen
	config={cartConfig}
	styleOverrides={{
		container: { padding: 16 },
		components: {
			button: {
				variant: "primary",
				style: { borderRadius: 8 },
			},
			card: {
				variant: "flat",
				padding: "md",
			},
		},
	}}
/>
```

### Theme override

```tsx
<ArticleScreen
	config={articleConfig}
	themeOverride={{
		colors: {
			textPrimary: "#333333",
			textSecondary: "#666666",
		},
		typography: {
			body: {
				fontSize: 16,
				lineHeight: 1.6,
			},
		},
	}}
/>
```

### Fully custom (default styles disabled)

```tsx
<ErrorScreen
	config={errorConfig}
	disableDefaultStyles
	styleOverrides={{
		container: customContainerStyle,
		content: customContentStyle,
	}}
/>
```

## Responsive styles

Style overrides support responsive values:

```typescript
type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

interface ResponsiveStyleOverrides extends BaseStyleOverrides {
	container?: ResponsiveValue<ViewStyle>;
	contentPadding?: ResponsiveValue<number>;
}
```

Usage example:

```tsx
<ProductScreen
	styleOverrides={{
		container: {
			xs: { padding: 12 },
			md: { padding: 24 },
			lg: { padding: 32 },
		},
	}}
/>
```

## Implementation requirements

1. Every template must accept a `styleOverrides` prop
2. Merge styles with `StyleSheet.flatten()` or the array form
3. Component styles are passed to child components through Context
4. Support TypeScript type inference
5. Style overrides must not break the template's responsive behavior

## Style merge utilities

```typescript
// Merge the default style with the user's override style
function mergeStyles<T>(defaultStyle: T, override?: T, disableDefault?: boolean): T {
	if (disableDefault) return override || ({} as T);
	if (!override) return defaultStyle;

	return {
		...defaultStyle,
		...override,
	};
}

// Resolve responsive styles
function resolveResponsiveStyle<T>(style: ResponsiveValue<T>, breakpoint: Breakpoint): T {
	if (typeof style !== "object" || !("xs" in style)) {
		return style as T;
	}

	const { xs, sm, md, lg, xl, ...base } = style as Record<string, T>;
	const breakpointValue = { xs, sm, md, lg, xl }[breakpoint];

	return breakpointValue || base || xs || ({} as T);
}
```

## Testing requirements

1. Each template's style overrides must pass visual regression tests
2. Verify that style precedence is applied correctly
3. Test how responsive styles behave at different screen sizes
4. Test the `disableDefaultStyles` behavior
5. Verify that theme overrides do not affect other screens
