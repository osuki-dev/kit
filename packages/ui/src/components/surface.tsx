import React, { createContext, useContext, useMemo } from "react";
import {
	ScrollView,
	StyleSheet,
	View,
	type ScrollViewProps,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	getCachedTransformedColor,
	useSurfaceDecorator,
	useThemeTokens,
	type SurfaceMeta,
} from "../theme";

export type SurfaceVariant = "page" | "surface" | "raised";
export type ScreenSafeArea = "none" | "top" | "bottom" | "both";

const absoluteFill: ViewStyle = {
	position: "absolute",
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
};

export interface SurfaceContextValue {
	variant: SurfaceVariant;
	slot?: string;
	baseColor: string;
	resolvedBackgroundColor: string;
	meta: SurfaceMeta;
}

const SurfaceContext = createContext<SurfaceContextValue | null>(null);

export function useSurface(): SurfaceContextValue {
	const context = useContext(SurfaceContext);
	if (!context) {
		throw new Error("Surface compound components must be used within Surface.Root");
	}
	return context;
}

export interface SurfaceRootProps extends ViewProps {
	variant?: SurfaceVariant;
	slot?: string;
	children?: React.ReactNode;
}

export function SurfaceRoot({
	variant = "surface",
	slot,
	style,
	children,
	...props
}: SurfaceRootProps) {
	const theme = useThemeTokens();
	const decorator = useSurfaceDecorator();
	const surfaceToken = theme.components.Surface[variant];
	const flatStyle = StyleSheet.flatten(style);
	const baseColor = (flatStyle?.backgroundColor as string) ?? theme.colors[surfaceToken];
	const borderRadius =
		typeof flatStyle?.borderRadius === "number" ? flatStyle.borderRadius : undefined;

	const meta: SurfaceMeta = useMemo(
		() => ({
			slot,
			variant,
			baseColor,
			borderRadius,
		}),
		[slot, variant, baseColor, borderRadius],
	);

	const resolvedBackgroundColor = useMemo(() => {
		if (decorator?.transformBackground) {
			return getCachedTransformedColor(baseColor, meta, decorator.transformBackground);
		}
		return baseColor;
	}, [baseColor, decorator, meta]);

	const contextValue = useMemo<SurfaceContextValue>(
		() => ({
			variant,
			slot,
			baseColor,
			resolvedBackgroundColor,
			meta,
		}),
		[variant, slot, baseColor, resolvedBackgroundColor, meta],
	);

	return (
		<SurfaceContext.Provider value={contextValue}>
			<View style={[{ position: "relative" }, style]} {...props}>
				{children}
			</View>
		</SurfaceContext.Provider>
	);
}

export interface SurfaceBackgroundProps extends ViewProps {
	children?: React.ReactNode;
}

export function SurfaceBackground({ style, children, ...props }: SurfaceBackgroundProps) {
	const { resolvedBackgroundColor, meta } = useSurface();
	const decorator = useSurfaceDecorator();

	return (
		<View
			collapsable={true}
			pointerEvents="none"
			style={[
				absoluteFill,
				{
					backgroundColor: resolvedBackgroundColor,
					...(meta.borderRadius !== undefined ? { borderRadius: meta.borderRadius } : null),
				},
				style,
			]}
			{...props}
		>
			{decorator?.renderDecoration?.(meta)}
			{children}
		</View>
	);
}

export interface SurfaceContentProps extends ViewProps {
	children?: React.ReactNode;
}

export function SurfaceContent({ style, children, ...props }: SurfaceContentProps) {
	return (
		<View collapsable={true} style={style} {...props}>
			{children}
		</View>
	);
}

export interface SurfaceProps extends ViewProps {
	variant?: SurfaceVariant;
	slot?: string;
}

export function Surface({
	variant = "surface",
	slot,
	style,
	children,
	...props
}: SurfaceProps) {
	return (
		<SurfaceRoot variant={variant} slot={slot} style={style} {...props}>
			<SurfaceBackground />
			{children}
		</SurfaceRoot>
	);
}

Surface.Root = SurfaceRoot;
Surface.Background = SurfaceBackground;
Surface.Content = SurfaceContent;

export interface ScreenProps extends SurfaceProps {
	safeArea?: ScreenSafeArea;
}

export function Screen({
	variant = "page",
	safeArea = "none",
	slot,
	style,
	children,
	...props
}: ScreenProps) {
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
			slot={slot}
			style={[{ flex: 1, width: "100%", height: "100%" }, insetStyle, style]}
			{...props}
		>
			{children}
		</Surface>
	);
}

export interface ScrollScreenProps extends Omit<ScrollViewProps, "contentInsetAdjustmentBehavior"> {
	variant?: SurfaceVariant;
	safeArea?: ScreenSafeArea;
	slot?: string;
	contentInsetAdjustmentBehavior?: ScrollViewProps["contentInsetAdjustmentBehavior"];
}

export function ScrollScreen({
	variant = "page",
	safeArea = "none",
	slot = "screens.scroll",
	style,
	contentContainerStyle,
	showsVerticalScrollIndicator = false,
	keyboardShouldPersistTaps = "handled",
	children,
	...props
}: ScrollScreenProps) {
	const theme = useThemeTokens();
	const insets = useSafeAreaInsets();
	const decorator = useSurfaceDecorator();
	const surfaceToken = theme.components.Surface[variant];
	const baseColor = theme.colors[surfaceToken];

	const meta: SurfaceMeta = useMemo(
		() => ({
			slot,
			variant,
			baseColor,
		}),
		[slot, variant, baseColor],
	);

	const resolvedBackgroundColor = useMemo(() => {
		if (decorator?.transformBackground) {
			return getCachedTransformedColor(baseColor, meta, decorator.transformBackground);
		}
		return baseColor;
	}, [baseColor, decorator, meta]);

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
			style={[{ flex: 1, backgroundColor: resolvedBackgroundColor }, style]}
			contentContainerStyle={[containerStyle, contentContainerStyle]}
			showsVerticalScrollIndicator={showsVerticalScrollIndicator}
			keyboardShouldPersistTaps={keyboardShouldPersistTaps}
			{...props}
		>
			{decorator?.renderDecoration?.(meta)}
			{children}
		</ScrollView>
	);
}
