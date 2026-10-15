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

// Resilient dynamic loader that prevents Metro static bundling errors
function safeRequire<T>(moduleName: string): T | null {
	try {
		// Evaluated dynamically to avoid bundling failures when peer packages are absent
		// eslint-disable-next-line @typescript-eslint/no-implied-eval
		const dynamicRequire = new Function(
			"name",
			"try { return typeof require !== 'undefined' ? require(name) : null; } catch (e) { return null; }",
		);
		return dynamicRequire(moduleName) as T | null;
	} catch {
		return null;
	}
}

const glassModule = safeRequire<GlassModule>("expo-glass-effect");
const blurModule = safeRequire<BlurModule>("expo-blur");

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
	const resolvedRadius =
		borderRadius ?? (face === "sheet" ? theme.radius.lg : theme.radius.md);

	const isLiquidGlassLive =
		Platform.OS === "ios" &&
		Boolean(
			glassModule?.GlassView &&
				glassModule?.isLiquidGlassAvailable?.() &&
				glassModule?.isGlassEffectAPIAvailable?.(),
		);

	if (isLiquidGlassLive && glassModule?.GlassView) {
		const GlassView = glassModule.GlassView;
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
				style={[
					styles.base,
					{ borderRadius: resolvedRadius },
					style,
				]}
			>
				{children}
			</GlassView>
		);
	}

	if (blurModule?.BlurView) {
		const BlurView = blurModule.BlurView;
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
		tint ??
		withAlpha(
			face === "sheet" ? theme.colors.surfaceRaised : theme.colors.surface,
			0.82,
		);

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
