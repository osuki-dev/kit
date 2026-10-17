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
	type GestureResponderEvent,
	type StyleProp,
	type TextStyle,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Text } from "./text";
import { Icon } from "./icon";

export type TraceStepStatus = "pending" | "running" | "success" | "error";

export interface TraceItemState {
	expanded: boolean;
	status: TraceStepStatus;
}

export interface TraceItemActions {
	setExpanded: (expanded: boolean) => void;
	toggle: () => void;
}

export interface TraceItemMeta {
	controlled: boolean;
}

export interface TraceItemContextValue {
	state: TraceItemState;
	actions: TraceItemActions;
	meta: TraceItemMeta;
}

const TraceItemContext = createContext<TraceItemContextValue | undefined>(undefined);

export function useTraceItem(): TraceItemContextValue {
	const context = useContext(TraceItemContext);
	if (!context) {
		throw new Error("Trace subcomponents must be used within Trace.Item");
	}
	return context;
}

export interface TraceRootProps extends ViewProps {
	children?: ReactNode;
	style?: StyleProp<ViewStyle>;
}

export function TraceRoot({ children, style, ...props }: TraceRootProps) {
	return (
		<View style={[styles.root, style]} {...props}>
			{children}
		</View>
	);
}

export interface TraceItemProps extends ViewProps {
	children?: ReactNode;
	status?: TraceStepStatus;
	expanded?: boolean;
	defaultExpanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
	style?: StyleProp<ViewStyle>;
}

export function TraceItem({
	children,
	status = "pending",
	expanded: controlledExpanded,
	defaultExpanded = false,
	onExpandedChange,
	style,
	...props
}: TraceItemProps) {
	const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
	const controlled = controlledExpanded !== undefined;
	const expanded = controlled ? controlledExpanded : uncontrolledExpanded;

	const setExpanded = useCallback(
		(nextExpanded: boolean) => {
			if (!controlled) {
				setUncontrolledExpanded(nextExpanded);
			}
			onExpandedChange?.(nextExpanded);
		},
		[controlled, onExpandedChange],
	);

	const toggle = useCallback(() => {
		setExpanded(!expanded);
	}, [expanded, setExpanded]);

	const value = useMemo<TraceItemContextValue>(
		() => ({
			state: { expanded, status },
			actions: { setExpanded, toggle },
			meta: { controlled },
		}),
		[controlled, expanded, setExpanded, status, toggle],
	);

	return (
		<TraceItemContext.Provider value={value}>
			<View style={[styles.item, style]} {...props}>
				{children}
			</View>
		</TraceItemContext.Provider>
	);
}

export interface TraceHeaderProps {
	children?: ReactNode;
	indicator?: ReactNode;
	showChevron?: boolean;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

function RunningIndicator({ color }: { color: string }) {
	const pulse = useSharedValue(0.4);

	useEffect(() => {
		pulse.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
	}, [pulse]);

	const animatedRingStyle = useAnimatedStyle(() => ({
		opacity: 1 - pulse.value * 0.5,
		transform: [{ scale: 0.7 + pulse.value * 0.55 }],
	}));

	return (
		<View style={styles.runningContainer}>
			<Animated.View style={[styles.runningPulseRing, { borderColor: color }, animatedRingStyle]} />
			<View style={[styles.runningCoreDot, { backgroundColor: color }]} />
		</View>
	);
}

export function TraceHeader({
	children,
	indicator,
	showChevron = true,
	onPress,
	style,
}: TraceHeaderProps) {
	const theme = useThemeTokens();
	const { state, actions } = useTraceItem();

	const handlePress = useCallback(
		(event: GestureResponderEvent) => {
			onPress?.(event);
			if (!event.defaultPrevented) {
				actions.toggle();
			}
		},
		[actions, onPress],
	);

	const defaultIndicator = useMemo(() => {
		if (indicator) return indicator;

		switch (state.status) {
			case "running":
				return <RunningIndicator color={theme.colors.primary} />;
			case "success":
				return <Icon name="CheckCircle2" size={16} color={theme.colors.success} />;
			case "error":
				return <Icon name="CircleAlert" size={16} color={theme.colors.danger} />;
			case "pending":
			default:
				return (
					<View
						style={[
							styles.pendingDot,
							{
								borderColor: theme.colors.borderStrong,
								backgroundColor: theme.colors.surfaceRaised,
							},
						]}
					/>
				);
		}
	}, [indicator, state.status, theme.colors]);

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ expanded: state.expanded }}
			onPress={handlePress}
			style={({ pressed }) => [
				styles.header,
				{
					backgroundColor: pressed ? theme.colors.surfaceRaised : "transparent",
					borderRadius: theme.radius.sm,
				},
				style,
			]}
		>
			<View style={styles.indicatorContainer}>{defaultIndicator}</View>
			<View style={styles.headerContent}>{children}</View>
			{showChevron && (
				<View style={styles.chevronContainer}>
					<Icon
						name={state.expanded ? "ChevronDown" : "ChevronRight"}
						size={15}
						color={theme.colors.textMuted}
					/>
				</View>
			)}
		</Pressable>
	);
}

export interface TraceTitleProps {
	children?: ReactNode;
	numberOfLines?: number;
	style?: StyleProp<TextStyle>;
}

export function TraceTitle({ children, numberOfLines = 1, style }: TraceTitleProps) {
	const theme = useThemeTokens();
	return (
		<Text
			variant="bodySmall"
			numberOfLines={numberOfLines}
			style={[
				styles.title,
				{
					color: theme.colors.text,
					fontSize: 14,
					lineHeight: 20,
					fontWeight: "500",
				},
				style,
			]}
		>
			{children}
		</Text>
	);
}

export interface TraceBadgeProps {
	children?: ReactNode;
	variant?: "default" | "primary" | "success" | "warning" | "danger";
	style?: StyleProp<ViewStyle>;
}

export function TraceBadge({ children, variant, style }: TraceBadgeProps) {
	const theme = useThemeTokens();
	const { state } = useTraceItem();

	const resolvedVariant = useMemo(() => {
		if (variant) return variant;
		switch (state.status) {
			case "running":
				return "primary";
			case "success":
				return "success";
			case "error":
				return "danger";
			case "pending":
			default:
				return "default";
		}
	}, [state.status, variant]);

	const badgeColors = useMemo(() => {
		switch (resolvedVariant) {
			case "primary":
				return { bg: theme.colors.primarySubtle, text: theme.colors.primary };
			case "success":
				return { bg: "rgba(18, 183, 106, 0.12)", text: theme.colors.success };
			case "danger":
				return { bg: theme.colors.dangerSubtle, text: theme.colors.danger };
			case "warning":
				return { bg: "rgba(247, 144, 9, 0.12)", text: theme.colors.warning };
			case "default":
			default:
				return { bg: theme.colors.surfaceRaised, text: theme.colors.textMuted };
		}
	}, [resolvedVariant, theme.colors]);

	const content = useMemo(() => {
		if (children !== undefined) return children;
		switch (state.status) {
			case "running":
				return "running";
			case "success":
				return "completed";
			case "error":
				return "failed";
			case "pending":
			default:
				return "pending";
		}
	}, [children, state.status]);

	return (
		<View
			style={[
				styles.badge,
				{
					backgroundColor: badgeColors.bg,
					borderRadius: theme.radius.sm,
				},
				style,
			]}
		>
			<Text
				variant="bodySmall"
				style={[
					styles.badgeText,
					{
						color: badgeColors.text,
					},
				]}
			>
				{content}
			</Text>
		</View>
	);
}

export interface TraceContentProps extends ViewProps {
	children?: ReactNode;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
}

export function TraceContent({ children, style, textStyle, ...props }: TraceContentProps) {
	const theme = useThemeTokens();
	const { state } = useTraceItem();

	if (!state.expanded) {
		return null;
	}

	return (
		<View
			style={[
				styles.content,
				{
					borderLeftColor: theme.colors.border,
				},
				style,
			]}
			{...props}
		>
			{typeof children === "string" ? (
				<Text
					variant="bodySmall"
					style={[
						styles.contentText,
						{
							color: theme.colors.textMuted,
						},
						textStyle,
					]}
				>
					{children}
				</Text>
			) : (
				children
			)}
		</View>
	);
}

export interface TraceActionProps {
	children?: ReactNode;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

export function TraceAction({ children, onPress, style }: TraceActionProps) {
	const handlePress = useCallback(
		(event: GestureResponderEvent) => {
			event.stopPropagation?.();
			onPress?.(event);
		},
		[onPress],
	);

	return (
		<Pressable onPress={handlePress} style={[styles.action, style]}>
			{children}
		</Pressable>
	);
}

export const Trace = Object.assign(TraceRoot, {
	Root: TraceRoot,
	Item: TraceItem,
	Header: TraceHeader,
	Title: TraceTitle,
	Badge: TraceBadge,
	Content: TraceContent,
	Action: TraceAction,
});

const styles = StyleSheet.create({
	root: {
		flexDirection: "column",
		width: "100%",
	},
	item: {
		flexDirection: "column",
		width: "100%",
		marginVertical: 2,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 36,
		paddingVertical: 6,
		paddingHorizontal: 8,
	},
	indicatorContainer: {
		width: 20,
		height: 20,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
	pendingDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		borderWidth: 1.5,
	},
	runningContainer: {
		width: 18,
		height: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	runningPulseRing: {
		position: "absolute",
		width: 16,
		height: 16,
		borderRadius: 8,
		borderWidth: 2,
	},
	runningCoreDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	headerContent: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	chevronContainer: {
		width: 20,
		height: 20,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 4,
	},
	title: {
		flexShrink: 1,
	},
	badge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		alignItems: "center",
		justifyContent: "center",
	},
	badgeText: {
		fontSize: 11,
		lineHeight: 14,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.3,
	},
	content: {
		marginLeft: 17,
		paddingLeft: 14,
		paddingTop: 4,
		paddingBottom: 6,
		borderLeftWidth: 1.5,
	},
	contentText: {
		fontSize: 13,
		lineHeight: 18,
	},
	action: {
		marginLeft: 4,
		alignItems: "center",
		justifyContent: "center",
	},
});
