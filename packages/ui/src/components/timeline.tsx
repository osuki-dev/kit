import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens, type ColorToken } from "../theme";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type TimelineTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
export type TimelineStatus = "pending" | "active" | "completed";

export interface TimelineItem {
	id: string;
	title: string;
	description?: string;
	timestamp?: string;
	meta?: string;
	icon?: IconName;
	tone?: TimelineTone;
	status?: TimelineStatus;
}

export interface TimelineProps extends Omit<ViewProps, "style" | "children"> {
	items: TimelineItem[];
	size?: "default" | "compact";
	style?: ViewStyle;
}

const toneColor: Record<TimelineTone, ColorToken> = {
	neutral: "borderStrong",
	primary: "primary",
	success: "success",
	warning: "warning",
	danger: "danger",
	info: "info",
};

export const Timeline: React.FC<TimelineProps> = ({
	items,
	size = "default",
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const compact = size === "compact";
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			gap: compact ? theme.spacing.sm : theme.spacing.md,
		}),
		[compact, theme.spacing.md, theme.spacing.sm],
	);

	return (
		<View style={[containerStyle, style]} testID={testID} {...props}>
			{items.map((item, index) => {
				const isLast = index === items.length - 1;
				const status = item.status ?? "pending";
				const completed = status === "completed";
				const color = theme.colors[toneColor[item.tone ?? "neutral"]];
				const dotSize = compact ? 24 : 30;
				return (
					<View key={item.id} style={{ flexDirection: "row" }}>
						<View style={{ alignItems: "center", width: dotSize }}>
							<View
								style={{
									width: dotSize,
									height: dotSize,
									borderRadius: dotSize / 2,
									alignItems: "center",
									justifyContent: "center",
									borderWidth: status === "active" ? 2 : 1,
									borderColor: color,
									backgroundColor: completed ? color : theme.colors.surface,
								}}
							>
								{item.icon ? (
									<Icon
										name={item.icon}
										size={compact ? 13 : 15}
										color={completed ? theme.colors.onPrimary : color}
									/>
								) : (
									<View
										style={{
											width: compact ? 7 : 8,
											height: compact ? 7 : 8,
											borderRadius: 4,
											backgroundColor: completed ? theme.colors.onPrimary : color,
										}}
									/>
								)}
							</View>
							{!isLast && (
								<View
									style={{
										width: 1,
										flex: 1,
										minHeight: compact ? 28 : 38,
										backgroundColor: theme.colors.border,
									}}
								/>
							)}
						</View>
						<View
							style={{
								flex: 1,
								minWidth: 0,
								paddingLeft: theme.spacing.sm,
								paddingBottom: isLast ? 0 : compact ? theme.spacing.sm : theme.spacing.md,
								gap: compact ? 2 : 4,
							}}
						>
							<Text variant={compact ? "bodySmall" : "body"} colorKey="text">
								{item.title}
							</Text>
							{item.description && (
								<Text variant="caption" colorKey="textMuted" numberOfLines={compact ? 2 : 3}>
									{item.description}
								</Text>
							)}
							{(item.timestamp || item.meta) && (
								<Text variant="caption" colorKey="textDisabled" numberOfLines={1}>
									{[item.timestamp, item.meta].filter(Boolean).join(" · ")}
								</Text>
							)}
						</View>
					</View>
				);
			})}
		</View>
	);
};
