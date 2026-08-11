import React from "react";
import {
	StyleSheet,
	Text as RNText,
	View,
	type GestureResponderEvent,
	type LayoutChangeEvent,
	type NativeSyntheticEvent,
	type TextProps as RNTextProps,
	type TextStyle,
	type TextLayoutEventData,
	type ViewStyle,
} from "react-native";
import Animated, {
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { resolveFontStyle, useThemeTokens, type FontWeight, type TypeStyleName } from "../theme";

export interface TextProps extends RNTextProps {
	/** Typography style preset */
	variant?: TypeStyleName;
	/** Custom color override */
	color?: string;
	/** Color key from theme (overrides color prop) */
	colorKey?: keyof ReturnType<typeof useThemeTokens>["colors"];
	/** Font weight override */
	weight?: FontWeight;
	/** Explicit text transform; inherit preserves the typography preset */
	transform?: "inherit" | "none" | "uppercase";
	/** Single-line overflow behavior */
	overflowMode?: "clip" | "marquee";
	/** Marquee playback policy; tapping still replays manual marquees */
	marqueePlayback?: "auto" | "manual";
	/** Delay before marquee starts */
	marqueeDelayMs?: number;
	/** Horizontal scroll speed in pixels per second */
	marqueeSpeed?: number;
	/** Additional styles */
	style?: TextStyle | TextStyle[];
}

/**
 * Text component with Osuki design system typography
 *
 * Follows the Three-Layer Rule:
 * - Primary: hero, display (large, attention-grabbing)
 * - Secondary: heading, subheading, body, bodySmall (supporting context)
 * - Tertiary: caption, label (metadata, always uppercase)
 *
 * @example
 * ```tsx
 * // Hero metric
 * <Text variant="hero" colorKey="text">128</Text>
 *
 * // Section heading
 * <Text variant="heading">SYSTEM STATUS</Text>
 *
 * // Label (auto uppercase)
 * <Text variant="label">UPLOAD SPEED</Text>
 *
 * // Data value with status color
 * <Text variant="dataLarge" colorKey="primary">WARNING</Text>
 * ```
 */
export const Text: React.FC<TextProps> = ({
	variant = "body",
	color,
	colorKey,
	weight,
	transform = "inherit",
	overflowMode = "clip",
	marqueePlayback = "auto",
	marqueeDelayMs = 700,
	marqueeSpeed = 56,
	style,
	children,
	maxFontSizeMultiplier,
	numberOfLines,
	onPress,
	...rest
}) => {
	const { colors, fonts, typeStyles } = useThemeTokens();
	const [containerWidth, setContainerWidth] = React.useState(0);
	const [measuredContentWidth, setMeasuredContentWidth] = React.useState<number | null>(null);
	const [marqueeRun, setMarqueeRun] = React.useState(0);
	const translateX = useSharedValue(0);
	const typeStyle = typeStyles[variant];

	if (!typeStyle) {
		console.warn(`[@osuki-dev/ui] Unknown text variant: ${variant}`);
		return null;
	}

	const textColor = React.useMemo(() => {
		if (colorKey) return colors[colorKey] as string;
		if (color) return color;
		if (
			variant === "hero" ||
			variant === "display" ||
			variant === "heading" ||
			variant === "subheading" ||
			variant === "body" ||
			variant === "bodySmall"
		) {
			return colors.text;
		}
		return colors.textMuted;
	}, [color, colorKey, colors, variant]);

	const fontStyle = React.useMemo(
		() =>
			resolveFontStyle(
				fonts,
				typeStyle.fontFamily,
				weight ?? getWeightFromNumber(typeStyle.fontWeight),
			),
		[fonts, typeStyle.fontFamily, typeStyle.fontWeight, weight],
	);

	const textStyles = React.useMemo<TextStyle>(
		() => ({
			...fontStyle,
			fontSize: typeStyle.fontSize,
			lineHeight: typeStyle.fontSize * typeStyle.lineHeight,
			letterSpacing: typeStyle.letterSpacing * typeStyle.fontSize,
			color: textColor,
			textTransform:
				transform === "inherit"
					? "textTransform" in typeStyle
						? typeStyle.textTransform
						: "none"
					: transform,
		}),
		[
			fontStyle,
			textColor,
			typeStyle.fontSize,
			typeStyle.letterSpacing,
			typeStyle.lineHeight,
			typeStyle,
			transform,
		],
	);
	const flattenedStyle = StyleSheet.flatten(style);
	const lineHeight =
		typeof flattenedStyle?.lineHeight === "number"
			? flattenedStyle.lineHeight
			: (textStyles.lineHeight ?? typeStyle.fontSize * typeStyle.lineHeight);
	const estimatedContentWidth = React.useMemo(
		() => estimateTextWidth(children, textStyles.fontSize ?? typeStyle.fontSize),
		[children, textStyles.fontSize, typeStyle.fontSize],
	);
	const contentWidth = measuredContentWidth ?? estimatedContentWidth;
	const overflow = Math.max(0, contentWidth - containerWidth);

	React.useEffect(() => {
		if (overflowMode !== "marquee" || marqueePlayback !== "auto" || overflow <= 4) {
			cancelAnimation(translateX);
			translateX.value = withTiming(0, { duration: 140 });
			return;
		}

		const travelDuration = Math.max(1800, (overflow / marqueeSpeed) * 1000);
		cancelAnimation(translateX);
		translateX.value = 0;
		translateX.value = withDelay(
			marqueeDelayMs,
			withTiming(-overflow, { duration: travelDuration }),
		);

		return () => cancelAnimation(translateX);
	}, [
		marqueeDelayMs,
		marqueePlayback,
		marqueeRun,
		marqueeSpeed,
		overflow,
		overflowMode,
		translateX,
	]);

	const animatedMarqueeStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const handleContainerLayout = (event: LayoutChangeEvent) => {
		if (!event?.nativeEvent?.layout) return;
		setContainerWidth(event.nativeEvent.layout.width);
	};

	const handleTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
		const line = event.nativeEvent.lines?.[0];
		if (!line?.width) return;
		const width = Math.ceil(line.width);
		setMeasuredContentWidth((prev) => (prev === width ? prev : width));
	};

	const handleMarqueePress = (event: GestureResponderEvent) => {
		onPress?.(event);
		if (overflow <= 4) return;
		if (marqueePlayback === "auto") {
			setMarqueeRun((run) => run + 1);
			return;
		}

		const travelDuration = Math.max(1800, (overflow / marqueeSpeed) * 1000);
		cancelAnimation(translateX);
		translateX.value = 0;
		translateX.value = withTiming(-overflow, { duration: travelDuration });
	};

	if (overflowMode === "marquee") {
		const marqueeContainerStyle = getMarqueeContainerStyle(flattenedStyle);

		return (
			<View style={[styles.marqueeRoot, marqueeContainerStyle]} onLayout={handleContainerLayout}>
				<View style={[styles.marqueeClip, { height: lineHeight + 2 }]}>
					<Animated.Text
						onTextLayout={handleTextLayout}
						maxFontSizeMultiplier={maxFontSizeMultiplier ?? getDefaultMaxFontScale(variant)}
						numberOfLines={1}
						ellipsizeMode="clip"
						onPress={handleMarqueePress}
						style={[textStyles, style, styles.marqueeText, animatedMarqueeStyle]}
						{...rest}
					>
						{children}
					</Animated.Text>
				</View>
			</View>
		);
	}

	return (
		<RNText
			maxFontSizeMultiplier={maxFontSizeMultiplier ?? getDefaultMaxFontScale(variant)}
			numberOfLines={numberOfLines}
			onPress={onPress}
			style={[textStyles, style]}
			{...rest}
		>
			{children}
		</RNText>
	);
};

function getMarqueeContainerStyle(style: TextStyle | undefined): ViewStyle | undefined {
	if (!style) return undefined;

	return {
		alignSelf: style.alignSelf,
		flex: style.flex,
		flexBasis: style.flexBasis,
		flexGrow: style.flexGrow,
		flexShrink: style.flexShrink,
		margin: style.margin,
		marginBottom: style.marginBottom,
		marginEnd: style.marginEnd,
		marginHorizontal: style.marginHorizontal,
		marginLeft: style.marginLeft,
		marginRight: style.marginRight,
		marginStart: style.marginStart,
		marginTop: style.marginTop,
		marginVertical: style.marginVertical,
		maxHeight: style.maxHeight,
		maxWidth: style.maxWidth,
		minHeight: style.minHeight,
		minWidth: style.minWidth,
		width: style.width,
	};
}

function getDefaultMaxFontScale(variant: TypeStyleName) {
	if (variant === "hero" || variant === "display" || variant === "dataLarge") return 1.08;
	if (variant === "heading" || variant === "subheading") return 1.14;
	if (variant === "button" || variant === "label" || variant === "caption") return 1.18;
	return 1.24;
}

function getWeightFromNumber(weight: number): FontWeight {
	if (weight <= 300) return "light";
	if (weight <= 400) return "regular";
	if (weight <= 500) return "medium";
	if (weight <= 600) return "semibold";
	return "bold";
}

function estimateTextWidth(children: React.ReactNode, fontSize: number) {
	const text = React.Children.toArray(children)
		.map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
		.join("");

	if (!text) return 0;

	return Math.ceil(
		Array.from(text).reduce((width, char) => {
			const code = char.codePointAt(0) ?? 0;
			if (char === " ") return width + fontSize * 0.32;
			if (code > 0x2e80) return width + fontSize;
			if (/[A-Z0-9]/.test(char)) return width + fontSize * 0.64;
			return width + fontSize * 0.54;
		}, 0),
	);
}

const styles = StyleSheet.create({
	marqueeRoot: {
		minWidth: 0,
		overflow: "hidden",
	},
	marqueeClip: {
		overflow: "hidden",
		minWidth: 0,
		justifyContent: "center",
	},
	marqueeText: {
		alignSelf: "flex-start",
		flexShrink: 0,
		minWidth: 0,
	},
});
