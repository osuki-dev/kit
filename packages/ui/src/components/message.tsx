import React, { createContext, useContext, type ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export type MessageAlign = "start" | "end";

const MessageAlignContext = createContext<MessageAlign>("start");

export function useMessageAlign(): MessageAlign {
	return useContext(MessageAlignContext);
}

export interface MessageRootProps extends ViewProps {
	children?: ReactNode;
	align?: MessageAlign;
}

export function MessageRoot({ children, align = "start", style, ...props }: MessageRootProps) {
	const theme = useThemeTokens();
	let items: "flex-start" | "flex-end" = "flex-start";
	if (align === "end") items = "flex-end";
	return (
		<MessageAlignContext.Provider value={align}>
			<View style={[{ width: "100%", gap: theme.spacing.xs, alignItems: items }, style]} {...props}>
				{children}
			</View>
		</MessageAlignContext.Provider>
	);
}

export function MessageAuthor({ children }: { children?: ReactNode }) {
	return (
		<Text variant="caption" colorKey="textMuted">
			{children}
		</Text>
	);
}

export function MessageTime({ children }: { children?: ReactNode }) {
	return (
		<Text variant="caption" colorKey="textDisabled">
			{children}
		</Text>
	);
}

export interface BubbleProps extends ViewProps {
	children?: ReactNode;
}

export function Bubble({ children, style, ...props }: BubbleProps) {
	const theme = useThemeTokens();
	const align = useMessageAlign();
	const own = align === "end";
	let backgroundColor = theme.colors.surfaceRaised;
	let color = theme.colors.text;
	let alignSelf: "flex-start" | "flex-end" = "flex-start";
	if (own) {
		backgroundColor = theme.colors.primary;
		color = theme.colors.onPrimary;
		alignSelf = "flex-end";
	}
	return (
		<View
			style={[
				styles.bubble,
				{
					backgroundColor,
					alignSelf,
					borderRadius: theme.radius.lg,
					paddingHorizontal: theme.spacing.md,
					paddingVertical: theme.spacing.sm,
					maxWidth: "85%",
				},
				style,
			]}
			{...props}
		>
			{typeof children === "string" ? (
				<Text variant="body" color={color}>
					{children}
				</Text>
			) : (
				children
			)}
		</View>
	);
}

export const Message = Object.assign(MessageRoot, {
	Root: MessageRoot,
	Author: MessageAuthor,
	Time: MessageTime,
	Bubble,
});

const styles = StyleSheet.create({
	bubble: {
		minHeight: 36,
	},
});
