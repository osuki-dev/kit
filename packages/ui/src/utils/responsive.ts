/**
 * Osuki Design System - Responsive Layout Utilities
 *
 * Modern React Native layout using:
 * - Flexbox (flex, flexDirection, justifyContent, alignItems)
 * - Percentage-based dimensions (width: '50%')
 * - useWindowDimensions hook for responsive updates
 * - Gap properties (rowGap, columnGap, gap)
 * - Breakpoint-based responsive design
 */

import { useWindowDimensions } from "react-native";
import { useMemo } from "react";

// Breakpoint definitions (in points)
export const breakpoints = {
	xs: 0, // Phones portrait
	sm: 375, // Phones landscape / small tablets
	md: 768, // Tablets portrait
	lg: 1024, // Tablets landscape / small laptops
	xl: 1366, // Large tablets / laptops
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Responsive value type - can be a single value or breakpoint map
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * Get current breakpoint based on window width
 */
export function getBreakpoint(width: number): Breakpoint {
	if (width >= breakpoints.xl) return "xl";
	if (width >= breakpoints.lg) return "lg";
	if (width >= breakpoints.md) return "md";
	if (width >= breakpoints.sm) return "sm";
	return "xs";
}

/**
 * Hook to get current breakpoint and responsive utilities
 *
 * @example
 * ```tsx
 * const { breakpoint, isMobile, isTablet, isDesktop } = useResponsiveLayout();
 *
 * // Use responsive values
 * const padding = getResponsiveValue(breakpoint, { xs: 16, md: 24, lg: 32 });
 * ```
 */
export function useResponsiveLayout() {
	const window = useWindowDimensions();
	const breakpoint = useMemo(() => getBreakpoint(window.width), [window.width]);

	return {
		window,
		breakpoint,
		isMobile: breakpoint === "xs" || breakpoint === "sm",
		isTablet: breakpoint === "md" || breakpoint === "lg",
		isDesktop: breakpoint === "xl",
		width: window.width,
		height: window.height,
		isLandscape: window.width > window.height,
		isPortrait: window.width < window.height,
	};
}

/**
 * Get responsive value based on current breakpoint
 *
 * @example
 * ```tsx
 * const padding = getResponsiveValue(breakpoint, {
 *   xs: 16,
 *   md: 24,
 *   lg: 32
 * });
 * ```
 */
export function getResponsiveValue<T>(
	breakpoint: Breakpoint,
	values: Partial<Record<Breakpoint, T>>,
	defaultValue: T,
): T {
	const breakpointsList: Breakpoint[] = ["xl", "lg", "md", "sm", "xs"];
	const currentIndex = breakpointsList.indexOf(breakpoint);

	if (currentIndex === -1) return defaultValue;

	// Find the closest matching breakpoint
	for (let i = currentIndex; i < breakpointsList.length; i++) {
		const bp = breakpointsList[i]!;
		if (values[bp] !== undefined) {
			return values[bp]!;
		}
	}

	return defaultValue;
}

/**
 * Hook to get responsive value that updates with window size
 *
 * @example
 * ```tsx
 * const padding = useResponsiveValue({ xs: 16, md: 24, lg: 32 }, 16);
 * ```
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
	const { breakpoint } = useResponsiveLayout();
	return useMemo(
		() => getResponsiveValue(breakpoint, values, defaultValue),
		[breakpoint, values, defaultValue],
	);
}

/**
 * Responsive spacing values based on theme spacing tokens
 */
export const responsiveSpacing = {
	pagePadding: { xs: "4%", sm: "5%", md: "6%", lg: "8%" },
	sectionGap: { xs: 16, sm: 20, md: 24, lg: 32 },
	cardPadding: { xs: 12, sm: 16, md: 20, lg: 24 },
	inputHeight: { xs: 44, sm: 48, md: 52, lg: 56 },
	buttonMinWidth: { xs: "100%", sm: 120, md: 140, lg: 160 },
	gridColumns: { xs: 1, sm: 2, md: 3, lg: 4 },
} as const;

/**
 * Grid column width calculator
 * Returns percentage width for grid items
 *
 * @example
 * ```tsx
 * const itemWidth = getGridItemWidth(3, 16); // 3 columns with 16px gap
 * // Returns 'calc(33.33% - 10.67px)'
 * ```
 */
export function getGridItemWidth(
	columns: number,
	gap: number,
	containerWidth?: number,
): string | number {
	if (containerWidth) {
		// Calculate exact pixel width
		const totalGap = gap * (columns - 1);
		const itemWidth = (containerWidth - totalGap) / columns;
		return itemWidth;
	}

	// Return percentage-based calc string
	const percentage = 100 / columns;
	const gapAdjustment = (gap * (columns - 1)) / columns;
	return `calc(${percentage}% - ${gapAdjustment}px)`;
}

/**
 * Hook to calculate responsive grid layout
 *
 * @example
 * ```tsx
 * const { columns, itemWidth, gap } = useResponsiveGrid({
 *   xs: 1,
 *   md: 2,
 *   lg: 3
 * }, 16);
 * ```
 */
export function useResponsiveGrid(
	columnConfig: Partial<Record<Breakpoint, number>>,
	gap: number = 16,
) {
	const { breakpoint, width } = useResponsiveLayout();

	const columns = useMemo(() => {
		const breakpointsList: Breakpoint[] = ["xl", "lg", "md", "sm", "xs"];
		const currentIndex = breakpointsList.indexOf(breakpoint);

		if (currentIndex === -1) return 1;

		for (let i = currentIndex; i < breakpointsList.length; i++) {
			const bp = breakpointsList[i]!;
			if (columnConfig[bp] !== undefined) {
				return columnConfig[bp]!;
			}
		}
		return 1;
	}, [breakpoint, columnConfig]);

	const itemWidth = useMemo(() => {
		return getGridItemWidth(columns, gap, width);
	}, [columns, gap, width]);

	return {
		columns,
		itemWidth,
		gap,
	};
}

/**
 * Responsive font size scaler
 * Scales font size based on screen width while keeping it readable
 */
export function useResponsiveFontScale(baseSize: number): number {
	const { width } = useResponsiveLayout();

	return useMemo(() => {
		// Scale factor: larger screens get slightly larger fonts
		if (width >= breakpoints.xl) return baseSize * 1.1;
		if (width >= breakpoints.lg) return baseSize * 1.05;
		if (width >= breakpoints.md) return baseSize * 1.0;
		if (width >= breakpoints.sm) return baseSize * 0.95;
		return baseSize * 0.9;
	}, [width, baseSize]);
}

/**
 * Safe area padding calculator for different screen sizes
 */
export function useResponsiveSafeArea(baseHorizontalPadding: number = 16): {
	horizontal: number;
	top: number;
	bottom: number;
} {
	const { breakpoint } = useResponsiveLayout();

	return useMemo(() => {
		const horizontal = getResponsiveValue(
			breakpoint,
			{ xs: baseHorizontalPadding, md: baseHorizontalPadding * 1.5, lg: baseHorizontalPadding * 2 },
			baseHorizontalPadding,
		);

		return {
			horizontal,
			top: 0,
			bottom: 0,
		};
	}, [breakpoint, baseHorizontalPadding]);
}
