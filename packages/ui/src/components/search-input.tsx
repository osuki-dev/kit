import React, { useMemo } from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	View,
	type TextInputProps,
	type TextStyle,
	type ViewStyle,
} from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { resolveFontStyle, useResolvedSurfaceFill, useSurfaceDecorator, useThemeTokens } from "../theme";
import { TextField } from "../utils/text-field";
import { Icon } from "./icon";

export interface SearchInputProps extends Omit<TextInputProps, "style"> {
	value: string;
	onChangeText: (value: string) => void;
	onClear?: () => void;
	containerStyle?: ViewStyle;
	inputStyle?: TextStyle;
	clearAccessibilityLabel?: string;
}

export const SearchInputRoot: React.FC<SearchInputProps> = ({
	value,
	onChangeText,
	onClear,
	containerStyle,
	inputStyle,
	clearAccessibilityLabel = "Clear search",
	placeholder = "Search",
	onFocus,
	onBlur,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const decorator = useSurfaceDecorator();
	const input = theme.components.Input;
	const focusProgress = useSharedValue(0);
	const showClear = value.length > 0;
	const controlBase =
		input.background === "transparent" ? "transparent" : theme.colors[input.background];
	const controlMeta = useMemo(
		() => ({
			slot: "inputs.search",
			variant: "search",
			baseColor: controlBase,
			borderRadius: theme.radius.pill,
		}),
		[controlBase, theme.radius.pill],
	);
	const controlFill = useResolvedSurfaceFill(controlBase, controlMeta);

	const containerStyles = useMemo<ViewStyle>(
		() => ({
			position: "relative",
			minHeight: 44,
			width: "100%",
			borderWidth: StyleSheet.hairlineWidth,
			borderRadius: theme.radius.pill,
			paddingHorizontal: theme.spacing.md,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			overflow: "hidden",
			backgroundColor: controlFill,
			borderColor: theme.colors[input.border],
		}),
		[controlFill, input.border, theme.colors, theme.radius.pill, theme.spacing],
	);

	const animatedContainerStyle = useAnimatedStyle(() => ({
		borderColor: interpolateColor(
			focusProgress.value,
			[0, 1],
			[theme.colors[input.border], theme.colors[input.borderFocused]],
		),
	}));

	const textInputStyle = useMemo<TextStyle>(
		() => ({
			alignSelf: "stretch",
			flex: 1,
			minWidth: 0,
			paddingVertical: 0,
			height: 22,
			...resolveFontStyle(theme.fonts, theme.typeStyles.body.fontFamily, "regular"),
			fontSize: 16,
			lineHeight: 22,
			color: theme.colors[input.foreground],
			textAlignVertical: "center",
			includeFontPadding: Platform.OS === "android" ? false : undefined,
		}),
		[input.foreground, theme.colors, theme.fonts, theme.typeStyles.body.fontFamily],
	);

	const handleClear = () => {
		onChangeText("");
		onClear?.();
	};

	const handleFocus: TextInputProps["onFocus"] = (event) => {
		focusProgress.value = withTiming(1, { duration: 140 });
		onFocus?.(event);
	};

	const handleBlur: TextInputProps["onBlur"] = (event) => {
		focusProgress.value = withTiming(0, { duration: 160 });
		onBlur?.(event);
	};

	return (
		<Animated.View
			testID={testID ? `${testID}-container` : undefined}
			style={[containerStyles, animatedContainerStyle, containerStyle]}
		>
			{decorator?.renderDecoration ? (
				<View collapsable pointerEvents="none" style={StyleSheet.absoluteFill}>
					{decorator.renderDecoration(controlMeta)}
				</View>
			) : null}
			<Icon name="Search" size={18} color={theme.colors.textMuted} />
			<TextField
				testID={testID}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={theme.colors[input.placeholder]}
				returnKeyType="search"
				clearButtonMode="never"
				style={[textInputStyle, inputStyle]}
				onFocus={handleFocus}
				onBlur={handleBlur}
				{...props}
			/>
			{showClear ? (
				<SearchInputClear
					testID={testID ? `${testID}-clear` : undefined}
					accessibilityLabel={clearAccessibilityLabel}
					onPress={handleClear}
					color={theme.colors.textMuted}
				/>
			) : null}
		</Animated.View>
	);
};

export function SearchInputClear({
	onPress,
	accessibilityLabel,
	testID,
	color,
}: {
	onPress: () => void;
	accessibilityLabel: string;
	testID?: string;
	color: string;
}) {
	return (
		<Pressable
			testID={testID}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
			hitSlop={10}
			style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
		>
			<Icon name="X" size={16} color={color} />
		</Pressable>
	);
}

export const SearchInput = Object.assign(SearchInputRoot, {
	Root: SearchInputRoot,
	Clear: SearchInputClear,
});
