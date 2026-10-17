import React, { useMemo, type ReactNode } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Spinner } from "./spinner";
import { Text } from "./text";

export interface LoadingViewProps extends ViewProps {
	label?: string;
	size?: "default" | "compact";
	children?: ReactNode;
}

export function LoadingViewRoot({ size = "default", style, children, ...props }: LoadingViewProps) {
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
			{children}
		</View>
	);
}

export function LoadingViewIndicator({ size = "default" }: { size?: "default" | "compact" }) {
	return <Spinner size={size === "compact" ? "sm" : "md"} />;
}

export function LoadingViewLabel({ children }: { children?: ReactNode }) {
	return (
		<Text variant="caption" colorKey="textMuted" transform="uppercase">
			{children}
		</Text>
	);
}

function LoadingViewFacade({
	label = "Loading",
	size = "default",
	children,
	...props
}: LoadingViewProps) {
	return (
		<LoadingViewRoot size={size} {...props}>
			{children ?? (
				<>
					<LoadingViewIndicator size={size} />
					<LoadingViewLabel>{label}</LoadingViewLabel>
				</>
			)}
		</LoadingViewRoot>
	);
}

export const LoadingView = Object.assign(LoadingViewFacade, {
	Root: LoadingViewRoot,
	Indicator: LoadingViewIndicator,
	Label: LoadingViewLabel,
});
