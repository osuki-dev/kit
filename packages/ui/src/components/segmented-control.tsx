import React from "react";
import { Platform, TouchableOpacity, View, type ViewProps, type ViewStyle } from "react-native";
import ExpoSegmentedControl from "@expo/ui/community/segmented-control";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export interface SegmentedControlOption {
	/** Option label (displayed) */
	label: string;
	/** Option value */
	value: string;
	/** Disabled state */
	disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<ViewProps, "style"> {
	/** Available options */
	options: SegmentedControlOption[];
	/** Currently selected value */
	value: string;
	/** Selection callback */
	onChange: (value: string) => void;
	/** Container style variant */
	variant?: "pill" | "rounded";
	/** Additional styles */
	style?: ViewStyle;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Segmented Control component
 *
 * Osuki Design Rules:
 * - Container: 1px solid border-visible, pill or 8px rounded
 * - Active: text-display bg, black text (inverted)
 * - Inactive: transparent, text-secondary
 * - Text: semantic label font, ALL CAPS, label size
 * - Height: 36-44px, max 2-4 segments
 * - Transition: 200ms ease-out
 *
 * Features:
 * - Press scale animation (0.96) on segments
 * - Smooth spring animations
 * - Disabled state disables animations
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { label: 'DAY', value: 'day' },
 *     { label: 'WEEK', value: 'week' },
 *     { label: 'MONTH', value: 'month' },
 *   ]}
 *   value={selectedPeriod}
 *   onChange={setSelectedPeriod}
 * />
 * ```
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
	options,
	value,
	onChange,
	variant = "rounded",
	style,
	testID,
	...rest
}) => {
	const { colors, mode, shadow } = useThemeTokens();
	const haptics = useHaptics();
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);
	const hasDisabledOptions = options.some((option) => option.disabled);

	const containerStyles: ViewStyle = {
		flexDirection: "row",
		height: 44,
		borderRadius: variant === "pill" ? 999 : 14,
		backgroundColor: colors.surfaceRaised,
		padding: 4,
		overflow: "hidden",
		...(mode === "light" ? shadow.soft : {}),
	};

	// The native control only fits this container on iOS.
	//
	// `@expo/ui/community/segmented-control` renders the platform's own widget.
	// On iOS that is `UISegmentedControl`, which is compact and chromeless enough
	// to sit inside the decorative track above. On Android it is Material's
	// `SegmentedButtonRow`, which draws a full outlined track of its own: its own
	// border, its own dividers between segments and its own selected fill. Nested
	// in this one you get two tracks, and Material's row wants more height than
	// the 36pt this container leaves it, so the selected segment overflows top and
	// bottom while the labels overflow the parent's rounded clip on the right.
	//
	// The branch below is not a fallback -- it is this design system's own
	// rendering of the control, and it is what the rules in the doc comment
	// describe. Android takes it.
	if (Platform.OS === "ios" && !hasDisabledOptions) {
		return (
			<View accessibilityRole="tablist" testID={testID} style={[containerStyles, style]} {...rest}>
				<ExpoSegmentedControl
					values={options.map((option) => option.label)}
					selectedIndex={selectedIndex}
					onChange={(event) => {
						const nextOption = options[event.nativeEvent.selectedSegmentIndex];
						if (nextOption) {
							haptics.feedback("selection");
							onChange(nextOption.value);
						}
					}}
					tintColor={colors.primary}
					style={{ flex: 1, minHeight: 36 }}
					testID={testID ? `${testID}-native` : undefined}
				/>
			</View>
		);
	}

	return (
		<View accessibilityRole="tablist" testID={testID} style={[containerStyles, style]} {...rest}>
			{options.map((option) => {
				const isActive = option.value === value;
				const isDisabled = option.disabled || false;

				return (
					<Segment
						key={option.value}
						label={option.label}
						isActive={isActive}
						isDisabled={isDisabled}
						onPress={() => onChange(option.value)}
						colors={colors}
						mode={mode}
						shadow={shadow}
						testID={testID ? `${testID}-option-${option.value}` : undefined}
					/>
				);
			})}
		</View>
	);
};

interface SegmentProps {
	label: string;
	isActive: boolean;
	isDisabled: boolean;
	onPress: () => void;
	colors: {
		text: string;
		background: string;
		textMuted: string;
		surface: string;
	};
	mode: string;
	shadow: {
		pill: ViewStyle;
	};
	testID?: string;
}

const Segment: React.FC<SegmentProps> = ({
	label,
	isActive,
	isDisabled,
	onPress,
	colors,
	mode,
	shadow,
	testID,
}) => {
	const haptics = useHaptics();
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = () => {
		if (!isDisabled) {
			haptics.feedback("selection");
			scale.value = withSpring(0.96, {
				stiffness: 400,
				damping: 25,
			});
		}
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, {
			stiffness: 300,
			damping: 20,
		});
	};

	const segmentStyles: ViewStyle = {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 999,
		backgroundColor: isActive ? colors.surface : "transparent",
		...(isActive && mode === "light" ? shadow.pill : {}),
		opacity: isDisabled ? 0.4 : 1,
	};

	return (
		<AnimatedTouchableOpacity
			style={[segmentStyles, animatedStyle]}
			testID={testID}
			onPress={onPress}
			disabled={isDisabled}
			accessibilityRole="tab"
			accessibilityLabel={`E2E SEGMENT ${label}`}
			accessibilityState={{ selected: isActive, disabled: isDisabled }}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			activeOpacity={1}
		>
			<Text variant="label" color={isActive ? colors.text : colors.textMuted} transform="uppercase">
				{label}
			</Text>
		</AnimatedTouchableOpacity>
	);
};
