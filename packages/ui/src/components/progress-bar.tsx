import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens, type ColorToken } from "../theme";
import { Text } from "./text";

export type ProgressBarTone = "neutral" | "success" | "warning" | "danger" | "info";
export type ProgressBarSize = "sm" | "md" | "lg";

export interface ProgressBarProps extends ViewProps {
	value: number;
	max?: number;
	label?: string;
	valueDisplay?: "hidden" | "percentage";
	tone?: ProgressBarTone;
	size?: ProgressBarSize;
	shape?: "rounded" | "square";
}

const toneTokens: Record<ProgressBarTone, ColorToken> = {
	neutral: "primary",
	success: "success",
	warning: "warning",
	danger: "danger",
	info: "info",
};

const sizeHeights: Record<ProgressBarSize, number> = {
	sm: 4,
	md: 8,
	lg: 12,
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
	value,
	max = 100,
	label,
	valueDisplay = "hidden",
	tone = "neutral",
	size = "md",
	shape = "rounded",
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const safeMax = max <= 0 ? 100 : max;
	const ratio = Math.min(Math.max(value / safeMax, 0), 1);
	const percent = Math.round(ratio * 100);
	const height = sizeHeights[size];
	const radius = shape === "rounded" ? height / 2 : theme.radius.xs;
	const foreground = theme.colors[toneTokens[tone]];

	const containerStyle = useMemo<ViewStyle>(
		() => ({ width: "100%", gap: theme.spacing.xs }),
		[theme.spacing.xs],
	);

	return (
		<View style={[containerStyle, style]} testID={testID} {...props}>
			{(label || valueDisplay === "percentage") && (
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						gap: theme.spacing.sm,
					}}
				>
					{label && (
						<Text variant="label" colorKey="textMuted" numberOfLines={1}>
							{label}
						</Text>
					)}
					{valueDisplay === "percentage" && (
						<Text variant="caption" colorKey="textMuted">
							{percent}%
						</Text>
					)}
				</View>
			)}
			<View
				accessibilityRole="progressbar"
				accessibilityValue={{ min: 0, max: safeMax, now: Math.min(Math.max(value, 0), safeMax) }}
				testID={testID ? `${testID}-track` : undefined}
				style={{
					width: "100%",
					height,
					borderRadius: radius,
					backgroundColor: theme.colors.surfaceRaised,
					overflow: "hidden",
				}}
			>
				<View
					testID={testID ? `${testID}-fill` : undefined}
					style={{
						width: `${percent}%`,
						height: "100%",
						borderRadius: radius,
						backgroundColor: foreground,
					}}
				/>
			</View>
		</View>
	);
};
