import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens, type SpacingToken } from "../theme";
import { Text } from "./text";

export interface SectionProps extends ViewProps {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	footer?: React.ReactNode;
	gap?: SpacingToken | number;
	padding?: "none" | "inset";
	separator?: "none" | "top";
}

export const Section: React.FC<SectionProps> = ({
	title,
	description,
	action,
	footer,
	gap = "md",
	padding = "none",
	separator = "none",
	style,
	children,
	...props
}) => {
	const theme = useThemeTokens();
	const resolvedGap = typeof gap === "number" ? gap : theme.spacing[gap];
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			gap: resolvedGap,
			paddingHorizontal: padding === "inset" ? theme.spacing.md : 0,
			paddingVertical: padding === "inset" ? theme.spacing.md : 0,
			borderTopWidth: separator === "top" ? 1 : 0,
			borderTopColor: theme.colors.border,
		}),
		[padding, resolvedGap, separator, theme.colors.border, theme.spacing.md],
	);

	return (
		<View style={[containerStyle, style]} {...props}>
			{(title || description || action) && (
				<View
					style={{
						flexDirection: "row",
						alignItems: "flex-start",
						gap: theme.spacing.md,
					}}
				>
					<View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
						{title && (
							<Text variant="subheading" colorKey="text" numberOfLines={2}>
								{title}
							</Text>
						)}
						{description && (
							<Text variant="bodySmall" colorKey="textMuted" numberOfLines={3}>
								{description}
							</Text>
						)}
					</View>
					{action && <View style={{ flexShrink: 0 }}>{action}</View>}
				</View>
			)}
			{children}
			{footer && <View>{footer}</View>}
		</View>
	);
};
