import React from "react";
import { type ViewProps } from "react-native";
import { Text } from "./text";
import { Field } from "./field";

export interface FieldGroupProps extends ViewProps {
	label?: string;
	description?: string;
	error?: string;
	helper?: string;
	required?: boolean;
	disabled?: boolean;
	children: React.ReactNode;
}

/** Convenience field: label, control, and one supporting line. Built from `Field`. */
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
	let support = helper;
	let supportTestId = testID ? `${testID}-helper` : undefined;
	if (error) {
		support = error;
		supportTestId = testID ? `${testID}-error` : undefined;
	}
	return (
		<Field.Root disabled={disabled} required={required} style={style} testID={testID} {...props}>
			{label ? <Field.Label>{label}</Field.Label> : null}
			{description ? <Field.Description>{description}</Field.Description> : null}
			{children}
			{error ? <Field.Error testID={supportTestId}>{error}</Field.Error> : null}
			{!error && support ? (
				<Text variant="caption" colorKey="textDisabled" testID={supportTestId}>
					{support}
				</Text>
			) : null}
		</Field.Root>
	);
};
