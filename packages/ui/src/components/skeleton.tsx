import React, { useEffect, useMemo } from "react";
import {
	StyleSheet,
	View,
	type DimensionValue,
	type StyleProp,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { useThemeTokens } from "../theme";

export type SkeletonVariant = "text" | "rect" | "circle";

export interface SkeletonProps extends ViewProps {
	variant?: SkeletonVariant;
	width?: DimensionValue;
	height?: number;
	lines?: number;
	gap?: number;
	motion?: "pulse" | "static";
	/**
	 * Merged last, so `style.backgroundColor` replaces the `border` token the
	 * placeholder is filled with. With `lines` above 1 the override lands on each
	 * line rather than on the wrapper, so a translucent fill is painted once and
	 * the gaps between lines stay empty.
	 */
	style?: StyleProp<ViewStyle>;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Skeleton: React.FC<SkeletonProps> = ({
	variant = "rect",
	width = "100%",
	height,
	lines = 1,
	gap,
	motion = "pulse",
	style,
	...props
}) => {
	const theme = useThemeTokens();
	const opacity = useSharedValue(0.62);
	const lineCount = Math.max(1, lines);

	useEffect(() => {
		if (motion === "static") {
			opacity.value = 0.72;
			return;
		}
		opacity.value = withRepeat(withTiming(1, { duration: 760 }), -1, true);
	}, [motion, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

	const baseStyle = useMemo<ViewStyle>(
		() => ({
			width,
			height: height ?? (variant === "text" ? 14 : variant === "circle" ? 40 : 64),
			borderRadius:
				variant === "circle" ? 999 : variant === "text" ? theme.radius.pill : theme.radius.md,
			backgroundColor: theme.colors.border,
		}),
		[height, theme.colors.border, theme.radius, variant, width],
	);

	if (lineCount === 1) {
		return <AnimatedView style={[baseStyle, animatedStyle, style]} {...props} />;
	}

	// A multi-line skeleton draws its fill on the lines, not on the wrapper, so a
	// consumer's `backgroundColor` has to travel down to them. Leaving it on the
	// wrapper as well would paint the gaps and double up a translucent fill.
	const { backgroundColor: fillOverride, ...wrapperStyle } = StyleSheet.flatten(style) ?? {};
	const lineFill = fillOverride === undefined ? undefined : { backgroundColor: fillOverride };

	return (
		<View style={[{ gap: gap ?? theme.spacing.sm }, wrapperStyle]} {...props}>
			{Array.from({ length: lineCount }).map((_, index) => (
				<AnimatedView
					key={index}
					style={[baseStyle, animatedStyle, lineFill, index === lineCount - 1 && { width: "72%" }]}
				/>
			))}
		</View>
	);
};
