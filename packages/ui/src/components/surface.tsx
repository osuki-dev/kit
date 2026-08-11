import React, { useMemo } from "react";
import {
	ScrollView,
	View,
	type ScrollViewProps,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeTokens } from "../theme";

export type SurfaceVariant = "page" | "surface" | "raised";
export type ScreenSafeArea = "none" | "top" | "bottom" | "both";

export interface SurfaceProps extends ViewProps {
	variant?: SurfaceVariant;
}

export function Surface({ variant = "surface", style, children, ...props }: SurfaceProps) {
	const theme = useThemeTokens();
	const surfaceToken = theme.components.Surface[variant];
	const surfaceStyle = useMemo<ViewStyle>(
		() => ({ backgroundColor: theme.colors[surfaceToken] }),
		[surfaceToken, theme.colors],
	);
	return (
		<View style={[surfaceStyle, style]} {...props}>
			{children}
		</View>
	);
}

export interface ScreenProps extends SurfaceProps {
	safeArea?: ScreenSafeArea;
}

export function Screen({ variant = "page", safeArea = "none", style, ...props }: ScreenProps) {
	const insets = useSafeAreaInsets();
	const insetStyle = useMemo<ViewStyle>(
		() => ({
			paddingTop: safeArea === "top" || safeArea === "both" ? insets.top : 0,
			paddingBottom: safeArea === "bottom" || safeArea === "both" ? insets.bottom : 0,
		}),
		[insets.bottom, insets.top, safeArea],
	);
	return (
		<Surface
			variant={variant}
			style={[{ flex: 1, width: "100%", height: "100%" }, insetStyle, style]}
			{...props}
		/>
	);
}

export interface ScrollScreenProps extends Omit<ScrollViewProps, "contentInsetAdjustmentBehavior"> {
	variant?: SurfaceVariant;
	safeArea?: ScreenSafeArea;
	contentInsetAdjustmentBehavior?: ScrollViewProps["contentInsetAdjustmentBehavior"];
}

export function ScrollScreen({
	variant = "page",
	safeArea = "none",
	style,
	contentContainerStyle,
	showsVerticalScrollIndicator = false,
	keyboardShouldPersistTaps = "handled",
	children,
	...props
}: ScrollScreenProps) {
	const theme = useThemeTokens();
	const insets = useSafeAreaInsets();
	const surfaceToken = theme.components.Surface[variant];
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			flexGrow: 1,
			paddingTop: safeArea === "top" || safeArea === "both" ? insets.top : 0,
			paddingBottom: safeArea === "bottom" || safeArea === "both" ? insets.bottom : 0,
		}),
		[insets.bottom, insets.top, safeArea],
	);
	return (
		<ScrollView
			style={[{ flex: 1, backgroundColor: theme.colors[surfaceToken] }, style]}
			contentContainerStyle={[containerStyle, contentContainerStyle]}
			showsVerticalScrollIndicator={showsVerticalScrollIndicator}
			keyboardShouldPersistTaps={keyboardShouldPersistTaps}
			{...props}
		>
			{children}
		</ScrollView>
	);
}
