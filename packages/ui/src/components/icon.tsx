import React from "react";
import {
	Image,
	StyleSheet,
	Text,
	View,
	type ColorValue,
	type ImageSourcePropType,
	type StyleProp,
	type TextStyle,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { useThemeTokens } from "../theme";

const isDev =
	typeof __DEV__ !== "undefined" ? Boolean(__DEV__) : process.env.NODE_ENV !== "production";

/**
 * Direction names for directional icons (e.g. arrows, chevrons, indicators).
 */
export type IconDirection =
	| "up"
	| "up-right"
	| "right"
	| "down-right"
	| "down"
	| "down-left"
	| "left"
	| "up-left";

/**
 * Render mode for icon coloring:
 * - "template": glyph shape is tinted with the active color (default)
 * - "original": preserve the asset's intrinsic colors (no tint override)
 */
export type IconRenderMode = "template" | "original";

/**
 * Standard theme chrome icon names from design system / theme packs.
 */
export const THEME_ICON_NAMES = [
	"chrome.back",
	"chrome.send",
	"chrome.attach",
	"chrome.create",
	"chrome.scan",
	"chrome.settings",
	"chrome.parameters",
	"home.arrow",
] as const;
export type ThemeIconName = (typeof THEME_ICON_NAMES)[number];

/**
 * Fallback Lucide icon names for standard theme chrome actions.
 */
export const DEFAULT_CHROME_FALLBACKS: Record<string, string> = {
	"chrome.back": "ChevronLeft",
	"chrome.send": "Send",
	"chrome.attach": "Paperclip",
	"chrome.create": "Plus",
	"chrome.scan": "Scan",
	"chrome.settings": "Settings",
	"chrome.parameters": "SlidersHorizontal",
	"home.arrow": "ArrowRight",
};

/**
 * Common Lucide icon names for IDE autocomplete while permitting any string
 * (e.g. custom theme pack names like "chrome.back" or NanoIcon names).
 */
export type CommonIconName =
	| "Home"
	| "Settings"
	| "User"
	| "Search"
	| "LayoutGrid"
	| "Menu"
	| "Info"
	| "Bell"
	| "ChevronLeft"
	| "ChevronRight"
	| "ChevronDown"
	| "ChevronUp"
	| "ChevronsLeft"
	| "ChevronsRight"
	| "ArrowUp"
	| "ArrowDown"
	| "ArrowLeft"
	| "ArrowRight"
	| "Check"
	| "CircleCheck"
	| "CircleAlert"
	| "TriangleAlert"
	| "X"
	| "Plus"
	| "Minus"
	| "Inbox"
	| "Calendar"
	| "Clock"
	| "Eye"
	| "EyeOff"
	| "Trash2"
	| "Edit"
	| "Share2"
	| "Filter"
	| "SlidersHorizontal"
	| ThemeIconName;

export type IconName = CommonIconName | (string & {});

export const ICON_DIRECTION_ANGLES: Record<IconDirection, number> = {
	up: 0,
	"up-right": 45,
	right: 90,
	"down-right": 135,
	down: 180,
	"down-left": 225,
	left: 270,
	"up-left": 315,
};

/**
 * Calculates rotation in degrees from source orientation to target orientation.
 * Returns degree number (0 - 359).
 */
export function calculateIconRotation(
	target?: IconDirection,
	source: IconDirection = "up",
): number {
	if (!target) return 0;
	const targetDeg = ICON_DIRECTION_ANGLES[target] ?? 0;
	const sourceDeg = ICON_DIRECTION_ANGLES[source] ?? 0;
	return (targetDeg - sourceDeg + 360) % 360;
}

/**
 * Normalizes an icon name to PascalCase for Lucide lookup.
 * e.g. "chevron-left" -> "ChevronLeft", "home" -> "Home"
 */
export function toPascalCase(str: string): string {
	if (!str) return "";
	return str
		.replace(/[-_ .]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
		.replace(/^(.)/, (c) => c.toUpperCase());
}

/**
 * Safely merges style transforms with rotation transform.
 */
function combineTransforms(
	baseTransform?: ViewStyle["transform"] | any,
	rotationTransform?: { rotate: string },
): ViewStyle["transform"] | undefined {
	if (!rotationTransform) return baseTransform;
	if (!baseTransform || !Array.isArray(baseTransform)) {
		return [rotationTransform] as any;
	}
	return [...baseTransform, rotationTransform] as any;
}

// Lazy / safe Lucide loader
let lucideModule: Record<string, React.ComponentType<any>> | null = null;
let lucideAttempted = false;

function getLucideModule(): Record<string, React.ComponentType<any>> | null {
	if (lucideAttempted) return lucideModule;
	lucideAttempted = true;
	try {
		if (typeof require === "function") {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			lucideModule = require("lucide-react-native");
		}
	} catch {
		lucideModule = null;
	}
	return lucideModule;
}

// Lazy / safe Expo Image loader
let expoImageComponent: any = null;
let expoImageAttempted = false;

function getExpoImage(): any {
	if (expoImageAttempted) return expoImageComponent;
	expoImageAttempted = true;
	try {
		if (typeof require === "function") {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const expoImage = require("expo-image");
			expoImageComponent = expoImage.Image;
		}
	} catch {
		expoImageComponent = null;
	}
	return expoImageComponent;
}

// Lazy / safe react-native-nano-icons loader
let nativeNanoIconsModule: {
	createNanoIconSet?: (glyphMap: any, ...args: any[]) => React.ComponentType<any>;
} | null = null;
let nativeNanoIconsAttempted = false;

function getNativeNanoIconsModule() {
	if (nativeNanoIconsAttempted) return nativeNanoIconsModule;
	nativeNanoIconsAttempted = true;
	try {
		// A literal name, so Metro sees the optional dependency. Expo's Metro config
		// allows optional dependencies, so a missing package throws here at runtime.
		nativeNanoIconsModule = require("react-native-nano-icons");
	} catch {
		nativeNanoIconsModule = null;
	}
	return nativeNanoIconsModule;
}

/* -------------------------------------------------------------------------- */
/*                                Icon Context                                */
/* -------------------------------------------------------------------------- */

export interface IconRenderProps {
	name?: string;
	size: number;
	color?: string;
	strokeWidth?: number;
	direction?: IconDirection;
	sourceDirection?: IconDirection;
	rotation?: number;
	renderMode?: IconRenderMode;
	style?: StyleProp<ViewStyle>;
}

export type IconResolver = (
	name: string,
	props: IconRenderProps,
) => React.ReactNode | null | undefined;

export interface IconContextValue {
	/** Custom resolver function */
	resolve?: IconResolver;
	/** Direct map of icon components */
	icons?: Record<string, React.ComponentType<any>>;
	/** Source directions for directional assets */
	sourceDirections?: Record<string, IconDirection>;
	/** Default render mode */
	renderMode?: IconRenderMode;
	/** Fallback component when an icon is not resolved */
	fallback?: React.ComponentType<IconRenderProps>;
	/** Whether parent Icon.Root already owns geometry and rotation */
	hasRootContainer?: boolean;
	/** Inherited size from parent Icon.Root */
	inheritedSize?: number;
	/** Inherited color from parent Icon.Root */
	inheritedColor?: ColorValue;
	/** Inherited strokeWidth from parent Icon.Root */
	inheritedStrokeWidth?: number;
	/** Inherited direction from parent Icon.Root */
	inheritedDirection?: IconDirection;
	/** Inherited renderMode from parent Icon.Root */
	inheritedRenderMode?: IconRenderMode;
}

export const IconContext = React.createContext<IconContextValue | null>(null);

export function useIconContext(): IconContextValue | null {
	return React.useContext(IconContext);
}

export interface IconProviderProps {
	children: React.ReactNode;
	/** Custom icon resolver function */
	resolve?: IconResolver;
	/** Map of custom icon components */
	icons?: Record<string, React.ComponentType<any>>;
	/** Known intrinsic directions of icon assets (e.g. { "chrome.back": "left" }) */
	sourceDirections?: Record<string, IconDirection>;
	/** Default render mode */
	renderMode?: IconRenderMode;
	/** Fallback component to render when an icon cannot be resolved */
	fallback?: React.ComponentType<IconRenderProps>;
}

/**
 * Injects custom icon resolvers, icon maps, and fallback settings into the subtree.
 */
export const IconProvider: React.FC<IconProviderProps> = ({
	children,
	resolve,
	icons,
	sourceDirections,
	renderMode,
	fallback,
}) => {
	const parentContext = useIconContext();

	const contextValue = React.useMemo<IconContextValue>(() => {
		const mergedIcons = { ...parentContext?.icons, ...icons };
		const mergedSourceDirections = {
			...parentContext?.sourceDirections,
			...sourceDirections,
		};

		const combinedResolver: IconResolver | undefined =
			resolve || parentContext?.resolve
				? (name, props) => {
						if (resolve) {
							const res = resolve(name, props);
							if (res !== undefined && res !== null) return res;
						}
						if (parentContext?.resolve) {
							return parentContext.resolve(name, props);
						}
						return null;
					}
				: undefined;

		return {
			resolve: combinedResolver,
			icons: mergedIcons,
			sourceDirections: mergedSourceDirections,
			renderMode: renderMode ?? parentContext?.renderMode,
			fallback: fallback ?? parentContext?.fallback,
		};
	}, [parentContext, resolve, icons, sourceDirections, renderMode, fallback]);

	return <IconContext.Provider value={contextValue}>{children}</IconContext.Provider>;
};

/* -------------------------------------------------------------------------- */
/*                               Compound Parts                               */
/* -------------------------------------------------------------------------- */

export interface IconRootProps extends ViewProps {
	/** Icon size (width and height) - default 24 */
	size?: number;
	/** Icon color - defaults to theme text */
	color?: ColorValue;
	/** Stroke width - defaults to theme iconography.strokeWidth */
	strokeWidth?: number;
	/** Desired control direction */
	direction?: IconDirection;
	/** Intrinsic source direction of the asset before rotation (default: "up") */
	sourceDirection?: IconDirection;
	/** Render mode: template (tinted) or original (preserve asset colors) */
	renderMode?: IconRenderMode;
	children?: React.ReactNode;
}

/**
 * Compound container that manages layout dimensions and direction rotation.
 */
export const IconRoot: React.FC<IconRootProps> = ({
	size = 24,
	color,
	strokeWidth,
	direction,
	sourceDirection = "up",
	renderMode = "template",
	style,
	children,
	...viewProps
}) => {
	const parentContext = useIconContext();

	const deg = calculateIconRotation(direction, sourceDirection);
	const rotationTransform = direction ? { rotate: `${deg}deg` } : undefined;

	const flattenedStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
	const transform = combineTransforms(flattenedStyle?.transform, rotationTransform);

	const contextValue = React.useMemo<IconContextValue>(() => {
		return {
			...parentContext,
			hasRootContainer: true,
			inheritedSize: size,
			inheritedColor: color,
			inheritedStrokeWidth: strokeWidth,
			inheritedDirection: direction,
			inheritedRenderMode: renderMode,
		};
	}, [parentContext, size, color, strokeWidth, direction, renderMode]);

	return (
		<IconContext.Provider value={contextValue}>
			<View
				style={[
					{
						width: size,
						height: size,
						alignItems: "center",
						justifyContent: "center",
					},
					style,
					transform ? { transform } : undefined,
				]}
				accessible={viewProps.accessible ?? false}
				{...viewProps}
			>
				{children}
			</View>
		</IconContext.Provider>
	);
};

export interface IconCustomProps extends Omit<ViewProps, "children"> {
	size?: number;
	color?: ColorValue;
	strokeWidth?: number;
	direction?: IconDirection;
	sourceDirection?: IconDirection;
	renderMode?: IconRenderMode;
	/** Custom component to render (e.g., SVG component or custom element) */
	component?: React.ComponentType<any>;
	/** Image source or URI for bitmap / SVG theme pack assets */
	source?: ImageSourcePropType | { uri: string } | string;
	/** Children or render prop */
	children?: React.ReactNode | ((props: IconRenderProps) => React.ReactNode);
}

/**
 * Compound part for custom SVG components, theme pack images, or custom render functions.
 */
export const IconCustom: React.FC<IconCustomProps> = ({
	size: propSize,
	color: propColor,
	strokeWidth: propStrokeWidth,
	direction: propDirection,
	sourceDirection = "up",
	renderMode: propRenderMode,
	component: Component,
	source,
	children,
	style,
	...viewProps
}) => {
	const { colors, iconography } = useThemeTokens();
	const context = useIconContext();

	const size = propSize ?? context?.inheritedSize ?? 24;
	const color = propColor ?? context?.inheritedColor ?? colors.text;
	const strokeWidth = propStrokeWidth ?? context?.inheritedStrokeWidth ?? iconography.strokeWidth;
	const direction = propDirection ?? context?.inheritedDirection;
	const renderMode =
		propRenderMode ?? context?.inheritedRenderMode ?? context?.renderMode ?? "template";

	const resolvedColor =
		renderMode === "original" ? undefined : typeof color === "string" ? color : colors.text;

	const renderProps: IconRenderProps = {
		size,
		color: resolvedColor,
		strokeWidth,
		direction,
		sourceDirection,
		renderMode,
		style,
	};

	let content: React.ReactNode = null;

	if (typeof children === "function") {
		content = children(renderProps);
	} else if (children) {
		content = children;
	} else if (source) {
		const ImageComponent = getExpoImage() ?? Image;
		const imageSource = typeof source === "string" ? { uri: source } : source;
		content = (
			<ImageComponent
				source={imageSource}
				contentFit="contain"
				resizeMode="contain"
				cachePolicy="memory"
				accessible={false}
				style={{
					width: size,
					height: size,
				}}
				tintColor={resolvedColor}
			/>
		);
	} else if (Component) {
		content = (
			<Component
				width={size}
				height={size}
				size={size}
				color={resolvedColor}
				strokeWidth={strokeWidth}
			/>
		);
	}

	// If already nested in an IconRoot, return directly
	if (context?.hasRootContainer) {
		return <>{content}</>;
	}

	// Standalone usage: wrap in container with rotation
	const deg = calculateIconRotation(direction, sourceDirection);
	const rotationTransform = direction ? { rotate: `${deg}deg` } : undefined;
	const flattenedStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
	const transform = combineTransforms(flattenedStyle?.transform, rotationTransform);

	return (
		<View
			style={[
				{
					width: size,
					height: size,
					alignItems: "center",
					justifyContent: "center",
				},
				style,
				transform ? { transform } : undefined,
			]}
			accessible={viewProps.accessible ?? false}
			{...viewProps}
		>
			{content}
		</View>
	);
};

export interface IconGlyphProps extends Omit<ViewProps, "children"> {
	name: IconName;
	size?: number;
	color?: ColorValue;
	strokeWidth?: number;
	direction?: IconDirection;
	sourceDirection?: IconDirection;
	renderMode?: IconRenderMode;
	fallback?: React.ComponentType<IconRenderProps>;
}

/**
 * Resolves and renders an icon glyph by name through resolvers, theme packs, or Lucide.
 */
export const IconGlyph: React.FC<IconGlyphProps> = ({
	name,
	size: propSize,
	color: propColor,
	strokeWidth: propStrokeWidth,
	direction: propDirection,
	sourceDirection: propSourceDirection,
	renderMode: propRenderMode,
	fallback,
	style,
	...viewProps
}) => {
	const { colors, iconography } = useThemeTokens();
	const context = useIconContext();

	const size = propSize ?? context?.inheritedSize ?? 24;
	const color = propColor ?? context?.inheritedColor ?? colors.text;
	const strokeWidth = propStrokeWidth ?? context?.inheritedStrokeWidth ?? iconography.strokeWidth;
	const direction = propDirection ?? context?.inheritedDirection;
	const sourceDirection = propSourceDirection ?? context?.sourceDirections?.[name] ?? "up";
	const renderMode =
		propRenderMode ?? context?.inheritedRenderMode ?? context?.renderMode ?? "template";

	const resolvedColor =
		renderMode === "original" ? undefined : typeof color === "string" ? color : colors.text;

	const deg = calculateIconRotation(direction, sourceDirection);

	const renderProps: IconRenderProps = {
		name,
		size,
		color: resolvedColor,
		strokeWidth,
		direction,
		sourceDirection,
		rotation: deg,
		renderMode,
		style,
	};

	let renderedNode: React.ReactNode = null;

	// 1. Check custom context resolver
	if (context?.resolve) {
		const resolved = context.resolve(name, renderProps);
		if (resolved !== null && resolved !== undefined) {
			renderedNode = resolved;
		}
	}

	// 2. Check direct custom icons map
	if (!renderedNode && context?.icons && name in context.icons) {
		const CustomComp = context.icons[name];
		if (CustomComp) {
			renderedNode = (
				<CustomComp
					name={name}
					width={size}
					height={size}
					size={size}
					color={resolvedColor}
					strokeWidth={strokeWidth}
					direction={direction}
					renderMode={renderMode}
				/>
			);
		}
	}

	// 3. Fallback for theme chrome icon names (e.g. chrome.back -> ChevronLeft)
	const fallbackName = DEFAULT_CHROME_FALLBACKS[name];
	if (!renderedNode && fallbackName && context?.icons && fallbackName in context.icons) {
		const CustomComp = context.icons[fallbackName];
		if (CustomComp) {
			renderedNode = (
				<CustomComp
					name={fallbackName}
					width={size}
					height={size}
					size={size}
					color={resolvedColor}
					strokeWidth={strokeWidth}
					direction={direction}
					renderMode={renderMode}
				/>
			);
		}
	}

	// 4. Lucide lookup
	if (!renderedNode) {
		const lucide = getLucideModule();
		if (lucide) {
			const targetLookup = fallbackName ?? name;
			const pascalName = toPascalCase(targetLookup);
			const LucideIcon = lucide[targetLookup] || lucide[pascalName];
			if (LucideIcon) {
				renderedNode = (
					<LucideIcon
						width={size}
						height={size}
						size={size}
						color={resolvedColor}
						strokeWidth={strokeWidth}
					/>
				);
			}
		}
	}

	// 5. Fallback component if not resolved
	if (!renderedNode) {
		const FallbackComponent = fallback ?? context?.fallback;
		if (FallbackComponent) {
			renderedNode = <FallbackComponent {...renderProps} />;
		} else {
			if (isDev) {
				console.warn(
					`[@osuki-dev/ui] Unknown icon: "${String(name)}". ` +
						`Ensure it is registered in IconProvider, matches a Lucide PascalCase name (e.g. "Home", "Settings"), or is provided by an active icon resolver.`,
				);
			}
			return null;
		}
	}

	// If already nested in an IconRoot, return directly
	if (context?.hasRootContainer) {
		return <>{renderedNode}</>;
	}

	// Standalone usage: wrap in container with rotation
	const rotationTransform = direction ? { rotate: `${deg}deg` } : undefined;
	const flattenedStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
	const transform = combineTransforms(flattenedStyle?.transform, rotationTransform);

	return (
		<View
			style={[
				{
					width: size,
					height: size,
					alignItems: "center",
					justifyContent: "center",
				},
				style,
				transform ? { transform } : undefined,
			]}
			accessible={viewProps.accessible ?? false}
			{...viewProps}
		>
			{renderedNode}
		</View>
	);
};

/* -------------------------------------------------------------------------- */
/*                                Primary Icon                                */
/* -------------------------------------------------------------------------- */

export interface IconProps extends Omit<ViewProps, "children"> {
	/** Icon name (PascalCase Lucide icon, theme icon, or custom resolved name) */
	name?: IconName;
	/** Icon size (width and height) - default 24 */
	size?: number;
	/** Icon color - defaults to theme text */
	color?: ColorValue;
	/** Stroke width - defaults to theme iconography.strokeWidth (1.5) */
	strokeWidth?: number;
	/** Desired control direction */
	direction?: IconDirection;
	/** Intrinsic source direction of the icon before rotation (default: "up") */
	sourceDirection?: IconDirection;
	/** Render mode: template (tinted) or original (preserve asset colors) */
	renderMode?: IconRenderMode;
	/** Fallback component to render if the icon name is not found */
	fallback?: React.ComponentType<IconRenderProps>;
	/** Children if used as a compound container */
	children?: React.ReactNode;
	/** Additional SVG-compatible or element properties */
	[key: string]: any;
}

export interface IconComponent extends React.FC<IconProps> {
	Root: typeof IconRoot;
	Custom: typeof IconCustom;
	Glyph: typeof IconGlyph;
}

/**
 * High-performance Icon component with theme support, custom resolvers, and rotation.
 *
 * Backward-compatible with standard Lucide icon names:
 * ```tsx
 * <Icon name="Home" />
 * <Icon name="Settings" size={20} color={colors.primary} />
 * <Icon name="ChevronLeft" direction="right" />
 * ```
 *
 * Supports compound composition:
 * ```tsx
 * <Icon.Root size={24} direction="left">
 *   <Icon.Glyph name="chrome.back" />
 * </Icon.Root>
 * ```
 */
export const Icon: IconComponent = (({
	name,
	size = 24,
	color,
	strokeWidth,
	direction,
	sourceDirection,
	renderMode = "template",
	fallback,
	style,
	children,
	...rest
}: IconProps) => {
	if (children && !name) {
		return (
			<IconRoot
				size={size}
				color={color}
				strokeWidth={strokeWidth}
				direction={direction}
				sourceDirection={sourceDirection}
				renderMode={renderMode}
				style={style}
				{...rest}
			>
				{children}
			</IconRoot>
		);
	}

	return (
		<IconRoot
			size={size}
			color={color}
			strokeWidth={strokeWidth}
			direction={direction}
			sourceDirection={sourceDirection}
			renderMode={renderMode}
			style={style}
			{...rest}
		>
			{name ? (
				<IconGlyph
					name={name}
					size={size}
					color={color}
					strokeWidth={strokeWidth}
					direction={direction}
					sourceDirection={sourceDirection}
					renderMode={renderMode}
					fallback={fallback}
				/>
			) : (
				children
			)}
		</IconRoot>
	);
}) as IconComponent;

Icon.Root = IconRoot;
Icon.Custom = IconCustom;
Icon.Glyph = IconGlyph;

/* -------------------------------------------------------------------------- */
/*                       NanoIcons Adaptor Helper                             */
/* -------------------------------------------------------------------------- */

export interface NanoIconGlyph {
	/** Unicode code point */
	u?: number;
	/** Character if pre-computed */
	char?: string;
	/** Original SVG color */
	c?: string;
	/** Multicolor layers */
	l?: Array<{ u: number; c?: string }>;
}

export type NanoIconGlyphMap = {
	/** Metadata */
	m?: {
		f?: string;
		name?: string;
		[key: string]: any;
	};
	/** Glyphs */
	g?: Record<string, NanoIconGlyph | number | string>;
	/** Direct glyph map */
	[key: string]: any;
};

export interface NanoIconConfig {
	fontFamily?: string;
	sourceDirection?: IconDirection;
}

export interface NanoIconProps<TName extends string = string> extends Omit<ViewProps, "children"> {
	name: TName;
	size?: number;
	color?: ColorValue | ColorValue[];
	tintMode?: "currentColor" | "all";
	direction?: IconDirection;
	sourceDirection?: IconDirection;
	renderMode?: IconRenderMode;
	strokeWidth?: number;
}

export interface NanoIconComponent<TName extends string = string> extends React.FC<
	NanoIconProps<TName>
> {
	glyphMap: NanoIconGlyphMap;
	fontFamily: string;
	hasIcon: (name: string) => boolean;
	resolve: IconResolver;
}

/**
 * Creates an optimized icon component and resolver adaptor from a react-native-nano-icons glyph map.
 *
 * If `react-native-nano-icons` is installed natively, it delegates to its native component.
 * Otherwise, it provides a high-performance native text-glyph stack fallback with multicolor layer support.
 *
 * @example
 * ```tsx
 * import glyphMap from "./assets/icons.glyphmap.json";
 * export const MyIcons = createNanoIconSet(glyphMap);
 *
 * // Direct component:
 * <MyIcons name="heart" size={24} color="red" />
 *
 * // Or register into IconProvider:
 * <IconProvider resolve={MyIcons.resolve}>
 *   <Icon name="heart" />
 * </IconProvider>
 * ```
 */
export function createNanoIconSet<TName extends string = string>(
	glyphMap: NanoIconGlyphMap,
	configOrFontFamily?: string | NanoIconConfig,
): NanoIconComponent<TName> {
	const config: NanoIconConfig =
		typeof configOrFontFamily === "string"
			? { fontFamily: configOrFontFamily }
			: (configOrFontFamily ?? {});

	const fontFamily =
		config.fontFamily ?? glyphMap?.m?.f ?? glyphMap?.fontFamily ?? glyphMap?.name ?? "nano-icons";

	const glyphs = glyphMap?.g ?? glyphMap?.glyphs ?? glyphMap ?? {};

	const hasIcon = (iconName: string): boolean => {
		return Boolean(glyphs && iconName in glyphs);
	};

	// Check if react-native-nano-icons is natively available
	const nativeModule = getNativeNanoIconsModule();
	const NativeNanoIcon = nativeModule?.createNanoIconSet
		? nativeModule.createNanoIconSet(glyphMap, config)
		: null;

	const NanoIcon: React.FC<NanoIconProps<TName>> = ({
		name,
		size = 24,
		color,
		tintMode = "all",
		direction,
		sourceDirection = config.sourceDirection ?? "up",
		renderMode = "template",
		style,
		...viewProps
	}) => {
		const { colors } = useThemeTokens();

		const deg = calculateIconRotation(direction, sourceDirection);
		const rotationTransform = direction ? { rotate: `${deg}deg` } : undefined;
		const flattenedStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
		const transform = combineTransforms(flattenedStyle?.transform, rotationTransform);

		const defaultColor = colors.text;
		const resolvedColor =
			renderMode === "original" ? undefined : typeof color === "string" ? color : defaultColor;

		// Delegate to native component if available
		if (NativeNanoIcon) {
			return (
				<View
					style={[
						{
							width: size,
							height: size,
							alignItems: "center",
							justifyContent: "center",
						},
						style,
						transform ? { transform } : undefined,
					]}
					accessible={viewProps.accessible ?? false}
					{...viewProps}
				>
					<NativeNanoIcon name={name} size={size} color={resolvedColor} tintMode={tintMode} />
				</View>
			);
		}

		// High-performance text glyph stack fallback
		const glyph = glyphs[name as string];
		if (!glyph) {
			if (isDev) {
				console.warn(
					`[@osuki-dev/ui] Icon "${String(name)}" not found in nano icon set "${fontFamily}".`,
				);
			}
			return null;
		}

		// Handle multicolor layer stacks
		if (typeof glyph === "object" && Array.isArray(glyph.l) && glyph.l.length > 0) {
			const colorArray = Array.isArray(color) ? color : null;
			return (
				<View
					style={[
						{
							width: size,
							height: size,
							position: "relative",
						},
						style,
						transform ? { transform } : undefined,
					]}
					accessible={viewProps.accessible ?? false}
					{...viewProps}
				>
					{glyph.l.map((layer: { u: number; c?: string }, index: number) => {
						const char = String.fromCodePoint(layer.u);
						let layerColor: ColorValue = defaultColor;
						if (renderMode === "original") {
							layerColor = layer.c ?? defaultColor;
						} else if (colorArray) {
							layerColor = colorArray[index] ?? colorArray[colorArray.length - 1] ?? defaultColor;
						} else if (typeof color === "string") {
							layerColor = color;
						}

						return (
							<Text
								key={index}
								style={[
									StyleSheet.absoluteFill,
									{
										fontFamily,
										fontSize: size,
										color: layerColor,
										textAlign: "center",
										lineHeight: size,
										includeFontPadding: false,
									} as TextStyle,
								]}
							>
								{char}
							</Text>
						);
					})}
				</View>
			);
		}

		// Single glyph fallback
		let char = "";
		let glyphColor: ColorValue | undefined = resolvedColor;

		if (typeof glyph === "number") {
			char = String.fromCodePoint(glyph);
		} else if (typeof glyph === "string") {
			char =
				glyph.length === 1
					? glyph
					: String.fromCodePoint(parseInt(glyph.replace(/^(\\u|0x)/, ""), 16));
		} else if (typeof glyph === "object") {
			char = glyph.char ?? (glyph.u ? String.fromCodePoint(glyph.u) : "");
			if (renderMode === "original" && glyph.c) {
				glyphColor = glyph.c;
			}
		}

		return (
			<View
				style={[
					{
						width: size,
						height: size,
						alignItems: "center",
						justifyContent: "center",
					},
					style,
					transform ? { transform } : undefined,
				]}
				accessible={viewProps.accessible ?? false}
				{...viewProps}
			>
				<Text
					style={{
						fontFamily,
						fontSize: size,
						color: glyphColor ?? defaultColor,
						textAlign: "center",
						lineHeight: size,
						includeFontPadding: false,
					}}
				>
					{char}
				</Text>
			</View>
		);
	};

	const NanoIconComponent = NanoIcon as NanoIconComponent<TName>;
	NanoIconComponent.glyphMap = glyphMap;
	NanoIconComponent.fontFamily = fontFamily;
	NanoIconComponent.hasIcon = hasIcon;
	NanoIconComponent.resolve = (iconName: string, props: IconRenderProps) => {
		if (hasIcon(iconName)) {
			return (
				<NanoIcon
					name={iconName as TName}
					size={props.size}
					color={props.color}
					direction={props.direction}
					sourceDirection={props.sourceDirection}
					renderMode={props.renderMode}
					strokeWidth={props.strokeWidth}
					style={props.style}
				/>
			);
		}
		return null;
	};

	return NanoIconComponent;
}
