import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	I18nManager,
	PanResponder,
	Platform,
	StyleSheet,
	View,
	type AccessibilityActionInfo,
	type GestureResponderEvent,
	type PanResponderGestureState,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import { Host, Slider as SwiftUISlider } from "@expo/ui/swift-ui";
import {
	accessibilityIdentifier,
	accessibilityLabel,
	accessibilityValue,
	disabled as disabledModifier,
	tint,
} from "@expo/ui/swift-ui/modifiers";
import { useThemeTokens } from "../theme";

export interface SliderProps {
	/** Current slider value */
	value: number;
	/** Minimum value of the range (default 0) */
	minimumValue?: number;
	/** Maximum value of the range (default 1) */
	maximumValue?: number;
	/** Granular step interval */
	step?: number;
	/** Whether the slider is interactive */
	disabled?: boolean;
	/** Callback invoked continuously as the slider drags */
	onValueChange?: (value: number) => void;
	/** Callback invoked when sliding gesture ends */
	onSlidingComplete?: (value: number) => void;
	/** Accent color for active track and thumb */
	tintColor?: string;
	/** Inactive track background color */
	trackColor?: string;
	/** Explicit thumb fill color */
	thumbColor?: string;
	/** Accessibility label */
	label?: string;
	/** Stable test identifier */
	testID?: string;
	/** Additional container styling */
	style?: StyleProp<ViewStyle>;
	/**
	 * Whether to use platform-native SwiftUISlider on iOS when available.
	 * Defaults to true.
	 */
	useNative?: boolean;
}

const accessibilityActions: AccessibilityActionInfo[] = [
	{ name: "increment", label: "Increment" },
	{ name: "decrement", label: "Decrement" },
];

/**
 * Cross-platform Slider component
 *
 * Supports native SwiftUI Slider on iOS and a fluid, touch-optimized
 * PanResponder gesture fallback with Osuki design system tokens.
 */
export const Slider: React.FC<SliderProps> = ({
	value,
	minimumValue = 0,
	maximumValue = 1,
	step = 0,
	disabled = false,
	onValueChange,
	onSlidingComplete,
	tintColor,
	trackColor,
	thumbColor,
	label,
	testID,
	style,
	useNative = true,
}) => {
	const theme = useThemeTokens();
	const activeTint = tintColor ?? theme.colors.primary;
	const inactiveTrack = trackColor ?? theme.colors.surfaceRaised;
	const activeThumb = thumbColor ?? activeTint;

	const clampedMin = Math.min(minimumValue, maximumValue);
	const clampedMax = Math.max(minimumValue, maximumValue);
	const range = clampedMax - clampedMin || 1;
	const clampedValue = Math.min(clampedMax, Math.max(clampedMin, Number.isFinite(value) ? value : clampedMin));

	// iOS SwiftUI native implementation
	const draftRef = useRef(clampedValue);
	const changedRef = useRef(false);

	useEffect(() => {
		if (!changedRef.current) draftRef.current = clampedValue;
		if (disabled) changedRef.current = false;
	}, [clampedValue, disabled]);

	// RN PanResponder fallback implementation
	const containerRef = useRef<View>(null);
	const [trackWidth, setTrackWidth] = useState(0);
	const pageXOffsetRef = useRef(0);

	const updateOffset = useCallback(() => {
		containerRef.current?.measure((_x, _y, _w, _h, pageX) => {
			pageXOffsetRef.current = pageX;
		});
	}, []);

	const calculateValueFromPageX = useCallback(
		(pageX: number): number => {
			if (trackWidth <= 0) return clampedValue;
			const localX = Math.max(0, Math.min(trackWidth, pageX - pageXOffsetRef.current));
			const ratio = I18nManager.isRTL ? (trackWidth - localX) / trackWidth : localX / trackWidth;
			let computed = clampedMin + ratio * range;

			if (step > 0) {
				const stepsCount = Math.round((computed - clampedMin) / step);
				computed = clampedMin + stepsCount * step;
			}

			return Math.min(clampedMax, Math.max(clampedMin, computed));
		},
		[clampedMax, clampedMin, clampedValue, range, step, trackWidth],
	);

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => !disabled,
				onMoveShouldSetPanResponder: () => !disabled,
				onPanResponderGrant: (evt: GestureResponderEvent) => {
					updateOffset();
					const next = calculateValueFromPageX(evt.nativeEvent.pageX);
					draftRef.current = next;
					changedRef.current = true;
					onValueChange?.(next);
				},
				onPanResponderMove: (evt: GestureResponderEvent, _gestureState: PanResponderGestureState) => {
					if (disabled) return;
					const next = calculateValueFromPageX(evt.nativeEvent.pageX);
					draftRef.current = next;
					changedRef.current = true;
					onValueChange?.(next);
				},
				onPanResponderRelease: (evt: GestureResponderEvent) => {
					if (disabled) return;
					const next = calculateValueFromPageX(evt.nativeEvent.pageX);
					draftRef.current = next;
					changedRef.current = false;
					onValueChange?.(next);
					onSlidingComplete?.(next);
				},
				onPanResponderTerminate: () => {
					if (disabled) return;
					changedRef.current = false;
					onSlidingComplete?.(draftRef.current);
				},
			}),
		[calculateValueFromPageX, disabled, onSlidingComplete, onValueChange, updateOffset],
	);

	if (Platform.OS === "ios" && useNative) {
		const percentage = Math.round(((clampedValue - clampedMin) / range) * 100);
		return (
			<Host
				style={StyleSheet.flatten([{ height: 44, alignSelf: "stretch", justifyContent: "center" }, style])}
				colorScheme={theme.mode}
				ignoreSafeArea="all"
				layoutDirection={I18nManager.isRTL ? "rightToLeft" : "leftToRight"}
			>
				<SwiftUISlider
					value={clampedValue}
					min={clampedMin}
					max={clampedMax}
					step={step > 0 ? step : undefined}
					modifiers={[
						tint(activeTint),
						disabledModifier(disabled),
						...(label ? [accessibilityLabel(label)] : []),
						accessibilityValue(`${percentage}%`),
						...(testID ? [accessibilityIdentifier(testID)] : []),
					]}
					onValueChange={(next) => {
						if (disabled) return;
						draftRef.current = next;
						changedRef.current = true;
						onValueChange?.(next);
					}}
					onEditingChanged={(editing) => {
						if (editing || disabled || !changedRef.current) return;
						changedRef.current = false;
						onSlidingComplete?.(draftRef.current);
					}}
				/>
			</Host>
		);
	}

	const fraction = Math.min(1, Math.max(0, (clampedValue - clampedMin) / range));
	const percentValue = Math.round(fraction * 100);

	return (
		<View
			ref={containerRef}
			testID={testID}
			accessible
			accessibilityRole="adjustable"
			accessibilityLabel={label}
			accessibilityState={{ disabled }}
			accessibilityValue={{
				min: clampedMin,
				max: clampedMax,
				now: clampedValue,
				text: `${percentValue}%`,
			}}
			accessibilityActions={disabled ? [] : accessibilityActions}
			onAccessibilityAction={(event) => {
				if (disabled) return;
				const delta = step > 0 ? step : range / 100;
				let next = clampedValue;
				if (event.nativeEvent.actionName === "increment") {
					next = Math.min(clampedMax, clampedValue + delta);
				} else if (event.nativeEvent.actionName === "decrement") {
					next = Math.max(clampedMin, clampedValue - delta);
				}
				onValueChange?.(next);
				onSlidingComplete?.(next);
			}}
			onLayout={(e) => {
				setTrackWidth(e.nativeEvent.layout.width);
				updateOffset();
			}}
			style={[styles.container, style, disabled && styles.disabled]}
			{...panResponder.panHandlers}
		>
			<View style={[styles.track, { backgroundColor: inactiveTrack }]}>
				<View
					style={[
						styles.activeTrack,
						{
							backgroundColor: activeTint,
							width: `${fraction * 100}%`,
						},
					]}
				/>
			</View>
			<View
				style={[
					styles.thumb,
					{
						backgroundColor: activeThumb,
						left: trackWidth > 0 ? fraction * (trackWidth - 22) : 0,
						borderColor: theme.colors.surface,
					},
				]}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 44,
		justifyContent: "center",
		alignSelf: "stretch",
		position: "relative",
	},
	disabled: {
		opacity: 0.5,
	},
	track: {
		height: 4,
		borderRadius: 999,
		overflow: "hidden",
		width: "100%",
	},
	activeTrack: {
		height: "100%",
		borderRadius: 999,
	},
	thumb: {
		position: "absolute",
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1.5 },
		shadowOpacity: 0.22,
		shadowRadius: 2.22,
		elevation: 3,
	},
});
