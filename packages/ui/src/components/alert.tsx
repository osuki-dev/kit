import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import {
	useResolvedSurfaceFill,
	useThemeTokens,
	type ColorToken,
	type SurfaceMeta,
} from "../theme";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type AlertVariant = "info" | "success" | "warning" | "danger";

const variantTokens: Record<
	AlertVariant,
	{ icon: IconName; foreground: ColorToken; background: ColorToken }
> = {
	info: { icon: "Info", foreground: "info", background: "primarySubtle" },
	success: { icon: "CircleCheck", foreground: "success", background: "surfaceRaised" },
	warning: { icon: "TriangleAlert", foreground: "warning", background: "surfaceRaised" },
	danger: { icon: "CircleAlert", foreground: "danger", background: "dangerSubtle" },
};

interface AlertMeta {
	variant: AlertVariant;
	foreground: string;
	icon: IconName;
}

const AlertContext = createContext<AlertMeta | null>(null);

function useAlertMeta(): AlertMeta {
	const context = useContext(AlertContext);
	if (!context) throw new Error("Alert parts must be used within Alert.Root");
	return context;
}

export interface AlertRootProps extends ViewProps {
	variant?: AlertVariant;
	children?: ReactNode;
}

export function AlertRoot({ variant = "info", children, style, ...props }: AlertRootProps) {
	const theme = useThemeTokens();
	const tokens = variantTokens[variant];
	const baseColor = theme.colors[tokens.background];
	const surfaceMeta = useMemo<SurfaceMeta>(
		() => ({
			slot: `alerts.${variant}`,
			variant,
			baseColor,
			borderRadius: theme.radius.lg,
		}),
		[baseColor, theme.radius.lg, variant],
	);
	const fill = useResolvedSurfaceFill(baseColor, surfaceMeta);
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			flexDirection: "row",
			alignItems: "flex-start",
			gap: theme.spacing.sm,
			padding: theme.spacing.md,
			borderRadius: theme.radius.lg,
			backgroundColor: fill,
			borderWidth: 1,
			borderColor: theme.colors.border,
		}),
		[fill, theme.colors.border, theme.radius.lg, theme.spacing],
	);
	const meta = useMemo<AlertMeta>(
		() => ({
			variant,
			foreground: theme.colors[tokens.foreground],
			icon: tokens.icon,
		}),
		[theme.colors, tokens.foreground, tokens.icon, variant],
	);
	return (
		<AlertContext.Provider value={meta}>
			<View accessibilityRole="text" style={[containerStyle, style]} {...props}>
				{children}
			</View>
		</AlertContext.Provider>
	);
}

export function AlertIcon({ name }: { name?: IconName | false }) {
	const { icon, foreground } = useAlertMeta();
	if (name === false) return null;
	return (
		<View style={{ paddingTop: 2 }}>
			<Icon name={name ?? icon} size={18} color={foreground} />
		</View>
	);
}

export function AlertBody({ children, style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return (
		<View style={[{ flex: 1, minWidth: 0, gap: theme.spacing.xs }, style]} {...props}>
			{children}
		</View>
	);
}

export function AlertTitle({ children }: { children?: ReactNode }) {
	if (!children) return null;
	return (
		<Text variant="bodySmall" weight="bold" colorKey="text">
			{children}
		</Text>
	);
}

export function AlertMessage({ children }: { children?: ReactNode }) {
	if (!children) return null;
	return (
		<Text variant="bodySmall" colorKey="textMuted">
			{children}
		</Text>
	);
}

export function AlertAction({ children }: { children?: ReactNode }) {
	const theme = useThemeTokens();
	if (!children) return null;
	return <View style={{ paddingTop: theme.spacing.xs }}>{children}</View>;
}

export interface AlertProps extends AlertRootProps {
	title?: string;
	message?: string;
	icon?: IconName | false;
	action?: ReactNode;
}

export function Alert({
	variant = "info",
	title,
	message,
	icon,
	action,
	children,
	...props
}: AlertProps) {
	return (
		<AlertRoot variant={variant} {...props}>
			<AlertIcon name={icon} />
			<AlertBody>
				<AlertTitle>{title}</AlertTitle>
				<AlertMessage>{message}</AlertMessage>
				{children}
				<AlertAction>{action}</AlertAction>
			</AlertBody>
		</AlertRoot>
	);
}

Alert.Root = AlertRoot;
Alert.Icon = AlertIcon;
Alert.Body = AlertBody;
Alert.Title = AlertTitle;
Alert.Message = AlertMessage;
Alert.Action = AlertAction;
