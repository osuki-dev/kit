import React, { useCallback } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useHaptics, type HapticFeedbackKind } from "./haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// The dip has to arrive under the finger and leave more slowly than it came,
// or the control reads as laggy on press and twitchy on release.
const PRESS_IN_DURATION = 80;
const PRESS_OUT_DURATION = 120;

/** Which haptic a press plays, or `"none"` for a control that should stay silent. */
export type PressableScaleFeedback = HapticFeedbackKind | "none";

export interface PressableScaleProps extends Omit<PressableProps, "style" | "children"> {
	/**
	 * Scale the content settles at while held. Large targets want a shallower
	 * dip than small ones: a full-width row at 0.9 looks broken, an icon button
	 * at 0.99 looks dead.
	 */
	pressedScale?: number;
	/** Haptic played on press-in. `"none"` opts a control out entirely. */
	feedback?: PressableScaleFeedback;
	/** Additional styles; the press transform is always composed on top. */
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode;
}

/**
 * Pressable that dips slightly while held.
 *
 * This is the press affordance for surfaces that are not cards: header
 * buttons, tiles, keys, list rows drawn by the product. `PressableCard` owns
 * the same job for card-shaped content and adds elevation on top; use that one
 * when the thing being pressed already looks like a card.
 *
 * Haptics come from `HapticsProvider`, so a host app decides once whether the
 * device buzzes and how; without a provider the call is a no-op and the
 * component still animates.
 *
 * Osuki Design Rules:
 * - Scale only, never opacity: a dimmed control reads as disabled
 * - Press-in faster than press-out (80ms / 120ms), ease-out both ways
 * - Disabled controls neither animate nor fire haptics
 *
 * @example
 * ```tsx
 * <PressableScale onPress={openServer} accessibilityLabel="Open server">
 *   <ServerTile />
 * </PressableScale>
 *
 * // Small target, deeper dip, no haptic
 * <PressableScale pressedScale={0.9} feedback="none" onPress={remove}>
 *   <Icon name="X" size={16} />
 * </PressableScale>
 * ```
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
	children,
	disabled,
	feedback = "selection",
	onPressIn,
	onPressOut,
	pressedScale = 0.985,
	style,
	...rest
}) => {
	const haptics = useHaptics();
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = useCallback<NonNullable<PressableProps["onPressIn"]>>(
		(event) => {
			if (disabled) {
				onPressIn?.(event);
				return;
			}
			if (feedback !== "none") haptics.feedback(feedback);
			scale.value = withTiming(pressedScale, {
				duration: PRESS_IN_DURATION,
				easing: Easing.out(Easing.cubic),
			});
			onPressIn?.(event);
		},
		[disabled, feedback, haptics, onPressIn, pressedScale, scale],
	);

	const handlePressOut = useCallback<NonNullable<PressableProps["onPressOut"]>>(
		(event) => {
			scale.value = withTiming(1, {
				duration: PRESS_OUT_DURATION,
				easing: Easing.out(Easing.cubic),
			});
			onPressOut?.(event);
		},
		[onPressOut, scale],
	);

	return (
		<AnimatedPressable
			{...rest}
			disabled={disabled}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[style, animatedStyle]}
		>
			{children}
		</AnimatedPressable>
	);
};
