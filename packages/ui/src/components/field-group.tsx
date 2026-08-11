import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export interface FieldGroupProps extends ViewProps {
	label?: string;
	description?: string;
	error?: string;
	helper?: string;
	required?: boolean;
	disabled?: boolean;
	children: React.ReactNode;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
	label,
	description,
	error,
	helper,
	required = false,
	disabled = false,
	children,
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			gap: theme.spacing.sm,
			opacity: disabled ? 0.56 : 1,
		}),
		[disabled, theme.spacing.sm],
	);
	const supportingText = error ?? helper;

	return (
		<View style={[containerStyle, style]} testID={testID} {...props}>
			{(label || description) && (
				<View style={{ gap: theme.spacing.xs }}>
					{label && (
						<Text variant="label" colorKey="textMuted">
							{label}
							{required && <Text colorKey="danger"> *</Text>}
						</Text>
					)}
					{description && (
						<Text variant="caption" colorKey="textSubtle">
							{description}
						</Text>
					)}
				</View>
			)}
			{children}
			{supportingText && (
				<Text
					variant="caption"
					colorKey={error ? "danger" : "textDisabled"}
					testID={testID ? `${testID}-${error ? "error" : "helper"}` : undefined}
				>
					{supportingText}
				</Text>
			)}
		</View>
	);
};
