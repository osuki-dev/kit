import type { ThemeOverride } from "@osuki-dev/ui";

export type ThemePresetId = "osuki" | "violet" | "mint" | "graphite";

export type ThemePreset = {
	id: ThemePresetId;
	label: string;
	description: string;
	primary: string;
	primarySubtle: string;
	onPrimary: string;
	darkPrimary?: string;
	darkPrimarySubtle: string;
	darkOnPrimary?: string;
};

export const themePresets: ThemePreset[] = [
	{
		id: "osuki",
		label: "Osuki Coral",
		description: "The default Osuki brand accent.",
		primary: "#FF5A4F",
		primarySubtle: "#FFE4E0",
		onPrimary: "#FFFFFF",
		darkPrimarySubtle: "#351815",
	},
	{
		id: "violet",
		label: "Soft Violet",
		description: "A calm editorial accent for premium commerce.",
		primary: "#7C5CFF",
		primarySubtle: "#ECE8FF",
		onPrimary: "#FFFFFF",
		darkPrimarySubtle: "#211A3F",
	},
	{
		id: "mint",
		label: "Fresh Mint",
		description: "A crisp accent for lifestyle and wellness shops.",
		primary: "#16A085",
		primarySubtle: "#DDF8F1",
		onPrimary: "#FFFFFF",
		darkPrimarySubtle: "#0D2D27",
	},
	{
		id: "graphite",
		label: "Graphite",
		description: "A restrained monochrome accent for studio brands.",
		primary: "#111827",
		primarySubtle: "#EEF0F4",
		onPrimary: "#FFFFFF",
		darkPrimary: "#E5E7EB",
		darkPrimarySubtle: "#1F2937",
		darkOnPrimary: "#050B12",
	},
];

export const defaultThemePresetId: ThemePresetId = "osuki";

export function resolveThemePreset(value?: string | null): ThemePreset {
	return (
		themePresets.find((preset) => preset.id === value || preset.label === value) ?? themePresets[0]
	);
}

export function getThemePresetLabel(value?: string | null) {
	return resolveThemePreset(value).label;
}

export function createThemePresetOverride(value?: string | null): ThemeOverride | undefined {
	const preset = resolveThemePreset(value);
	if (preset.id === defaultThemePresetId) return undefined;

	return {
		name: `osuki-${preset.id}`,
		colors: {
			primary: preset.primary,
			onPrimary: preset.onPrimary,
			primarySubtle: preset.primarySubtle,
			info: preset.primary,
		},
		light: {
			colors: {
				primary: preset.primary,
				onPrimary: preset.onPrimary,
				primarySubtle: preset.primarySubtle,
				info: preset.primary,
			},
		},
		dark: {
			colors: {
				primary: preset.darkPrimary ?? preset.primary,
				onPrimary: preset.darkOnPrimary ?? preset.onPrimary,
				primarySubtle: preset.darkPrimarySubtle,
				info: preset.darkPrimary ?? preset.primary,
			},
		},
	};
}
