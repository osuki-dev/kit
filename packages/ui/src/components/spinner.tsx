import React from "react";
import { View, ActivityIndicator, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { spinnerSizes, type SpinnerSize } from "./spinner-size";

export type { SpinnerSize };

export interface SpinnerProps {
	/** Spinner size variant */
	size?: SpinnerSize;
	/** Spinner color (defaults to textDisplay) */
	color?: string;
	/** Additional container styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * Spinner loading indicator component
 *
 * Osuki Design Rules:
 * - Circular spinning animation
 * - Consistent sizing (16-32px)
 * - Monochrome color scheme
 * - Centered in container
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color={colors.primary} />
 * <Spinner size="sm" />
 * ```
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = "md", color, style, testID }) => {
	const { colors } = useThemeTokens();

	const dimension = spinnerSizes[size];
	const spinnerColor = color || colors.text;

	const containerStyle: ViewStyle = {
		width: dimension,
		height: dimension,
		justifyContent: "center",
		alignItems: "center",
	};

	return (
		<View testID={testID} style={[containerStyle, style]}>
			<ActivityIndicator size={dimension} color={spinnerColor} />
		</View>
	);
};
