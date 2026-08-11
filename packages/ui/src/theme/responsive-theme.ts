/**
 * Osuki Design System - Optimized Theme Configuration
 *
 * Provides a comprehensive, developer-friendly theme system with:
 * - Responsive breakpoints and utilities
 * - Type-safe theme tokens
 * - Easy customization via theme extensions
 * - Platform-adaptive values
 */

import { useResponsiveLayout, breakpoints, type Breakpoint } from "../utils/responsive";
import { useMemo } from "react";

// ============================================================================
// Breakpoints
// ============================================================================

export { breakpoints, type Breakpoint };

// ============================================================================
// Responsive Layout Presets
// ============================================================================

/** String or number for responsive dimensions (no null) */
type ResponsiveDimension = string | number;

/**
 * Predefined responsive container max widths
 * Following modern responsive design best practices
 */
export const containerMaxWidths: Record<Breakpoint, ResponsiveDimension> = {
	xs: "100%",
	sm: "100%",
	md: 720,
	lg: 960,
	xl: 1140,
};

/**
 * Predefined responsive page paddings
 */
export const pagePaddings: Record<Breakpoint, number> = {
	xs: 16,
	sm: 20,
	md: 24,
	lg: 32,
	xl: 48,
};

/**
 * Predefined responsive grid columns
 */
export const gridColumns: Record<Breakpoint, number> = {
	xs: 1,
	sm: 2,
	md: 2,
	lg: 3,
	xl: 4,
};

/**
 * Predefined responsive gaps
 */
export const responsiveGaps: Record<Breakpoint, number> = {
	xs: 8,
	sm: 12,
	md: 16,
	lg: 24,
	xl: 32,
};

// ============================================================================
// Form Layout Presets
// ============================================================================

/**
 * Form container max widths - forms should be narrower for better readability
 */
export const formMaxWidths: Record<Breakpoint, ResponsiveDimension> = {
	xs: "100%",
	sm: "100%",
	md: 480,
	lg: 560,
	xl: 640,
};

/**
 * Form field responsive gaps
 */
export const formGaps: Record<Breakpoint, number> = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 20,
	xl: 24,
};

/**
 * Button min widths - responsive
 */
export const buttonMinWidths: Record<Breakpoint, ResponsiveDimension> = {
	xs: "100%",
	sm: "100%",
	md: 120,
	lg: 140,
	xl: 160,
};

// ============================================================================
// Card & Content Presets
// ============================================================================

/**
 * Card padding presets
 */
export const cardPaddings: Record<
	"compact" | "default" | "spacious",
	Record<Breakpoint, number>
> = {
	compact: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 },
	default: { xs: 16, sm: 18, md: 20, lg: 24, xl: 32 },
	spacious: { xs: 20, sm: 24, md: 28, lg: 32, xl: 40 },
};

/**
 * Empty state responsive config
 */
export const emptyStateConfig: {
	maxWidth: Record<Breakpoint, ResponsiveDimension>;
	iconSize: Record<Breakpoint, number>;
	actionMinWidth: Record<Breakpoint, ResponsiveDimension>;
} = {
	maxWidth: { xs: "90%", sm: 320, md: 360, lg: 400, xl: 480 },
	iconSize: { xs: 64, sm: 72, md: 80, lg: 96, xl: 112 },
	actionMinWidth: { xs: "80%", sm: 160, md: 180, lg: 200, xl: 240 },
};

// ============================================================================
// Developer-Friendly Hook
// ============================================================================

export interface ResponsiveTheme {
	/** Current breakpoint */
	breakpoint: Breakpoint;
	/** Current window dimensions */
	window: { width: number; height: number };
	/** Whether current screen is mobile */
	isMobile: boolean;
	/** Whether current screen is tablet */
	isTablet: boolean;
	/** Whether current screen is desktop */
	isDesktop: boolean;
	/** Whether screen is in landscape */
	isLandscape: boolean;
	/** Container max width for current breakpoint */
	containerMaxWidth: ResponsiveDimension;
	/** Page padding for current breakpoint */
	pagePadding: number;
	/** Grid columns for current breakpoint */
	gridColumns: number;
	/** Default gap for current breakpoint */
	gap: number;
	/** Form max width for current breakpoint */
	formMaxWidth: ResponsiveDimension;
	/** Form field gap for current breakpoint */
	formGap: number;
	/** Button min width for current breakpoint */
	buttonMinWidth: ResponsiveDimension;
	/** Card padding preset getters */
	getCardPadding: (variant?: "compact" | "default" | "spacious") => number;
	/** Empty state config for current breakpoint */
	emptyState: {
		maxWidth: ResponsiveDimension;
		iconSize: number;
		actionMinWidth: ResponsiveDimension;
	};
}

/**
 * Comprehensive responsive theme hook
 *
 * Provides all responsive values in one hook for easy access
 *
 * @example
 * ```tsx
 * const theme = useResponsiveTheme();
 *
 * // Use in styles
 * <View style={{ maxWidth: theme.containerMaxWidth, padding: theme.pagePadding }}>
 *
 * // Conditional rendering
 * {theme.isMobile && <MobileMenu />}
 * ```
 */
export function useResponsiveTheme(): ResponsiveTheme {
	const layout = useResponsiveLayout();
	const { breakpoint } = layout;

	return useMemo(
		() => ({
			breakpoint,
			window: { width: layout.width, height: layout.height },
			isMobile: layout.isMobile,
			isTablet: layout.isTablet,
			isDesktop: layout.isDesktop,
			isLandscape: layout.isLandscape,
			containerMaxWidth: containerMaxWidths[breakpoint],
			pagePadding: pagePaddings[breakpoint],
			gridColumns: gridColumns[breakpoint],
			gap: responsiveGaps[breakpoint],
			formMaxWidth: formMaxWidths[breakpoint],
			formGap: formGaps[breakpoint],
			buttonMinWidth: buttonMinWidths[breakpoint],
			getCardPadding: (variant: "compact" | "default" | "spacious" = "default") => {
				return cardPaddings[variant][breakpoint];
			},
			emptyState: {
				maxWidth: emptyStateConfig.maxWidth[breakpoint],
				iconSize: emptyStateConfig.iconSize[breakpoint],
				actionMinWidth: emptyStateConfig.actionMinWidth[breakpoint],
			},
		}),
		[
			breakpoint,
			layout.height,
			layout.isDesktop,
			layout.isLandscape,
			layout.isMobile,
			layout.isTablet,
			layout.width,
		],
	);
}

// ============================================================================
// Layout Helper Functions
// ============================================================================

/**
 * Create responsive style object with breakpoint values
 *
 * @example
 * ```tsx
 * const style = createResponsiveStyle(breakpoint, {
 *   padding: { xs: 16, md: 24, lg: 32 },
 *   maxWidth: { xs: '100%', md: 720 }
 * });
 * ```
 */
export function createResponsiveStyle<T extends Record<string, unknown>>(
	breakpoint: Breakpoint,
	styles: { [K in keyof T]: Record<Breakpoint, T[K]> | T[K] },
): T {
	const result = {} as T;

	for (const key in styles) {
		const value = styles[key];

		if (value && typeof value === "object" && !Array.isArray(value)) {
			// Check if it's a breakpoint map
			const hasBreakpoints = Object.keys(value).some((k) => k in breakpoints);

			if (hasBreakpoints) {
				// It's a breakpoint map, get value for current breakpoint
				(result as Record<string, unknown>)[key] = (value as Record<Breakpoint, unknown>)[
					breakpoint
				];
			} else {
				// It's a regular object value
				(result as Record<string, unknown>)[key] = value;
			}
		} else {
			// It's a primitive value
			(result as Record<string, unknown>)[key] = value;
		}
	}

	return result;
}

// ============================================================================
// Re-export utilities for convenience
// ============================================================================

export {
	useResponsiveLayout,
	type ResponsiveValue,
	getResponsiveValue,
	useResponsiveValue,
	getGridItemWidth,
	useResponsiveGrid,
	useResponsiveFontScale,
	useResponsiveSafeArea,
} from "../utils/responsive";
