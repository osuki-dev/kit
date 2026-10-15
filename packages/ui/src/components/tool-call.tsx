import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	Text as RNText,
	View,
	type GestureResponderEvent,
	type StyleProp,
	type TextStyle,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { useThemeTokens } from "../theme";
import { Icon, type IconName } from "./icon";
import { Spinner } from "./spinner";

export type ToolCallStatusType = "pending" | "running" | "success" | "error";

export interface ToolCallState {
	expanded: boolean;
	payloadExpanded: boolean;
	resultExpanded: boolean;
}

export interface ToolCallActions {
	setExpanded: (expanded: boolean) => void;
	toggle: () => void;
	setPayloadExpanded: (expanded: boolean) => void;
	togglePayload: () => void;
	setResultExpanded: (expanded: boolean) => void;
	toggleResult: () => void;
}

export interface ToolCallMeta {
	controlled: boolean;
	status: ToolCallStatusType;
	name?: string;
}

export interface ToolCallContextValue {
	state: ToolCallState;
	actions: ToolCallActions;
	meta: ToolCallMeta;
}

const ToolCallContext = createContext<ToolCallContextValue | undefined>(undefined);

export function useToolCall(): ToolCallContextValue {
	const context = useContext(ToolCallContext);
	if (!context) {
		throw new Error("ToolCall subcomponents must be used within ToolCall.Root");
	}
	return context;
}

const monospaceFont = Platform.select({
	ios: "Menlo",
	android: "monospace",
	default: "monospace",
});

export interface ToolCallRootProps extends ViewProps {
	children?: ReactNode;
	name?: string;
	status?: ToolCallStatusType;
	expanded?: boolean;
	defaultExpanded?: boolean;
	payloadExpanded?: boolean;
	defaultPayloadExpanded?: boolean;
	resultExpanded?: boolean;
	defaultResultExpanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
	style?: StyleProp<ViewStyle>;
}

export function ToolCallRoot({
	children,
	name,
	status = "pending",
	expanded: controlledExpanded,
	defaultExpanded = true,
	payloadExpanded: controlledPayloadExpanded,
	defaultPayloadExpanded = true,
	resultExpanded: controlledResultExpanded,
	defaultResultExpanded = true,
	onExpandedChange,
	style,
	...props
}: ToolCallRootProps) {
	const theme = useThemeTokens();

	const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
	const [uncontrolledPayloadExpanded, setUncontrolledPayloadExpanded] =
		useState(defaultPayloadExpanded);
	const [uncontrolledResultExpanded, setUncontrolledResultExpanded] =
		useState(defaultResultExpanded);

	const controlled = controlledExpanded !== undefined;
	const expanded = controlled ? controlledExpanded : uncontrolledExpanded;

	const payloadExpanded =
		controlledPayloadExpanded !== undefined
			? controlledPayloadExpanded
			: uncontrolledPayloadExpanded;

	const resultExpanded =
		controlledResultExpanded !== undefined ? controlledResultExpanded : uncontrolledResultExpanded;

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

	const setPayloadExpanded = useCallback((nextExpanded: boolean) => {
		setUncontrolledPayloadExpanded(nextExpanded);
	}, []);

	const togglePayload = useCallback(() => {
		setUncontrolledPayloadExpanded((prev) => !prev);
	}, []);

	const setResultExpanded = useCallback((nextExpanded: boolean) => {
		setUncontrolledResultExpanded(nextExpanded);
	}, []);

	const toggleResult = useCallback(() => {
		setUncontrolledResultExpanded((prev) => !prev);
	}, []);

	const value = useMemo<ToolCallContextValue>(
		() => ({
			state: { expanded, payloadExpanded, resultExpanded },
			actions: {
				setExpanded,
				toggle,
				setPayloadExpanded,
				togglePayload,
				setResultExpanded,
				toggleResult,
			},
			meta: { controlled, status, name },
		}),
		[
			controlled,
			expanded,
			name,
			payloadExpanded,
			resultExpanded,
			setExpanded,
			setPayloadExpanded,
			setResultExpanded,
			status,
			toggle,
			togglePayload,
			toggleResult,
		],
	);

	return (
		<ToolCallContext.Provider value={value}>
			<View
				style={[
					styles.root,
					{
						backgroundColor: theme.colors.surface,
						borderColor: theme.colors.border,
						borderRadius: theme.radius.md,
					},
					style,
				]}
				{...props}
			>
				{children}
			</View>
		</ToolCallContext.Provider>
	);
}

export interface ToolCallHeaderProps {
	children?: ReactNode;
	icon?: IconName;
	showChevron?: boolean;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

export function ToolCallHeader({
	children,
	icon = "Wrench",
	showChevron = true,
	onPress,
	style,
}: ToolCallHeaderProps) {
	const theme = useThemeTokens();
	const { state, actions } = useToolCall();

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
			accessibilityState={{ expanded: state.expanded }}
			onPress={handlePress}
			style={({ pressed }) => [
				styles.header,
				{
					backgroundColor: pressed ? theme.colors.surfaceRaised : "transparent",
					borderBottomColor: state.expanded ? theme.colors.border : "transparent",
					borderBottomWidth: state.expanded ? 1 : 0,
				},
				style,
			]}
		>
			<View style={styles.headerLeft}>
				<View
					style={[
						styles.iconBox,
						{
							backgroundColor: theme.colors.surfaceRaised,
							borderRadius: theme.radius.sm,
						},
					]}
				>
					<Icon name={icon} size={15} color={theme.colors.textMuted} />
				</View>
				{children}
			</View>
			<View style={styles.headerRight}>
				{showChevron && (
					<Icon
						name={state.expanded ? "ChevronDown" : "ChevronRight"}
						size={15}
						color={theme.colors.textMuted}
					/>
				)}
			</View>
		</Pressable>
	);
}

export interface ToolCallNameProps {
	children?: ReactNode;
	style?: StyleProp<TextStyle>;
}

export function ToolCallName({ children, style }: ToolCallNameProps) {
	const theme = useThemeTokens();
	const { meta } = useToolCall();

	const content = children ?? meta.name ?? "tool_call";

	return (
		<View
			style={[
				styles.nameBadge,
				{
					backgroundColor: theme.colors.surfaceRaised,
					borderRadius: theme.radius.sm,
				},
			]}
		>
			<RNText
				style={[
					styles.nameText,
					{
						color: theme.colors.text,
						fontFamily: monospaceFont,
					},
					style,
				]}
			>
				{content}
			</RNText>
		</View>
	);
}

export interface ToolCallStatusProps {
	children?: ReactNode;
	variant?: "default" | "primary" | "success" | "warning" | "danger";
	style?: StyleProp<ViewStyle>;
}

export function ToolCallStatus({ children, variant, style }: ToolCallStatusProps) {
	const theme = useThemeTokens();
	const { meta } = useToolCall();

	const resolvedVariant = useMemo(() => {
		if (variant) return variant;
		switch (meta.status) {
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
	}, [meta.status, variant]);

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

	if (children !== undefined) {
		return (
			<View
				style={[
					styles.statusBadge,
					{ backgroundColor: badgeColors.bg, borderRadius: theme.radius.sm },
					style,
				]}
			>
				{children}
			</View>
		);
	}

	return (
		<View
			style={[
				styles.statusBadge,
				{ backgroundColor: badgeColors.bg, borderRadius: theme.radius.sm },
				style,
			]}
		>
			{meta.status === "running" && <Spinner size="sm" />}
			{meta.status === "success" && <Icon name="Check" size={12} color={badgeColors.text} />}
			{meta.status === "error" && <Icon name="CircleAlert" size={12} color={badgeColors.text} />}
			<RNText style={[styles.statusText, { color: badgeColors.text }]}>{meta.status}</RNText>
		</View>
	);
}

export interface ToolCallPayloadProps {
	children?: ReactNode;
	label?: string;
	collapsible?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function ToolCallPayload({
	children,
	label = "Parameters",
	collapsible = true,
	style,
}: ToolCallPayloadProps) {
	const theme = useThemeTokens();
	const { state, actions } = useToolCall();

	if (!state.expanded) {
		return null;
	}

	return (
		<View style={[styles.section, style]}>
			<Pressable
				disabled={!collapsible}
				onPress={actions.togglePayload}
				style={styles.sectionHeader}
			>
				<RNText style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>{label}</RNText>
				{collapsible && (
					<Icon
						name={state.payloadExpanded ? "ChevronDown" : "ChevronRight"}
						size={13}
						color={theme.colors.textSubtle}
					/>
				)}
			</Pressable>
			{state.payloadExpanded && (
				<View
					style={[
						styles.sectionContent,
						{
							backgroundColor: theme.colors.surfaceRaised,
							borderRadius: theme.radius.sm,
						},
					]}
				>
					{typeof children === "string" ? (
						<RNText
							style={[styles.codeText, { color: theme.colors.text, fontFamily: monospaceFont }]}
						>
							{children}
						</RNText>
					) : (
						children
					)}
				</View>
			)}
		</View>
	);
}

export interface ToolCallResultProps {
	children?: ReactNode;
	label?: string;
	collapsible?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function ToolCallResult({
	children,
	label = "Result",
	collapsible = true,
	style,
}: ToolCallResultProps) {
	const theme = useThemeTokens();
	const { state, meta, actions } = useToolCall();

	if (!state.expanded) {
		return null;
	}

	const isError = meta.status === "error";

	return (
		<View
			style={[
				styles.section,
				{
					borderTopColor: theme.colors.border,
					borderTopWidth: 1,
				},
				style,
			]}
		>
			<Pressable
				disabled={!collapsible}
				onPress={actions.toggleResult}
				style={styles.sectionHeader}
			>
				<RNText
					style={[
						styles.sectionTitle,
						{ color: isError ? theme.colors.danger : theme.colors.textMuted },
					]}
				>
					{label}
				</RNText>
				{collapsible && (
					<Icon
						name={state.resultExpanded ? "ChevronDown" : "ChevronRight"}
						size={13}
						color={theme.colors.textSubtle}
					/>
				)}
			</Pressable>
			{state.resultExpanded && (
				<View
					style={[
						styles.sectionContent,
						{
							backgroundColor: isError ? theme.colors.dangerSubtle : theme.colors.surfaceRaised,
							borderRadius: theme.radius.sm,
						},
					]}
				>
					{typeof children === "string" ? (
						<RNText
							style={[
								styles.codeText,
								{
									color: isError ? theme.colors.danger : theme.colors.text,
									fontFamily: monospaceFont,
								},
							]}
						>
							{children}
						</RNText>
					) : (
						children
					)}
				</View>
			)}
		</View>
	);
}

export const ToolCall = Object.assign(ToolCallRoot, {
	Root: ToolCallRoot,
	Header: ToolCallHeader,
	Name: ToolCallName,
	Status: ToolCallStatus,
	Payload: ToolCallPayload,
	Result: ToolCallResult,
});

const styles = StyleSheet.create({
	root: {
		borderWidth: 1,
		overflow: "hidden",
		width: "100%",
		marginVertical: 4,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		paddingVertical: 10,
		minHeight: 44,
	},
	headerLeft: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginLeft: 8,
	},
	iconBox: {
		width: 26,
		height: 26,
		alignItems: "center",
		justifyContent: "center",
	},
	nameBadge: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		alignItems: "center",
		justifyContent: "center",
	},
	nameText: {
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 0.2,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 7,
		paddingVertical: 3,
	},
	statusText: {
		fontSize: 11,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	section: {
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 4,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	sectionContent: {
		marginTop: 6,
		padding: 10,
	},
	codeText: {
		fontSize: 12,
		lineHeight: 18,
	},
});
