/**
 * Color utility for alpha blending and opacity transformations.
 */

/**
 * Returns the color with the given alpha value (0 to 1).
 * Supports 3-digit and 6-digit hex (#rgb, #rrggbb), rgb, and rgba formats.
 */
export function withAlpha(color: string, alpha: number): string {
	if (!color) return color;
	const clampedAlpha = Math.max(0, Math.min(1, alpha));

	const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
	if (hexMatch) {
		let fullHex = hexMatch;
		if (hexMatch.length === 3) {
			fullHex = `${hexMatch[0]}${hexMatch[0]}${hexMatch[1]}${hexMatch[1]}${hexMatch[2]}${hexMatch[2]}`;
		}
		const red = Number.parseInt(fullHex.slice(0, 2), 16);
		const green = Number.parseInt(fullHex.slice(2, 4), 16);
		const blue = Number.parseInt(fullHex.slice(4, 6), 16);
		return `rgba(${red}, ${green}, ${blue}, ${clampedAlpha})`;
	}

	const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/i);
	if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
		return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${clampedAlpha})`;
	}

	return color;
}
