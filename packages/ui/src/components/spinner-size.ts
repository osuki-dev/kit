export type SpinnerSize = "sm" | "md" | "lg";

/**
 * The square a spinner occupies at each size, in points.
 *
 * This lives apart from the component because `Spinner` is not the only thing
 * that needs the number: a row that shows a spinner some of the time has to
 * reserve the identical box the rest of the time, or its text slides sideways
 * when the spinner leaves. Both readers import this map so neither can keep a
 * copy that quietly drifts from the other.
 */
export const spinnerSizes: Record<SpinnerSize, number> = {
	sm: 16,
	md: 24,
	lg: 32,
};
