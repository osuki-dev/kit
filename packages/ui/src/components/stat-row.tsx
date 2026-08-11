import React from "react";
import { View, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export type DataStatus = "neutral" | "success" | "warning" | "error";

export interface StatRowProps {
	/** Label text (will be uppercased) */
	label: string;
	/** Value text */
	value: string | number;
	/** Optional unit text (small, adjacent to value) */
	unit?: string;
	/** Status color for value */
	status?: DataStatus;
	/** Show trend indicator */
	trend?: "up" | "down" | "neutral";
	/** Row style variant */
	size?: "default" | "compact" | "large";
	/** Additional styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * StatRow component for data display
 *
 * Osuki Design Rules:
 * - Label: semantic label font, ALL CAPS, --text-secondary
 * - Value: color = status color (success/warning/accent)
 * - Unit: --label size, adjacent to value
 * - No alternating backgrounds (no zebra striping)
 *
 * @example
 * ```tsx
 * <StatRow label="CPU Usage" value="64" unit="%" status="warning" />
 * <StatRow label="Memory" value="8.2" unit="GB" status="neutral" trend="up" />
 * <StatRow label="Status" value="ACTIVE" status="success" />
 * ```
 */
export const StatRow: React.FC<StatRowProps> = ({
	label,
	value,
	unit,
	status = "neutral",
	trend,
	size = "default",
	style,
	testID,
}) => {
	const { colors, spacing } = useThemeTokens();

	const getStatusColor = (): string => {
		switch (status) {
			case "success":
				return colors.success;
			case "warning":
				return colors.warning;
			case "error":
				return colors.primary;
			default:
				return colors.text;
		}
	};

	const getTrendSymbol = (): string => {
		switch (trend) {
			case "up":
				return "↑";
			case "down":
				return "↓";
			default:
				return "";
		}
	};

	const rowStyles: ViewStyle = {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: size === "compact" ? spacing["xs"] : spacing["sm"],
	};

	const valueContainerStyles: ViewStyle = {
		flexDirection: "row",
		alignItems: "baseline",
		gap: spacing["xs"],
	};

	const valueVariant = size === "large" ? "dataLarge" : size === "compact" ? "data" : "data";

	return (
		<View testID={testID} style={[rowStyles, style]}>
			<Text variant="label" colorKey="textMuted">
				{label}
			</Text>

			<View testID={testID ? `${testID}-value` : undefined} style={valueContainerStyles}>
				<Text variant={valueVariant} color={getStatusColor()}>
					{value}
					{getTrendSymbol()}
				</Text>

				{unit && (
					<Text variant="label" colorKey="textMuted">
						{unit}
					</Text>
				)}
			</View>
		</View>
	);
};
