import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
	Easing,
	ReduceMotion,
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { useHaptics } from "./haptics";
import { PressableScale } from "./pressable-scale";
import { Text } from "./text";

export interface TwoStepActionProps {
	/** Label displayed at rest: e.g. "Delete Session" */
	label: string;
	/** Label displayed once armed: e.g. "Tap again to confirm" */
	confirmLabel: string;
	/** Explanatory description shown only while armed */
	detail?: string;
	/** Callback invoked on the second, confirmed press */
	onConfirm: () => void;
	/** Controlled armed state */
	armed?: boolean;
	/** Callback invoked whenever armed state changes */
	onArmedChange?: (armed: boolean) => void;
	/** Duration in milliseconds before auto-disarming. Defaults to 3200 */
	durationMs?: number;
	/** Layout density presentation variant. Defaults to "default" */
	presentation?: "default" | "compact";
	/** Optional leading icon component or node */
	icon?: React.ReactNode;
	/** Whether the action is disabled */
	disabled?: boolean;
	/** Custom accessibility label at rest */
	accessibilityLabel?: string;
	/** Custom accessibility label when armed */
	confirmAccessibilityLabel?: string;
	/** Additional container styling */
	style?: StyleProp<ViewStyle>;
	/** Stable test identifier */
	testID?: string;
}

/**
 * TwoStepAction component
 *
 * An inline confirmation action button replacing disruptive modal dialogs.
 * First tap arms the button with a danger accent and begins a timed drain animation;
 * second tap confirms the action.
 */
export const TwoStepAction: React.FC<TwoStepActionProps> = memo(function TwoStepAction({
	label,
	confirmLabel,
	detail,
	onConfirm,
	armed: controlledArmed,
	onArmedChange,
	durationMs = 3200,
	presentation = "default",
	icon,
	disabled = false,
	accessibilityLabel,
	confirmAccessibilityLabel,
	style,
	testID,
}) {
	const theme = useThemeTokens();
	const haptics = useHaptics();

	const [uncontrolledArmed, setUncontrolledArmed] = useState(false);
	const isControlled = controlledArmed !== undefined;
	const isArmed = isControlled ? controlledArmed : uncontrolledArmed;

	const arm = useSharedValue(0);
	const drain = useSharedValue(1);
	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const onArmedChangeRef = useRef(onArmedChange);

	useEffect(() => {
		onArmedChangeRef.current = onArmedChange;
	}, [onArmedChange]);

	const setArmedState = useCallback(
		(next: boolean) => {
			if (!isControlled) setUncontrolledArmed(next);
			onArmedChangeRef.current?.(next);
		},
		[isControlled],
	);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = undefined;
		}
		cancelAnimation(drain);

		if (!isArmed || disabled) {
			arm.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
			if (isArmed && disabled) setArmedState(false);
			return;
		}

		arm.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
		drain.value = 1;
		drain.value = withTiming(0, {
			duration: durationMs,
			easing: Easing.linear,
			reduceMotion: ReduceMotion.Never,
		});

		timerRef.current = setTimeout(() => {
			setArmedState(false);
		}, durationMs);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [arm, disabled, drain, durationMs, isArmed, setArmedState]);

	const handlePress = useCallback(() => {
		if (disabled) return;
		if (isArmed) {
			haptics.feedback("warning");
			setArmedState(false);
			onConfirm();
		} else {
			haptics.feedback("selection");
			setArmedState(true);
		}
	}, [disabled, haptics, isArmed, onConfirm, setArmedState]);

	const fillStyle = useAnimatedStyle(() => ({ opacity: arm.value }));
	const restLabelStyle = useAnimatedStyle(() => ({ opacity: 1 - arm.value }));
	const armedLabelStyle = useAnimatedStyle(() => ({ opacity: arm.value }));
	const drainStyle = useAnimatedStyle(() => ({
		opacity: arm.value,
		transform: [{ scaleX: drain.value }],
	}));

	const isCompact = presentation === "compact";
	const effectiveRadius = theme.radius.sm;

	return (
		<PressableScale
			testID={testID}
			accessibilityRole="button"
			accessibilityLabel={
				isArmed
					? (confirmAccessibilityLabel ?? confirmLabel)
					: (accessibilityLabel ?? label)
			}
			accessibilityHint={isArmed ? detail : undefined}
			accessibilityState={{ disabled, expanded: isArmed }}
			disabled={disabled}
			onPress={handlePress}
			style={[
				styles.action,
				{ borderRadius: effectiveRadius },
				isCompact ? styles.actionCompact : null,
				style,
			]}
		>
			<Animated.View
				pointerEvents="none"
				style={[
					StyleSheet.absoluteFill,
					styles.fill,
					{
						borderRadius: effectiveRadius,
						backgroundColor: theme.colors.dangerSubtle,
					},
					fillStyle,
				]}
			/>
			<View style={[styles.line, isCompact ? styles.lineCompact : null]}>
				{icon ? <View style={styles.icon}>{icon}</View> : null}
				<View style={styles.labels} accessibilityLiveRegion="polite">
					<Animated.View style={isArmed ? styles.over : null}>
						<Animated.View style={restLabelStyle}>
							<Text
								variant="bodySmall"
								style={[styles.label, { color: theme.colors.danger }]}
								numberOfLines={1}
							>
								{label}
							</Text>
						</Animated.View>
					</Animated.View>
					<Animated.View style={[isArmed ? null : styles.over, armedLabelStyle]}>
						<Text
							variant="bodySmall"
							style={[styles.label, { color: theme.colors.danger, fontWeight: "600" }]}
							numberOfLines={1}
						>
							{confirmLabel}
						</Text>
					</Animated.View>
				</View>
			</View>
			{isArmed && detail ? (
				<View style={styles.detail}>
					<Text variant="caption" style={{ color: theme.colors.textMuted }}>
						{detail}
					</Text>
				</View>
			) : null}
			<Animated.View
				pointerEvents="none"
				style={[
					styles.drain,
					{ backgroundColor: theme.colors.danger },
					drainStyle,
				]}
			/>
		</PressableScale>
	);
});

const styles = StyleSheet.create({
	action: {
		alignSelf: "stretch",
		minHeight: 42,
		justifyContent: "center",
		paddingHorizontal: 14,
		paddingVertical: 10,
		overflow: "hidden",
		position: "relative",
	},
	actionCompact: {
		alignSelf: "center",
		minHeight: 38,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	fill: {
		borderCurve: "continuous",
	},
	line: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	lineCompact: {
		gap: 6,
	},
	icon: {
		width: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	labels: {
		flexShrink: 1,
	},
	over: {
		position: "absolute",
		top: 0,
		left: 0,
	},
	label: {
		lineHeight: 20,
	},
	detail: {
		marginTop: 4,
		marginLeft: 28,
	},
	drain: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: 2,
		transformOrigin: "left center",
	},
});
