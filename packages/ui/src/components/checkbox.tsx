import React, { createContext, useContext, useEffect, useMemo } from "react";
import { TouchableOpacity, type TouchableOpacityProps, type ViewStyle } from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { useHaptics } from "./haptics";

export interface CheckboxProps extends Omit<TouchableOpacityProps, "style" | "children"> {
	/** Checked state */
	checked: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Size variant */
	size?: "sm" | "md";
	/** Additional container styles */
	style?: ViewStyle;
	/** Callback when checkbox is toggled */
	onToggle?: (checked: boolean) => void;
}

const sizeMap = {
	sm: 20,
	md: 24,
};

/**
 * Checkbox component for form selection
 *
 * Osuki Design Rules:
 * - Square shape with 4px radius
 * - 2px border, 1px when checked
 * - Check icon when selected
 * - 44px min touch target
 * - Disabled: 40% opacity
 *
 * Features:
 * - Press scale animation (0.92) for tactile feedback
 * - Smooth spring animations
 * - Disabled state disables animations
 *
 * @example
 * ```tsx
 * <Checkbox checked={isChecked} onToggle={setChecked} />
 * <Checkbox checked={true} disabled />
 * <Checkbox checked={false} size="sm" />
 * ```
 */
interface CheckboxIndicatorContext {
	boxStyle: React.ComponentProps<typeof Animated.View>["style"];
	markStyle: React.ComponentProps<typeof Animated.View>["style"];
	dimension: number;
	markColor: string;
}

const CheckboxIndicatorContext = createContext<CheckboxIndicatorContext | null>(null);

export const CheckboxRoot: React.FC<CheckboxProps & { children?: React.ReactNode }> = ({
	checked,
	disabled = false,
	size = "md",
	style,
	onToggle,
	children,
	...rest
}) => {
	const { colors, radius } = useThemeTokens();
	const haptics = useHaptics();
	const scale = useSharedValue(1);
	const checkProgress = useSharedValue(checked ? 1 : 0);

	useEffect(() => {
		checkProgress.value = withSpring(checked ? 1 : 0, {
			stiffness: 420,
			damping: 28,
			mass: 0.72,
		});
	}, [checkProgress, checked]);

	const animatedStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(checkProgress.value, [0, 1], ["transparent", colors.primary]),
		borderColor: interpolateColor(
			checkProgress.value,
			[0, 1],
			[colors.borderStrong, colors.primary],
		),
		transform: [{ scale: scale.value }],
	}));

	const checkAnimatedStyle = useAnimatedStyle(() => ({
		opacity: checkProgress.value,
		transform: [{ scale: 0.62 + checkProgress.value * 0.38 }],
	}));

	const dimension = sizeMap[size];

	const handlePressIn = () => {
		if (!disabled) {
			scale.value = withSpring(0.92, {
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

	const handlePress = () => {
		if (!disabled && onToggle) {
			haptics.feedback("selection");
			onToggle(!checked);
		}
	};

	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: dimension,
			height: dimension,
			borderRadius: radius["sm"],
			borderWidth: 2,
			borderColor: colors.borderStrong,
			backgroundColor: "transparent",
			justifyContent: "center",
			alignItems: "center",
			opacity: disabled ? 0.4 : 1,
		}),
		[colors.borderStrong, dimension, disabled, radius],
	);

	const touchableStyle = useMemo<ViewStyle>(
		() => ({
			minWidth: 44,
			minHeight: 44,
			justifyContent: "center",
			alignItems: "center",
		}),
		[],
	);

	const indicator = useMemo<CheckboxIndicatorContext>(
		() => ({
			boxStyle: [containerStyle, animatedStyle],
			markStyle: checkAnimatedStyle,
			dimension,
			markColor: colors.onPrimary,
		}),
		[animatedStyle, checkAnimatedStyle, colors.onPrimary, containerStyle, dimension],
	);

	return (
		<CheckboxIndicatorContext.Provider value={indicator}>
			<TouchableOpacity
				onPress={handlePress}
				disabled={disabled}
				accessibilityRole="checkbox"
				accessibilityState={{ checked, disabled }}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={[touchableStyle, style]}
				activeOpacity={1}
				{...rest}
			>
				{children ?? <CheckboxIndicator />}
			</TouchableOpacity>
		</CheckboxIndicatorContext.Provider>
	);
};

export function CheckboxIndicator() {
	const indicator = useContext(CheckboxIndicatorContext);
	if (!indicator) {
		throw new Error("Checkbox.Indicator must be used within Checkbox.Root");
	}
	return (
		<Animated.View style={indicator.boxStyle}>
			<Animated.View style={indicator.markStyle}>
				<Icon name="Check" size={indicator.dimension - 5} color={indicator.markColor} />
			</Animated.View>
		</Animated.View>
	);
}

export const Checkbox = Object.assign(CheckboxRoot, {
	Root: CheckboxRoot,
	Indicator: CheckboxIndicator,
});
