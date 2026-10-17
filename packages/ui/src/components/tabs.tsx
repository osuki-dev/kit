import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	Pressable,
	StyleSheet,
	View,
	type LayoutChangeEvent,
	type PressableProps,
	type StyleProp,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import {
	readStringFill,
	useResolvedSurfaceFill,
	useThemeTokens,
	withoutStringFill,
	type FontWeightValue,
	type RadiusToken,
	type SurfaceMeta,
	type TabsTokens,
} from "../theme";
import { useHaptics } from "./haptics";
import { Text, type TextProps } from "./text";
import { SurfaceDecoration } from "./surface-decoration";

export type TabsVariant = "underline" | "pill";
export type TabsSize = "default" | "compact";
/**
 * How the selection moves. `static` repaints the selected trigger; `slide`
 * draws one indicator that travels to the selected trigger, or lands without
 * moving when the system reduce-motion setting is on.
 */
export type TabsIndicator = "static" | "slide";
/**
 * Who paints the `pill` fills. `overlay` paints the track once on the list and
 * the selection over it. `segments` leaves the list clear and has each trigger
 * paint its own fill, the track's when idle and the selection's when
 * selected, so a translucent fill is never stacked on itself.
 */
export type TabsLayering = "overlay" | "segments";

export interface TabsState {
	value: string;
}

export interface TabsActions {
	setValue: (value: string) => void;
}

export interface TabsMeta {
	controlled: boolean;
	variant: TabsVariant;
	size: TabsSize;
	indicator: TabsIndicator;
	layering: TabsLayering;
	/** This instance's `pill` track radius, over `components.Tabs.radius`. */
	radius?: RadiusToken;
	/** This instance's selection radius, over `components.Tabs.optionRadius`. */
	optionRadius?: RadiusToken;
}

export interface TabsContextValue {
	state: TabsState;
	actions: TabsActions;
	meta: TabsMeta;
}

interface TriggerLayout {
	x: number;
	width: number;
}

interface TabsListContextValue {
	/** The resolved track fill, which an `overlay` selection is drawn over. */
	trackFill: string;
	reportLayout: (value: string, layout: TriggerLayout) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);
const TabsTriggerContext = createContext(false);
const TabsListContext = createContext<TabsListContextValue | null>(null);

export interface TabsRootProps {
	children: ReactNode;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	variant?: TabsVariant;
	size?: TabsSize;
	indicator?: TabsIndicator;
	/** Who paints the `pill` fills. Defaults to `overlay`. */
	layering?: TabsLayering;
	/**
	 * The `pill` track radius of this instance only, over
	 * `components.Tabs.radius`.
	 */
	radius?: RadiusToken;
	/**
	 * The selection radius of this instance only (the selected trigger, the
	 * sliding indicator and, with `segments` layering, every trigger), over
	 * `components.Tabs.optionRadius`. Unset, it follows the theme's
	 * `optionRadius`, then `radius`.
	 */
	optionRadius?: RadiusToken;
}

export function TabsRoot({
	children,
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	variant = "underline",
	size = "default",
	indicator = "static",
	layering = "overlay",
	radius,
	optionRadius,
}: TabsRootProps) {
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
	const controlled = controlledValue !== undefined;
	const value = controlledValue ?? uncontrolledValue;
	const setValue = useCallback(
		(nextValue: string) => {
			if (!controlled) setUncontrolledValue(nextValue);
			onValueChange?.(nextValue);
		},
		[controlled, onValueChange],
	);
	const contextValue = useMemo<TabsContextValue>(
		() => ({
			state: { value },
			actions: { setValue },
			meta: { controlled, variant, size, indicator, layering, radius, optionRadius },
		}),
		[controlled, indicator, layering, optionRadius, radius, setValue, size, value, variant],
	);
	return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
}

/**
 * The `pill` track and selection radius tokens: the instance's, then the
 * theme's. The selection falls back to the track.
 */
function tabsRadiusTokens(
	meta: TabsMeta,
	tabs: TabsTokens,
): { track: RadiusToken; option: RadiusToken } {
	const track = meta.radius ?? tabs.radius;
	return { track, option: meta.optionRadius ?? tabs.optionRadius ?? track };
}

export function useTabs(): TabsContextValue {
	const context = useContext(TabsContext);
	if (!context) throw new Error("Tabs components must be used within Tabs.Root");
	return context;
}

/**
 * The `pill` selection fill: an overlay on the track in `overlay` layering, a
 * surface of its own in `segments` layering, where nothing is under it.
 */
function useSelectionFill(trackFill: string, radius: number, layering: TabsLayering): string {
	const theme = useThemeTokens();
	const base = theme.colors[theme.components.Tabs.activeBackground];
	const segments = layering === "segments";
	const meta = useMemo<SurfaceMeta>(
		() => ({
			slot: "tabs.selected",
			role: segments ? "surface" : "overlay",
			over: segments ? undefined : trackFill,
			baseColor: base,
			selected: true,
			borderRadius: radius,
		}),
		[base, radius, segments, trackFill],
	);
	return useResolvedSurfaceFill(base, meta);
}

export interface TabsListProps extends Omit<ViewProps, "style"> {
	style?: StyleProp<ViewStyle>;
}

/**
 * The row of triggers. In the `pill` variant with `overlay` layering it paints
 * the track once, with its decoration once, and every selection is an overlay
 * on top of it: the same layering rule as `SegmentedControl`. With `segments`
 * layering it stays clear and the triggers paint.
 */
export function TabsList({ style, children, ...props }: TabsListProps) {
	const theme = useThemeTokens();
	const reduceMotion = useReducedMotion();
	const { state, meta } = useTabs();
	const tabs = theme.components.Tabs;
	const pill = meta.variant === "pill";
	const paintsTrack = pill && meta.layering === "overlay";
	const radiusTokens = tabsRadiusTokens(meta, tabs);
	const radius = pill ? theme.radius[radiusTokens.track] : 0;
	const optionRadius = pill ? theme.radius[radiusTokens.option] : 0;
	const trackBase = paintsTrack
		? (readStringFill(style) ?? theme.colors[tabs.background])
		: (readStringFill(style) ?? "transparent");
	const trackMeta = useMemo<SurfaceMeta>(
		() => ({
			slot: "tabs.track",
			variant: meta.variant,
			baseColor: trackBase,
			borderRadius: radius,
		}),
		[meta.variant, radius, trackBase],
	);
	const trackFill = useResolvedSurfaceFill(trackBase, trackMeta);
	const selectionFill = useSelectionFill(trackFill, optionRadius, meta.layering);

	const [layouts, setLayouts] = useState<Record<string, TriggerLayout>>({});
	const reportLayout = useCallback((value: string, layout: TriggerLayout) => {
		setLayouts((previous) => {
			const current = previous[value];
			if (current && current.x === layout.x && current.width === layout.width) return previous;
			return { ...previous, [value]: layout };
		});
	}, []);
	const listContext = useMemo<TabsListContextValue>(
		() => ({ trackFill, reportLayout }),
		[reportLayout, trackFill],
	);

	const sliding = meta.indicator === "slide";
	const target = sliding ? layouts[state.value] : undefined;
	const indicatorX = useSharedValue(target?.x ?? 0);
	const indicatorWidth = useSharedValue(target?.width ?? 0);
	const placed = useSharedValue(target ? 1 : 0);
	const duration = theme.motion.segmented.duration;
	useEffect(() => {
		if (!target) return;
		// The first placement and reduce motion land without travelling.
		const animate = placed.get() === 1 && !reduceMotion;
		indicatorX.set(animate ? withTiming(target.x, { duration }) : target.x);
		indicatorWidth.set(animate ? withTiming(target.width, { duration }) : target.width);
		placed.set(1);
	}, [duration, indicatorWidth, indicatorX, placed, reduceMotion, target]);
	const indicatorStyle = useAnimatedStyle(() => ({
		opacity: placed.get(),
		width: indicatorWidth.get(),
		transform: [{ translateX: indicatorX.get() }],
	}));

	const listStyle = useMemo<ViewStyle>(
		() => ({
			position: "relative",
			flexDirection: "row",
			alignItems: "center",
			gap: pill ? theme.spacing.xs : 0,
			borderBottomWidth: pill ? 0 : StyleSheet.hairlineWidth,
			borderBottomColor: theme.colors.border,
			backgroundColor: trackFill,
			borderRadius: radius,
			padding: pill ? theme.spacing[tabs.padding] : 0,
		}),
		[pill, radius, tabs.padding, theme.colors.border, theme.spacing, trackFill],
	);
	const indicatorShape = useMemo<ViewStyle>(
		() =>
			pill
				? {
						top: theme.spacing[tabs.padding],
						bottom: theme.spacing[tabs.padding],
						borderRadius: optionRadius,
						backgroundColor: selectionFill,
					}
				: { bottom: 0, height: 2, backgroundColor: theme.colors[tabs.indicator] },
		[optionRadius, pill, selectionFill, tabs.indicator, tabs.padding, theme.colors, theme.spacing],
	);

	return (
		<TabsListContext.Provider value={listContext}>
			<View accessibilityRole="tablist" style={[listStyle, withoutStringFill(style)]} {...props}>
				{paintsTrack ? <SurfaceDecoration {...trackMeta} /> : null}
				{sliding ? (
					<Animated.View
						pointerEvents="none"
						style={[styles.indicator, indicatorShape, indicatorStyle]}
					/>
				) : null}
				{children}
			</View>
		</TabsListContext.Provider>
	);
}

export interface TabsTriggerProps extends Omit<PressableProps, "children"> {
	value: string;
	children: ReactNode;
	disabled?: boolean;
}

export function TabsTrigger({
	value,
	children,
	disabled = false,
	style,
	onPress,
	onLayout,
	...props
}: TabsTriggerProps) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const { state, actions, meta } = useTabs();
	const list = useContext(TabsListContext);
	const selected = state.value === value;
	const tabs = theme.components.Tabs;
	const pill = meta.variant === "pill";
	const sliding = meta.indicator === "slide";
	const segments = pill && meta.layering === "segments";
	const radius = pill ? theme.radius[tabsRadiusTokens(meta, tabs).option] : 0;
	const selectionFill = useSelectionFill(list?.trackFill ?? "transparent", radius, meta.layering);
	const segmentBase = segments ? theme.colors[tabs.background] : "transparent";
	const segmentMeta = useMemo<SurfaceMeta>(
		() => ({
			slot: "tabs.track",
			variant: "segment",
			baseColor: segmentBase,
			disabled,
			borderRadius: radius,
		}),
		[disabled, radius, segmentBase],
	);
	const segmentFill = useResolvedSurfaceFill(segmentBase, segmentMeta);
	// In `segments` layering an idle trigger paints the track's fill and the
	// selected one the selection's; a sliding indicator paints the selection.
	const idleSegment = segments && !selected;
	let fill = "transparent";
	if (pill && selected && !sliding) fill = selectionFill;
	else if (idleSegment) fill = segmentFill;
	const reportLayout = list?.reportLayout;
	const handleLayout = useCallback(
		(event: LayoutChangeEvent) => {
			onLayout?.(event);
			const { x, width } = event.nativeEvent.layout;
			reportLayout?.(value, { x, width });
		},
		[onLayout, reportLayout, value],
	);
	const triggerStyle = useMemo<ViewStyle>(
		() => ({
			position: "relative",
			minHeight: meta.size === "compact" ? 40 : 48,
			flex: 1,
			minWidth: 0,
			alignItems: "center",
			justifyContent: "center",
			flexDirection: "row",
			gap: theme.spacing.xs,
			paddingHorizontal: theme.spacing.sm,
			borderRadius: radius,
			backgroundColor: fill,
			borderBottomWidth: !pill && !sliding && selected ? 2 : 0,
			borderBottomColor: theme.colors[tabs.indicator],
			opacity: disabled ? 0.44 : 1,
		}),
		[
			disabled,
			fill,
			meta.size,
			pill,
			radius,
			selected,
			sliding,
			tabs.indicator,
			theme.colors,
			theme.spacing.xs,
			theme.spacing.sm,
		],
	);
	return (
		<Pressable
			accessibilityRole="tab"
			accessibilityState={{ selected, disabled }}
			disabled={disabled}
			onLayout={sliding ? handleLayout : onLayout}
			onPress={(event) => {
				onPress?.(event);
				if (event.defaultPrevented) return;
				haptics.feedback("selection");
				actions.setValue(value);
			}}
			style={(pressState) => [
				triggerStyle,
				pressState.pressed && !disabled ? { opacity: 0.72 } : undefined,
				typeof style === "function" ? style(pressState) : style,
			]}
			{...props}
		>
			{idleSegment ? <SurfaceDecoration {...segmentMeta} /> : null}
			<TabsTriggerContext.Provider value={selected}>{children}</TabsTriggerContext.Provider>
		</Pressable>
	);
}

export interface TabsLabelProps {
	children: ReactNode;
	/** Casing. Defaults to the `label` type style's own transform. */
	transform?: TextProps["transform"];
	weight?: FontWeightValue;
	numberOfLines?: number;
	/**
	 * Android trailing slack. Off by default: the label is centred in its
	 * trigger, so the slack would move it off centre. See `Text`'s `hugSlack`.
	 */
	hugSlack?: boolean;
}

export function TabsLabel({
	children,
	transform = "inherit",
	weight,
	numberOfLines = 1,
	hugSlack = false,
}: TabsLabelProps) {
	const theme = useThemeTokens();
	const selected = useContext(TabsTriggerContext);
	return (
		<Text
			variant="label"
			hugSlack={hugSlack}
			color={
				selected
					? theme.colors[theme.components.Tabs.activeForeground]
					: theme.colors[theme.components.Tabs.inactiveForeground]
			}
			transform={transform}
			weight={weight}
			numberOfLines={numberOfLines}
			adjustsFontSizeToFit
			minimumFontScale={0.72}
		>
			{children}
		</Text>
	);
}

export interface TabsBadgeProps {
	children: ReactNode;
}

export function TabsBadge({ children }: TabsBadgeProps) {
	const theme = useThemeTokens();
	const selected = useContext(TabsTriggerContext);
	const baseColor = selected ? theme.colors.primary : theme.colors.borderStrong;
	const badgeMeta = useMemo<SurfaceMeta>(
		() => ({
			slot: "tabs.badge",
			role: "mark",
			variant: selected ? "selected" : "idle",
			baseColor,
			selected,
		}),
		[baseColor, selected],
	);
	const fill = useResolvedSurfaceFill(baseColor, badgeMeta);
	return (
		<View
			style={{
				minWidth: 18,
				height: 18,
				borderRadius: theme.radius.pill,
				paddingHorizontal: theme.spacing.xs,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: fill,
			}}
		>
			<Text variant="caption" colorKey="onPrimary" numberOfLines={1} hugSlack={false}>
				{children}
			</Text>
		</View>
	);
}

export interface TabOption {
	label: string;
	value: string;
	disabled?: boolean;
	badge?: string | number;
}

export interface TabsProps extends Omit<ViewProps, "style" | "children"> {
	options: TabOption[];
	value: string;
	onChange: (value: string) => void;
	variant?: TabsVariant;
	size?: TabsSize;
	indicator?: TabsIndicator;
	layering?: TabsLayering;
	/** See `TabsRootProps.radius`. */
	radius?: RadiusToken;
	/** See `TabsRootProps.optionRadius`. */
	optionRadius?: RadiusToken;
	style?: StyleProp<ViewStyle>;
}

function TabsFacade({
	options,
	value,
	onChange,
	variant = "underline",
	size = "default",
	indicator = "static",
	layering = "overlay",
	radius,
	optionRadius,
	style,
	testID,
	...props
}: TabsProps) {
	return (
		<TabsRoot
			value={value}
			onValueChange={onChange}
			variant={variant}
			size={size}
			indicator={indicator}
			layering={layering}
			radius={radius}
			optionRadius={optionRadius}
		>
			<TabsList style={style} testID={testID} {...props}>
				{options.map((option) => (
					<TabsTrigger
						key={option.value}
						value={option.value}
						disabled={option.disabled}
						testID={testID ? `${testID}-tab-${option.value}` : undefined}
					>
						<TabsLabel>{option.label}</TabsLabel>
						{option.badge !== undefined ? <TabsBadge>{option.badge}</TabsBadge> : null}
					</TabsTrigger>
				))}
			</TabsList>
		</TabsRoot>
	);
}

const styles = StyleSheet.create({
	indicator: {
		position: "absolute",
		left: 0,
	},
});

export const Tabs = Object.assign(TabsFacade, {
	Root: TabsRoot,
	List: TabsList,
	Trigger: TabsTrigger,
	Label: TabsLabel,
	Badge: TabsBadge,
});
