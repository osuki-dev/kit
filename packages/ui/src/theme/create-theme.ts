import { spacing } from "./spacing";
import { radius, motion, shadow, iconography } from "./motion";
import { fonts, typeStyles } from "./typography";
import {
	commerceTokens,
	componentTokens,
	osukiDarkColors,
	osukiLightColors,
	semanticTokens,
} from "./tokens";
import type { DeepPartial, OsukiTheme, ResolvedThemeMode, ThemeOverride } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
	if (!override) return base;
	const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
	for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
		if (value === undefined) continue;
		const current = result[key];
		result[key] = isRecord(current) && isRecord(value) ? deepMerge(current, value) : value;
	}
	return result as T;
}

export function createBaseTheme(mode: ResolvedThemeMode): OsukiTheme {
	return {
		name: "osuki-" + mode,
		mode,
		colors: mode === "dark" ? osukiDarkColors : osukiLightColors,
		semantic: semanticTokens,
		commerce: commerceTokens,
		spacing,
		radius,
		motion,
		shadow,
		iconography,
		typeStyles,
		typography: typeStyles,
		fonts,
		components: componentTokens,
	};
}

export function extendTheme(
	base: OsukiTheme,
	override?: DeepPartial<Omit<OsukiTheme, "mode">>,
): OsukiTheme {
	return deepMerge(base, override as DeepPartial<OsukiTheme>);
}

export function createTheme(mode: ResolvedThemeMode, override?: ThemeOverride): OsukiTheme {
	const base = createBaseTheme(mode);
	const modeOverride = mode === "dark" ? override?.dark : override?.light;
	return extendTheme(extendTheme(base, override), modeOverride);
}
