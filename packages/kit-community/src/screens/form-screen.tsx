import React from "react";
import { View, StyleSheet, type DimensionValue } from "react-native";
import type { z } from "zod";

import {
	Screen,
	Surface,
	Card,
	Text,
	Button,
	useTheme,
	useResponsiveTheme,
	KeyboardAwareScrollView,
	KeyboardToolbar,
} from "@osuki-dev/ui";

import { FormField, type FieldConfig } from "../components/form-field";
import { useForm } from "../hooks/use-form";
import { useI18n } from "../i18n";

export interface FormSectionConfig {
	id: string;
	title: string;
	description?: string;
	fields: FieldConfig[];
	columns?: 1 | 2;
}

export interface FormScreenProps<T extends Record<string, unknown>> {
	/** Screen title */
	title: string;
	/** Form sections with fields */
	sections: FormSectionConfig[];
	/** Zod schema for validation */
	schema: z.ZodType<T>;
	/** Default values for form */
	defaultValues: Partial<T>;
	/** Submit handler */
	onSubmit: (values: T) => void | Promise<void>;
	/** Cancel handler */
	onCancel?: () => void;
	/** Submit button text */
	submitLabel?: string;
	/** Cancel button text */
	cancelLabel?: string;
	/** Show cancel button */
	showCancel?: boolean;
	/** Loading state */
	isLoading?: boolean;
	/** Header component */
	header?: React.ReactNode;
	/** Footer component (replaces default buttons) */
	footer?: React.ReactNode;
}

// Static styles - layout only
const staticStyles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	content: {
		padding: 0,
	},
	section: {
		// Dynamic margin applied inline
	},
	twoColumnGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	halfWidth: {
		flex: 1,
		minWidth: "45%",
	},
	actionsContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
});

/**
 * Generic form screen component with Osuki design system
 *
 * Features:
 * - Section-based layout
 * - Zod schema validation
 * - Auto field rendering based on type
 * - Support for: string, number, boolean, enum, email, password, url
 *
 * @example
 * ```tsx
 * <FormScreen
 *   title="CREATE USER"
 *   schema={UserSchema}
 *   defaultValues={{ name: '', email: '', role: 'user' }}
 *   sections={[
 *     {
 *       id: 'basic',
 *       title: 'BASIC INFO',
 *       fields: [
 *         { key: 'name', label: 'FULL NAME', type: 'string', required: true },
 *         { key: 'email', label: 'EMAIL', type: 'email', required: true },
 *       ],
 *     },
 *     {
 *       id: 'settings',
 *       title: 'SETTINGS',
 *       fields: [
 *         { key: 'role', label: 'ROLE', type: 'enum', options: [...] },
 *         { key: 'active', label: 'ACTIVE', type: 'boolean' },
 *       ],
 *     },
 *   ]}
 *   onSubmit={handleCreate}
 * />
 * ```
 */
export function FormScreen<T extends Record<string, unknown>>({
	title,
	sections,
	schema,
	defaultValues,
	onSubmit,
	onCancel,
	submitLabel,
	cancelLabel,
	showCancel = true,
	isLoading,
	header,
	footer,
}: FormScreenProps<T>) {
	const { colors, spacing } = useTheme();
	const { buttonMinWidth, formMaxWidth, pagePadding, isMobile } = useResponsiveTheme();
	const { t } = useI18n();
	const resolvedSubmitLabel = submitLabel ?? t("common.save");
	const resolvedCancelLabel = cancelLabel ?? t("common.cancel");

	// Dynamic spacing values
	const layoutSpacing = {
		pagePaddingTop: 0,
		headerPadding: spacing["md"],
		sectionMargin: spacing["md"],
		sectionPadding: spacing["lg"],
		sectionGap: spacing["xs"],
		fieldGap: spacing["md"],
		actionsGap: spacing["sm"],
		bottomPadding: spacing["4xl"],
	};

	const form = useForm<T>({
		schema,
		defaultValues,
		onSubmit,
	});

	const handleFieldChange = (key: keyof T, value: unknown) => {
		form.setValue(key, value as T[keyof T]);
	};

	return (
		<Screen style={{ paddingTop: layoutSpacing.pagePaddingTop }}>
			<KeyboardAwareScrollView style={staticStyles.scrollView}>
				<KeyboardToolbar doneText={t("common.done")} />

				{/* Header */}
				<Surface
					variant="page"
					style={{ paddingHorizontal: pagePadding, paddingVertical: layoutSpacing.headerPadding }}
				>
					<Text variant="heading" color={colors.text}>
						{title}
					</Text>
					{header}
				</Surface>

				{/* Form Sections - Responsive Container */}
				<View
					style={{ maxWidth: formMaxWidth as DimensionValue, alignSelf: "center", width: "100%" }}
				>
					{sections.map((section) => (
						<Card
							key={section.id}
							variant="raised"
							border="subtle"
							padding="lg"
							style={[
								staticStyles.section,
								{
									marginHorizontal: pagePadding,
									marginBottom: layoutSpacing.sectionMargin,
								},
							]}
						>
							<Text
								variant="label"
								color={colors.textMuted}
								style={{ marginBottom: layoutSpacing.sectionGap }}
							>
								{section.title}
							</Text>

							{section.description && (
								<Text
									variant="caption"
									color={colors.textDisabled}
									style={{ marginBottom: layoutSpacing.fieldGap }}
								>
									{section.description}
								</Text>
							)}

							<View style={section.columns === 2 ? staticStyles.twoColumnGrid : undefined}>
								{section.fields.map((field) => (
									<View
										key={field.key}
										style={section.columns === 2 ? staticStyles.halfWidth : undefined}
									>
										<FormField
											config={field}
											value={form.values[field.key as keyof T]}
											onChange={(value) => handleFieldChange(field.key as keyof T, value)}
											error={form.errors[field.key as keyof T]}
										/>
									</View>
								))}
							</View>
						</Card>
					))}

					{/* Footer / Actions */}
					{footer ? (
						footer
					) : (
						<View
							style={[
								staticStyles.actionsContainer,
								{
									gap: layoutSpacing.actionsGap,
									paddingHorizontal: pagePadding,
									marginTop: layoutSpacing.sectionMargin,
									marginBottom: layoutSpacing.sectionMargin,
								},
							]}
						>
							{showCancel && (
								<Button
									variant="secondary"
									onPress={onCancel}
									style={{
										minWidth: buttonMinWidth as DimensionValue,
										flex: isMobile ? 1 : undefined,
									}}
								>
									{resolvedCancelLabel}
								</Button>
							)}
							<Button
								variant="primary"
								onPress={form.handleSubmit}
								style={{
									minWidth: buttonMinWidth as DimensionValue,
									flex: isMobile ? 1 : undefined,
								}}
							>
								{isLoading || form.isSubmitting ? t("form.saving") : resolvedSubmitLabel}
							</Button>
						</View>
					)}
				</View>

				<View style={{ height: layoutSpacing.bottomPadding }} />
			</KeyboardAwareScrollView>
		</Screen>
	);
}
