import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens, type ColorToken } from "../theme";
import { Card } from "./card";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type MetricCardTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface MetricCardProps extends ViewProps {
	label: string;
	value: string | number;
	unit?: string;
	description?: string;
	icon?: IconName;
	tone?: MetricCardTone;
	trend?: string;
	footer?: React.ReactNode;
}

const toneColor: Record<MetricCardTone, ColorToken> = {
	neutral: "text",
	success: "success",
	warning: "warning",
	danger: "danger",
	info: "info",
};

export const MetricCard: React.FC<MetricCardProps> = ({
	label,
	value,
	unit,
	description,
	icon,
	tone = "neutral",
	trend,
	footer,
	style,
	...props
}) => {
	const theme = useThemeTokens();
	const accent = theme.colors[toneColor[tone]];
	const contentStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			gap: theme.spacing.md,
		}),
		[theme.spacing.md],
	);

	return (
		<Card variant="raised" border="subtle" padding="md" style={style} {...props}>
			<View style={contentStyle}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
					{icon && <Icon name={icon} size={18} color={accent} />}
					<Text variant="label" colorKey="textMuted" transform="uppercase" numberOfLines={1}>
						{label}
					</Text>
				</View>
				<View style={{ gap: theme.spacing.xs }}>
					<View style={{ flexDirection: "row", alignItems: "baseline", gap: theme.spacing.xs }}>
						<Text variant="dataLarge" color={accent} numberOfLines={1} adjustsFontSizeToFit>
							{value}
						</Text>
						{unit && (
							<Text variant="label" colorKey="textMuted">
								{unit}
							</Text>
						)}
					</View>
					{description && (
						<Text variant="caption" colorKey="textMuted" numberOfLines={2}>
							{description}
						</Text>
					)}
				</View>
				{trend && (
					<Text variant="caption" color={accent} numberOfLines={1}>
						{trend}
					</Text>
				)}
				{footer}
			</View>
		</Card>
	);
};
