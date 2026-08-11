import React from "react";
import { TouchableOpacity, View, type TouchableOpacityProps, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export type TagVariant = "default" | "active" | "pill" | "technical";

export interface TagProps extends Omit<TouchableOpacityProps, "style"> {
	/** Tag text content */
	children: string;
	/** Visual variant */
	variant?: TagVariant;
	/** Disabled state */
	disabled?: boolean;
	/** Additional styles */
	style?: ViewStyle;
	/** Callback when tag is pressed (makes tag interactive) */
	onPress?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Tag/Chip component
 *
 * Osuki Design Rules:
 * - Fill: quiet semantic surfaces, no hard outline
 * - Text: semantic label font, caption size, ALL CAPS
 * - Radius: 999px (pill) or 4px (technical)
 * - Padding: 4px 12px
 * - Active: display border + text
 *
 * Features:
 * - Press scale animation (0.96) when onPress is provided
 * - Subtle tactile feedback for interactive tags
 * - Disabled state disables animations
 *
 * @example
 * ```tsx
 * <Tag>NEW</Tag>
 * <Tag variant="active">LIVE</Tag>
 * <Tag variant="technical">API</Tag>
 * <Tag variant="pill" onPress={selectFilter}>FILTER</Tag>
 * ```
 */
export const Tag: React.FC<TagProps> = ({
	children,
	variant = "default",
	disabled = false,
	style,
	onPress,
	...rest
}) => {
	const { colors, mode, shadow } = useThemeTokens();
	const haptics = useHaptics();
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = () => {
		if (!disabled && onPress) {
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

	const isPill = variant === "pill" || variant === "active" || variant === "default";
	const isActive = variant === "active";

	const tagStyles: ViewStyle = {
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: isPill ? 999 : 4,
		backgroundColor: isActive ? colors.surface : colors.surfaceRaised,
		...(isActive && mode === "light" ? shadow.pill : {}),
		alignSelf: "flex-start",
		opacity: disabled ? 0.4 : 1,
	};

	const tagContent = (
		<Text variant="caption" color={isActive ? colors.text : colors.textMuted} transform="uppercase">
			{children}
		</Text>
	);

	if (onPress) {
		return (
			<AnimatedTouchableOpacity
				onPress={onPress}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityState={{ disabled }}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				activeOpacity={1}
				style={[tagStyles, animatedStyle, style]}
				{...rest}
			>
				{tagContent}
			</AnimatedTouchableOpacity>
		);
	}

	return <View style={[tagStyles, style]}>{tagContent}</View>;
};
