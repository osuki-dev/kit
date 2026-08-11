import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ExpoHaptics from "expo-haptics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useMemo, type ReactNode } from "react";
import { LogBox, Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "expo-router/react-navigation";
import { KeyboardProvider } from "react-native-keyboard-controller";

import {
	FontLoader,
	HapticsProvider,
	ToastProvider,
	ThemeProvider as OsukiThemeProvider,
	useNavigationTheme,
	type HapticFeedbackKind,
	type ThemeMode,
	type ThemeStorageAdapter,
} from "@osuki-dev/ui";
import { I18nProvider } from "@osuki-dev/kit-community";
import { OsukiDataProvider, useSettings } from "@/lib/data";
import { defaultLocale, resolveLocale } from "@/lib/locale-options";
import { createThemePresetOverride, defaultThemePresetId } from "@/lib/theme-presets";
import { appFontRegistry, appFontSources } from "@/lib/fonts";
import { HeaderBackButton } from "@/components/header-back-button";
import { PillHeaderTitle } from "@/components/pill-header-title";
import { StackHeaderBackground } from "@/components/stack-header-background";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

LogBox.ignoreLogs([
	"source.uri should not be an empty string",
	"Can't perform a React state update on a component that hasn't mounted yet",
]);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 3,
			gcTime: 1000 * 60 * 30,
			retry: 1,
		},
	},
});

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

function isThemeMode(value: string | undefined): value is ThemeMode {
	return value === "system" || value === "light" || value === "dark";
}

function AppThemeProvider({ children }: { children: ReactNode }) {
	const { settings, setSetting } = useSettings();
	const themeMode = isThemeMode(settings.darkMode) ? settings.darkMode : "system";
	const themeOverride = useMemo(
		() => ({
			...createThemePresetOverride(settings.themePreset ?? defaultThemePresetId),
			fonts: appFontRegistry,
		}),
		[settings.themePreset],
	);
	const storageAdapter = useMemo<ThemeStorageAdapter>(
		() => ({
			getItem: () => settings.darkMode ?? "system",
			setItem: (_key, value) => setSetting("darkMode", value),
			removeItem: () => setSetting("darkMode", "system"),
		}),
		[setSetting, settings.darkMode],
	);

	return (
		<OsukiThemeProvider mode={themeMode} theme={themeOverride} storageAdapter={storageAdapter}>
			{children}
		</OsukiThemeProvider>
	);
}

function AppI18nProvider({ children }: { children: ReactNode }) {
	const { settings } = useSettings();
	const locale = resolveLocale(settings.language ?? defaultLocale);

	return (
		<I18nProvider key={locale} defaultLocale={locale}>
			{children}
		</I18nProvider>
	);
}

function AppHapticsProvider({ children }: { children: ReactNode }) {
	const { settings } = useSettings();
	const enabled = settings.haptics !== "false";
	const feedback = useCallback(async (kind: HapticFeedbackKind = "selection") => {
		if (Platform.OS === "web") return;

		try {
			switch (kind) {
				case "light":
					await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
					break;
				case "medium":
					await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
					break;
				case "success":
					await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
					break;
				case "warning":
					await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning);
					break;
				case "error":
					await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
					break;
				case "selection":
				default:
					await ExpoHaptics.selectionAsync();
					break;
			}
		} catch {
			// Haptics are best-effort because simulators and some devices may not expose a motor.
		}
	}, []);

	return (
		<HapticsProvider enabled={enabled} feedback={feedback}>
			{children}
		</HapticsProvider>
	);
}

/**
 * Navigation wrapper that applies Osuki design system theme
 */
function NavigationContent() {
	const { theme, screenOptions, colors, mode } = useNavigationTheme();
	const stackScreenOptions = {
		...screenOptions,
		headerBackVisible: false,
		headerTitleAlign: "center" as const,
		headerTransparent: false,
		headerBackground: () => <StackHeaderBackground />,
		headerLeft: () => <HeaderBackButton />,
		headerTitle: ({ children }: { children: string }) => (
			<PillHeaderTitle>{children}</PillHeaderTitle>
		),
	};

	return (
		<ThemeProvider value={theme}>
			<SafeAreaProvider>
				<StatusBar style={mode === "dark" ? "light" : "dark"} />
				<GestureHandlerRootView style={styles.container}>
					<ToastProvider placement="top">
						<Stack screenOptions={stackScreenOptions}>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
							<Stack.Screen name="product" options={{ title: "Product" }} />
							<Stack.Screen name="cart" options={{ title: "Cart" }} />
							<Stack.Screen name="checkout" options={{ title: "Checkout" }} />
							<Stack.Screen name="order" options={{ title: "Order" }} />
							<Stack.Screen
								name="search"
								options={{
									title: "Search",
									animation: "slide_from_right",
									headerTransparent: false,
									headerShadowVisible: false,
									headerTitleAlign: "left",
									contentStyle: { backgroundColor: colors.background },
								}}
							/>
							<Stack.Screen name="operations" options={{ title: "Operations" }} />
							<Stack.Screen name="users" options={{ title: "Clients" }} />
							<Stack.Screen name="security-screen" options={{ headerShown: false }} />
							<Stack.Screen name="auth-screen" options={{ title: "Account Access" }} />
							<Stack.Screen name="account-profile" options={{ title: "Profile" }} />
							<Stack.Screen name="account-addresses" options={{ title: "Addresses" }} />
							<Stack.Screen name="account-orders" options={{ title: "Order History" }} />
							<Stack.Screen name="forms" options={{ title: "Request" }} />
							<Stack.Screen name="article" options={{ title: "Journal" }} />
							<Stack.Screen name="notifications" options={{ title: "Updates" }} />
							<Stack.Screen name="calendar" options={{ title: "Calendar" }} />
							<Stack.Screen name="files" options={{ title: "Documents" }} />
							<Stack.Screen name="feed" options={{ title: "Community" }} />
							<Stack.Screen name="player" options={{ title: "Audio" }} />
							<Stack.Screen name="camera" options={{ title: "Scan" }} />
							<Stack.Screen name="flows" options={{ title: "Flows" }} />
							<Stack.Screen name="welcome" options={{ title: "Welcome" }} />
							<Stack.Screen name="tabbed" options={{ title: "Insights" }} />
							<Stack.Screen name="bottom-nav" options={{ title: "Navigation" }} />
							<Stack.Screen name="empty-state" options={{ title: "Empty State" }} />
							<Stack.Screen name="error-state" options={{ title: "Error State" }} />
							<Stack.Screen name="loading" options={{ title: "Loading" }} />
							<Stack.Screen name="component-e2e" options={{ title: "Component QA" }} />
							<Stack.Screen name="icons" options={{ title: "Icons" }} />
							<Stack.Screen name="modal" options={{ title: "Action", presentation: "modal" }} />
						</Stack>
					</ToastProvider>
				</GestureHandlerRootView>
			</SafeAreaProvider>
		</ThemeProvider>
	);
}

export default function RootLayout() {
	return (
		<FontLoader fonts={appFontSources}>
			<QueryClientProvider client={queryClient}>
				<OsukiDataProvider>
					<AppThemeProvider>
						<AppI18nProvider>
							<AppHapticsProvider>
								<KeyboardProvider>
									<NavigationContent />
								</KeyboardProvider>
							</AppHapticsProvider>
						</AppI18nProvider>
					</AppThemeProvider>
				</OsukiDataProvider>
			</QueryClientProvider>
		</FontLoader>
	);
}
