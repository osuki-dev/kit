import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import {
	Input,
	Toggle,
	SegmentedControl,
	Text,
	Button,
	Tag,
	DateInput,
	FieldGroup,
	ProgressBar,
	Select,
	Stepper,
	useThemeTokens,
	type InputVariant,
} from "@osuki-dev/ui";

import { useI18n, type TranslationKey } from "../i18n";
import { FieldErrorMessage } from "./validation-error";

export type FieldType =
	| "string"
	| "text"
	| "textarea"
	| "number"
	| "boolean"
	| "toggle"
	| "enum"
	| "select"
	| "segmented"
	| "date"
	| "datetime"
	| "time"
	| "email"
	| "url"
	| "phone"
	| "password"
	| "search"
	| "color"
	| "range"
	| "slider"
	| "chips"
	| "tags"
	| "rating"
	| "file"
	| "image"
	| "multiselect";

export interface FieldOption {
	label: string;
	value: string;
	disabled?: boolean;
}

export interface FieldConfig {
	key: string;
	label: string;
	type: FieldType;
	/** Stable test identifier for automation. Defaults to form-field-${key}. */
	testID?: string;
	options?: FieldOption[];
	placeholder?: string;
	helper?: string;
	required?: boolean;
	disabled?: boolean;
	min?: number;
	max?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	step?: number;
	// Textarea specific
	rows?: number;
	// Range/slider specific
	showValue?: boolean;
	valueLabel?: string;
	// i18n key for label
	i18nKey?: TranslationKey;
	// Validation
	validate?: (value: unknown) => string | undefined;
	// Transform
	transform?: (value: unknown) => unknown;
}

export interface FormFieldProps {
	config: FieldConfig;
	value: unknown;
	onChange: (value: unknown) => void;
	onBrowse?: (field: FieldConfig) => void;
	error?: string;
	touched?: boolean;
	variant?: InputVariant;
}

// Static styles - only layout
const staticStyles = StyleSheet.create({
	container: {
		// Layout only
	},
	booleanContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	booleanLabel: {
		flex: 1,
	},
	fieldLabel: {
		// Layout only
	},
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	ratingContainer: {
		flexDirection: "row",
		gap: 4,
	},
	errorContainer: {
		alignSelf: "flex-start",
		maxWidth: "100%",
	},
});

/**
 * Form field with Zod validation, i18n, and theme support
 *
 * Supports comprehensive field types:
 * - Text: string, text, textarea
 * - Number: number, range, slider
 * - Boolean: boolean, toggle
 * - Selection: enum, select, segmented, chips, tags, multiselect
 * - Date/Time: date, datetime, time
 * - Specialized: email, url, phone, password, search, color, rating
 */
export const FormField: React.FC<FormFieldProps> = ({
	config,
	value,
	onChange,
	onBrowse,
	error,
	touched,
	variant = "outline",
}) => {
	const { colors, spacing, radius, shadow, mode } = useThemeTokens();
	const { t } = useI18n();
	const testID = config.testID ?? `form-field-${config.key}`;
	const inputBackedTypes: FieldType[] = [
		"string",
		"text",
		"textarea",
		"number",
		"email",
		"url",
		"phone",
		"search",
		"password",
		"date",
		"datetime",
		"time",
	];

	// Apply theme spacing
	const layoutSpacing = {
		marginBottom: spacing.md,
		fieldGap: spacing.sm,
		booleanPadding: spacing["sm"],
		chipGap: spacing["xs"],
	};

	// Get localized label
	const label = config.i18nKey ? t(config.i18nKey) : config.label;

	const renderLabel = (showRequired = true) => (
		<Text variant="label" style={staticStyles.fieldLabel}>
			{label}
			{showRequired && config.required && <Text colorKey="danger"> *</Text>}
		</Text>
	);

	const renderHelper = () => {
		if (error) {
			return (
				<View
					testID={`${testID}-error`}
					style={[
						staticStyles.errorContainer,
						{
							backgroundColor: colors.dangerSubtle,
							borderRadius: radius["pill"],
							marginTop: spacing["xs"],
							paddingHorizontal: spacing["md"],
							paddingVertical: spacing["xs"],
						},
					]}
				>
					<Text variant="caption" colorKey="danger">
						{error}
					</Text>
				</View>
			);
		}
		if (config.helper) {
			return (
				<Text variant="caption" colorKey="textDisabled" style={{ marginTop: spacing["xs"] }}>
					{config.helper}
				</Text>
			);
		}
		return null;
	};

	const renderField = () => {
		switch (config.type) {
			// Boolean types
			case "boolean":
			case "toggle":
				return (
					<View
						testID={`${testID}-boolean`}
						style={[
							staticStyles.booleanContainer,
							{ paddingVertical: layoutSpacing.booleanPadding },
						]}
					>
						<Text variant="body" style={staticStyles.booleanLabel}>
							{label}
							{config.required && <Text colorKey="danger"> *</Text>}
						</Text>
						<Toggle
							testID={`${testID}-toggle`}
							value={Boolean(value)}
							onValueChange={onChange}
							disabled={config.disabled}
						/>
					</View>
				);

			// Selection types
			case "enum":
			case "segmented":
				if (!config.options || config.options.length === 0) {
					return (
						<Text variant="caption" colorKey="danger">
							NO OPTIONS DEFINED
						</Text>
					);
				}
				return (
					<View testID={`${testID}-segmented`} style={{ gap: layoutSpacing.fieldGap }}>
						{renderLabel()}
						<SegmentedControl
							testID={`${testID}-segmented-control`}
							options={config.options.map((opt) => ({
								label: opt.label,
								value: opt.value,
							}))}
							value={(value as string) || config.options[0]?.value || ""}
							onChange={onChange}
						/>
					</View>
				);

			case "select":
				return (
					<Select
						testID={`${testID}-select`}
						label={label}
						required={config.required}
						options={config.options ?? []}
						value={typeof value === "string" ? value : undefined}
						onChange={onChange}
						placeholder={config.placeholder}
						helper={config.helper}
						error={error}
						disabled={config.disabled}
					/>
				);

			case "chips":
			case "tags":
			case "multiselect": {
				const selectedValues = (value as string[]) || [];
				return (
					<View testID={`${testID}-chips`} style={{ gap: layoutSpacing.fieldGap }}>
						{renderLabel()}
						<View style={staticStyles.chipsContainer}>
							{config.options?.map((option) => {
								const isSelected = selectedValues.includes(option.value);
								return (
									<Tag
										key={option.value}
										variant={isSelected ? "active" : "default"}
										testID={`${testID}-chip-${option.value}`}
										onPress={() => {
											if (option.disabled) return;
											const newValues = isSelected
												? selectedValues.filter((v) => v !== option.value)
												: [...selectedValues, option.value];
											onChange(newValues);
										}}
										disabled={option.disabled}
									>
										{option.label}
									</Tag>
								);
							})}
						</View>
					</View>
				);
			}

			// Range/Slider types
			case "range":
			case "slider": {
				const min = config.min ?? 0;
				const max = config.max ?? 100;
				const currentValue = (value as number) ?? min;
				const safeRange = max <= min ? 1 : max - min;
				const progressValue = ((currentValue - min) / safeRange) * 100;

				return (
					<FieldGroup
						testID={`${testID}-slider`}
						label={label}
						required={config.required}
						helper={config.helper}
						error={error}
						disabled={config.disabled}
					>
						<ProgressBar
							testID={`${testID}-slider-progress`}
							value={progressValue}
							max={100}
							size="md"
							tone="neutral"
							valueDisplay={config.showValue === false ? "hidden" : "percentage"}
						/>
						<Stepper
							testID={`${testID}-slider-input`}
							value={currentValue}
							min={min}
							max={max}
							step={config.step ?? 1}
							disabled={config.disabled}
							onChange={onChange}
							formatValue={(nextValue) => `${nextValue}${config.valueLabel ?? ""}`}
						/>
					</FieldGroup>
				);
			}

			case "rating": {
				const rating = (value as number) ?? 0;
				const maxRating = config.max ?? 5;
				return (
					<View testID={`${testID}-rating`} style={{ gap: layoutSpacing.fieldGap }}>
						{renderLabel()}
						<View style={staticStyles.ratingContainer}>
							{Array.from({ length: maxRating }, (_, i) => (
								<TouchableOpacity
									key={i}
									testID={`${testID}-rating-${i + 1}`}
									onPress={() => onChange(i + 1)}
									disabled={config.disabled}
								>
									<Text
										variant="hero"
										colorKey={i < rating ? "text" : "textDisabled"}
										style={{ fontSize: 24 }}
									>
										★
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				);
			}

			// Text input types
			case "textarea":
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={(value as string) || ""}
						onChangeText={onChange}
						placeholder={config.placeholder}
						error={error}
						helper={config.helper}
						multiline
						numberOfLines={config.rows || 4}
						textAlignVertical="top"
						editable={!config.disabled}
					/>
				);

			case "number":
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={value !== undefined ? String(value) : ""}
						onChangeText={(text) => {
							const num = text === "" ? undefined : Number(text);
							onChange(isNaN(num as number) ? undefined : num);
						}}
						keyboardType="numeric"
						placeholder={config.placeholder}
						error={error}
						helper={config.helper}
						editable={!config.disabled}
					/>
				);

			case "email":
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={(value as string) || ""}
						onChangeText={onChange}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholder={config.placeholder || "email@example.com"}
						error={error}
						helper={config.helper}
						editable={!config.disabled}
					/>
				);

			case "url":
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={(value as string) || ""}
						onChangeText={onChange}
						keyboardType="url"
						autoCapitalize="none"
						autoCorrect={false}
						placeholder={config.placeholder || "https://..."}
						error={error}
						helper={config.helper}
						editable={!config.disabled}
					/>
				);

			case "phone":
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={(value as string) || ""}
						onChangeText={onChange}
						keyboardType="phone-pad"
						placeholder={config.placeholder || "+1 (555) 000-0000"}
						error={error}
						helper={config.helper}
						editable={!config.disabled}
					/>
				);

			case "search":
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={(value as string) || ""}
						onChangeText={onChange}
						placeholder={config.placeholder || "Search..."}
						error={error}
						helper={config.helper}
						clearButtonMode="while-editing"
						autoCapitalize="none"
						autoCorrect={false}
						editable={!config.disabled}
					/>
				);

			case "color":
				return (
					<View testID={`${testID}-color`} style={{ gap: layoutSpacing.fieldGap }}>
						{renderLabel()}
						<View style={{ flexDirection: "row", gap: spacing["sm"], alignItems: "center" }}>
							<View
								testID={`${testID}-color-swatch`}
								style={{
									width: 40,
									height: 40,
									borderRadius: 8,
									backgroundColor: (value as string) || "#000000",
									...(mode === "light" ? shadow.pill : {}),
								}}
							/>
							<Input
								testID={`${testID}-input`}
								variant={variant}
								value={(value as string) || ""}
								onChangeText={(text) => {
									// Validate hex color
									if (/^#[0-9A-F]{6}$/i.test(text) || text === "") {
										onChange(text);
									}
								}}
								placeholder="#000000"
								autoCapitalize="none"
								style={{ flex: 1 }}
								editable={!config.disabled}
							/>
						</View>
						{renderHelper()}
					</View>
				);

			case "password":
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={(value as string) || ""}
						onChangeText={onChange}
						secureTextEntry
						placeholder={config.placeholder}
						error={error}
						helper={config.helper}
						editable={!config.disabled}
					/>
				);

			// Date/Time types
			case "date":
			case "datetime":
			case "time":
				return (
					<DateInput
						testID={`${testID}-date-input`}
						mode={config.type}
						label={label}
						variant={variant}
						value={typeof value === "string" ? value : ""}
						onChange={onChange}
						placeholder={config.placeholder}
						error={error}
						helper={config.helper}
						required={config.required}
						disabled={config.disabled}
					/>
				);

			// File types
			case "file":
			case "image":
				return (
					<View testID={`${testID}-${config.type}`} style={{ gap: layoutSpacing.fieldGap }}>
						{renderLabel()}
						<View
							testID={`${testID}-dropzone`}
							style={{
								backgroundColor: colors.surface,
								borderRadius: radius.lg,
								padding: spacing["lg"],
								alignItems: "center",
								gap: spacing["sm"],
								...(mode === "light" ? shadow.soft : {}),
							}}
						>
							<Text variant="caption" colorKey="textMuted">
								{(value as string) || `Drop ${config.type} here or click to browse`}
							</Text>
							<Button
								testID={`${testID}-browse`}
								variant="secondary"
								onPress={() => onBrowse?.(config)}
								disabled={config.disabled || !onBrowse}
							>
								BROWSE
							</Button>
						</View>
						{renderHelper()}
					</View>
				);

			// Default text input
			case "string":
			case "text":
			default:
				return (
					<Input
						testID={`${testID}-input`}
						label={label}
						variant={variant}
						value={(value as string) || ""}
						onChangeText={onChange}
						placeholder={config.placeholder}
						error={error}
						helper={config.helper}
						editable={!config.disabled}
					/>
				);
		}
	};

	return (
		<View
			testID={testID}
			style={[staticStyles.container, { marginBottom: layoutSpacing.marginBottom }]}
		>
			{renderField()}
			{!inputBackedTypes.includes(config.type) &&
				config.type !== "color" &&
				config.type !== "file" &&
				config.type !== "image" &&
				config.type !== "range" &&
				config.type !== "slider" && (
					<FieldErrorMessage testID={`${testID}-field-error`} error={error} touched={touched} />
				)}
		</View>
	);
};
