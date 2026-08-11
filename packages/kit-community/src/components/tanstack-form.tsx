import React from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";

import { FormField, type FieldConfig, type FormFieldProps } from "./form-field";

export type OsukiTanStackForm = {
	Field: React.ComponentType<{
		name: string;
		children: (field: OsukiTanStackField) => React.ReactNode;
	}>;
};

export type OsukiTanStackField = {
	state: {
		value: unknown;
		meta: {
			errors: unknown;
			isTouched: boolean;
		};
	};
	handleChange: (value: unknown) => void;
};

export type OsukiFormErrorMap<TFormValues extends Record<string, unknown>> = Partial<
	Record<keyof TFormValues | string, string>
>;

export type UseOsukiFormOptions<TSchema extends z.ZodTypeAny> = {
	schema: TSchema;
	defaultValues: z.input<TSchema> & Record<string, unknown>;
	onSubmit: (values: z.output<TSchema>) => void | Promise<void>;
	onSubmitInvalid?: (errors: OsukiFormErrorMap<Record<string, unknown>>) => void;
	validateOnChange?: boolean;
};

export function useOsukiForm<TSchema extends z.ZodTypeAny>({
	schema,
	defaultValues,
	onSubmit,
	onSubmitInvalid,
	validateOnChange = true,
}: UseOsukiFormOptions<TSchema>) {
	return useForm({
		defaultValues,
		validators: {
			onChange: (validateOnChange ? schema : undefined) as never,
			onSubmit: schema as never,
		},
		onSubmitInvalid: ({ formApi }) => {
			onSubmitInvalid?.(collectFormErrors(formApi.state.fieldMeta as FieldMetaMap));
		},
		onSubmit: async ({ value }) => {
			await onSubmit(schema.parse(value));
		},
	});
}

export type OsukiFormFieldProps = {
	form: OsukiTanStackForm;
	config: FieldConfig;
	onBrowse?: FormFieldProps["onBrowse"];
	variant?: FormFieldProps["variant"];
};

export function OsukiFormField({ form, config, onBrowse, variant }: OsukiFormFieldProps) {
	const Field = form.Field;
	return (
		<Field name={config.key}>
			{(field) => (
				<FormField
					config={config}
					value={field.state.value}
					onChange={(value) => field.handleChange(value)}
					onBrowse={onBrowse}
					error={getFieldError(field)}
					touched={field.state.meta.isTouched}
					variant={variant}
				/>
			)}
		</Field>
	);
}

export function getFieldError(field: OsukiTanStackField) {
	return getFirstMessage(field.state.meta.errors);
}

export function getFirstMessage(errors: unknown): string | undefined {
	if (!errors) return undefined;
	if (typeof errors === "string") return errors;
	if (Array.isArray(errors)) {
		for (const error of errors) {
			const message = getFirstMessage(error);
			if (message) return message;
		}
		return undefined;
	}
	if (typeof errors === "object") {
		const candidate = errors as { message?: unknown; issues?: unknown; errors?: unknown };
		if (typeof candidate.message === "string") return candidate.message;
		return getFirstMessage(candidate.issues) ?? getFirstMessage(candidate.errors);
	}
	return undefined;
}

type FieldMetaMap = Partial<Record<string, { errors?: unknown }>>;

function collectFormErrors(fieldMeta: FieldMetaMap) {
	const errors: OsukiFormErrorMap<Record<string, unknown>> = {};
	for (const [key, meta] of Object.entries(fieldMeta)) {
		const message = getFirstMessage(meta?.errors);
		if (message) errors[key] = message;
	}
	return errors;
}
