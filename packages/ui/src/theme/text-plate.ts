import React, { createContext, useContext, type ReactNode } from "react";
import type { TextStyle } from "react-native";

/**
 * A style for text that stands directly on a decorated background, outside
 * any card or control: field labels and hints, section titles, empty-state
 * copy. Over an image or a translucent ground, an app publishes a plate (a
 * backing fill, padding, a radius) so that text stays legible; over a plain
 * background it publishes nothing.
 */
const TextPlateContext = createContext<TextStyle | null>(null);

export interface TextPlateProviderProps {
	/** The plate for plated text below, or `null` for none. Keep it stable. */
	plate: TextStyle | null;
	children: ReactNode;
}

export function TextPlateProvider({ plate, children }: TextPlateProviderProps) {
	return React.createElement(TextPlateContext.Provider, { value: plate }, children);
}

/** The plate in force, or `null`. `Text` applies it when `plated` is set. */
export function useTextPlate(): TextStyle | null {
	return useContext(TextPlateContext);
}
