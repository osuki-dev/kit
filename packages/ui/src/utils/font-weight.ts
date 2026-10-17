import type { TextStyle } from "react-native";

const NAMED_NATIVE_WEIGHTS: Record<string, number> = {
	thin: 100,
	ultralight: 200,
	light: 300,
	normal: 400,
	regular: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
	condensedBold: 700,
	heavy: 800,
	black: 900,
};

/** A style's `fontWeight` as a number, or undefined when it sets none. */
export function styleFontWeight(value: TextStyle["fontWeight"]): number | undefined {
	if (value === undefined) return undefined;
	if (typeof value === "number") return value;
	const named = NAMED_NATIVE_WEIGHTS[value];
	if (named !== undefined) return named;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : undefined;
}
