import React, { useState } from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export type TooltipPlacement = "top" | "bottom";

export interface TooltipProps extends Omit<ViewProps, "children"> {
	content: string;
	children: React.ReactNode;
	title?: string;
	placement?: TooltipPlacement;
	defaultVisible?: boolean;
	visible?: boolean;
	onVisibleChange?: (visible: boolean) => void;
	disabled?: boolean;
	bubbleStyle?: ViewStyle;
}

export const Tooltip: React.FC<TooltipProps> = ({
	content,
	children,
	title,
	placement = "bottom",
	defaultVisible = false,
	visible,
	onVisibleChange,
	disabled = false,
	style,
	bubbleStyle,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const [internalVisible, setInternalVisible] = useState(defaultVisible);
	const shown = visible ?? internalVisible;

	const setShown = (nextVisible: boolean) => {
		if (disabled) return;
		onVisibleChange?.(nextVisible);
		if (visible === undefined) setInternalVisible(nextVisible);
	};

	const bubble = shown ? (
		<View
			testID={testID ? `${testID}-bubble` : undefined}
			style={[
				{
					maxWidth: 280,
					alignSelf: "flex-start",
					gap: theme.spacing.xs,
					paddingHorizontal: theme.spacing.md,
					paddingVertical: theme.spacing.sm,
					borderRadius: theme.radius.md,
					backgroundColor: theme.colors.surfaceRaised,
					borderWidth: 1,
					borderColor: theme.colors.border,
				},
				bubbleStyle,
			]}
		>
			{title && (
				<Text variant="label" colorKey="text">
					{title}
				</Text>
			)}
			<Text variant="caption" colorKey="textMuted">
				{content}
			</Text>
		</View>
	) : null;

	return (
		<View
			style={[
				{
					alignSelf: "flex-start",
					gap: theme.spacing.xs,
					opacity: disabled ? 0.56 : 1,
				},
				style,
			]}
			testID={testID}
			{...props}
		>
			{placement === "top" && bubble}
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={title ?? content}
				accessibilityState={{ expanded: shown, disabled }}
				disabled={disabled}
				onBlur={() => setShown(false)}
				onPress={() => setShown(!shown)}
				style={{ alignSelf: "flex-start" }}
				testID={testID ? `${testID}-trigger` : undefined}
			>
				{children}
			</Pressable>
			{placement === "bottom" && bubble}
		</View>
	);
};
