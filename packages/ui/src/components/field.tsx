import React, { createContext, useContext, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";

export interface FieldMeta {
	disabled: boolean;
	required: boolean;
}

const FieldContext = createContext<FieldMeta>({ disabled: false, required: false });

export function useField(): FieldMeta {
	return useContext(FieldContext);
}

export interface FieldRootProps extends ViewProps {
	children?: ReactNode;
	disabled?: boolean;
	required?: boolean;
}

export function FieldRoot({
	children,
	disabled = false,
	required = false,
	style,
	...props
}: FieldRootProps) {
	const theme = useThemeTokens();
	return (
		<FieldContext.Provider value={{ disabled, required }}>
			<View
				style={[{ width: "100%", gap: theme.spacing.sm, opacity: disabled ? 0.56 : 1 }, style]}
				{...props}
			>
				{children}
			</View>
		</FieldContext.Provider>
	);
}

export function FieldLabel({ children }: { children?: ReactNode }) {
	const { required } = useField();
	return (
		<Text variant="label" colorKey="textMuted">
			{children}
			{required ? <Text colorKey="danger"> *</Text> : null}
		</Text>
	);
}

export function FieldDescription({ children }: { children?: ReactNode }) {
	return (
		<Text variant="caption" colorKey="textSubtle">
			{children}
		</Text>
	);
}

export function FieldError({ children, testID }: { children?: ReactNode; testID?: string }) {
	if (!children) return null;
	return (
		<Text variant="caption" colorKey="danger" testID={testID}>
			{children}
		</Text>
	);
}

export const Field = Object.assign(FieldRoot, {
	Root: FieldRoot,
	Label: FieldLabel,
	Description: FieldDescription,
	Error: FieldError,
});
