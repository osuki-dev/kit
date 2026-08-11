import React, { type ReactNode } from "react";
import { View, type ViewStyle, StyleSheet, type DimensionValue } from "react-native";
import { useResponsiveLayout, useResponsiveValue, type Breakpoint } from "../utils/responsive";

export interface ResponsiveContainerProps {
	children: ReactNode;
	/**
	 * Responsive max width - either a single value or breakpoint map
	 * @example '100%' | { xs: '100%', md: 720, lg: 960 }
	 */
	maxWidth?: number | string | Partial<Record<Breakpoint, number | string>>;
	/**
	 * Horizontal padding - responsive
	 * @example 16 | { xs: 16, md: 24, lg: 32 }
	 */
	horizontalPadding?: number | Partial<Record<Breakpoint, number>>;
	/**
	 * Vertical padding
	 */
	verticalPadding?: number;
	/**
	 * Additional styles
	 */
	style?: ViewStyle;
	/**
	 * Center the container
	 */
	alignment?: "start" | "center";
	/**
	 * Full width (ignores maxWidth)
	 */
	widthMode?: "constrained" | "full";
	/**
	 * Stable test identifier for automation
	 */
	testID?: string;
}

/**
 * Responsive Container Component
 *
 * Provides a responsive wrapper with max-width constraints and padding
 * that adapts to screen size.
 *
 * @example
 * ```tsx
 * <ResponsiveContainer
 *   maxWidth={{ xs: '100%', md: 720, lg: 960 }}
 *   horizontalPadding={{ xs: 16, md: 24 }}
 *   center
 * >
 *   <YourContent />
 * </ResponsiveContainer>
 * ```
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
	children,
	maxWidth = "100%",
	horizontalPadding = 16,
	verticalPadding = 0,
	style,
	alignment = "center",
	widthMode = "constrained",
	testID,
}) => {
	const layout = useResponsiveLayout();
	const { width } = layout;

	// Get responsive values
	const resolvedMaxWidth =
		typeof maxWidth === "object" && maxWidth !== null
			? useResponsiveValue(maxWidth as Partial<Record<Breakpoint, DimensionValue>>, "100%")
			: maxWidth;

	const paddingHorizontal =
		typeof horizontalPadding === "object" && horizontalPadding !== null
			? useResponsiveValue(horizontalPadding, 16)
			: horizontalPadding;

	// Calculate actual max width
	const calculatedMaxWidth =
		widthMode === "full"
			? ("100%" as const)
			: typeof resolvedMaxWidth === "number"
				? Math.min(resolvedMaxWidth, width)
				: (resolvedMaxWidth ?? ("100%" as const));

	const containerStyle: ViewStyle = {
		width: "100%",
		maxWidth: calculatedMaxWidth as DimensionValue,
		paddingHorizontal,
		paddingVertical: verticalPadding,
		alignSelf: alignment === "center" ? "center" : "flex-start",
	};

	return (
		<View testID={testID} style={[styles.container, containerStyle, style]}>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		// Base styles
	},
});
