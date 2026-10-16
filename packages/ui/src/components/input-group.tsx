import React, { type ReactNode } from "react";
import { StyleSheet, View, type TextInputProps, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";
import { TextField } from "../utils/text-field";

export interface InputGroupRootProps extends ViewProps {
	children?: ReactNode;
	disabled?: boolean;
	invalid?: boolean;
}

export function InputGroupRoot({
	children,
	disabled = false,
	invalid = false,
	style,
	...props
}: InputGroupRootProps) {
	const theme = useThemeTokens();
	let borderColor = theme.colors.border;
	if (invalid) borderColor = theme.colors.danger;
	return (
		<View
			style={[
				styles.root,
				{
					borderColor,
					borderRadius: theme.radius.lg,
					backgroundColor: theme.colors.surface,
					opacity: disabled ? 0.56 : 1,
				},
				style,
			]}
			{...props}
		>
			{children}
		</View>
	);
}

export function InputGroupAddon({ children }: { children?: ReactNode }) {
	const theme = useThemeTokens();
	return (
		<View style={[styles.addon, { paddingHorizontal: theme.spacing.sm }]}>
			{typeof children === "string" ? (
				<Text variant="bodySmall" colorKey="textMuted">
					{children}
				</Text>
			) : (
				children
			)}
		</View>
	);
}

export interface InputGroupInputProps extends Omit<TextInputProps, "style"> {
	disabled?: boolean;
}

export function InputGroupInput({ disabled = false, ...props }: InputGroupInputProps) {
	const theme = useThemeTokens();
	return (
		<TextField
			editable={!disabled}
			placeholderTextColor={theme.colors.textDisabled}
			style={[styles.input, { color: theme.colors.text }]}
			{...props}
		/>
	);
}

export const InputGroup = Object.assign(InputGroupRoot, {
	Root: InputGroupRoot,
	Addon: InputGroupAddon,
	Input: InputGroupInput,
});

const styles = StyleSheet.create({
	root: {
		minHeight: 48,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
		overflow: "hidden",
	},
	addon: {
		justifyContent: "center",
		minHeight: 44,
	},
	input: {
		flex: 1,
		minWidth: 0,
		fontSize: 16,
		paddingVertical: 8,
		paddingHorizontal: 0,
	},
});
