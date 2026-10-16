import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import {
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text as RNText,
	View,
	type StyleProp,
	type TextStyle,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { readStringFill, useResolvedSurfaceFill, useThemeTokens, withoutStringFill } from "../theme";
import { withAlpha } from "../utils/color";
import { Icon } from "./icon";

export type CodeBlockVariant = "default" | "diff" | "terminal" | "compact";
export type CodeBlockDiffType = "add" | "delete" | "normal";

export interface CodeBlockState {
	copied: boolean;
}

export interface CodeBlockActions {
	copy: () => void;
	setCopied: (copied: boolean) => void;
}

export interface CodeBlockMeta {
	variant: CodeBlockVariant;
	code?: string;
}

export interface CodeBlockContextValue {
	state: CodeBlockState;
	actions: CodeBlockActions;
	meta: CodeBlockMeta;
}

const CodeBlockContext = createContext<CodeBlockContextValue | undefined>(undefined);

export function useCodeBlock(): CodeBlockContextValue {
	const context = useContext(CodeBlockContext);
	if (!context) {
		throw new Error("CodeBlock subcomponents must be used within CodeBlock.Root");
	}
	return context;
}

const monospaceFont = Platform.select({
	ios: "Menlo",
	android: "monospace",
	default: "monospace",
});

export interface CodeBlockRootProps extends ViewProps {
	children?: ReactNode;
	variant?: CodeBlockVariant;
	code?: string;
	onCopy?: (code?: string) => void | Promise<void>;
	style?: StyleProp<ViewStyle>;
}

export function CodeBlockRoot({
	children,
	variant = "default",
	code,
	onCopy,
	style,
	...props
}: CodeBlockRootProps) {
	const theme = useThemeTokens();
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const copy = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		onCopy?.(code);
		setCopied(true);
		timerRef.current = setTimeout(() => {
			setCopied(false);
		}, 2000);
	}, [code, onCopy]);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const tokenFill = variant === "default" ? theme.colors.surface : theme.colors.surfaceRaised;
	const fillOverride = readStringFill(style);
	const baseColor = fillOverride ?? tokenFill;
	const surfaceMeta = useMemo(
		() => ({
			slot: `code.${variant}`,
			variant,
			baseColor,
			borderRadius: theme.radius.md,
		}),
		[baseColor, theme.radius.md, variant],
	);
	const fill = useResolvedSurfaceFill(baseColor, surfaceMeta);

	const value = useMemo<CodeBlockContextValue>(
		() => ({
			state: { copied },
			actions: { copy, setCopied },
			meta: { variant, code },
		}),
		[copied, copy, variant, code],
	);

	const variantContainerStyle = useMemo<ViewStyle>(
		() => ({
			backgroundColor: fill,
			borderColor: theme.colors.border,
		}),
		[fill, theme.colors.border],
	);

	return (
		<CodeBlockContext.Provider value={value}>
			<View
				style={[
					styles.root,
					variantContainerStyle,
					{
						borderRadius: theme.radius.md,
						overflow: "hidden",
					},
					withoutStringFill(style),
				]}
				{...props}
			>
				{children}
			</View>
		</CodeBlockContext.Provider>
	);
}

export interface CodeBlockHeaderProps {
	children?: ReactNode;
	showTerminalDots?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function CodeBlockHeader({ children, showTerminalDots, style }: CodeBlockHeaderProps) {
	const theme = useThemeTokens();
	const { meta } = useCodeBlock();

	const shouldShowDots = showTerminalDots ?? meta.variant === "terminal";

	return (
		<View
			style={[
				styles.header,
				{
					borderBottomColor: theme.colors.border,
				},
				style,
			]}
		>
			{shouldShowDots && (
				<View style={styles.terminalDots}>
					<View style={[styles.terminalDot, { backgroundColor: theme.colors.danger }]} />
					<View style={[styles.terminalDot, { backgroundColor: theme.colors.warning }]} />
					<View style={[styles.terminalDot, { backgroundColor: theme.colors.success }]} />
				</View>
			)}
			<View style={styles.headerContent}>{children}</View>
		</View>
	);
}

export interface CodeBlockTitleProps {
	children?: ReactNode;
	style?: StyleProp<TextStyle>;
}

export function CodeBlockTitle({ children, style }: CodeBlockTitleProps) {
	const theme = useThemeTokens();
	const defaultColor = theme.colors.text;

	return (
		<RNText
			style={[
				styles.title,
				{
					color: defaultColor,
					fontFamily: monospaceFont,
				},
				style,
			]}
		>
			{children}
		</RNText>
	);
}

export interface CodeBlockActionsProps {
	children?: ReactNode;
	style?: StyleProp<ViewStyle>;
}

export function CodeBlockActions({ children, style }: CodeBlockActionsProps) {
	return <View style={[styles.actions, style]}>{children}</View>;
}

export interface CodeBlockCopyButtonProps {
	onCopy?: (code?: string) => void | Promise<void>;
	code?: string;
	style?: StyleProp<ViewStyle>;
}

export function CodeBlockCopyButton({ onCopy, code, style }: CodeBlockCopyButtonProps) {
	const theme = useThemeTokens();
	const { state, actions, meta } = useCodeBlock();

	const handlePress = useCallback(() => {
		if (onCopy) {
			onCopy(code ?? meta.code);
			actions.setCopied(true);
			setTimeout(() => actions.setCopied(false), 2000);
		} else {
			actions.copy();
		}
	}, [actions, code, meta.code, onCopy]);

	const iconColor = state.copied ? theme.colors.success : theme.colors.textMuted;

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={state.copied ? "Copied" : "Copy code"}
			onPress={handlePress}
			style={({ pressed }) => [
				styles.copyButton,
				{
					backgroundColor: pressed ? withAlpha(theme.colors.text, 0.08) : "transparent",
					borderRadius: theme.radius.sm,
				},
				style,
			]}
		>
			<Icon name={state.copied ? "Check" : "Copy"} size={14} color={iconColor} />
		</Pressable>
	);
}

export interface CodeBlockContentProps {
	children?: ReactNode;
	scrollable?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function CodeBlockContent({ children, scrollable = true, style }: CodeBlockContentProps) {
	const content = <View style={[styles.contentInner, style]}>{children}</View>;

	if (!scrollable) {
		return <View style={styles.contentWrapper}>{content}</View>;
	}

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.scrollContent}
			style={styles.contentWrapper}
		>
			{content}
		</ScrollView>
	);
}

export interface CodeBlockLineProps {
	children?: ReactNode;
	lineNumber?: number;
	type?: CodeBlockDiffType;
	style?: StyleProp<ViewStyle>;
}

export function CodeBlockLine({
	children,
	lineNumber,
	type = "normal",
	style,
}: CodeBlockLineProps) {
	const theme = useThemeTokens();
	const { meta } = useCodeBlock();

	const lineHighlight = useMemo(() => {
		switch (type) {
			case "add":
				return {
					bg: withAlpha(theme.colors.success, 0.14),
					marker: "+",
					markerColor: theme.colors.success,
					textColor: theme.colors.success,
				};
			case "delete":
				return {
					bg: withAlpha(theme.colors.danger, 0.14),
					marker: "-",
					markerColor: theme.colors.danger,
					textColor: theme.colors.danger,
				};
			case "normal":
			default:
				return {
					bg: "transparent",
					marker: meta.variant === "diff" ? " " : undefined,
					markerColor: theme.colors.textMuted,
					textColor: theme.colors.text,
				};
		}
	}, [
		meta.variant,
		theme.colors.danger,
		theme.colors.success,
		theme.colors.text,
		theme.colors.textMuted,
		type,
	]);

	return (
		<View style={[styles.line, { backgroundColor: lineHighlight.bg }, style]}>
			{lineNumber !== undefined && (
				<RNText
					style={[
						styles.lineNumber,
						{
							color: theme.colors.textDisabled,
							fontFamily: monospaceFont,
						},
					]}
				>
					{lineNumber}
				</RNText>
			)}
			{lineHighlight.marker !== undefined && (
				<RNText
					style={[
						styles.marker,
						{
							color: lineHighlight.markerColor,
							fontFamily: monospaceFont,
						},
					]}
				>
					{lineHighlight.marker}
				</RNText>
			)}
			<RNText
				style={[
					styles.lineText,
					{
						color: lineHighlight.textColor,
						fontFamily: monospaceFont,
					},
				]}
			>
				{children}
			</RNText>
		</View>
	);
}

export const CodeBlock = Object.assign(CodeBlockRoot, {
	Root: CodeBlockRoot,
	Header: CodeBlockHeader,
	Title: CodeBlockTitle,
	Actions: CodeBlockActions,
	CopyButton: CodeBlockCopyButton,
	Content: CodeBlockContent,
	Line: CodeBlockLine,
});

const styles = StyleSheet.create({
	root: {
		borderWidth: StyleSheet.hairlineWidth,
		overflow: "hidden",
		width: "100%",
		marginVertical: 4,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderBottomWidth: 1,
		minHeight: 36,
	},
	terminalDots: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginRight: 10,
	},
	terminalDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	headerContent: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	title: {
		fontSize: 12,
		fontWeight: "500",
		letterSpacing: 0.2,
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginLeft: "auto",
	},
	copyButton: {
		padding: 5,
		alignItems: "center",
		justifyContent: "center",
	},
	contentWrapper: {
		width: "100%",
	},
	scrollContent: {
		flexGrow: 1,
	},
	contentInner: {
		paddingVertical: 8,
		width: "100%",
	},
	line: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 2,
		paddingHorizontal: 12,
		minHeight: 20,
	},
	lineNumber: {
		width: 32,
		fontSize: 12,
		textAlign: "right",
		marginRight: 12,
		userSelect: "none" as unknown as undefined,
	},
	marker: {
		width: 14,
		fontSize: 12,
		fontWeight: "600",
	},
	lineText: {
		fontSize: 12,
		lineHeight: 18,
		flexShrink: 0,
	},
});
