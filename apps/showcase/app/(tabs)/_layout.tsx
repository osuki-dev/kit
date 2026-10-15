import { Tabs } from "expo-router";
import { Icon, useTheme } from "@osuki-dev/ui";
import { Platform } from "react-native";

export default function TabLayout() {
	const { colors } = useTheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.textMuted,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
					borderTopWidth: 1,
					height: Platform.OS === "ios" ? 88 : 64,
					paddingBottom: Platform.OS === "ios" ? 28 : 8,
					paddingTop: 8,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "600",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Primitives",
					tabBarIcon: ({ color, size }) => <Icon name="Layers" size={size ?? 22} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="ai"
				options={{
					title: "AI Elements",
					tabBarIcon: ({ color, size }) => <Icon name="Sparkles" size={size ?? 22} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="theming"
				options={{
					title: "Theming",
					tabBarIcon: ({ color, size }) => <Icon name="Palette" size={size ?? 22} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="templates"
				options={{
					title: "Templates",
					tabBarIcon: ({ color, size }) => (
						<Icon name="Smartphone" size={size ?? 22} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color, size }) => <Icon name="Settings" size={size ?? 22} color={color} />,
				}}
			/>
		</Tabs>
	);
}
