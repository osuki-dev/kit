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
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import {
	readStringFill,
	useResolvedSurfaceFill,
	useThemeTokens,
	withoutStringFill,
	type SurfaceMeta,
	type SurfaceSlot,
} from "../theme";
import { useHaptics } from "./haptics";
import { Icon, type IconName } from "./icon";
import { Spinner, type SpinnerProps } from "./spinner";
import { Text, type TextProps } from "./text";
import { SurfaceDecoration } from "./surface-decoration";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonContextValue {
	variant: ButtonVariant;
	disabled: boolean;
	loading: boolean;
	slot: SurfaceSlot;
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
	// A column, as in 1.x: a row root measures its content row against the
	// parent's width inside a wrapping column, and the button grows past it.
	baseRoot: {
		flexDirection: "column",
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
	slot?: SurfaceSlot;
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode;
}

export function ButtonRoot({
	variant = "primary",
	disabled = false,
	loading = false,
	slot,
	style,
	onPress,
	onLongPress,
	onPressIn,
	onPressOut,
	children,
	...rest
}: ButtonRootProps) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const pressProgress = useSharedValue(0);
	const reduceMotion = useReducedMotion();
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

	const surfaceMeta: SurfaceMeta = useMemo<SurfaceMeta>(
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

	// Native press recognition suppresses onPress after a handled long press.
	// Keeping feedback here leaves responder cancellation (including scrolling) silent.
	const handlePress: PressableProps["onPress"] = (event) => {
		if (!isDisabled && onPress) {
			haptics.feedback("light");
			onPress(event);
		}
	};
	const handleLongPress: PressableProps["onLongPress"] = (event) => {
		if (!isDisabled && onLongPress) {
			haptics.feedback("light");
			onLongPress(event);
		}
	};

	const handlePressIn: PressableProps["onPressIn"] = (event) => {
		if (!isDisabled) {
			// Reduce motion drops the movement; confirmed actions still have feedback.
			if (!reduceMotion) pressProgress.value = withSpring(1, theme.motion.press.springIn);
		}
		onPressIn?.(event);
	};

	const handlePressOut: PressableProps["onPressOut"] = (event) => {
		pressProgress.value = withSpring(0, theme.motion.press.springOut);
		onPressOut?.(event);
	};

	// `Button.Background` stays a layer of the root; every other part goes in
	// one centred row, so `<Button.Icon />` and `<Button.Label />` sit side by
	// side inside the column root.
	const layers: React.ReactNode[] = [];
	const content: React.ReactNode[] = [];
	for (const child of React.Children.toArray(children)) {
		if (React.isValidElement(child) && child.type === ButtonBackground) layers.push(child);
		else content.push(child);
	}

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
				onPress={onPress ? handlePress : undefined}
				onLongPress={onLongPress ? handleLongPress : undefined}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				{...rest}
			>
				{layers}
				{content.length > 0 ? (
					<View style={[styles.contentRow, { gap: theme.spacing.sm }]}>{content}</View>
				) : null}
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
	const variantTokens = theme.components.Button[variant];
	const shadowToken = variantTokens.shadow ?? "pill";
	const lift =
		!disabled &&
		shadowToken !== "none" &&
		variantTokens.background !== "transparent" &&
		theme.mode === "light";

	return (
		<View
			collapsable={true}
			pointerEvents="none"
			style={[
				styles.background,
				{
					backgroundColor: resolvedBackgroundColor,
					borderRadius,
					...(lift ? theme.shadow[shadowToken] : {}),
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
				<SurfaceDecoration {...meta} />
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
			// Centred in the button, where the slack would move it off centre.
			// A caller can still pass `hugSlack`.
			hugSlack={false}
			variant="button"
			color={textColor}
			transform="inherit"
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
	slot?: SurfaceSlot;
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
		</ButtonRoot>
	);
}

Button.Root = ButtonRoot;
Button.Background = ButtonBackground;
Button.Label = ButtonLabel;
Button.Icon = ButtonIcon;
Button.Spinner = ButtonSpinner;
