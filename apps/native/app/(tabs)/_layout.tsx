import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

import { BottomChromeVeil, TopChromeVeil } from "@/components/chrome-veil";
import { FloatingTabBar } from "@/components/floating-tab-bar";
import { TabChromeProvider } from "@/components/tab-chrome-context";
import { useCart } from "@/lib/data";
import { useTheme } from "@osuki-dev/ui";
import { useI18n } from "@osuki-dev/kit-community";

export default function TabLayout() {
	const { colors, mode } = useTheme();
	const { t } = useI18n();
	const { items } = useCart();
	const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

	if (Platform.OS !== "ios") {
		return (
			<TabChromeProvider>
				<View style={styles.container}>
					<Tabs
						screenOptions={{
							headerShown: false,
							tabBarHideOnKeyboard: true,
							sceneStyle: { backgroundColor: colors.background },
						}}
						tabBar={(props) => <FloatingTabBar {...props} />}
					>
						<Tabs.Screen name="index" options={{ title: t("navigation.shop") }} />
						<Tabs.Screen name="categories" options={{ title: t("navigation.categories") }} />
						<Tabs.Screen name="bag" options={{ title: t("navigation.cart") }} />
						<Tabs.Screen name="account" options={{ title: t("navigation.account") }} />
					</Tabs>
					<TopChromeVeil />
					<BottomChromeVeil />
				</View>
			</TabChromeProvider>
		);
	}

	return (
		<TabChromeProvider>
			<View style={styles.container}>
				<NativeTabs
					tintColor={colors.primary}
					iconColor={{ default: colors.textDisabled, selected: colors.primary }}
					labelStyle={{
						default: { color: colors.textMuted },
						selected: { color: colors.primary },
					}}
					badgeBackgroundColor={colors.primary}
					badgeTextColor={colors.onPrimary}
					blurEffect={mode === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
					minimizeBehavior="onScrollDown"
					disableTransparentOnScrollEdge
				>
					<NativeTabs.Trigger name="index">
						<NativeTabs.Trigger.Icon
							sf={{ default: "bag", selected: "bag.fill" }}
							md={{ default: "shopping_bag", selected: "shopping_bag" }}
						/>
						<NativeTabs.Trigger.Label>{t("navigation.shop")}</NativeTabs.Trigger.Label>
					</NativeTabs.Trigger>

					<NativeTabs.Trigger name="categories">
						<NativeTabs.Trigger.Icon
							sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }}
							md={{ default: "category", selected: "category" }}
						/>
						<NativeTabs.Trigger.Label>{t("navigation.categories")}</NativeTabs.Trigger.Label>
					</NativeTabs.Trigger>

					<NativeTabs.Trigger name="bag">
						<NativeTabs.Trigger.Icon
							sf={{ default: "cart", selected: "cart.fill" }}
							md={{ default: "shopping_cart", selected: "shopping_cart" }}
						/>
						<NativeTabs.Trigger.Label>{t("navigation.cart")}</NativeTabs.Trigger.Label>
						{cartCount > 0 ? (
							<NativeTabs.Trigger.Badge>
								{cartCount > 9 ? "9+" : String(cartCount)}
							</NativeTabs.Trigger.Badge>
						) : null}
					</NativeTabs.Trigger>

					<NativeTabs.Trigger name="account">
						<NativeTabs.Trigger.Icon
							sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
							md={{ default: "account_circle", selected: "account_circle" }}
						/>
						<NativeTabs.Trigger.Label>{t("navigation.account")}</NativeTabs.Trigger.Label>
					</NativeTabs.Trigger>
				</NativeTabs>
				<TopChromeVeil />
			</View>
		</TabChromeProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
