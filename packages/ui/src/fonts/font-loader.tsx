import React, { type ReactNode } from "react";
import { useFonts, type FontSource } from "expo-font";

export type FontSourceMap = Record<string, FontSource>;

export interface FontLoaderProps {
	children: ReactNode;
	fonts?: FontSourceMap;
	fallback?: ReactNode;
}

const noFontSources: FontSourceMap = {};

/** Loads application-owned font assets without prescribing a font family. */
export const FontLoader: React.FC<FontLoaderProps> = ({
	children,
	fonts = noFontSources,
	fallback = null,
}) => {
	const [loaded, error] = useFonts(fonts);

	if (!error && Object.keys(fonts).length > 0 && !loaded) {
		return fallback ? <>{fallback}</> : <>{children}</>;
	}

	return <>{children}</>;
};
