import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ExpoHaptics from "expo-haptics";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

import {
	HapticsProvider,
	ToastProvider,
	ThemeProvider as OsukiThemeProvider,
	IconProvider,
	createNanoIconSet,
	type HapticFeedbackKind,
} from "@osuki-dev/ui";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

// Demo custom Nano Icons set
const customNanoSet = createNanoIconSet({
	CustomNano: {
		name: "CustomNano",
		viewBox: "0 0 24 24",
		renderGlyph: (props: { size?: number; color?: string }) => (
			<View
				style={{
					width: props.size ?? 24,
					height: props.size ?? 24,
					borderRadius: 6,
					backgroundColor: props.color ?? "#ff5500",
					alignItems: "center",
					justifyContent: "center",
				}}
			/>
		),
	},
});

export default function RootLayout() {
	const handleHaptic = useCallback((kind?: HapticFeedbackKind) => {
		try {
			switch (kind) {
				case "light":
				case "selection":
					void ExpoHaptics.selectionAsync();
					break;
				case "medium":
					void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
					break;
				case "success":
					void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
					break;
				case "warning":
					void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning);
					break;
				case "error":
					void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
					break;
			}
		} catch {
			// no-op in non-haptic environments
		}
	}, []);

	return (
		<GestureHandlerRootView style={styles.container}>
			<SafeAreaProvider>
				<KeyboardProvider>
					<OsukiThemeProvider defaultMode="system">
						<HapticsProvider feedback={handleHaptic}>
							<ToastProvider>
								<IconProvider resolve={customNanoSet.resolve}>
									<Stack
										screenOptions={{
											headerShown: false,
											animation: "slide_from_right",
										}}
									>
										<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
										<Stack.Screen
											name="custom-theme"
											options={{ headerShown: true, title: "Custom theme" }}
										/>
										<Stack.Screen
											name="template-preview"
											options={{
												headerShown: false,
												presentation: "modal",
											}}
										/>
									</Stack>
									<StatusBar style="auto" />
								</IconProvider>
							</ToastProvider>
						</HapticsProvider>
					</OsukiThemeProvider>
				</KeyboardProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
