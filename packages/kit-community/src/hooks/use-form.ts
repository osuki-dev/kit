import { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import { useI18n } from "../i18n";

export interface FormState<T> {
	values: T;
	errors: Partial<Record<keyof T, string>>;
	touched: Partial<Record<keyof T, boolean>>;
	isValid: boolean;
	isDirty: boolean;
}

export interface UseFormOptions<T> {
	schema: z.ZodType<T>;
	defaultValues: Partial<T>;
	onSubmit?: (values: T) => void | Promise<void>;
	onError?: (errors: Record<string, string>) => void;
}

export interface UseFormReturn<T> {
	values: T;
	errors: Partial<Record<keyof T, string>>;
	touched: Partial<Record<keyof T, boolean>>;
	isValid: boolean;
	isDirty: boolean;
	isSubmitting: boolean;
	setValue: <K extends keyof T>(key: K, value: T[K]) => void;
	setValues: (values: Partial<T>) => void;
	setTouched: (key: keyof T, touched?: boolean) => void;
	validate: () => boolean;
	validateField: <K extends keyof T>(key: K) => boolean;
	handleSubmit: () => Promise<void>;
	reset: () => void;
	clearError: (key: keyof T) => void;
}

/**
 * Enhanced form hook with Zod validation and i18n error messages
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   schema: UserSchema,
 *   defaultValues: { name: '', email: '' },
 *   onSubmit: async (values) => {
 *     await saveUser(values);
 *   },
 * });
 * ```
 */
export function useForm<T extends Record<string, unknown>>({
	schema,
	defaultValues,
	onSubmit,
	onError,
}: UseFormOptions<T>): UseFormReturn<T> {
	const { t } = useI18n();
	const [values, setValuesState] = useState<T>({ ...defaultValues } as T);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
	const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isDirty = useMemo(() => {
		return Object.keys(touched).some((key) => touched[key as keyof T]);
	}, [touched]);

	// Helper to convert Zod error to i18n message
	const getErrorMessage = useCallback(
		(issue: z.core.$ZodIssue): string => {
			// Check if there's a specific validation message
			switch (issue.code) {
				case "invalid_type":
					return t("validation.required");

				case "invalid_format":
					return t("validation.pattern");

				case "too_small":
					return t("validation.min");

				case "too_big":
					return t("validation.max");

				case "custom":
					return (issue as { message?: string }).message || t("validation.pattern");

				default:
					return t("validation.pattern");
			}
		},
		[t],
	);

	const validate = useCallback((): boolean => {
		const result = schema.safeParse(values);

		if (!result.success) {
			const newErrors: Partial<Record<keyof T, string>> = {};

			result.error.issues.forEach((issue) => {
				const path = issue.path[0] as keyof T;
				newErrors[path] = getErrorMessage(issue);
			});

			setErrors(newErrors);
			onError?.(newErrors as Record<string, string>);
			return false;
		}

		setErrors({});
		return true;
	}, [schema, values, getErrorMessage, onError]);

	const validateField = useCallback(
		<K extends keyof T>(key: K): boolean => {
			const fieldSchema = schema instanceof z.ZodObject ? schema.shape[key as string] : null;

			if (!fieldSchema) return true;

			const result = fieldSchema.safeParse(values[key]);

			if (!result.success) {
				const message =
					result.error.issues.length > 0
						? getErrorMessage(result.error.issues[0])
						: t("validation.pattern");

				setErrors((prev) => ({ ...prev, [key]: message }));
				return false;
			}

			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[key];
				return newErrors;
			});
			return true;
		},
		[schema, values, getErrorMessage, t],
	);

	const setValue = useCallback(
		<K extends keyof T>(key: K, value: T[K]) => {
			setValuesState((prev) => ({ ...prev, [key]: value }));
			setTouchedState((prev) => ({ ...prev, [key]: true }));

			// Validate field immediately
			setTimeout(() => validateField(key), 0);
		},
		[validateField],
	);

	const setValues = useCallback((newValues: Partial<T>) => {
		setValuesState((prev) => ({ ...prev, ...newValues }));
	}, []);

	const setTouched = useCallback((key: keyof T, isTouched: boolean = true) => {
		setTouchedState((prev) => ({ ...prev, [key]: isTouched }));
	}, []);

	const clearError = useCallback((key: keyof T) => {
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[key];
			return newErrors;
		});
	}, []);

	const handleSubmit = useCallback(async () => {
		// Mark all fields as touched
		const allTouched: Partial<Record<keyof T, boolean>> = {};
		Object.keys(values).forEach((key) => {
			allTouched[key as keyof T] = true;
		});
		setTouchedState(allTouched);

		if (!validate()) {
			return;
		}

		if (onSubmit) {
			setIsSubmitting(true);
			try {
				await onSubmit(values);
			} finally {
				setIsSubmitting(false);
			}
		}
	}, [validate, onSubmit, values]);

	const reset = useCallback(() => {
		setValuesState({ ...defaultValues } as T);
		setErrors({});
		setTouchedState({});
		setIsSubmitting(false);
	}, [defaultValues]);

	const isValid = useMemo(() => {
		return Object.keys(errors).length === 0;
	}, [errors]);

	return {
		values,
		errors,
		touched,
		isValid,
		isDirty,
		isSubmitting,
		setValue,
		setValues,
		setTouched,
		validate,
		validateField,
		handleSubmit,
		reset,
		clearError,
	};
}
