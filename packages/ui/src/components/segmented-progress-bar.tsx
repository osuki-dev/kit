import React, { useMemo } from "react";
import { View, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export type ProgressStatus = "neutral" | "success" | "warning" | "error" | "overflow";

export interface SegmentedProgressBarProps {
	/** Current value */
	value: number;
	/** Maximum value (default 100) */
	max?: number;
	/** Number of segments to display */
	segments?: number;
	/** Visual status */
	status?: ProgressStatus;
	/** Numeric readout above bar */
	valueDisplay?: "hidden" | "value";
	/** Label above bar */
	label?: string;
	/** Size variant */
	size?: "hero" | "standard" | "compact";
	/** Additional styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * Segmented Progress Bar - The signature Osuki data visualization
 *
 * Discrete rectangular segments with 2px gaps. Mechanical, instrument-like.
 *
 * Osuki Design Rules:
 * - Square-ended blocks, no border-radius on segments
 * - Filled = solid status color (neutral = white, overflow = red)
 * - Empty = semantic divider color
 * - Always pair with numeric readout
 * - Bar = proportion, number = precision
 *
 * @example
 * ```tsx
 * <SegmentedProgressBar
 *   value={64}
 *   max={100}
 *   label="CPU LOAD"
 *   status="warning"
 *   size="standard"
 * />
 *
 * <SegmentedProgressBar
 *   value={128}
 *   max={100}
 *   label="MEMORY"
 *   status="overflow"
 *   size="hero"
 * />
 * ```
 */
export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
	value,
	max = 100,
	segments = 20,
	status = "neutral",
	valueDisplay = "value",
	label,
	size = "standard",
	style,
	testID,
}) => {
	const { colors, spacing } = useThemeTokens();

	const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
	const filledSegments = Math.round((percentage / 100) * segments);
	const isOverflow = value > max || status === "overflow";

	const getSegmentColor = (isFilled: boolean): string => {
		if (!isFilled) return colors.border;

		if (isOverflow) return colors.danger;

		switch (status) {
			case "success":
				return colors.success;
			case "warning":
				return colors.warning;
			case "error":
				return colors.danger;
			default:
				return colors.text;
		}
	};

	const containerStyles: ViewStyle = {
		width: "100%",
		gap: spacing["xs"],
	};

	const headerStyles: ViewStyle = {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	};

	const barStyles: ViewStyle = {
		flexDirection: "row",
		gap: 2,
		height: SEGMENT_HEIGHTS[size],
	};
	const segmentIndexes = useMemo(
		() => Array.from({ length: Math.max(segments, 1) }, (_, index) => index),
		[segments],
	);
	const filledStyle = useMemo<ViewStyle>(
		() => ({ flex: 1, height: "100%", backgroundColor: getSegmentColor(true) }),
		[colors, isOverflow, status],
	);
	const emptyStyle = useMemo<ViewStyle>(
		() => ({ flex: 1, height: "100%", backgroundColor: getSegmentColor(false) }),
		[colors.border],
	);

	return (
		<View testID={testID} style={[containerStyles, style]}>
			{/* Header with label and value */}
			{(label || valueDisplay === "value") && (
				<View testID={testID ? `${testID}-header` : undefined} style={headerStyles}>
					{label && (
						<Text variant="label" colorKey="textMuted">
							{label}
						</Text>
					)}
					{valueDisplay === "value" && (
						<Text variant="data" color={getSegmentColor(true)}>
							{Math.round(value)}
							{value > max ? "+" : ""}
						</Text>
					)}
				</View>
			)}

			{/* Segmented bar */}
			<View testID={testID ? `${testID}-bar` : undefined} style={barStyles}>
				{segmentIndexes.map((index) => (
					<View
						key={index}
						testID={testID ? `${testID}-segment-${index + 1}` : undefined}
						style={index < filledSegments ? filledStyle : emptyStyle}
					/>
				))}
			</View>
		</View>
	);
};

const SEGMENT_HEIGHTS = { hero: 16, standard: 8, compact: 4 } as const;
