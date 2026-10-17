import React from "react";
import {
	Platform,
	StyleSheet,
	Text as RNText,
	View,
	type GestureResponderEvent,
	type LayoutChangeEvent,
	type StyleProp,
	type TextProps as RNTextProps,
	type TextStyle,
	type TextLayoutEvent,
	type ViewStyle,
} from "react-native";
import Animated, {
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import {
	resolveFontStyle,
	useTextPlate,
	useThemeTokens,
	type FontWeightValue,
	type TypeStyleName,
} from "../theme";
import { styleFontWeight } from "../utils/font-weight";

const HUG_SLACK = "\u2009";

/**
 * Android clips the last glyph of italic and wide faces at the line edge.
 * A trailing thin space gives the native text run room without changing the words.
 */
export function withHugSlack(children: React.ReactNode, os: string = Platform.OS): React.ReactNode {
	if (os !== "android") return children;
	if (typeof children === "string") {
		if (children.length === 0 || children.endsWith(HUG_SLACK)) return children;
		return `${children}${HUG_SLACK}`;
	}
	if (typeof children === "number") return `${children}${HUG_SLACK}`;
	if (!hasContent(children)) return children;
	// Nested runs and arrays get the slack as one more run after them.
	return [children, HUG_SLACK];
}

/** An empty `Text` stays zero-width, so a row that relies on that keeps collapsing. */
function hasContent(children: React.ReactNode): boolean {
	if (children === null || children === undefined || children === false || children === "") {
		return false;
	}
	if (Array.isArray(children)) return children.some(hasContent);
	return true;
}

/** True inside a kit `Text`, where a child `Text` is a run, not a paragraph. */
const NestedTextContext = React.createContext(false);

/**
 * Android measures a paragraph with a paint that already carries the
 * paragraph's `fontVariationSettings`; each run's span then resets the
 * typeface and sets the same settings again, and `Paint` ignores an unchanged
 * settings string. The run is measured at the font's default instance and
 * drawn at the requested one, so heavier text overflows its box and wraps or
 * loses letters. The axes therefore go on one inner run and never on the
 * paragraph.
 */
function splitVariation(
	style: TextStyle,
	os: string = Platform.OS,
): { paragraph: TextStyle; run?: TextStyle } {
	if (os !== "android" || style.fontVariationSettings === undefined) return { paragraph: style };
	const { fontVariationSettings, ...paragraph } = style;
	return { paragraph, run: { fontVariationSettings } };
}

export interface TextProps extends RNTextProps {
	/** Typography style preset */
	variant?: TypeStyleName;
	/** Custom color override */
	color?: string;
	/** Color key from theme (overrides color prop) */
	colorKey?: keyof ReturnType<typeof useThemeTokens>["colors"];
	/**
	 * Font weight override: a named weight, or a number from 1 to 1000. A
	 * variable face draws a numeric weight exactly; a static family rounds it.
	 * A `fontWeight` in `style` is honored the same way unless `style` also
	 * sets its own `fontFamily`.
	 */
	weight?: FontWeightValue;
	/**
	 * Android only. Appends a thin space after the text so an italic or wide
	 * face does not lose the edge of its last glyph to the line clip. Defaults
	 * to the role's `trailingSlack` in the theme's font registry, so it is off for
	 * upright faces. Ignored on nested and selectable text, which it would
	 * otherwise put mid-sentence or into the clipboard. Pass `false` for text
	 * in a box of its own size, such as a count in a round badge.
	 */
	hugSlack?: boolean;
	/**
	 * Text that stands directly on the background rather than inside a card
	 * or control. It takes the plate a `TextPlateProvider` publishes, so it
	 * stays legible over a decorated ground; without a provider it is plain.
	 */
	plated?: boolean;
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
	style?: StyleProp<TextStyle>;
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
	hugSlack,
	plated = false,
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

	const plate = useTextPlate();
	const callerStyle = StyleSheet.flatten(plated && plate ? [plate, style] : style) ?? undefined;
	// A caller style that names its own family owns its weight too. Otherwise a
	// `fontWeight` in it is a weight request like `weight`, resolved against the
	// theme's face instead of reaching the native side as a bare number.
	const callerOwnsFace = callerStyle?.fontFamily !== undefined;
	const callerWeight = callerOwnsFace ? undefined : styleFontWeight(callerStyle?.fontWeight);
	const requestedWeight = weight ?? callerWeight ?? typeStyle.fontWeight;
	const fontSize = callerStyle?.fontSize ?? typeStyle.fontSize;
	const fontStyle = React.useMemo(
		() => resolveFontStyle(fonts, typeStyle.fontFamily, requestedWeight, { fontSize }),
		[fonts, typeStyle.fontFamily, requestedWeight, fontSize],
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
	const nested = React.useContext(NestedTextContext);
	const wantsSlack = hugSlack ?? fonts[typeStyle.fontFamily]?.trailingSlack ?? false;
	const renderedChildren =
		wantsSlack && !nested && !rest.selectable ? withHugSlack(children) : children;
	const flattenedStyle = callerStyle;
	const merged: TextStyle = { ...textStyles, ...callerStyle };
	const resolvedStyle: TextStyle = callerOwnsFace
		? merged
		: {
				...merged,
				fontFamily: fontStyle.fontFamily,
				// The system face draws any native weight, so a numeric request
				// such as 800 is passed through rather than rounded to 700.
				fontWeight:
					fontStyle.fontFamily === undefined && typeof requestedWeight === "number"
						? (String(requestedWeight) as TextStyle["fontWeight"])
						: fontStyle.fontWeight,
				fontVariationSettings:
					callerStyle?.fontVariationSettings ?? fontStyle.fontVariationSettings,
			};
	const { paragraph, run } = splitVariation(resolvedStyle);
	const content = (
		<NestedTextContext.Provider value>
			{run ? <RNText style={run}>{renderedChildren}</RNText> : renderedChildren}
		</NestedTextContext.Provider>
	);
	const lineHeight =
		typeof flattenedStyle?.lineHeight === "number"
			? flattenedStyle.lineHeight
			: (textStyles.lineHeight ?? typeStyle.fontSize * typeStyle.lineHeight);
	const estimatedContentWidth = React.useMemo(
		() => estimateTextWidth(renderedChildren, textStyles.fontSize ?? typeStyle.fontSize),
		[renderedChildren, textStyles.fontSize, typeStyle.fontSize],
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

	const handleTextLayout = (event: TextLayoutEvent) => {
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
						style={[paragraph, styles.marqueeText, animatedMarqueeStyle]}
						{...rest}
					>
						{content}
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
			style={paragraph}
			{...rest}
		>
			{content}
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
