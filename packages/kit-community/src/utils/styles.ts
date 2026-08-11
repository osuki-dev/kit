/**
 * Theme-aware styling utilities for @osuki-dev/kit-community
 *
 * Performance considerations:
 * - StyleSheet.create() is only called once per component (static styles)
 * - Dynamic values (colors, spacing) are applied inline
 * - No new style objects created on every render
 * - spacing(), radius() are memoized in useTheme hook
 */

import { StyleSheet, type ViewStyle, type TextStyle } from "react-native";

// Static base styles - created once
export const createBaseStyles = <T extends Record<string, ViewStyle | TextStyle>>(styles: T): T => {
	return StyleSheet.create(styles);
};

// Common spacing combinations for inline use
export type SpacingCombination =
	| {
			margin?: number;
			marginHorizontal?: number;
			marginVertical?: number;
			marginTop?: number;
			marginBottom?: number;
			marginLeft?: number;
			marginRight?: number;
	  }
	| {
			padding?: number;
			paddingHorizontal?: number;
			paddingVertical?: number;
			paddingTop?: number;
			paddingBottom?: number;
			paddingLeft?: number;
			paddingRight?: number;
	  }
	| { gap?: number; rowGap?: number; columnGap?: number };

/**
 * Helper to build dynamic spacing styles inline
 * Use with theme.spacing() values
 *
 * @example
 * ```tsx
 * <View style={[
 *   styles.container,
 *   spacing[{ padding: spacing('md'], marginTop: spacing['lg'] })
 * ]} />
 * ```
 */
export const spacing = (config: SpacingCombination): ViewStyle => {
	const style: ViewStyle = {};

	if ("margin" in config) style.margin = config.margin;
	if ("marginHorizontal" in config) {
		style.marginHorizontal = config.marginHorizontal;
	}
	if ("marginVertical" in config) {
		style.marginVertical = config.marginVertical;
	}
	if ("marginTop" in config) style.marginTop = config.marginTop;
	if ("marginBottom" in config) style.marginBottom = config.marginBottom;
	if ("marginLeft" in config) style.marginLeft = config.marginLeft;
	if ("marginRight" in config) style.marginRight = config.marginRight;

	if ("padding" in config) style.padding = config.padding;
	if ("paddingHorizontal" in config) {
		style.paddingHorizontal = config.paddingHorizontal;
	}
	if ("paddingVertical" in config) {
		style.paddingVertical = config.paddingVertical;
	}
	if ("paddingTop" in config) style.paddingTop = config.paddingTop;
	if ("paddingBottom" in config) style.paddingBottom = config.paddingBottom;
	if ("paddingLeft" in config) style.paddingLeft = config.paddingLeft;
	if ("paddingRight" in config) style.paddingRight = config.paddingRight;

	if ("gap" in config) style.gap = config.gap;
	if ("rowGap" in config) style.rowGap = config.rowGap;
	if ("columnGap" in config) style.columnGap = config.columnGap;

	return style;
};

/**
 * Predefined layout patterns for common use cases
 * These return functions that accept theme spacing
 */
export const layout = {
	/**
	 * Stack layout - vertical list with consistent gap
	 */
	stack: (gap: number): ViewStyle => ({
		flexDirection: "column",
		gap,
	}),

	/**
	 * Row layout - horizontal with consistent gap
	 */
	row: (gap: number): ViewStyle => ({
		flexDirection: "row",
		alignItems: "center",
		gap,
	}),

	/**
	 * Grid layout - 2 columns with gap
	 */
	grid2: (gap: number): ViewStyle => ({
		flexDirection: "row",
		flexWrap: "wrap",
		gap,
	}),

	/**
	 * Grid item - half width for 2-column grid
	 */
	gridItem2: (): ViewStyle => ({
		flex: 1,
		minWidth: "45%",
	}),

	/**
	 * Center content both horizontally and vertically
	 */
	center: (): ViewStyle => ({
		justifyContent: "center",
		alignItems: "center",
	}),

	/**
	 * Space between - pushes content to edges
	 */
	spaceBetween: (): ViewStyle => ({
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	}),
};

/**
 * Common component patterns with theme integration
 * Use these as base styles, then apply dynamic values inline
 */
export const patterns = {
	/**
	 * Card with internal spacing
	 */
	card: (padding: number): ViewStyle => ({
		padding,
	}),

	/**
	 * Section with title spacing
	 */
	section: (titleSpacing: number, contentSpacing: number): ViewStyle => ({
		paddingTop: titleSpacing,
		gap: contentSpacing,
	}),

	/**
	 * List item with horizontal spacing
	 */
	listItem: (horizontalPadding: number, verticalPadding: number): ViewStyle => ({
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: horizontalPadding,
		paddingVertical: verticalPadding,
	}),

	/**
	 * Icon + text row
	 */
	iconTextRow: (iconGap: number): ViewStyle => ({
		flexDirection: "row",
		alignItems: "center",
		gap: iconGap,
	}),
};

/**
 * Helper to apply border styles
 */
export const borders = {
	bottom: (color: string, width: number = 1): ViewStyle => ({
		borderBottomWidth: width,
		borderBottomColor: color,
	}),

	top: (color: string, width: number = 1): ViewStyle => ({
		borderTopWidth: width,
		borderTopColor: color,
	}),

	all: (color: string, width: number = 1, radius?: number): ViewStyle => {
		const style: ViewStyle = {
			borderWidth: width,
			borderColor: color,
		};
		if (radius !== undefined) {
			style.borderRadius = radius;
		}
		return style;
	},
};
