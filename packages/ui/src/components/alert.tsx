import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens, type ColorToken } from "../theme";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps extends ViewProps {
	variant?: AlertVariant;
	title?: string;
	message?: string;
	icon?: IconName | false;
	action?: React.ReactNode;
}

const variantTokens: Record<
	AlertVariant,
	{ icon: IconName; foreground: ColorToken; background: ColorToken }
> = {
	info: { icon: "Info", foreground: "info", background: "primarySubtle" },
	success: { icon: "CircleCheck", foreground: "success", background: "surfaceRaised" },
	warning: { icon: "TriangleAlert", foreground: "warning", background: "surfaceRaised" },
	danger: { icon: "CircleAlert", foreground: "danger", background: "dangerSubtle" },
};

export const Alert: React.FC<AlertProps> = ({
	variant = "info",
	title,
	message,
	icon,
	action,
	style,
	children,
	...props
}) => {
	const theme = useThemeTokens();
	const tokens = variantTokens[variant];
	const iconName = icon === false ? undefined : (icon ?? tokens.icon);

	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			flexDirection: "row",
			alignItems: "flex-start",
			gap: theme.spacing.sm,
			padding: theme.spacing.md,
			borderRadius: theme.radius.lg,
			backgroundColor: theme.colors[tokens.background],
			borderWidth: 1,
			borderColor: theme.colors.border,
		}),
		[theme.colors, theme.radius.lg, theme.spacing, tokens.background],
	);

	return (
		<View accessibilityRole="text" style={[containerStyle, style]} {...props}>
			{iconName && (
				<View style={{ paddingTop: 2 }}>
					<Icon name={iconName} size={18} color={theme.colors[tokens.foreground]} />
				</View>
			)}
			<View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
				{title && (
					<Text variant="bodySmall" weight="bold" colorKey="text">
						{title}
					</Text>
				)}
				{message && (
					<Text variant="bodySmall" colorKey="textMuted">
						{message}
					</Text>
				)}
				{children}
				{action && <View style={{ paddingTop: theme.spacing.xs }}>{action}</View>}
			</View>
		</View>
	);
};
