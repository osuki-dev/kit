import React, { memo, useEffect, useState } from "react";
import {
	StyleSheet,
	View,
	type LayoutChangeEvent,
	type TextStyle,
} from "react-native";
import Animated, {
	Easing,
	cancelAnimation,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { Text } from "./text";

export interface MarqueeTextProps {
	/** Text string to display */
	children: string;
	/** Scroll velocity in points/pixels per second. Defaults to 32 */
	speed?: number;
	/** Additional typography styling */
	style?: TextStyle | TextStyle[];
	/** Pause duration at the beginning before scrolling starts. Defaults to 1500ms */
	holdStartMs?: number;
	/** Pause duration at the end before returning. Defaults to 1200ms */
	holdEndMs?: number;
	/** Stable test identifier */
	testID?: string;
}

const MARQUEE_TRACK_WIDTH = 4096;

/**
 * MarqueeText component
 *
 * Single-line text for titles and labels. When text width exceeds container bounds,
 * smoothly scrolls back and forth on the UI thread using Reanimated transforms.
 * Automatically falls back to standard single-line truncation when reduced motion is preferred.
 */
export const MarqueeText: React.FC<MarqueeTextProps> = memo(function MarqueeText({
	children,
	speed = 32,
	style,
	holdStartMs = 1500,
	holdEndMs = 1200,
	testID,
}) {
	const reduceMotion = useReducedMotion();
	const [boxWidth, setBoxWidth] = useState(0);
	const [lineWidth, setLineWidth] = useState(0);
	const offset = useSharedValue(0);

	const overflow = boxWidth > 0 && lineWidth > 0 ? Math.max(0, Math.ceil(lineWidth - boxWidth)) : 0;
	const travels = overflow > 1 && !reduceMotion;

	useEffect(() => {
		cancelAnimation(offset);
		offset.value = 0;
		if (!travels) return;

		const travelMs = Math.max(400, (overflow / speed) * 1000);
		const glide = { duration: travelMs, easing: Easing.inOut(Easing.quad) };

		offset.value = withRepeat(
			withSequence(
				withDelay(holdStartMs, withTiming(-overflow, glide)),
				withDelay(holdEndMs, withTiming(0, glide)),
			),
			-1,
		);

		return () => cancelAnimation(offset);
	}, [holdEndMs, holdStartMs, offset, overflow, speed, travels]);

	const travelAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: offset.value }],
	}));

	const onBoxLayout = (event: LayoutChangeEvent) => {
		const next = Math.round(event.nativeEvent.layout.width);
		setBoxWidth((cur) => (cur === next ? cur : next));
	};

	const onLineLayout = (event: LayoutChangeEvent) => {
		const next = Math.round(event.nativeEvent.layout.width);
		setLineWidth((cur) => (cur === next ? cur : next));
	};

	if (reduceMotion) {
		return (
			<Text testID={testID} numberOfLines={1} style={style}>
				{children}
			</Text>
		);
	}

	const resolvedLineStyle: TextStyle[] = [
		styles.line,
		...(Array.isArray(style) ? style : style ? [style] : []),
	];

	return (
		<View testID={testID} style={styles.box} onLayout={onBoxLayout}>
			<Animated.View style={[styles.track, travelAnimatedStyle]}>
				<Text
					numberOfLines={1}
					style={resolvedLineStyle}
					onLayout={onLineLayout}
				>
					{children}
				</Text>
			</Animated.View>
		</View>
	);
});

const styles = StyleSheet.create({
	box: {
		alignSelf: "stretch",
		overflow: "hidden",
	},
	track: {
		flexDirection: "row",
		width: MARQUEE_TRACK_WIDTH,
	},
	line: {
		flexShrink: 0,
		flexGrow: 0,
		alignSelf: "flex-start",
	},
});
