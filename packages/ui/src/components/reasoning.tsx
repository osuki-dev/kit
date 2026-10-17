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

export interface ReasoningState {
	open: boolean;
}

export interface ReasoningActions {
	setOpen: (open: boolean) => void;
	toggle: () => void;
}

export interface ReasoningMeta {
	controlled: boolean;
	durationSeconds?: number;
	isStreaming?: boolean;
}

export interface ReasoningContextValue {
	state: ReasoningState;
	actions: ReasoningActions;
	meta: ReasoningMeta;
}

const ReasoningContext = createContext<ReasoningContextValue | undefined>(undefined);

export function useReasoning(): ReasoningContextValue {
	const context = useContext(ReasoningContext);
	if (!context) {
		throw new Error("Reasoning subcomponents must be used within Reasoning.Root");
	}
	return context;
}

export interface ReasoningRootProps extends ViewProps {
	children?: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	durationSeconds?: number;
	isStreaming?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function ReasoningRoot({
	children,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	durationSeconds,
	isStreaming = false,
	style,
	...props
}: ReasoningRootProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const controlled = controlledOpen !== undefined;
	const open = controlled ? controlledOpen : uncontrolledOpen;

	const setOpen = useCallback(
		(nextOpen: boolean) => {
			if (!controlled) {
				setUncontrolledOpen(nextOpen);
			}
			onOpenChange?.(nextOpen);
		},
		[controlled, onOpenChange],
	);

	const toggle = useCallback(() => {
		setOpen(!open);
	}, [open, setOpen]);

	const value = useMemo<ReasoningContextValue>(
		() => ({
			state: { open },
			actions: { setOpen, toggle },
			meta: { controlled, durationSeconds, isStreaming },
		}),
		[controlled, durationSeconds, isStreaming, open, setOpen, toggle],
	);

	return (
		<ReasoningContext.Provider value={value}>
			<View style={[styles.root, style]} {...props}>
				{children}
			</View>
		</ReasoningContext.Provider>
	);
}

function StreamingIcon({ color }: { color: string }) {
	const opacity = useSharedValue(0.4);

	useEffect(() => {
		opacity.value = withRepeat(withTiming(1, { duration: 650 }), -1, true);
	}, [opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	return (
		<Animated.View style={[styles.iconWrapper, animatedStyle]}>
			<Icon name="Brain" size={16} color={color} />
		</Animated.View>
	);
}

export interface ReasoningTriggerProps {
	children?: ReactNode;
	showChevron?: boolean;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

export function ReasoningTrigger({
	children,
	showChevron = true,
	onPress,
	style,
}: ReasoningTriggerProps) {
	const theme = useThemeTokens();
	const { state, actions, meta } = useReasoning();

	const handlePress = useCallback(
		(event: GestureResponderEvent) => {
			onPress?.(event);
			if (!event.defaultPrevented) {
				actions.toggle();
			}
		},
		[actions, onPress],
	);

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ expanded: state.open }}
			onPress={handlePress}
			style={({ pressed }) => [
				styles.trigger,
				{
					backgroundColor: pressed ? theme.colors.surfaceRaised : "transparent",
					borderRadius: theme.radius.sm,
				},
				style,
			]}
		>
			<View style={styles.triggerLeft}>
				{meta.isStreaming ? (
					<StreamingIcon color={theme.colors.primary} />
				) : (
					<View style={styles.iconWrapper}>
						<Icon name="Brain" size={16} color={theme.colors.textMuted} />
					</View>
				)}
				{children ?? (
					<View style={styles.defaultTriggerContent}>
						<Text
							variant="bodySmall"
							style={[styles.triggerText, { color: theme.colors.textMuted }]}
						>
							{meta.isStreaming ? "Thinking..." : "Thought process"}
						</Text>
						<ReasoningDuration />
					</View>
				)}
			</View>
			{showChevron && (
				<View style={styles.chevronWrapper}>
					<Icon
						name={state.open ? "ChevronDown" : "ChevronRight"}
						size={15}
						color={theme.colors.textMuted}
					/>
				</View>
			)}
		</Pressable>
	);
}

export interface ReasoningDurationProps {
	children?: ReactNode;
	style?: StyleProp<TextStyle>;
}

export function ReasoningDuration({ children, style }: ReasoningDurationProps) {
	const theme = useThemeTokens();
	const { meta } = useReasoning();

	if (children !== undefined) {
		return (
			<Text
				variant="bodySmall"
				style={[styles.durationText, { color: theme.colors.textSubtle }, style]}
			>
				{children}
			</Text>
		);
	}

	if (meta.isStreaming) {
		return null;
	}

	if (meta.durationSeconds === undefined) {
		return null;
	}

	const durationLabel = `for ${meta.durationSeconds}s`;

	return (
		<Text
			variant="bodySmall"
			style={[styles.durationText, { color: theme.colors.textSubtle }, style]}
		>
			{durationLabel}
		</Text>
	);
}

export interface ReasoningContentProps extends ViewProps {
	children?: ReactNode;
	style?: StyleProp<ViewStyle>;
}

export function ReasoningContent({ children, style, ...props }: ReasoningContentProps) {
	const theme = useThemeTokens();
	const { state } = useReasoning();

	if (!state.open) {
		return null;
	}

	return (
		<View
			style={[
				styles.content,
				{
					borderLeftColor: theme.colors.borderStrong,
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

export const Reasoning = Object.assign(ReasoningRoot, {
	Root: ReasoningRoot,
	Trigger: ReasoningTrigger,
	Duration: ReasoningDuration,
	Content: ReasoningContent,
});

const styles = StyleSheet.create({
	root: {
		flexDirection: "column",
		width: "100%",
		marginVertical: 4,
	},
	trigger: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 6,
		paddingHorizontal: 8,
		minHeight: 32,
	},
	triggerLeft: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	iconWrapper: {
		width: 18,
		height: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	defaultTriggerContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	triggerText: {
		fontSize: 13,
		lineHeight: 18,
		fontWeight: "500",
	},
	durationText: {
		fontSize: 12,
		lineHeight: 16,
		fontStyle: "italic",
	},
	chevronWrapper: {
		width: 18,
		height: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		marginLeft: 17,
		paddingLeft: 12,
		paddingTop: 6,
		paddingBottom: 8,
		borderLeftWidth: 2,
	},
	contentText: {
		fontSize: 13,
		lineHeight: 20,
		fontStyle: "italic",
	},
});
