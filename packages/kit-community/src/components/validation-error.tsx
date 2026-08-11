import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "@osuki-dev/ui";

export interface ValidationErrorProps {
	message: string;
	fieldName?: string;
	variant?: "inline" | "block";
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * Validation Error Component
 * Displays Zod validation errors with Osuki design system
 */
export const ValidationError: React.FC<ValidationErrorProps> = ({
	message,
	fieldName,
	variant = "inline",
	testID,
}) => {
	const { colors, spacing, radius } = useTheme();

	if (variant === "block") {
		return (
			<View
				testID={testID}
				style={[
					styles.blockContainer,
					{
						backgroundColor: colors.dangerSubtle,
						borderRadius: radius["lg"],
						paddingHorizontal: spacing["md"],
						paddingVertical: spacing["sm"],
						marginVertical: spacing["xs"],
					},
				]}
			>
				<Text variant="caption" colorKey="danger" style={styles.blockText}>
					{fieldName && `[${fieldName.toUpperCase()}] `}
					{message}
				</Text>
			</View>
		);
	}

	return (
		<View
			testID={testID}
			style={[
				styles.inlineContainer,
				{
					backgroundColor: colors.dangerSubtle,
					borderRadius: radius["pill"],
					marginTop: spacing["xs"],
					paddingHorizontal: spacing["md"],
					paddingVertical: spacing["xs"],
				},
			]}
		>
			<Text variant="caption" colorKey="danger" style={styles.inlineText}>
				{message}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	blockContainer: {
		alignSelf: "flex-start",
		maxWidth: "100%",
	},
	blockText: {
		letterSpacing: 0,
	},
	inlineContainer: {
		alignSelf: "flex-start",
		maxWidth: "100%",
	},
	inlineText: {
		letterSpacing: 0,
	},
});

export interface FieldErrorMessageProps {
	error?: string;
	touched?: boolean;
	showOnUntouched?: boolean;
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * Field-level error message
 * Only shows when field has been touched (or forced)
 */
export const FieldErrorMessage: React.FC<FieldErrorMessageProps> = ({
	error,
	touched,
	showOnUntouched = false,
	testID,
}) => {
	if (!error) return null;
	if (!touched && !showOnUntouched) return null;

	return <ValidationError testID={testID} message={error} variant="inline" />;
};
