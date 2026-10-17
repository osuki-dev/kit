/** Semantic font roles. Apps may add roles and point them at any loaded font. */
export type FontFamily = string;
export type FontWeight = "light" | "regular" | "medium" | "semibold" | "bold";

/**
 * A weight request: a named weight, or a CSS weight from 1 to 1000. A variable
 * face draws a numeric weight exactly; a static family rounds it to the
 * nearest named weight (`fontWeightName`) and then to the nearest one loaded.
 */
export type FontWeightValue = FontWeight | number;

/** One design axis of a variable font, in the font's own user-space units. */
export interface FontAxisRange {
	min: number;
	max: number;
	/** The font's default instance on this axis, from its `fvar` table. */
	default?: number;
}

/**
 * The axes a variable face declares, as its `fvar` table lists them. `wght`
 * is what makes a face variable for the theme; `opsz` follows the text size
 * and `wdth` follows `FontDefinition.width`. Other axes (`slnt`, `ital`, a
 * foundry's upper-case tags) may be listed and stay at the font's default.
 */
export interface VariableFontAxes {
	wght: FontAxisRange;
	opsz?: FontAxisRange;
	wdth?: FontAxisRange;
	[tag: string]: FontAxisRange | undefined;
}

/**
 * A family may use one native/variable family name, or a separately loaded name per weight.
 * Expo font packages commonly use the per-weight form (for example `Inter_400Regular`).
 *
 * A variable face is one loaded file: name it as `family` and declare its
 * `axes`. Every weight then resolves to that family with the weight on its
 * `wght` axis, so a variable face renders its own 700 and above on Android.
 */
export type FontDefinition = Partial<Record<FontWeight, string>> & {
	family?: string;
	/** Declares `family` as a variable face with these axes. */
	axes?: VariableFontAxes;
	/** The `wdth` this role is set at, when the face has a `wdth` axis. */
	width?: number;
	/**
	 * The face draws past its glyph advances (an italic, an oblique, a wide
	 * brush face, or any face the app cannot vouch for, such as a user-supplied
	 * file). On Android, every kit `Text` in this role, including the labels
	 * inside kit components, then appends a thin space so the last glyph is
	 * not clipped at the line edge. `hugSlack={false}` still opts one out.
	 */
	trailingSlack?: boolean;
};

export type FontRegistry = Record<FontFamily, FontDefinition>;
export type NativeFontWeight = "300" | "400" | "500" | "600" | "700";

/** Axis tags to values: the object form of React Native's `fontVariationSettings`. */
export type FontVariationSettings = Readonly<Record<string, number>>;

export interface ResolvedFontStyle {
	fontFamily?: string;
	fontWeight: NativeFontWeight;
	/** Set only for a variable face: `wght`, plus `opsz` and `wdth` when they apply. */
	fontVariationSettings?: FontVariationSettings;
}

export interface ResolveFontStyleOptions {
	/** The size the text is set at. A face with an `opsz` axis follows it. */
	fontSize?: number;
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

const numericFontWeights: Record<FontWeight, number> = {
	light: 300,
	regular: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
};

const weightFallbacks: Record<FontWeight, FontWeight[]> = {
	light: ["light", "regular"],
	regular: ["regular", "medium", "light"],
	medium: ["medium", "semibold", "regular"],
	semibold: ["semibold", "bold", "medium", "regular"],
	bold: ["bold", "semibold", "medium", "regular"],
};

/** The named weight a numeric weight rounds to on a static family. */
export function fontWeightName(weight: FontWeightValue): FontWeight {
	if (typeof weight === "string") return weight;
	if (weight <= 300) return "light";
	if (weight <= 400) return "regular";
	if (weight <= 500) return "medium";
	if (weight <= 600) return "semibold";
	return "bold";
}

function clampToAxis(value: number, axis: FontAxisRange): number {
	return Math.min(axis.max, Math.max(axis.min, value));
}

/**
 * The style for one weight of one font role.
 *
 * A static family walks a fallback ladder to the nearest weight it loaded. A
 * variable family (`axes.wght` and `family` both set) answers with its one
 * face at native weight 400 and puts the requested weight on `wght`, clamped
 * to the font's range. 400 because Android registers a loaded face under the
 * normal style only: a native 700 misses that entry and falls back to the
 * system bold, which is why a static ladder can never reach 700 in an
 * app-loaded face.
 */
export function resolveFontStyle(
	registry: FontRegistry,
	family: FontFamily,
	weight: FontWeightValue = "regular",
	options: ResolveFontStyleOptions = {},
): ResolvedFontStyle {
	const definition = registry[family];
	const axes = definition?.axes;

	if (axes?.wght && definition?.family) {
		const requested = typeof weight === "number" ? weight : numericFontWeights[weight];
		const settings: Record<string, number> = { wght: clampToAxis(requested, axes.wght) };
		if (axes.opsz && options.fontSize !== undefined) {
			settings.opsz = clampToAxis(options.fontSize, axes.opsz);
		}
		if (axes.wdth && definition.width !== undefined) {
			settings.wdth = clampToAxis(definition.width, axes.wdth);
		}
		return {
			fontFamily: definition.family,
			fontWeight: "400",
			fontVariationSettings: settings,
		};
	}

	const named = fontWeightName(weight);
	const loadedWeight = weightFallbacks[named].find(
		(fallbackWeight) => definition?.[fallbackWeight],
	);
	const loadedFamily = loadedWeight ? definition?.[loadedWeight] : undefined;

	return {
		fontFamily: loadedFamily ?? definition?.family,
		fontWeight: nativeFontWeights[loadedWeight ?? named],
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
