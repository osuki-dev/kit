import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
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

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon = "Inbox",
	title,
	message,
	actionLabel,
	onAction,
	size = "default",
	style,
	...props
}) => {
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
			<View
				style={{
					width: compact ? 48 : 64,
					height: compact ? 48 : 64,
					borderRadius: compact ? 24 : 32,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: theme.colors.surfaceRaised,
				}}
			>
				<Icon name={icon} size={compact ? 22 : 28} color={theme.colors.textMuted} />
			</View>
			<View style={{ width: "100%", alignItems: "center", gap: theme.spacing.xs }}>
				<Text
					variant={compact ? "body" : "subheading"}
					colorKey="text"
					style={{ textAlign: "center" }}
				>
					{title}
				</Text>
				{message && (
					<Text variant="bodySmall" colorKey="textMuted" style={{ textAlign: "center" }}>
						{message}
					</Text>
				)}
			</View>
			{actionLabel && onAction && (
				<Button variant="secondary" onPress={onAction}>
					{actionLabel}
				</Button>
			)}
		</View>
	);
};
