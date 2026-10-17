import React from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { withAlpha } from "../utils/color";

export type GlassSurfaceFace = "floating" | "sheet";

export interface GlassSurfaceProps {
	/** Role and material treatment of the glass surface. Defaults to "floating" */
	face?: GlassSurfaceFace;
	/** Blur intensity when rendered with expo-blur. Defaults to 78 for floating, 50 for sheet */
	intensity?: number;
	/** Custom tint color overlay */
	tint?: string;
	/** Corner radius in points. Defaults to theme token */
	borderRadius?: number;
	/** Additional styling */
	style?: StyleProp<ViewStyle>;
	/** Inner content */
	children?: React.ReactNode;
	/** Stable test identifier */
	testID?: string;
}

type AnyComponent = React.ComponentType<any>;

interface GlassModule {
	GlassView?: AnyComponent;
	isLiquidGlassAvailable?: () => boolean;
	isGlassEffectAPIAvailable?: () => boolean;
}

interface BlurModule {
	BlurView?: AnyComponent;
}

// Optional native modules. Each `require` names its module literally so Metro
// can see it: Expo's Metro config allows optional dependencies, so a missing
// package becomes a runtime throw inside the `try` instead of a bundling error.
// A dynamically built `require` would never resolve in a Metro bundle.
let glassModule: GlassModule | null | undefined;
let blurModule: BlurModule | null | undefined;

function getGlassModule(): GlassModule | null {
	if (glassModule !== undefined) return glassModule;
	try {
		glassModule = require("expo-glass-effect") as GlassModule;
	} catch {
		glassModule = null;
	}
	return glassModule;
}

function getBlurModule(): BlurModule | null {
	if (blurModule !== undefined) return blurModule;
	try {
		blurModule = require("expo-blur") as BlurModule;
	} catch {
		blurModule = null;
	}
	return blurModule;
}

/**
 * GlassSurface component
 *
 * Renders an adaptive translucent/glass surface.
 * Gracefully layers from Apple Liquid Glass (`expo-glass-effect`) to `expo-blur`
 * to a high-contrast styled translucent view fallback on Android, Web, or standard views.
 */
export const GlassSurface: React.FC<GlassSurfaceProps> = ({
	face = "floating",
	intensity,
	tint,
	borderRadius,
	style,
	children,
	testID,
}) => {
	const theme = useThemeTokens();
	const isDark = theme.mode === "dark";
	const resolvedRadius = borderRadius ?? (face === "sheet" ? theme.radius.lg : theme.radius.md);

	const glass = Platform.OS === "ios" ? getGlassModule() : null;
	const isLiquidGlassLive = Boolean(
		glass?.GlassView && glass.isLiquidGlassAvailable?.() && glass.isGlassEffectAPIAvailable?.(),
	);

	if (isLiquidGlassLive && glass?.GlassView) {
		const GlassView = glass.GlassView;
		const defaultTint =
			face === "sheet"
				? withAlpha(theme.colors.surfaceRaised, 0.4)
				: withAlpha(isDark ? theme.colors.background : theme.colors.surface, 0.6);

		return (
			<GlassView
				testID={testID}
				colorScheme={isDark ? "dark" : "light"}
				glassEffectStyle={{
					style: face === "sheet" ? "clear" : "regular",
					animate: true,
					animationDuration: 0.15,
				}}
				tintColor={tint ?? defaultTint}
				style={[styles.base, { borderRadius: resolvedRadius }, style]}
			>
				{children}
			</GlassView>
		);
	}

	const blur = getBlurModule();
	if (blur?.BlurView) {
		const BlurView = blur.BlurView;
		const defaultIntensity = intensity ?? (face === "sheet" ? 50 : 78);
		const defaultOverlay = tint ?? withAlpha(theme.colors.surfaceRaised, 0.25);

		return (
			<BlurView
				testID={testID}
				intensity={defaultIntensity}
				tint={isDark ? "systemMaterialDark" : "systemMaterialLight"}
				style={[
					styles.base,
					{
						borderRadius: resolvedRadius,
						backgroundColor: defaultOverlay,
					},
					style,
				]}
			>
				{children}
			</BlurView>
		);
	}

	// Graceful fallback to translucent styled View
	const fallbackBackground =
		tint ?? withAlpha(face === "sheet" ? theme.colors.surfaceRaised : theme.colors.surface, 0.82);

	return (
		<View
			testID={testID}
			style={[
				styles.base,
				{
					borderRadius: resolvedRadius,
					backgroundColor: fallbackBackground,
					borderColor: withAlpha(theme.colors.border, 0.6),
					borderWidth: StyleSheet.hairlineWidth,
				},
				style,
			]}
		>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	base: {
		overflow: "hidden",
		borderCurve: "continuous",
	},
});
