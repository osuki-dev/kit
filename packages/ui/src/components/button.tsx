import React, { createContext, useContext, useMemo } from "react";
import {
	Pressable,
	StyleSheet,
	View,
	type PressableProps,
	type StyleProp,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import {
	readStringFill,
	useResolvedSurfaceFill,
	useSurfaceDecorator,
	useThemeTokens,
	withoutStringFill,
	type SurfaceMeta,
} from "../theme";
import { useHaptics } from "./haptics";
import { Icon, type IconName } from "./icon";
import { Spinner, type SpinnerProps } from "./spinner";
import { Text, type TextProps } from "./text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonContextValue {
	variant: ButtonVariant;
	disabled: boolean;
	loading: boolean;
	slot: string;
	baseColor: string;
	resolvedBackgroundColor: string;
	textColor: string;
	iconColor: string;
	borderRadius: number;
	meta: SurfaceMeta;
}

const ButtonContext = createContext<ButtonContextValue | null>(null);

export function useButton(): ButtonContextValue {
	const context = useContext(ButtonContext);
	if (!context) {
		throw new Error("Button compound components must be used within Button.Root");
	}
	return context;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
	baseRoot: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
	},
	background: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	},
	contentRow: {
		minWidth: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		flexShrink: 1,
		minWidth: 0,
		textAlign: "center",
	},
});

export interface ButtonRootProps extends Omit<PressableProps, "style" | "children"> {
	variant?: ButtonVariant;
	disabled?: boolean;
	loading?: boolean;
	slot?: string;
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode;
}

export function ButtonRoot({
	variant = "primary",
	disabled = false,
	loading = false,
	slot,
	style,
	onPressIn,
	onPressOut,
	children,
	...rest
}: ButtonRootProps) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const pressProgress = useSharedValue(0);
	const pressDepth = 1 - theme.motion.press.control;

	const button = theme.components.Button;
	const variantTokens = button[variant];
	const isDisabled = disabled || loading;
	const flatStyle = StyleSheet.flatten(style);
	const fillOverride = readStringFill(style);
	const borderRadius =
		typeof flatStyle?.borderRadius === "number"
			? flatStyle.borderRadius
			: theme.radius[button.radius];

	const backgroundToken = disabled ? "surfaceRaised" : variantTokens.background;
	const tokenColor =
		backgroundToken === "transparent" ? "transparent" : theme.colors[backgroundToken];
	const baseColor = fillOverride ?? tokenColor;

	const resolvedSlot = slot ?? `buttons.${variant}.background`;

	const surfaceMeta: SurfaceMeta = useMemo(
		() => ({
			slot: resolvedSlot,
			variant,
			baseColor,
			disabled: isDisabled,
			borderRadius,
		}),
		[resolvedSlot, variant, baseColor, isDisabled, borderRadius],
	);

	const resolvedBackgroundColor = useResolvedSurfaceFill(baseColor, surfaceMeta);

	const textColor = disabled ? theme.colors.textDisabled : theme.colors[variantTokens.foreground];
	const iconColor = loading ? theme.colors.textDisabled : textColor;

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: pressProgress.value },
			{ scale: 1 - pressProgress.value * pressDepth },
		],
	}));

	const buttonRootStyle = useMemo<ViewStyle>(() => {
		return {
			minHeight: button.height,
			paddingVertical: theme.spacing[button.paddingY],
			paddingHorizontal: theme.spacing[button.paddingX],
			borderRadius,
			opacity: loading ? 0.68 : 1,
			gap: theme.spacing.sm,
			...(variantTokens.border && {
				borderWidth: StyleSheet.hairlineWidth,
				borderColor: theme.colors[variantTokens.border],
			}),
		};
	}, [
		button.height,
		button.paddingX,
		button.paddingY,
		borderRadius,
		loading,
		theme.colors,
		theme.spacing,
		variantTokens.border,
	]);

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

	const contextValue = useMemo<ButtonContextValue>(
		() => ({
			variant,
			disabled: isDisabled,
			loading,
			slot: resolvedSlot,
			baseColor,
			resolvedBackgroundColor,
			textColor,
			iconColor,
			borderRadius,
			meta: surfaceMeta,
		}),
		[
			variant,
			isDisabled,
			loading,
			resolvedSlot,
			baseColor,
			resolvedBackgroundColor,
			textColor,
			iconColor,
			borderRadius,
			surfaceMeta,
		],
	);

	return (
		<ButtonContext.Provider value={contextValue}>
			<AnimatedPressable
				style={[styles.baseRoot, buttonRootStyle, animatedStyle, withoutStringFill(style)]}
				disabled={isDisabled}
				accessibilityRole="button"
				accessibilityState={{ disabled: isDisabled, busy: loading }}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				{...rest}
			>
				{children}
			</AnimatedPressable>
		</ButtonContext.Provider>
	);
}

export interface ButtonBackgroundProps extends ViewProps {
	children?: React.ReactNode;
}

export function ButtonBackground({ style, children, ...props }: ButtonBackgroundProps) {
	const { resolvedBackgroundColor, borderRadius, meta, variant, disabled } = useButton();
	const theme = useThemeTokens();
	const decorator = useSurfaceDecorator();
	const variantTokens = theme.components.Button[variant];
	const lift = !disabled && variantTokens.background !== "transparent" && theme.mode === "light";

	return (
		<View
			collapsable={true}
			pointerEvents="none"
			style={[
				styles.background,
				{
					backgroundColor: resolvedBackgroundColor,
					borderRadius,
					...(lift ? theme.shadow.pill : {}),
				},
				style,
			]}
			{...props}
		>
			<View
				collapsable
				pointerEvents="none"
				style={[styles.background, { borderRadius, overflow: "hidden" }]}
			>
				{decorator?.renderDecoration?.(meta)}
				{children}
			</View>
		</View>
	);
}

export interface ButtonLabelProps extends Omit<TextProps, "children"> {
	children?: React.ReactNode;
}

export function ButtonLabel({ style, children, ...props }: ButtonLabelProps) {
	const { textColor } = useButton();
	const flattenedStyle = StyleSheet.flatten([styles.label, style]) ?? undefined;

	return (
		<Text
			variant="button"
			color={textColor}
			transform="uppercase"
			numberOfLines={1}
			adjustsFontSizeToFit
			minimumFontScale={0.72}
			style={flattenedStyle}
			{...props}
		>
			{children}
		</Text>
	);
}

export interface ButtonIconProps {
	name: IconName;
	size?: number;
	color?: string;
	style?: StyleProp<ViewStyle>;
}

export function ButtonIcon({ name, size = 17, color, style }: ButtonIconProps) {
	const { iconColor } = useButton();
	return <Icon name={name} size={size} color={color ?? iconColor} style={style} />;
}

export interface ButtonSpinnerProps extends Partial<SpinnerProps> {}

export function ButtonSpinner({ size = "sm", color, testID, ...props }: ButtonSpinnerProps) {
	const { iconColor } = useButton();
	return <Spinner size={size} color={color ?? iconColor} testID={testID} {...props} />;
}

export interface ButtonProps extends Omit<PressableProps, "style"> {
	variant?: ButtonVariant;
	children?: React.ReactNode;
	disabled?: boolean;
	loading?: boolean;
	loadingLabel?: string;
	leftIcon?: IconName;
	rightIcon?: IconName;
	slot?: string;
	style?: StyleProp<ViewStyle>;
}

export function Button({
	variant = "primary",
	children,
	disabled = false,
	loading = false,
	loadingLabel,
	leftIcon,
	rightIcon,
	slot,
	style,
	onPressIn,
	onPressOut,
	...rest
}: ButtonProps) {
	const theme = useThemeTokens();

	return (
		<ButtonRoot
			variant={variant}
			disabled={disabled}
			loading={loading}
			slot={slot}
			style={style}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			{...rest}
		>
			<ButtonBackground />
			<View style={[styles.contentRow, { gap: theme.spacing.sm }]}>
				{loading ? (
					<ButtonSpinner testID={rest.testID ? `${rest.testID}-spinner` : undefined} />
				) : leftIcon ? (
					<ButtonIcon name={leftIcon} />
				) : null}
				{typeof children === "string" ? (
					<ButtonLabel>{loading && loadingLabel ? loadingLabel : children}</ButtonLabel>
				) : loading && loadingLabel ? (
					<ButtonLabel>{loadingLabel}</ButtonLabel>
				) : (
					children
				)}
				{!loading && rightIcon ? <ButtonIcon name={rightIcon} /> : null}
			</View>
		</ButtonRoot>
	);
}

Button.Root = ButtonRoot;
Button.Background = ButtonBackground;
Button.Label = ButtonLabel;
Button.Icon = ButtonIcon;
Button.Spinner = ButtonSpinner;
