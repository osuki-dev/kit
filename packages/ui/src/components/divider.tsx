import React from "react";
import { View, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";

export type DividerVariant = "full" | "inset" | "middle";

export interface DividerProps {
	/** Divider style variant */
	variant?: DividerVariant;
	/** Divider thickness */
	thickness?: number;
	/** Additional container styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

const insetMap: Record<DividerVariant, { left: number; right: number }> = {
	full: { left: 0, right: 0 },
	inset: { left: 72, right: 0 }, // After icon + padding
	middle: { left: 16, right: 16 },
};

/**
 * Divider component for visual separation
 *
 * Osuki Design Rules:
 * - 1px thickness by default
 * - border color (not background)
 * - Full width or inset variants
 * - 8px vertical margin
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider variant="inset" />
 * <Divider variant="middle" thickness={2} />
 * ```
 */
export const Divider: React.FC<DividerProps> = ({
	variant = "full",
	thickness = 1,
	style,
	testID,
}) => {
	const { colors, spacing } = useThemeTokens();

	const insets = insetMap[variant];

	const dividerStyle: ViewStyle = {
		height: thickness,
		backgroundColor: colors.border,
		marginVertical: spacing["sm"],
		marginLeft: insets.left,
		marginRight: insets.right,
	};

	return <View testID={testID} style={[dividerStyle, style]} />;
};
