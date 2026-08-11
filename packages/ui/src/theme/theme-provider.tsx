import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { createTheme } from "./create-theme";
import type {
	OsukiTheme,
	ResolvedThemeMode,
	ThemeContextValue,
	ThemeMode,
	ThemeModeContextValue,
	ThemeOverride,
	ThemeStorageAdapter,
} from "./types";

const DEFAULT_STORAGE_KEY = "osuki-theme-mode";

const ThemeTokensContext = createContext<OsukiTheme | undefined>(undefined);
const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
	children: ReactNode;
	mode?: ThemeMode;
	defaultMode?: ThemeMode;
	theme?: ThemeOverride;
	storageAdapter?: ThemeStorageAdapter;
	storageKey?: string;
}

function resolveMode(mode: ThemeMode, systemMode: string | null | undefined): ResolvedThemeMode {
	if (mode === "system") return systemMode === "dark" ? "dark" : "light";
	return mode;
}

function isThemeMode(value: string | null): value is ThemeMode {
	return value === "system" || value === "light" || value === "dark";
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
	children,
	mode: controlledMode,
	defaultMode = "system",
	theme: themeOverride,
	storageAdapter,
	storageKey = DEFAULT_STORAGE_KEY,
}) => {
	const systemMode = useColorScheme();
	const [uncontrolledMode, setUncontrolledMode] = useState<ThemeMode>(
		controlledMode ?? defaultMode,
	);
	const mode = controlledMode ?? uncontrolledMode;
	const resolvedMode = resolveMode(mode, systemMode);

	useEffect(() => {
		if (!storageAdapter || controlledMode) return;
		let cancelled = false;
		Promise.resolve(storageAdapter.getItem(storageKey)).then((storedMode) => {
			if (!cancelled && isThemeMode(storedMode)) {
				setUncontrolledMode(storedMode);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [controlledMode, storageAdapter, storageKey]);

	const setMode = useCallback(
		(nextMode: ThemeMode) => {
			if (!controlledMode) setUncontrolledMode(nextMode);
			void storageAdapter?.setItem(storageKey, nextMode);
		},
		[controlledMode, storageAdapter, storageKey],
	);

	const toggleMode = useCallback(() => {
		setMode(resolvedMode === "dark" ? "light" : "dark");
	}, [resolvedMode, setMode]);

	const theme = useMemo(
		() => createTheme(resolvedMode, themeOverride),
		[resolvedMode, themeOverride],
	);

	const modeValue = useMemo(
		() => ({ mode, resolvedMode, setMode, toggleMode }),
		[mode, resolvedMode, setMode, toggleMode],
	);

	return (
		<ThemeModeContext.Provider value={modeValue}>
			<ThemeTokensContext.Provider value={theme}>{children}</ThemeTokensContext.Provider>
		</ThemeModeContext.Provider>
	);
};

export function useThemeTokens(): OsukiTheme {
	const context = useContext(ThemeTokensContext);
	if (!context) throw new Error("useThemeTokens must be used within a ThemeProvider");
	return context;
}

export function useThemeMode(): ThemeModeContextValue {
	const context = useContext(ThemeModeContext);
	if (!context) throw new Error("useThemeMode must be used within a ThemeProvider");
	return context;
}

export function useTheme(): ThemeContextValue {
	const tokens = useThemeTokens();
	const mode = useThemeMode();
	return useMemo(() => ({ ...tokens, ...mode }), [tokens, mode]);
}

export type { ThemeContextValue };
