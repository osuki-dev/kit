import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens, type SpacingToken } from "../theme";

export interface StackProps extends ViewProps {
	direction?: "vertical" | "horizontal";
	gap?: SpacingToken | number;
	align?: ViewStyle["alignItems"];
	justify?: ViewStyle["justifyContent"];
	flow?: "nowrap" | "wrap";
	widthMode?: "content" | "full";
}

export const Stack: React.FC<StackProps> = ({
	direction = "vertical",
	gap = "md",
	align,
	justify,
	flow = "nowrap",
	widthMode = "content",
	style,
	children,
	...props
}) => {
	const theme = useThemeTokens();
	const resolvedGap = typeof gap === "number" ? gap : theme.spacing[gap];
	const stackStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: direction === "horizontal" ? "row" : "column",
			flexWrap: flow,
			alignItems: align,
			justifyContent: justify,
			gap: resolvedGap,
			width: widthMode === "full" ? "100%" : undefined,
		}),
		[align, direction, flow, justify, resolvedGap, widthMode],
	);

	return (
		<View style={[stackStyle, style]} {...props}>
			{children}
		</View>
	);
};
