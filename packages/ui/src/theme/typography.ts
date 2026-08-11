/** Semantic font roles. Apps may add roles and point them at any loaded font. */
export type FontFamily = string;
export type FontWeight = "light" | "regular" | "medium" | "semibold" | "bold";

/**
 * A family may use one native/variable family name, or a separately loaded name per weight.
 * Expo font packages commonly use the per-weight form (for example `Inter_400Regular`).
 */
export type FontDefinition = Partial<Record<FontWeight, string>> & {
	family?: string;
};

export type FontRegistry = Record<FontFamily, FontDefinition>;
export type NativeFontWeight = "300" | "400" | "500" | "600" | "700";
export interface ResolvedFontStyle {
	fontFamily?: string;
	fontWeight: NativeFontWeight;
}

/** System-font defaults keep the UI package font-agnostic and asset-free. */
export const fonts: FontRegistry = {
	display: {},
	body: {},
	label: {},
};

const nativeFontWeights: Record<FontWeight, NativeFontWeight> = {
	light: "300",
	regular: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
};

const weightFallbacks: Record<FontWeight, FontWeight[]> = {
	light: ["light", "regular"],
	regular: ["regular", "medium", "light"],
	medium: ["medium", "semibold", "regular"],
	semibold: ["semibold", "bold", "medium", "regular"],
	bold: ["bold", "semibold", "medium", "regular"],
};

export function resolveFontStyle(
	registry: FontRegistry,
	family: FontFamily,
	weight: FontWeight = "regular",
): ResolvedFontStyle {
	const definition = registry[family];
	const loadedWeight = weightFallbacks[weight].find(
		(fallbackWeight) => definition?.[fallbackWeight],
	);
	const loadedFamily = loadedWeight ? definition?.[loadedWeight] : undefined;

	return {
		fontFamily: loadedFamily ?? definition?.family,
		fontWeight: nativeFontWeights[loadedWeight ?? weight],
	};
}

// Type scale tokens
export const typeScale = {
	// 72px - Hero numbers, time displays
	displayXl: { size: 72, lineHeight: 1.0, letterSpacing: 0 },

	// 48px - Section heroes, percentages
	displayLg: { size: 48, lineHeight: 1.05, letterSpacing: 0 },

	// 36px - Page titles
	displayMd: { size: 36, lineHeight: 1.1, letterSpacing: 0 },

	// 24px - Section headings
	heading: { size: 24, lineHeight: 1.2, letterSpacing: 0 },

	// 18px - Subsections
	subheading: { size: 18, lineHeight: 1.3, letterSpacing: 0 },

	// 16px - Body text
	body: { size: 16, lineHeight: 1.5, letterSpacing: 0 },

	// 14px - Secondary body
	bodySm: { size: 14, lineHeight: 1.5, letterSpacing: 0 },

	// 12px - Timestamps, footnotes
	caption: { size: 12, lineHeight: 1.4, letterSpacing: 0 },

	// 11px - ALL CAPS monospace labels (instrument panel style)
	label: { size: 11, lineHeight: 1.2, letterSpacing: 0 },
} as const;

export type TypeToken = keyof typeof typeScale;

export interface TypeStyle {
	fontFamily: FontFamily;
	fontSize: number;
	lineHeight: number;
	letterSpacing: number;
	fontWeight: number;
	textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

// Predefined type styles following the Three-Layer Rule
export const typeStyles = {
	// Layer 1: Primary - The ONE thing the user sees first
	hero: {
		fontFamily: "display",
		fontSize: typeScale.displayXl.size,
		lineHeight: typeScale.displayXl.lineHeight,
		letterSpacing: typeScale.displayXl.letterSpacing,
		fontWeight: 700,
	},
	display: {
		fontFamily: "display",
		fontSize: typeScale.displayLg.size,
		lineHeight: typeScale.displayLg.lineHeight,
		letterSpacing: typeScale.displayLg.letterSpacing,
		fontWeight: 400,
	},

	// Layer 2: Secondary - Supporting context
	heading: {
		fontFamily: "body",
		fontSize: typeScale.heading.size,
		lineHeight: typeScale.heading.lineHeight,
		letterSpacing: typeScale.heading.letterSpacing,
		fontWeight: 500,
	},
	subheading: {
		fontFamily: "body",
		fontSize: typeScale.subheading.size,
		lineHeight: typeScale.subheading.lineHeight,
		letterSpacing: typeScale.subheading.letterSpacing,
		fontWeight: 400,
	},
	body: {
		fontFamily: "body",
		fontSize: typeScale.body.size,
		lineHeight: typeScale.body.lineHeight,
		letterSpacing: typeScale.body.letterSpacing,
		fontWeight: 400,
	},
	bodySmall: {
		fontFamily: "body",
		fontSize: typeScale.bodySm.size,
		lineHeight: typeScale.bodySm.lineHeight,
		letterSpacing: typeScale.bodySm.letterSpacing,
		fontWeight: 400,
	},

	// Layer 3: Tertiary - Metadata, navigation, system info
	caption: {
		fontFamily: "label",
		fontSize: typeScale.caption.size,
		lineHeight: typeScale.caption.lineHeight,
		letterSpacing: typeScale.caption.letterSpacing,
		fontWeight: 400,
	},
	label: {
		fontFamily: "label",
		fontSize: typeScale.label.size,
		lineHeight: typeScale.label.lineHeight,
		letterSpacing: typeScale.label.letterSpacing,
		fontWeight: 400,
		textTransform: "uppercase",
	},

	// Data-specific styles
	dataLarge: {
		fontFamily: "label",
		fontSize: typeScale.displayMd.size,
		lineHeight: typeScale.displayMd.lineHeight,
		letterSpacing: typeScale.displayMd.letterSpacing,
		fontWeight: 700,
	},
	data: {
		fontFamily: "label",
		fontSize: typeScale.body.size,
		lineHeight: typeScale.body.lineHeight,
		letterSpacing: typeScale.body.letterSpacing,
		fontWeight: 400,
	},
	button: {
		fontFamily: "label",
		fontSize: 13,
		lineHeight: 1.2,
		letterSpacing: 0,
		fontWeight: 400,
		textTransform: "uppercase",
	},
} as const satisfies Record<string, TypeStyle>;

export type TypeStyleName = keyof typeof typeStyles;
export type TypographyStyles = Record<TypeStyleName, TypeStyle>;
