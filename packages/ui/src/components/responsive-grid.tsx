import React, { type ReactNode } from "react";
import { View, type ViewStyle, StyleSheet } from "react-native";
import { useResponsiveGrid, type Breakpoint } from "../utils/responsive";

export interface ResponsiveGridProps {
	children: ReactNode;
	/**
	 * Number of columns - can be responsive
	 * @example 2 | { xs: 1, sm: 2, md: 3, lg: 4 }
	 */
	columns?: number | Partial<Record<Breakpoint, number>>;
	/**
	 * Gap between items
	 */
	gap?: number;
	/**
	 * Row gap (defaults to gap)
	 */
	rowGap?: number;
	/**
	 * Column gap (defaults to gap)
	 */
	columnGap?: number;
	/**
	 * Additional styles
	 */
	style?: ViewStyle;
	/**
	 * Should items wrap to next line
	 */
	flow?: "wrap" | "single-row";
	/**
	 * Stable test identifier for automation
	 */
	testID?: string;
}

/**
 * Responsive Grid Component
 *
 * A flex-based grid that adapts column count based on screen size.
 * Uses modern CSS Grid-like capabilities with Flexbox.
 *
 * @example
 * ```tsx
 * <ResponsiveGrid
 *   columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
 *   gap={16}
 * >
 *   <Card>...</Card>
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </ResponsiveGrid>
 * ```
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
	children,
	columns = { xs: 1, sm: 2, md: 3, lg: 4 },
	gap = 16,
	rowGap,
	columnGap,
	style,
	flow = "wrap",
	testID,
}) => {
	// Convert columns to responsive config
	const columnConfig = typeof columns === "object" ? columns : { xs: columns };
	const { itemWidth } = useResponsiveGrid(columnConfig, gap);

	const calculatedColumnGap = columnGap ?? gap;
	const calculatedRowGap = rowGap ?? gap;

	const gridStyle: ViewStyle = {
		flexDirection: "row",
		flexWrap: flow === "wrap" ? "wrap" : "nowrap",
		gap: calculatedRowGap,
		columnGap: calculatedColumnGap,
	};

	// Clone children and apply responsive width
	const responsiveChildren = React.Children.map(children, (child) => {
		if (!React.isValidElement(child)) return child;

		const childProps = child.props as { style?: unknown };
		return React.cloneElement(child, {
			...childProps,
			style: [
				childProps.style,
				typeof itemWidth === "number" ? { width: itemWidth } : { width: itemWidth as string },
			],
		} as React.Attributes);
	});

	return (
		<View testID={testID} style={[styles.grid, gridStyle, style]}>
			{responsiveChildren}
		</View>
	);
};

const styles = StyleSheet.create({
	grid: {
		width: "100%",
	},
});
