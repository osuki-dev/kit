import React, { useMemo } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
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
	onPressIn,
	onPressOut,
	children,
	...rest
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const card = theme.components.Card;
	const variantTokens = card[variant];
	const pressProgress = useSharedValue(0);

	const animatedContentStyle = useAnimatedStyle(() => ({
		opacity: 1 - pressProgress.value * 0.06,
		transform: [
			{ translateY: pressProgress.value * 1.5 },
			{ scale: 1 - pressProgress.value * 0.01 },
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

	const handlePressIn: PressableProps["onPressIn"] = (event) => {
		if (!disabled) {
			haptics.feedback("light");
			pressProgress.value = withSpring(1, {
				stiffness: 520,
				damping: 34,
				mass: 0.72,
			});
		}
		onPressIn?.(event);
	};

	const handlePressOut: PressableProps["onPressOut"] = (event) => {
		pressProgress.value = withSpring(0, {
			stiffness: 420,
			damping: 30,
			mass: 0.78,
		});
		onPressOut?.(event);
	};

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
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
