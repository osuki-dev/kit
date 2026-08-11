/**
 * Osuki Design System - Navigation Theme Constants
 *
 * These colors align with the Osuki UI design system tokens.
 * @see packages/ui/src/theme/colors.ts
 */

export const NAV_THEME = {
	light: {
		background: "#F5F5F5", // --black
		border: "#E8E8E8", // --border
		card: "#FFFFFF", // --surface
		notification: "#D71921", // --accent
		primary: "#1A1A1A", // --text-primary
		text: "#1A1A1A", // --text-primary
	},
	dark: {
		background: "#000000", // --black (OLED black)
		border: "#222222", // --border
		card: "#111111", // --surface
		notification: "#D71921", // --accent (Osuki red)
		primary: "#FFFFFF", // --text-display
		text: "#E8E8E8", // --text-primary
	},
};

// Export individual tokens for reference
export const OSUKI_TOKENS = {
	accent: "#D71921",
	success: "#4A9E5C",
	warning: "#D4A843",
};
