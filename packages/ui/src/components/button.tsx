import React, { useMemo } from "react";
import { Pressable, View, type PressableProps, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Text } from "./text";
import { useHaptics } from "./haptics";
import { Icon, type IconName } from "./icon";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonProps extends Omit<PressableProps, "style"> {
	variant?: ButtonVariant;
	children: string;
	disabled?: boolean;
	loading?: boolean;
	loadingLabel?: string;
	leftIcon?: IconName;
	rightIcon?: IconName;
	style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
	variant = "primary",
	children,
	disabled = false,
	loading = false,
	loadingLabel,
	leftIcon,
	rightIcon,
	style,
	onPressIn,
	onPressOut,
	...rest
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const pressProgress = useSharedValue(0);
	const button = theme.components.Button;
	const variantTokens = button[variant];
	const isDisabled = disabled || loading;

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: pressProgress.value }, { scale: 1 - pressProgress.value * 0.012 }],
	}));

	const buttonStyle = useMemo<ViewStyle>(() => {
		const backgroundToken = disabled ? "surfaceRaised" : variantTokens.background;
		return {
			minHeight: button.height,
			paddingVertical: theme.spacing[button.paddingY],
			paddingHorizontal: theme.spacing[button.paddingX],
			borderRadius: theme.radius[button.radius],
			alignItems: "center",
			justifyContent: "center",
			opacity: loading ? 0.68 : 1,
			backgroundColor:
				backgroundToken === "transparent" ? "transparent" : theme.colors[backgroundToken],
			...(!isDisabled && variantTokens.background !== "transparent" && theme.mode === "light"
				? theme.shadow.pill
				: {}),
			...(variantTokens.border && {
				borderWidth: 1,
				borderColor: theme.colors[variantTokens.border],
			}),
		};
	}, [
		button,
		disabled,
		isDisabled,
		loading,
		theme.colors,
		theme.mode,
		theme.radius,
		theme.shadow.pill,
		theme.spacing,
		variantTokens,
	]);

	const textColor = disabled ? theme.colors.textDisabled : theme.colors[variantTokens.foreground];
	const iconColor = loading ? theme.colors.textDisabled : textColor;

	const handlePressIn: PressableProps["onPressIn"] = (event) => {
		if (!isDisabled) {
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
		<AnimatedPressable
			style={[buttonStyle, animatedStyle, style]}
			disabled={isDisabled}
			accessibilityRole="button"
			accessibilityState={{ disabled: isDisabled, busy: loading }}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			{...rest}
		>
			<View
				style={{
					minWidth: 0,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					gap: theme.spacing.sm,
				}}
			>
				{loading ? (
					<Spinner
						size="sm"
						color={iconColor}
						testID={rest.testID ? `${rest.testID}-spinner` : undefined}
					/>
				) : leftIcon ? (
					<Icon name={leftIcon} size={17} color={iconColor} />
				) : null}
				<Text
					variant="button"
					color={textColor}
					transform="uppercase"
					numberOfLines={1}
					adjustsFontSizeToFit
					minimumFontScale={0.72}
					style={{ flexShrink: 1, minWidth: 0, textAlign: "center" }}
				>
					{loading && loadingLabel ? loadingLabel : children}
				</Text>
				{!loading && rightIcon ? <Icon name={rightIcon} size={17} color={iconColor} /> : null}
			</View>
		</AnimatedPressable>
	);
};
