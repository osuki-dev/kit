import React, { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import {
	Platform,
	StyleSheet,
	View,
	type TextInputProps,
	type ViewStyle,
	type TextStyle,
} from "react-native";
import Animated, {
	FadeInDown,
	Layout,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { resolveFontStyle, useResolvedSurfaceFill, useSurfaceDecorator, useThemeTokens } from "../theme";
import { TextField } from "../utils/text-field";
import { Text } from "./text";

export type InputVariant = "underline" | "outline";
export type InputSize = "default" | "compact";

interface InputFrame {
	testID?: string;
	placeholderColor: string;
	textStyle: TextStyle;
	controlStyle: ViewStyle;
	animatedStyle: ReturnType<typeof useAnimatedStyle>;
	borderRadius: number;
	errorFill: string;
	decorationMeta: {
		slot: string;
		variant: string;
		baseColor: string;
		borderRadius: number;
	};
	inputProps: Omit<TextInputProps, "style" | "onFocus" | "onBlur">;
	onFocus: TextInputProps["onFocus"];
	onBlur: TextInputProps["onBlur"];
}

export const InputFrameContext = createContext<InputFrame | null>(null);

function useInputFrame(): InputFrame {
	const frame = useContext(InputFrameContext);
	if (!frame) throw new Error("Input parts must be used within Input.Root");
	return frame;
}

export interface InputProps extends Omit<TextInputProps, "style"> {
	label?: string;
	variant?: InputVariant;
	size?: InputSize;
	error?: string;
	helper?: string;
	containerStyle?: ViewStyle;
	style?: TextStyle;
}

export const InputRoot: React.FC<InputProps> = ({
	label,
	variant = "underline",
	size = "default",
	error,
	helper,
	containerStyle,
	style,
	onFocus,
	onBlur,
	children,
	...textInputProps
}) => {
	const theme = useThemeTokens();
	const input = theme.components.Input;
	const hasError = !!error;
	const hasHelper = !!helper && !hasError;
	const isMultiline = textInputProps.multiline === true;
	const numberOfLines =
		typeof textInputProps.numberOfLines === "number" ? textInputProps.numberOfLines : 4;
	const focusProgress = useSharedValue(0);
	const errorProgress = useSharedValue(hasError ? 1 : 0);

	useEffect(() => {
		errorProgress.value = withTiming(hasError ? 1 : 0, { duration: 160 });
	}, [errorProgress, hasError]);

	const containerStyles = useMemo<ViewStyle>(
		() => ({ width: "100%", gap: theme.spacing.sm }),
		[theme.spacing],
	);

	const controlBase =
		input.background === "transparent" ? "transparent" : theme.colors[input.background];
	const controlMeta = useMemo(
		() => ({
			slot: "inputs.background",
			variant,
			baseColor: controlBase,
			borderRadius: variant === "outline" ? theme.radius[input.radius] : 0,
		}),
		[controlBase, input.radius, theme.radius, variant],
	);
	const controlFill = useResolvedSurfaceFill(controlBase, controlMeta);
	const errorMeta = useMemo(
		() => ({
			slot: "inputs.error",
			variant,
			baseColor: theme.colors.dangerSubtle,
		}),
		[theme.colors.dangerSubtle, variant],
	);
	const errorFill = useResolvedSurfaceFill(theme.colors.dangerSubtle, errorMeta);

	const inputContainerStyles = useMemo<ViewStyle>(() => {
		const verticalPadding = size === "compact" ? theme.spacing.xs : theme.spacing[input.paddingY];
		const minHeight = isMultiline
			? verticalPadding * 2 + Math.max(numberOfLines, 2) * 24
			: size === "compact"
				? 40
				: 48;

		return {
			position: "relative",
			minHeight,
			justifyContent: isMultiline ? "flex-start" : "center",
			overflow: "hidden",
			backgroundColor: controlFill,
			...(variant === "outline" && {
				borderRadius: theme.radius[input.radius],
				paddingHorizontal: theme.spacing[input.paddingX],
				paddingVertical: verticalPadding,
			}),
			...(variant === "underline" && {
				borderBottomWidth: StyleSheet.hairlineWidth,
				borderColor: theme.colors[input.border],
				paddingVertical: verticalPadding,
			}),
		};
	}, [
		controlFill,
		input,
		isMultiline,
		numberOfLines,
		size,
		theme.colors,
		theme.radius,
		theme.spacing,
		variant,
	]);

	const animatedInputContainerStyle = useAnimatedStyle(() => {
		const focusBorder = interpolateColor(
			focusProgress.value,
			[0, 1],
			[theme.colors[input.border], theme.colors[input.borderFocused]],
		);

		return {
			borderColor: interpolateColor(
				errorProgress.value,
				[0, 1],
				[focusBorder, theme.colors[input.borderError]],
			),
		};
	});

	const inputStyles = useMemo<TextStyle>(() => {
		const lineHeight = size === "compact" ? 20 : 22;

		return {
			alignSelf: "stretch",
			...resolveFontStyle(theme.fonts, theme.typeStyles.body.fontFamily, "regular"),
			fontSize: size === "compact" ? 14 : 16,
			color: theme.colors[input.foreground],
			padding: 0,
			paddingVertical: 0,
			minHeight: isMultiline ? Math.max(numberOfLines, 2) * 24 : lineHeight,
			height: isMultiline ? undefined : lineHeight,
			lineHeight,
			textAlignVertical: isMultiline ? "top" : "center",
			includeFontPadding: Platform.OS === "android" ? false : undefined,
		};
	}, [
		input.foreground,
		isMultiline,
		numberOfLines,
		size,
		theme.colors,
		theme.fonts,
		theme.typeStyles.body.fontFamily,
	]);

	const handleFocus: TextInputProps["onFocus"] = (e) => {
		focusProgress.value = withTiming(1, { duration: 140 });
		onFocus?.(e);
	};

	const handleBlur: TextInputProps["onBlur"] = (e) => {
		focusProgress.value = withTiming(0, { duration: 160 });
		onBlur?.(e);
	};

	const frame = useMemo<InputFrame>(
		() => ({
			testID: textInputProps.testID,
			placeholderColor: theme.colors[input.placeholder],
			textStyle: inputStyles,
			controlStyle: inputContainerStyles,
			animatedStyle: animatedInputContainerStyle,
			borderRadius: controlMeta.borderRadius ?? 0,
			errorFill,
			decorationMeta: {
				slot: controlMeta.slot ?? "inputs.background",
				variant,
				baseColor: controlMeta.baseColor,
				borderRadius: controlMeta.borderRadius ?? 0,
			},
			inputProps: textInputProps,
			onFocus: handleFocus,
			onBlur: handleBlur,
		}),
		[
			animatedInputContainerStyle,
			controlMeta,
			errorFill,
			handleBlur,
			handleFocus,
			input.placeholder,
			inputContainerStyles,
			inputStyles,
			textInputProps,
			theme.colors,
		],
	);

	const slots = (
		<>
			{label ? <InputLabel>{label}</InputLabel> : null}
			<InputControl style={style} />
			{hasError ? <InputError testID={textInputProps.testID}>{error}</InputError> : null}
			{hasHelper ? <InputHint>{helper}</InputHint> : null}
		</>
	);

	return (
		<InputFrameContext.Provider value={frame}>
			<View
				testID={textInputProps.testID ? `${textInputProps.testID}-container` : undefined}
				style={[containerStyles, containerStyle]}
			>
				{children ?? slots}
			</View>
		</InputFrameContext.Provider>
	);
};

export function InputLabel({ children }: { children?: ReactNode }) {
	if (!children) return null;
	return (
		<Text variant="label" colorKey="textMuted">
			{children}
		</Text>
	);
}

export function InputControl({ style }: { style?: TextStyle }) {
	const decorator = useSurfaceDecorator();
	const frame = useInputFrame();
	return (
		<Animated.View
			testID={frame.testID ? `${frame.testID}-control` : undefined}
			style={[frame.controlStyle, frame.animatedStyle]}
		>
			{decorator?.renderDecoration ? (
				<View
					collapsable
					pointerEvents="none"
					style={[StyleSheet.absoluteFill, { borderRadius: frame.borderRadius }]}
				>
					{decorator.renderDecoration(frame.decorationMeta)}
				</View>
			) : null}
			<TextField
				style={[frame.textStyle, style]}
				placeholderTextColor={frame.placeholderColor}
				onFocus={frame.onFocus}
				onBlur={frame.onBlur}
				{...frame.inputProps}
			/>
		</Animated.View>
	);
}

export function InputError({ children, testID }: { children?: ReactNode; testID?: string }) {
	const theme = useThemeTokens();
	const frame = useInputFrame();
	if (!children) return null;
	return (
		<Animated.View
			testID={testID ? `${testID}-error` : undefined}
			entering={FadeInDown.duration(150)}
			layout={Layout.springify().damping(20).stiffness(260)}
			style={{
				backgroundColor: frame.errorFill,
				borderRadius: theme.radius.pill,
				paddingHorizontal: theme.spacing.md,
				paddingVertical: theme.spacing.xs,
				alignSelf: "flex-start",
				maxWidth: "100%",
			}}
		>
			<Text variant="caption" colorKey="danger">
				{children}
			</Text>
		</Animated.View>
	);
}

export function InputHint({ children }: { children?: ReactNode }) {
	if (!children) return null;
	return (
		<Text variant="caption" colorKey="textDisabled">
			{children}
		</Text>
	);
}

export const Input = Object.assign(InputRoot, {
	Root: InputRoot,
	Label: InputLabel,
	Control: InputControl,
	Error: InputError,
	Hint: InputHint,
});
