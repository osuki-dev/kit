import type { ColorMode, CommerceTokens, ThemeColors, ThemeOverride } from "./types";

export type ThemeDensity = "compact" | "comfortable" | "spacious";
export type ThemeShape = "sharp" | "soft" | "rounded";
export type ThemeTone =
	| "neutral"
	| "commerce"
	| "saas"
	| "finance"
	| "health"
	| "education"
	| "creator"
	| "fashion"
	| "beauty"
	| "grocery"
	| "restaurant"
	| "fitness"
	| "electronics";

export interface ThemePresetOptions {
	name?: string;
	primary?: string;
	tone?: ThemeTone;
	density?: ThemeDensity;
	shape?: ThemeShape;
	light?: Partial<ThemeColors>;
	dark?: Partial<ThemeColors>;
	commerce?: Partial<CommerceTokens>;
}

export type IndustryThemePresetId =
	| "commerce"
	| "fashion"
	| "beauty"
	| "grocery"
	| "restaurant"
	| "fitness"
	| "electronics"
	| "saas"
	| "finance"
	| "health"
	| "education"
	| "creator";

export interface ThemePresetDefinition {
	id: IndustryThemePresetId;
	label: string;
	description: string;
	options: ThemePresetOptions;
	override: ThemeOverride;
}

const tonePrimary: Record<ThemeTone, string> = {
	neutral: "#3E63FF",
	commerce: "#FF5A4A",
	saas: "#2563EB",
	finance: "#087443",
	health: "#079455",
	education: "#7F56D9",
	creator: "#E31B54",
	fashion: "#111827",
	beauty: "#D946A0",
	grocery: "#159947",
	restaurant: "#C2410C",
	fitness: "#E11D48",
	electronics: "#2563EB",
};

const densityOverrides: Record<ThemeDensity, ThemeOverride> = {
	compact: {
		spacing: { sm: 6, md: 12, lg: 20, xl: 28 },
		components: {
			Button: { height: 40, paddingX: "md", paddingY: "xs" },
			Input: { paddingY: "xs" },
			Card: { padding: { sm: "xs", md: "sm", lg: "md" } },
		},
	},
	comfortable: {},
	spacious: {
		spacing: { md: 18, lg: 28, xl: 40, "2xl": 56, "3xl": 72 },
		components: {
			Button: { height: 48, paddingX: "lg", paddingY: "md" },
			Input: { paddingY: "md" },
			Card: { padding: { sm: "md", md: "lg", lg: "xl" } },
		},
	},
};

const shapeOverrides: Record<ThemeShape, ThemeOverride> = {
	sharp: {
		radius: { xs: 2, sm: 4, md: 6, lg: 8, pill: 10 },
		components: {
			Button: { radius: "sm" },
			Input: { radius: "sm" },
			Card: { radius: { sm: "xs", md: "sm", lg: "md" } },
		},
	},
	soft: {},
	rounded: {
		radius: { xs: 6, sm: 10, md: 16, lg: 22, pill: 999 },
		components: {
			Button: { radius: "pill" },
			Input: { radius: "lg" },
			Card: { radius: { sm: "md", md: "lg", lg: "lg" } },
		},
	},
};

const commerceDefaults: Record<ThemeTone, Partial<CommerceTokens>> = {
	neutral: {},
	commerce: {},
	saas: { productCardRadius: "md", productImageRadius: "sm", productImageAspectRatio: 1.12 },
	finance: { productCardRadius: "sm", productImageRadius: "xs", productImageAspectRatio: 1.18 },
	health: { productImageRadius: "lg", productImageAspectRatio: 0.92 },
	education: { productImageRadius: "lg", productImageAspectRatio: 1 },
	creator: { productCardRadius: "lg", productImageRadius: "lg", productImageAspectRatio: 0.82 },
	fashion: { productCardRadius: "md", productImageRadius: "sm", productImageAspectRatio: 0.76 },
	beauty: { productCardRadius: "lg", productImageRadius: "lg", productImageAspectRatio: 0.9 },
	grocery: { productCardRadius: "md", productImageRadius: "md", productImageAspectRatio: 1 },
	restaurant: { productCardRadius: "lg", productImageRadius: "lg", productImageAspectRatio: 1.22 },
	fitness: { productCardRadius: "md", productImageRadius: "sm", productImageAspectRatio: 0.88 },
	electronics: { productCardRadius: "lg", productImageRadius: "md", productImageAspectRatio: 1 },
};

export function createThemePreset(options: ThemePresetOptions = {}): ThemeOverride {
	const tone = options.tone ?? "commerce";
	const primary = options.primary ?? tonePrimary[tone];
	const density = options.density ?? "comfortable";
	const shape = options.shape ?? "soft";
	const light = createModeColors("light", primary, options.light);
	const dark = createModeColors("dark", primary, options.dark);
	const base: ThemeOverride = {
		commerce: {
			...commerceDefaults[tone],
			...options.commerce,
		},
		light: { colors: light },
		dark: { colors: dark },
	};
	if (options.name) base.name = options.name;

	return mergeThemeOverrides(base, densityOverrides[density], shapeOverrides[shape]);
}

function defineThemePreset(
	id: IndustryThemePresetId,
	label: string,
	description: string,
	options: ThemePresetOptions,
): ThemePresetDefinition {
	return {
		id,
		label,
		description,
		options,
		override: createThemePreset({ name: id, ...options }),
	};
}

export const themePresetRegistry = [
	defineThemePreset(
		"commerce",
		"Commerce Core",
		"Balanced mobile storefront rhythm for broad commerce apps.",
		{ tone: "commerce" },
	),
	defineThemePreset(
		"fashion",
		"Fashion Atelier",
		"Editorial spacing, sharper product cards, and tall product imagery.",
		{
			tone: "fashion",
			density: "spacious",
			shape: "sharp",
			light: {
				background: "#FAF7F3",
				surfaceRaised: "#F1ECE5",
				primarySubtle: "#EEE7DD",
			},
			dark: {
				primary: "#F8FAFC",
				primarySubtle: "#24201B",
				onPrimary: "#050B12",
			},
		},
	),
	defineThemePreset(
		"beauty",
		"Beauty Studio",
		"Soft surfaces, rounded controls, and polished campaign commerce.",
		{
			tone: "beauty",
			density: "comfortable",
			shape: "rounded",
			light: {
				background: "#FFF8FB",
				surfaceRaised: "#FDECF5",
				primarySubtle: "#FCE7F3",
			},
			dark: {
				primarySubtle: "#3B132C",
			},
		},
	),
	defineThemePreset(
		"grocery",
		"Grocery Fresh",
		"Compact density for repeat shopping and fast basket building.",
		{
			tone: "grocery",
			density: "compact",
			shape: "soft",
			light: {
				background: "#F8FAF6",
				surfaceRaised: "#EEF6E9",
				primarySubtle: "#DCFCE7",
			},
			dark: {
				primarySubtle: "#0F2E1D",
			},
		},
	),
	defineThemePreset(
		"restaurant",
		"Restaurant Orders",
		"Warm surfaces, rounded food imagery, and checkout-forward accents.",
		{
			tone: "restaurant",
			density: "comfortable",
			shape: "rounded",
			light: {
				background: "#FFF8F1",
				surfaceRaised: "#FEEFD8",
				primarySubtle: "#FFEDD5",
			},
			dark: {
				primarySubtle: "#3A1A0B",
			},
		},
	),
	defineThemePreset(
		"fitness",
		"Fitness Gear",
		"Compact, high-contrast controls for energetic product catalogs.",
		{
			tone: "fitness",
			density: "compact",
			shape: "sharp",
			light: {
				background: "#FFF7F8",
				surfaceRaised: "#FFE4E9",
				primarySubtle: "#FFE4E9",
			},
			dark: {
				primarySubtle: "#3B101A",
			},
		},
	),
	defineThemePreset(
		"electronics",
		"Electronics Pro",
		"Dense technical cards, crisp blue accents, and clean comparison views.",
		{
			tone: "electronics",
			density: "compact",
			shape: "soft",
			light: {
				background: "#F8FAFC",
				surfaceRaised: "#EEF4FF",
				primarySubtle: "#DBEAFE",
			},
			dark: {
				primarySubtle: "#10264D",
			},
		},
	),
	defineThemePreset("saas", "SaaS Console", "Compact operational density for B2B apps.", {
		tone: "saas",
		density: "compact",
	}),
	defineThemePreset(
		"finance",
		"Finance Desk",
		"Sharp, compact surfaces for data-heavy workflows.",
		{
			tone: "finance",
			density: "compact",
			shape: "sharp",
		},
	),
	defineThemePreset(
		"health",
		"Health Companion",
		"Rounded, calm surfaces for care and wellness apps.",
		{
			tone: "health",
			shape: "rounded",
		},
	),
	defineThemePreset(
		"education",
		"Education Hub",
		"Rounded learning surfaces with approachable hierarchy.",
		{ tone: "education", shape: "rounded" },
	),
	defineThemePreset("creator", "Creator Studio", "Spacious editorial rhythm for creator tools.", {
		tone: "creator",
		density: "spacious",
	}),
] as const satisfies readonly ThemePresetDefinition[];

export const themePresets = Object.fromEntries(
	themePresetRegistry.map((preset) => [preset.id, preset.override]),
) as Record<IndustryThemePresetId, ThemeOverride>;

export const themePresetById = new Map<IndustryThemePresetId, ThemePresetDefinition>(
	themePresetRegistry.map((preset) => [preset.id, preset]),
);

const themePresetByLabel = new Map<string, ThemePresetDefinition>(
	themePresetRegistry.map((preset) => [preset.label, preset]),
);

export function resolveThemePresetDefinition(
	value?: string | null,
	fallback: IndustryThemePresetId = "commerce",
): ThemePresetDefinition {
	return (
		themePresetById.get(value as IndustryThemePresetId) ??
		themePresetByLabel.get(value ?? "") ??
		themePresetById.get(fallback) ??
		themePresetRegistry[0]
	);
}

function createModeColors(
	mode: ColorMode,
	primary: string,
	override?: Partial<ThemeColors>,
): Partial<ThemeColors> {
	return {
		primary,
		onPrimary: mode === "dark" ? "#050B12" : "#FCFBFA",
		primarySubtle: toRgba(primary, mode === "dark" ? 0.24 : 0.14),
		info: mode === "dark" ? "#84ADFF" : "#3E63FF",
		...override,
	};
}

function mergeThemeOverrides(...overrides: ThemeOverride[]): ThemeOverride {
	return overrides.reduce<ThemeOverride>((merged, override) => mergeRecords(merged, override), {});
}

function mergeRecords<T extends Record<string, unknown>>(base: T, override: T): T {
	const result: Record<string, unknown> = { ...base };
	for (const [key, value] of Object.entries(override)) {
		if (value === undefined) continue;
		const current = result[key];
		result[key] =
			isPlainRecord(current) && isPlainRecord(value) ? mergeRecords(current, value) : value;
	}
	return result as T;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toRgba(hex: string, alpha: number): string {
	const normalized = hex.replace("#", "").trim();
	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return hex;
	const r = Number.parseInt(normalized.slice(0, 2), 16);
	const g = Number.parseInt(normalized.slice(2, 4), 16);
	const b = Number.parseInt(normalized.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
