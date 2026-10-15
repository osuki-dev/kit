import React, { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export type TransientPillTone = "primary" | "surface" | "neutral";

export interface TransientPillProps {
	/** Text message to display */
	label: string;
	/**
	 * Offset from the bottom of the anchor region in points,
	 * preventing overlap with keyboards or bottom docks. Defaults to 0.
	 */
	bottomInset?: number;
	/** Visual tone. Defaults to "primary" */
	tone?: TransientPillTone;
	/** Additional styling */
	style?: StyleProp<ViewStyle>;
	/** Stable test identifier */
	testID?: string;
}

/**
 * TransientPill component
 *
 * A floating, temporary status indicator badge anchored over content to
 * confirm gestures or state transitions without interrupting user interaction.
 */
export const TransientPill: React.FC<TransientPillProps> = ({
	label,
	bottomInset = 0,
	tone = "primary",
	style,
	testID,
}) => {
	const theme = useThemeTokens();
	const reduceMotion = useReducedMotion();
	const opacity = useSharedValue(reduceMotion ? 1 : 0);

	useEffect(() => {
		if (reduceMotion) {
			opacity.value = 1;
			return;
		}
		opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
	}, [opacity, reduceMotion]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: 0.94 + 0.06 * opacity.value }],
	}));

	const toneStyles: Record<
		TransientPillTone,
		{ backgroundColor: string; textColor: string; borderColor?: string; borderWidth?: number }
	> = {
		primary: {
			backgroundColor: theme.colors.primary,
			textColor: theme.colors.onPrimary,
		},
		surface: {
			backgroundColor: theme.colors.surfaceRaised,
			textColor: theme.colors.text,
			borderColor: theme.colors.border,
			borderWidth: StyleSheet.hairlineWidth,
		},
		neutral: {
			backgroundColor: theme.colors.borderStrong,
			textColor: theme.colors.background,
		},
	};

	const currentTone = toneStyles[tone];

	return (
		<View pointerEvents="none" style={[styles.anchor, { bottom: bottomInset }]} testID={testID}>
			<Animated.View style={animatedStyle}>
				<View
					style={[
						styles.indicator,
						{
							backgroundColor: currentTone.backgroundColor,
							borderRadius: theme.radius.pill,
							borderColor: currentTone.borderColor,
							borderWidth: currentTone.borderWidth ?? 0,
						},
						style,
					]}
				>
					<Text
						variant="caption"
						numberOfLines={1}
						style={[styles.indicatorText, { color: currentTone.textColor }]}
					>
						{label}
					</Text>
				</View>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	anchor: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 11,
		elevation: 11,
	},
	indicator: {
		maxWidth: "80%",
		minHeight: 26,
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderCurve: "continuous",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 6,
		elevation: 4,
	},
	indicatorText: {
		fontWeight: "600",
		fontVariant: ["tabular-nums"],
	},
});
