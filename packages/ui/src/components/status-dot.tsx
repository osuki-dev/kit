import React, { useEffect, useState } from "react";
import {
	AppState,
	type AppStateStatus,
	StyleSheet,
	View,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import Animated, {
	Easing,
	cancelAnimation,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { useThemeTokens } from "../theme";

export type StatusDotTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface StatusDotProps {
	/** Explicit indicator color overriding tone */
	color?: string;
	/** True draws a filled circle; false draws a ring outline. Defaults to true */
	filled?: boolean;
	/** Diameter of the indicator in points. Defaults to 8 */
	size?: number;
	/** Emits an expanding pulse ripple ring */
	pulse?: boolean;
	/** Semantic tone. Defaults to "neutral" */
	tone?: StatusDotTone;
	/** Additional styling */
	style?: StyleProp<ViewStyle>;
	/** Stable test identifier */
	testID?: string;
}

const RIPPLE_MAX_SCALE = 2.6;
const RIPPLE_PEAK_OPACITY = 0.36;
const RIPPLE_INSET = 2;

/**
 * StatusDot indicator component
 *
 * Provides a crisp status light where fill indicates certainty, color indicates
 * state, and an animated pulse ring indicates active real-time connectivity.
 */
export const StatusDot: React.FC<StatusDotProps> = ({
	color,
	filled = true,
	size = 8,
	pulse = false,
	tone = "neutral",
	style,
	testID,
}) => {
	const theme = useThemeTokens();
	const reduceMotion = useReducedMotion();
	const [appActive, setAppActive] = useState(true);

	useEffect(() => {
		const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
			setAppActive(state === "active");
		});
		return () => sub.remove();
	}, []);

	const toneColors: Record<StatusDotTone, string> = {
		neutral: theme.colors.textMuted,
		success: theme.colors.success,
		warning: theme.colors.warning,
		danger: theme.colors.danger,
		info: theme.colors.info,
	};

	const resolvedColor = color ?? toneColors[tone];

	const pop = useSharedValue(1);
	const ripple = useSharedValue(0);

	// Swell pop on state changes
	useEffect(() => {
		if (reduceMotion || !appActive) return;
		pop.value = withSequence(
			withTiming(1.35, { duration: 150, easing: Easing.out(Easing.quad) }),
			withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
		);
		return () => cancelAnimation(pop);
	}, [appActive, filled, pop, reduceMotion, resolvedColor]);

	// Continuous pulse ring when requested
	useEffect(() => {
		if (!pulse || reduceMotion || !appActive) {
			cancelAnimation(ripple);
			ripple.value = 0;
			return;
		}
		ripple.value = 0;
		ripple.value = withRepeat(
			withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
			-1,
			false,
		);
		return () => cancelAnimation(ripple);
	}, [appActive, pulse, reduceMotion, ripple]);

	const dotAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pop.value }],
	}));

	const rippleAnimatedStyle = useAnimatedStyle(() => ({
		opacity: (1 - ripple.value) * RIPPLE_PEAK_OPACITY,
		transform: [{ scale: 1 + ripple.value * (RIPPLE_MAX_SCALE - 1) }],
	}));

	const borderWidth = filled ? 0 : Math.max(1.5, size * 0.16);

	return (
		<View
			testID={testID}
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}
		>
			{pulse && !reduceMotion ? (
				<Animated.View
					pointerEvents="none"
					style={[
						styles.ripple,
						{
							borderRadius: size,
							borderColor: resolvedColor,
						},
						rippleAnimatedStyle,
					]}
				/>
			) : null}
			<Animated.View
				style={[
					styles.dot,
					{
						width: size,
						height: size,
						borderRadius: size / 2,
						backgroundColor: filled ? resolvedColor : "transparent",
						borderColor: resolvedColor,
						borderWidth,
					},
					dotAnimatedStyle,
				]}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	dot: {
		alignItems: "center",
		justifyContent: "center",
	},
	ripple: {
		position: "absolute",
		left: -RIPPLE_INSET,
		right: -RIPPLE_INSET,
		top: -RIPPLE_INSET,
		bottom: -RIPPLE_INSET,
		borderWidth: 1,
	},
});
