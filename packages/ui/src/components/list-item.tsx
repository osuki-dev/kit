import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View, type TouchableOpacityProps, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useResolvedSurfaceFill, useThemeTokens } from "../theme";
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
 * - Press scale animation (theme `motion.press.row`) for tactile feedback
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
export const ListItemRoot: React.FC<ListItemProps> = ({
	icon,
	title,
	subtitle,
	trailing,
	separator = "none",
	disabled = false,
	style,
	onPress,
	onLongPress,
	...rest
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const scale = useSharedValue(1);
	const rowBase =
		theme.components.ListItem.background === "transparent"
			? "transparent"
			: theme.colors[theme.components.ListItem.background];
	const rowFill = useResolvedSurfaceFill(rowBase, { slot: "rows.background", baseColor: rowBase });

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	// Native press recognition suppresses onPress after a handled long press.
	// Keeping feedback here leaves responder cancellation (including scrolling) silent.
	const handlePress: TouchableOpacityProps["onPress"] = () => {
		if (!disabled && onPress) {
			haptics.feedback("selection");
			onPress();
		}
	};
	const handleLongPress: TouchableOpacityProps["onLongPress"] = (event) => {
		if (!disabled && onLongPress) {
			haptics.feedback("selection");
			onLongPress(event);
		}
	};

	const handlePressIn = useCallback(() => {
		if (!disabled && onPress) {
			scale.value = withSpring(theme.motion.press.row, {
				stiffness: 400,
				damping: 25,
			});
		}
	}, [disabled, onPress, scale, theme.motion.press.row]);

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
			backgroundColor: rowFill,
		}),
		[disabled, rowFill, separator, theme.colors, theme.semantic.divider, theme.spacing, tokens],
	);

	const content = (
		<>
			{icon ? <ListItemLeading name={icon as IconName} /> : null}
			<ListItemBody>
				<ListItemTitle>{title}</ListItemTitle>
				{subtitle ? <ListItemSubtitle>{subtitle}</ListItemSubtitle> : null}
			</ListItemBody>
			{trailing ? <ListItemTrailing>{trailing}</ListItemTrailing> : null}
		</>
	);

	if (onPress) {
		return (
			<AnimatedTouchableOpacity
				onPress={handlePress}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityState={{ disabled }}
				onLongPress={onLongPress ? handleLongPress : undefined}
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

export function ListItemLeading({ name }: { name: IconName }) {
	const theme = useThemeTokens();
	return (
		<View style={iconSlotStyle}>
			<Icon name={name} size={22} color={theme.colors.textMuted} />
		</View>
	);
}

export function ListItemBody({ children }: { children?: React.ReactNode }) {
	return <View style={bodyStyle}>{children}</View>;
}

export function ListItemTitle({ children }: { children?: React.ReactNode }) {
	const theme = useThemeTokens();
	return (
		<Text variant="body" color={theme.colors.text} overflowMode="marquee" marqueePlayback="manual">
			{children}
		</Text>
	);
}

export function ListItemSubtitle({ children }: { children?: string }) {
	const theme = useThemeTokens();
	if (!children) return null;
	return (
		<Text
			variant="caption"
			color={theme.colors.textMuted}
			overflowMode="marquee"
			marqueePlayback="manual"
		>
			{children.toUpperCase()}
		</Text>
	);
}

export function ListItemTrailing({ children }: { children?: React.ReactNode }) {
	const theme = useThemeTokens();
	if (!children) return null;
	if (typeof children === "string") {
		return (
			<View style={trailingStyle}>
				<Text
					variant="caption"
					color={theme.colors.textMuted}
					overflowMode="marquee"
					marqueePlayback="manual"
					style={{ textAlign: "right" }}
				>
					{children}
				</Text>
			</View>
		);
	}
	return <View style={trailingStyle}>{children}</View>;
}

export const ListItem = Object.assign(ListItemRoot, {
	Root: ListItemRoot,
	Leading: ListItemLeading,
	Body: ListItemBody,
	Title: ListItemTitle,
	Subtitle: ListItemSubtitle,
	Trailing: ListItemTrailing,
});

const bodyStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	gap: 2,
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
