import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Spinner } from "./spinner";
import { Text } from "./text";

export interface LoadingViewProps extends ViewProps {
	label?: string;
	size?: "default" | "compact";
}

export const LoadingView: React.FC<LoadingViewProps> = ({
	label = "Loading",
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
			paddingVertical: compact ? theme.spacing.lg : theme.spacing["3xl"],
		}),
		[compact, theme.spacing],
	);

	return (
		<View accessibilityRole="progressbar" style={[containerStyle, style]} {...props}>
			<Spinner size={compact ? "sm" : "md"} />
			<Text variant="caption" colorKey="textMuted" transform="uppercase">
				{label}
			</Text>
		</View>
	);
};
