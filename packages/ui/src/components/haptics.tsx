import React, { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

export type HapticFeedbackKind = "selection" | "light" | "medium" | "success" | "warning" | "error";

export interface HapticsController {
	enabled: boolean;
	feedback: (kind?: HapticFeedbackKind) => void | Promise<void>;
}

const noopFeedback: HapticsController["feedback"] = () => {};

const HapticsContext = createContext<HapticsController>({
	enabled: false,
	feedback: noopFeedback,
});

export function HapticsProvider({
	children,
	enabled = false,
	feedback = noopFeedback,
}: {
	children: ReactNode;
	enabled?: boolean;
	feedback?: HapticsController["feedback"];
}) {
	const guardedFeedback = useCallback<HapticsController["feedback"]>(
		(kind = "selection") => {
			if (!enabled) return;
			void feedback(kind);
		},
		[enabled, feedback],
	);

	const value = useMemo<HapticsController>(
		() => ({
			enabled,
			feedback: guardedFeedback,
		}),
		[enabled, guardedFeedback],
	);

	return <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>;
}

export function useHaptics() {
	return useContext(HapticsContext);
}
