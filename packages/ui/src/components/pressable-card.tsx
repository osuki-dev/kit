import React, { useMemo } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { useHaptics } from "./haptics";
import type { CardBorder } from "./card";

export type PressableCardVariant = "default" | "raised" | "flat";

export interface PressableCardProps extends Omit<PressableProps, "style" | "children"> {
	/** Visual elevation style */
	variant?: PressableCardVariant;
	/** Border treatment */
	border?: CardBorder;
	/** Border radius - default 16px (lg) for cards */
	radius?: "none" | "xs" | "sm" | "md" | "lg";
	/** Padding inside card */
	padding?: "none" | "xs" | "sm" | "md" | "lg";
	/** Disabled state */
	disabled?: boolean;
	/** Additional styles */
	style?: ViewStyle;
	/** Callback when card is pressed */
	onPress: () => void;
	/** Card content */
	children: React.ReactNode;
}

/**
 * PressableCard component for interactive cards with press feedback.
 */
export const PressableCard: React.FC<PressableCardProps> = ({
	variant = "default",
	border = "none",
	radius = "lg",
	padding = "md",
	disabled = false,
	style,
	onPress,
	onLongPress,
	onPressIn,
	onPressOut,
	children,
	...rest
}) => {
	const theme = useThemeTokens();
	const pressDepth = 1 - theme.motion.press.card;
	const haptics = useHaptics();
	const card = theme.components.Card;
	const variantTokens = card[variant];
	const pressProgress = useSharedValue(0);
	const reduceMotion = useReducedMotion();

	const animatedContentStyle = useAnimatedStyle(() => ({
		opacity: 1 - pressProgress.value * 0.06,
		transform: [
			{ translateY: pressProgress.value * 1.5 },
			{ scale: 1 - pressProgress.value * pressDepth },
		],
	}));

	const cardStyles = useMemo<ViewStyle>(() => {
		const paddingToken = card.padding[padding];
		const borderToken = variantTokens.border ?? "border";
		const shouldShowBorder = border === "subtle" || Boolean(variantTokens.border);
		const shouldLift = theme.mode === "light" && radius !== "none";
		return {
			backgroundColor: theme.colors[variantTokens.background],
			borderRadius: theme.radius[card.radius[radius]],
			padding: paddingToken === 0 ? 0 : theme.spacing[paddingToken],
			overflow: shouldLift ? "visible" : "hidden",
			...(shouldLift ? theme.shadow.soft : {}),
			...(shouldShowBorder && {
				borderWidth: 1,
				borderColor: theme.colors[borderToken],
			}),
			opacity: disabled ? 0.4 : 1,
		};
	}, [
		border,
		card,
		disabled,
		padding,
		radius,
		theme.colors,
		theme.mode,
		theme.radius,
		theme.shadow.soft,
		theme.spacing,
		variantTokens,
	]);

	// Native press recognition suppresses onPress after a handled long press.
	// Keeping feedback here leaves responder cancellation (including scrolling) silent.
	const handlePress: PressableProps["onPress"] = () => {
		if (!disabled && onPress) {
			haptics.feedback("light");
			onPress();
		}
	};
	const handleLongPress: PressableProps["onLongPress"] = (event) => {
		if (!disabled && onLongPress) {
			haptics.feedback("light");
			onLongPress(event);
		}
	};

	const handlePressIn: PressableProps["onPressIn"] = (event) => {
		if (!disabled) {
			// Reduce motion drops the movement; confirmed actions still have feedback.
			if (!reduceMotion) pressProgress.value = withSpring(1, theme.motion.press.springIn);
		}
		onPressIn?.(event);
	};

	const handlePressOut: PressableProps["onPressOut"] = (event) => {
		pressProgress.value = withSpring(0, theme.motion.press.springOut);
		onPressOut?.(event);
	};

	return (
		<Pressable
			onPress={handlePress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			onLongPress={onLongPress ? handleLongPress : undefined}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[cardStyles, style]}
			{...rest}
		>
			<Animated.View pointerEvents="none" style={animatedContentStyle}>
				{children}
			</Animated.View>
		</Pressable>
	);
};
