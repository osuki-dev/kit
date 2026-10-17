/**
 * Color utility for alpha blending and opacity transformations.
 */

interface Rgba {
	red: number;
	green: number;
	blue: number;
	alpha: number;
}

/** Parses #rgb, #rgba, #rrggbb, #rrggbbaa, rgb() and rgba(). */
function parseColor(color: string): Rgba | null {
	const hex = color.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)?.[1];
	if (hex) {
		const full =
			hex.length <= 4
				? Array.from(hex)
						.map((digit) => digit + digit)
						.join("")
				: hex;
		return {
			red: Number.parseInt(full.slice(0, 2), 16),
			green: Number.parseInt(full.slice(2, 4), 16),
			blue: Number.parseInt(full.slice(4, 6), 16),
			alpha: full.length === 8 ? Number.parseInt(full.slice(6, 8), 16) / 255 : 1,
		};
	}

	const rgb = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
	if (rgb && rgb[1] && rgb[2] && rgb[3]) {
		return {
			red: Number(rgb[1]),
			green: Number(rgb[2]),
			blue: Number(rgb[3]),
			alpha: rgb[4] === undefined ? 1 : Number(rgb[4]),
		};
	}
	return null;
}

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}

function toRgba({ red, green, blue, alpha }: Rgba): string {
	return `rgba(${red}, ${green}, ${blue}, ${Math.round(alpha * 1000) / 1000})`;
}

/**
 * Returns the color with its alpha *replaced* by `alpha` (0 to 1). Use it for
 * a tint of a solid color. Unparseable colors are returned unchanged.
 */
export function withAlpha(color: string, alpha: number): string {
	if (!color) return color;
	const parsed = parseColor(color);
	if (!parsed) return color;
	return toRgba({ ...parsed, alpha: clamp01(alpha) });
}

/**
 * Returns the color with its alpha *multiplied* by `opacity` (0 to 1), so a
 * color that is already translucent stays proportionally so. This is the one
 * to use for an opacity policy in `transformBackground`: `withAlpha` would make
 * a subtle translucent token more opaque. Unparseable colors and
 * `transparent` are returned unchanged.
 */
export function multiplyAlpha(color: string, opacity: number): string {
	if (!color) return color;
	const parsed = parseColor(color);
	if (!parsed) return color;
	return toRgba({ ...parsed, alpha: parsed.alpha * clamp01(opacity) });
}
