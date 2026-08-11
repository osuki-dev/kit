/**
 * Osuki Design System - Spacing Tokens
 * 8px base grid, meaningful spacing relationships
 */

export const spacing = {
	// 2px - Optical adjustments only
	"2xs": 2,

	// 4px - Icon-to-label gaps, tight padding
	xs: 4,

	// 8px - Component internal spacing
	sm: 8,

	// 16px - Standard padding, element gaps
	md: 16,

	// 24px - Group separation
	lg: 24,

	// 32px - Section margins
	xl: 32,

	// 48px - Major section breaks
	"2xl": 48,

	// 64px - Page-level vertical rhythm
	"3xl": 64,

	// 96px - Hero breathing room
	"4xl": 96,
} as const;

export type SpacingToken = keyof typeof spacing;

/**
 * Spacing semantics:
 * - Tight (4-8px): "These belong together" (icon + label, number + unit)
 * - Medium (16px): "Same group, different items" (list items, form fields)
 * - Wide (32-48px): "New group starts here" (section breaks)
 * - Vast (64-96px): "This is a new context" (hero to content, major divisions)
 */
