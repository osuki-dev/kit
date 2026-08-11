import React from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useFocusEffect } from "expo-router";

type TabChromeContextValue = {
	title: string;
	scrolled: boolean;
	setTitle: (title: string) => void;
	setScrolled: (scrolled: boolean) => void;
	setScreenScrolled: (title: string, scrolled: boolean) => void;
};

const TabChromeContext = React.createContext<TabChromeContextValue | null>(null);

export function TabChromeProvider({ children }: { children: React.ReactNode }) {
	const [title, setTitleState] = React.useState("Shop");
	const [scrolled, setScrolledState] = React.useState(false);
	const scrolledByTitle = React.useRef<Record<string, boolean>>({});

	const setTitle = React.useCallback((nextTitle: string) => {
		setTitleState((currentTitle) => (currentTitle === nextTitle ? currentTitle : nextTitle));
		setScrolledState(Boolean(scrolledByTitle.current[nextTitle]));
	}, []);

	const setScrolled = React.useCallback((nextScrolled: boolean) => {
		setScrolledState((currentScrolled) =>
			currentScrolled === nextScrolled ? currentScrolled : nextScrolled,
		);
	}, []);

	const setScreenScrolled = React.useCallback((screenTitle: string, nextScrolled: boolean) => {
		scrolledByTitle.current[screenTitle] = nextScrolled;
		setScrolledState((currentScrolled) =>
			currentScrolled === nextScrolled ? currentScrolled : nextScrolled,
		);
	}, []);

	const value = React.useMemo(
		() => ({
			title,
			scrolled,
			setTitle,
			setScrolled,
			setScreenScrolled,
		}),
		[title, scrolled, setTitle, setScrolled, setScreenScrolled],
	);

	return <TabChromeContext.Provider value={value}>{children}</TabChromeContext.Provider>;
}

export function useTabChrome() {
	const value = React.use(TabChromeContext);

	if (!value) {
		throw new Error("useTabChrome must be used inside TabChromeProvider");
	}

	return value;
}

export function useTabChromeScreen(title: string) {
	const { setTitle, setScreenScrolled } = useTabChrome();

	useFocusEffect(
		React.useCallback(() => {
			setTitle(title);
		}, [setTitle, title]),
	);

	return React.useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			setScreenScrolled(title, event.nativeEvent.contentOffset.y > 28);
		},
		[setScreenScrolled, title],
	);
}
