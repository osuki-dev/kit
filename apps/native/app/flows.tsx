import { View, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";

import {
	Screen,
	Card,
	Text,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	ListItem,
} from "@osuki-dev/ui";
import { Container } from "@/components/container";

const flowGroups = [
	{
		title: "E-COMMERCE",
		items: [
			{
				icon: "Package",
				label: "Product Details",
				route: "/product",
				description: "Product page with gallery",
			},
			{
				icon: "ShoppingCart",
				label: "Shopping Cart",
				route: "/bag",
				description: "Cart with quantity controls",
			},
			{
				icon: "CreditCard",
				label: "Checkout",
				route: "/checkout",
				description: "Multi-step checkout flow",
			},
			{
				icon: "ClipboardList",
				label: "Order History",
				route: "/account-orders",
				description: "Receipts and shipment tracking",
			},
		],
	},
	{
		title: "CONTENT",
		items: [
			{
				icon: "FileText",
				label: "Article",
				route: "/article",
				description: "Blog post with author",
			},
			{ icon: "Newspaper", label: "Feed", route: "/feed", description: "Social media feed" },
			{
				icon: "Music",
				label: "Media Player",
				route: "/player",
				description: "Audio/Video controls",
			},
			{
				icon: "Bell",
				label: "Notifications",
				route: "/notifications",
				description: "Notification center",
			},
		],
	},
	{
		title: "TOOLS",
		items: [
			{
				icon: "Calendar",
				label: "Calendar",
				route: "/calendar",
				description: "Monthly/weekly/day views",
			},
			{
				icon: "Camera",
				label: "Camera",
				route: "/camera",
				description: "Photo/Video/Scanner",
			},
			{
				icon: "Folder",
				label: "File Browser",
				route: "/files",
				description: "File manager with grid/list",
			},
		],
	},
	{
		title: "SPECIAL PAGES",
		items: [
			{
				icon: "AlertCircle",
				label: "Error Pages",
				route: "/error-state",
				description: "404, 500, Network errors",
			},
			{
				icon: "Inbox",
				label: "Empty States",
				route: "/empty-state",
				description: "No content placeholders",
			},
			{
				icon: "Loader",
				label: "Loading",
				route: "/loading",
				description: "Loading indicators",
			},
			{
				icon: "Sparkles",
				label: "Welcome",
				route: "/welcome",
				description: "Onboarding welcome",
			},
		],
	},
	{
		title: "NAVIGATION",
		items: [
			{
				icon: "Layers",
				label: "Tabbed Screen",
				route: "/tabbed",
				description: "Top tab navigation",
			},
			{
				icon: "LayoutGrid",
				label: "Bottom Navigation",
				route: "/bottom-nav",
				description: "Bottom tab bar",
			},
		],
	},
];

export default function FlowsPage() {
	const { spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	return (
		<Container>
			<Screen>
				<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 720, lg: 960 }}
						horizontalPadding={pagePadding}
					>
						{/* Header */}
						<View style={[styles.header, { marginTop: spacing["lg"] }]}>
							<Text variant="heading" colorKey="text">
								FLOWS
							</Text>
							<Text variant="body" colorKey="textMuted">
								Operational screens available for the full commerce lifecycle.
							</Text>
						</View>

						{flowGroups.map((group) => (
							<View key={group.title} style={[styles.section, { marginTop: spacing["xl"] }]}>
								<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
									{group.title}
								</Text>
								<Card variant="raised" border="subtle" padding="none">
									{group.items.map((item, index) => (
										<ListItem
											key={item.route}
											icon={item.icon}
											title={item.label}
											subtitle={item.description}
											trailing="→"
											separator={index < group.items.length - 1 ? "bottom" : "none"}
											onPress={() => router.push(item.route as any)}
										/>
									))}
								</Card>
							</View>
						))}

						<View style={{ height: spacing["4xl"] }} />
					</ResponsiveContainer>
				</ScrollView>
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	header: {
		alignItems: "center",
		marginBottom: 8,
	},
	section: {
		width: "100%",
	},
	sectionLabel: {
		marginBottom: 8,
	},
});
