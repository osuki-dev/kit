import { BottomNavScreen } from "@osuki-dev/kit-community";
import { View, Text } from "react-native";
import { useTheme } from "@osuki-dev/ui";

export default function BottomNavproduct() {
	const { colors } = useTheme();

	const renderContent = (title: string, subtitle: string) => (
		<View style={{ padding: 24, gap: 12, alignItems: "center", justifyContent: "center", flex: 1 }}>
			<Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>{title}</Text>
			<Text style={{ color: colors.textMuted, textAlign: "center" }}>{subtitle}</Text>
		</View>
	);

	return (
		<BottomNavScreen
			config={{
				items: [
					{
						id: "home",
						label: "Home",
						icon: "Home",
						activeIcon: "Home",
						content: renderContent("Home", "Your main dashboard and overview"),
						badge: 0,
					},
					{
						id: "search",
						label: "Search",
						icon: "Search",
						activeIcon: "Search",
						content: renderContent("Search", "Find what you're looking for"),
					},
					{
						id: "favorites",
						label: "Favorites",
						icon: "Heart",
						activeIcon: "Heart",
						content: renderContent("Favorites", "Your saved items and collections"),
						badge: 3,
					},
					{
						id: "profile",
						label: "Profile",
						icon: "User",
						activeIcon: "User",
						content: renderContent("Profile", "Manage your account and settings"),
					},
				],
				activeItemId: "home",
			}}
		/>
	);
}
