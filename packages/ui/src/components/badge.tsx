import React from "react";
import { View, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export type BadgeVariant = "default" | "primary" | "success" | "warning";

export interface BadgeProps {
	/** Badge content - number or text */
	children?: number | string;
	/** Visual variant */
	variant?: BadgeVariant;
	/** Label or compact dot presentation */
	display?: "label" | "dot";
	/** Additional container styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * Badge component for notifications and status indicators
 *
 * Osuki Design Rules:
 * - Pill-shaped (999px radius)
 * - Monospace caption text
 * - 4px 8px padding for text badges
 * - 8px diameter for dot badges
 * - Positioned absolute top-right by default
 *
 * @example
 * ```tsx
 * <Badge>3</Badge>
 * <Badge variant="primary">NEW</Badge>
 * <Badge display="dot" />
 * <Badge variant="success">99+</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
	children,
	variant = "default",
	display = "label",
	style,
	testID,
}) => {
	const { colors } = useThemeTokens();

	const colorMap: Record<BadgeVariant, string> = {
		default: colors.text,
		primary: colors.primary,
		success: colors.success,
		warning: colors.warning,
	};

	const backgroundColor = colorMap[variant];

	if (display === "dot") {
		return (
			<View
				testID={testID}
				style={[
					{
						width: 8,
						height: 8,
						borderRadius: 4,
						backgroundColor,
					},
					style,
				]}
			/>
		);
	}

	const content = typeof children === "number" && children > 99 ? "99+" : String(children ?? "");

	return (
		<View
			testID={testID}
			style={[
				{
					minWidth: 18,
					height: 18,
					paddingHorizontal: 6,
					borderRadius: 999,
					backgroundColor,
					justifyContent: "center",
					alignItems: "center",
				},
				style,
			]}
		>
			<Text
				style={{
					fontSize: 10,
					color: colors.background,
				}}
				weight="bold"
				transform="uppercase"
			>
				{content}
			</Text>
		</View>
	);
};
