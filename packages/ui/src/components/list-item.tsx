import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View, type TouchableOpacityProps, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Text } from "./text";
import { Icon, type IconName } from "./icon";
import { useHaptics } from "./haptics";

export interface ListItemProps extends Omit<TouchableOpacityProps, "style"> {
	/** Leading icon name (Lucide icon) */
	icon?: IconName | string;
	/** Primary text */
	title: string;
	/** Secondary text below title */
	subtitle?: string;
	/** Trailing element (text, badge, or icon) */
	trailing?: string | React.ReactNode;
	/** Optional separator placement */
	separator?: "none" | "bottom";
	/** Disabled state */
	disabled?: boolean;
	/** Additional container styles */
	style?: ViewStyle;
	/** Callback when item is pressed */
	onPress?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * ListItem component for lists and menus
 *
 * Osuki Design Rules:
 * - Min height 56px
 * - 16px horizontal padding
 * - 12px gap between elements
 * - Monospace caption for subtitle
 * - Optional semantic bottom separator
 * - 44px touch target for trailing actions
 *
 * Features:
 * - Press scale animation (0.98) for tactile feedback
 * - Smooth spring animations
 * - Disabled state disables animations
 *
 * @example
 * ```tsx
 * <ListItem
 *   icon="User"
 *   title="John Doe"
 *   subtitle="Admin"
 *   trailing="→"
 *   onPress={() => {}}
 * />
 * <ListItem
 *   title="Settings"
 *   icon="Settings"
 *   separator="bottom"
 * />
 * ```
 */
export const ListItem: React.FC<ListItemProps> = ({
	icon,
	title,
	subtitle,
	trailing,
	separator = "none",
	disabled = false,
	style,
	onPress,
	...rest
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = useCallback(() => {
		if (!disabled && onPress) {
			haptics.feedback("selection");
			scale.value = withSpring(0.98, {
				stiffness: 400,
				damping: 25,
			});
		}
	}, [disabled, haptics, onPress, scale]);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, {
			stiffness: 300,
			damping: 20,
		});
	}, [scale]);

	const tokens = theme.components.ListItem;
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: "row",
			alignItems: "center",
			minHeight: tokens.minHeight,
			paddingHorizontal: theme.spacing[tokens.paddingX],
			paddingVertical: theme.spacing[tokens.paddingY],
			gap: theme.spacing[tokens.gap],
			opacity: disabled ? 0.4 : 1,
			borderBottomWidth: separator === "bottom" ? 1 : 0,
			borderBottomColor: theme.colors[theme.semantic.divider],
			backgroundColor:
				tokens.background === "transparent" ? "transparent" : theme.colors[tokens.background],
		}),
		[disabled, separator, theme.colors, theme.semantic.divider, theme.spacing, tokens],
	);

	const contentStyle: ViewStyle = {
		flex: 1,
		minWidth: 0,
		gap: 2,
	};

	const renderTrailing = () => {
		if (!trailing) return null;

		if (typeof trailing === "string") {
			return (
				<View style={trailingStyle}>
					<Text
						variant="caption"
						color={theme.colors.textMuted}
						overflowMode="marquee"
						marqueePlayback="manual"
						style={{ textAlign: "right" }}
					>
						{trailing}
					</Text>
				</View>
			);
		}

		return <View style={trailingStyle}>{trailing}</View>;
	};

	const content = (
		<>
			{icon && (
				<View style={iconSlotStyle}>
					<Icon name={icon as IconName} size={22} color={theme.colors.textMuted} />
				</View>
			)}

			<View style={contentStyle}>
				<Text
					variant="body"
					color={theme.colors.text}
					overflowMode="marquee"
					marqueePlayback="manual"
				>
					{title}
				</Text>
				{subtitle && (
					<Text
						variant="caption"
						color={theme.colors.textMuted}
						overflowMode="marquee"
						marqueePlayback="manual"
					>
						{subtitle.toUpperCase()}
					</Text>
				)}
			</View>

			{renderTrailing()}
		</>
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
				style={[containerStyle, animatedStyle, style]}
				{...rest}
			>
				{content}
			</AnimatedTouchableOpacity>
		);
	}

	return <View style={[containerStyle, style]}>{content}</View>;
};

const iconSlotStyle: ViewStyle = {
	width: 32,
	minHeight: 44,
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
};

const trailingStyle: ViewStyle = {
	minWidth: 44,
	maxWidth: 132,
	minHeight: 44,
	alignItems: "flex-end",
	justifyContent: "center",
	flexShrink: 0,
};
