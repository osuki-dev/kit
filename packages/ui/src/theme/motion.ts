/**
 * Motion & Interaction Tokens
 * Percussive, mechanical precision — no spring, no bounce
 */

export const motion = {
	// Durations
	micro: 150, // Micro-interactions
	short: 200, // Button states, toggles
	medium: 300, // Transitions, modals
	long: 400, // Page transitions

	// Easing
	// Subtle ease-out only — no spring/bounce
	easeOut: [0.25, 0.1, 0.25, 1] as const,

	// Common timing presets
	button: { duration: 200, easing: [0.25, 0.1, 0.25, 1] as const },
	toggle: { duration: 200, easing: [0.25, 0.1, 0.25, 1] as const },
	segmented: { duration: 200, easing: [0.25, 0.1, 0.25, 1] as const },
	modal: { duration: 300, easing: [0.25, 0.1, 0.25, 1] as const },
	dropdown: { duration: 150, easing: [0.25, 0.1, 0.25, 1] as const },
} as const;

/**
 * Border Radius Tokens
 * Pill for buttons, technical for cards/inputs
 */
export const radius = {
	none: 0,
	xs: 4, // Technical inputs, compact cards
	sm: 8, // Standard inputs
	md: 12, // Cards
	lg: 16, // Large cards, bottom sheets
	pill: 999, // Buttons, tags
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Shadow is used as a very soft ambient lift for floating pills and primary cards.
 * It must stay subtle; structure should still come from surface hierarchy.
 */
export const shadow = {
	none: {
		shadowColor: "transparent",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
	soft: {
		boxShadow: "0 6px 18px rgba(5, 11, 18, 0.045)",
	},
	pill: {
		boxShadow: "0 4px 14px rgba(5, 11, 18, 0.045)",
	},
} as const;

/**
 * Icon specs
 * Monoline, 1.5px stroke, no fill
 */
export const iconography = {
	strokeWidth: 1.5,
	baseSize: 24,
	liveArea: 20,
	caps: "round" as const,
	joins: "round" as const,
};
