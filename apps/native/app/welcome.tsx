import { WelcomeScreen } from "@osuki-dev/kit-community";
import type { WelcomeScreenConfig } from "@osuki-dev/kit-community";
import { router, type Href } from "expo-router";

const welcomeConfig: WelcomeScreenConfig = {
	brandName: "Osuki Market",
	tagline: "Curated goods, thoughtful service, and a calmer way to shop.",
	features: [
		{
			icon: "Palette",
			title: "Curated Catalog",
			description: "Focused product stories with clear details and confident choices",
		},
		{
			icon: "Zap",
			title: "Fast Checkout",
			description: "A direct purchase path from product discovery to order confirmation",
		},
		{
			icon: "Smartphone",
			title: "Native Feel",
			description: "Platform tabs, polished controls, and responsive mobile layouts",
		},
		{
			icon: "Layers",
			title: "Account Care",
			description: "Preferences, security, orders, and service flows in one place",
		},
	],
	primaryAction: {
		label: "GET STARTED",
		onPress: () => router.push("/"),
	},
	secondaryAction: {
		label: "VIEW FLOWS",
		onPress: () => router.push("/flows" as Href),
	},
};

export default function WelcomeProduct() {
	return <WelcomeScreen config={welcomeConfig} />;
}
