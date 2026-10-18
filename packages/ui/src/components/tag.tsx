import React from "react";
import { TouchableOpacity, View, type TouchableOpacityProps, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useResolvedSurfaceFill, useThemeTokens } from "../theme";
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
	/**
	 * Android trailing slack on the label. Off by default: a chip hugs its
	 * label, so the slack would only widen it. See `Text`'s `hugSlack`.
	 */
	hugSlack?: boolean;
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
 * - Press scale animation (theme `motion.press.chip`) when onPress is provided
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
export const TagRoot: React.FC<
	Omit<TagProps, "children" | "hugSlack"> & { children?: React.ReactNode }
> = ({ children, variant = "default", disabled = false, style, onPress, onLongPress, ...rest }) => {
	const { colors, mode, motion, shadow } = useThemeTokens();
	const haptics = useHaptics();
	const scale = useSharedValue(1);

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

	const handlePressIn = () => {
		if (!disabled && onPress) {
			scale.value = withSpring(motion.press.chip, {
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
	const baseColor = isActive ? colors.surface : colors.surfaceRaised;
	const fill = useResolvedSurfaceFill(baseColor, {
		slot: "tags.background",
		variant,
		baseColor,
		borderRadius: isPill ? 999 : 4,
	});

	const tagStyles: ViewStyle = {
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: isPill ? 999 : 4,
		backgroundColor: fill,
		...(isActive && mode === "light" ? shadow.pill : {}),
		alignSelf: "flex-start",
		maxWidth: "100%",
		opacity: disabled ? 0.4 : 1,
	};

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
				style={[tagStyles, animatedStyle, style]}
				{...rest}
			>
				{children}
			</AnimatedTouchableOpacity>
		);
	}

	return <View style={[tagStyles, style]}>{children}</View>;
};

export interface TagLabelProps {
	children?: React.ReactNode;
	/** Android trailing slack. Off by default, as on `Tag`. */
	hugSlack?: boolean;
}

export function TagLabel({ children, hugSlack = false }: TagLabelProps) {
	const { colors } = useThemeTokens();
	return (
		<Text variant="caption" color={colors.text} transform="uppercase" hugSlack={hugSlack}>
			{children}
		</Text>
	);
}

function TagFacade({ children, variant = "default", hugSlack = false, ...props }: TagProps) {
	const { colors } = useThemeTokens();
	const muted = variant !== "active";
	return (
		<TagRoot variant={variant} {...props}>
			<Text
				variant="caption"
				color={muted ? colors.textMuted : colors.text}
				transform="uppercase"
				hugSlack={hugSlack}
			>
				{children}
			</Text>
		</TagRoot>
	);
}

export const Tag = Object.assign(TagFacade, {
	Root: TagRoot,
	Label: TagLabel,
});
