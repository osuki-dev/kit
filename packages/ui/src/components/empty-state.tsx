import React, { useMemo, type ReactNode } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useResolvedSurfaceFill, useThemeTokens } from "../theme";
import { Button } from "./button";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export interface EmptyStateProps extends ViewProps {
	icon?: IconName;
	title: string;
	message?: string;
	actionLabel?: string;
	onAction?: () => void;
	size?: "default" | "compact";
}

export function EmptyStateRoot({
	size = "default",
	style,
	children,
	...props
}: ViewProps & { size?: "default" | "compact"; children?: ReactNode }) {
	const theme = useThemeTokens();
	const compact = size === "compact";
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			alignItems: "center",
			justifyContent: "center",
			gap: theme.spacing.md,
			paddingHorizontal: theme.spacing.lg,
			paddingVertical: compact ? theme.spacing.xl : theme.spacing["3xl"],
		}),
		[compact, theme.spacing],
	);
	return (
		<View accessibilityRole="summary" style={[containerStyle, style]} {...props}>
			{children}
		</View>
	);
}

export function EmptyStateIcon({
	name,
	size = "default",
}: {
	name: IconName;
	size?: "default" | "compact";
}) {
	const theme = useThemeTokens();
	const compact = size === "compact";
	const dimension = compact ? 48 : 64;
	const fill = useResolvedSurfaceFill(theme.colors.surfaceRaised, {
		slot: "empty.icon",
		baseColor: theme.colors.surfaceRaised,
		borderRadius: dimension / 2,
	});
	return (
		<View
			style={{
				width: dimension,
				height: dimension,
				borderRadius: dimension / 2,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: fill,
			}}
		>
			<Icon name={name} size={compact ? 22 : 28} color={theme.colors.textMuted} />
		</View>
	);
}

export function EmptyStateTitle({
	children,
	size = "default",
}: {
	children?: ReactNode;
	size?: "default" | "compact";
}) {
	return (
		<Text
			variant={size === "compact" ? "body" : "subheading"}
			colorKey="text"
			style={{ textAlign: "center" }}
			plated
		>
			{children}
		</Text>
	);
}

export function EmptyStateMessage({ children }: { children?: ReactNode }) {
	if (!children) return null;
	return (
		<Text variant="bodySmall" colorKey="textMuted" style={{ textAlign: "center" }} plated>
			{children}
		</Text>
	);
}

export function EmptyStateAction({ label, onPress }: { label: string; onPress: () => void }) {
	return (
		<Button variant="secondary" onPress={onPress}>
			{label}
		</Button>
	);
}

function EmptyStateFacade({
	icon = "Inbox",
	title,
	message,
	actionLabel,
	onAction,
	size = "default",
	...props
}: EmptyStateProps) {
	const theme = useThemeTokens();
	return (
		<EmptyStateRoot size={size} {...props}>
			<EmptyStateIcon name={icon} size={size} />
			<View style={{ width: "100%", alignItems: "center", gap: theme.spacing.xs }}>
				<EmptyStateTitle size={size}>{title}</EmptyStateTitle>
				<EmptyStateMessage>{message}</EmptyStateMessage>
			</View>
			{actionLabel && onAction ? <EmptyStateAction label={actionLabel} onPress={onAction} /> : null}
		</EmptyStateRoot>
	);
}

export const EmptyState = Object.assign(EmptyStateFacade, {
	Root: EmptyStateRoot,
	Icon: EmptyStateIcon,
	Title: EmptyStateTitle,
	Message: EmptyStateMessage,
	Action: EmptyStateAction,
});
