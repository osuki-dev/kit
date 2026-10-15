import { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen, TopBar, Text, Card, Badge, Icon, useTheme, type IconName } from "@osuki-dev/ui";

const TEMPLATES = [
	{
		id: "dashboard",
		title: "Dashboard & Analytics",
		description: "Data grids, KPIs, time series metrics, and quick action bars.",
		icon: "LayoutGrid" as IconName,
		category: "Operations",
		badge: "Popular",
	},
	{
		id: "profile",
		title: "User Profile & Activity",
		description: "Avatar headers, follower stats, bio markdown, and social activity feeds.",
		icon: "User" as IconName,
		category: "Social",
		badge: "Standard",
	},
	{
		id: "chat",
		title: "Realtime Chat Stream",
		description: "Streaming thought blocks, agent message bubbles, and tool invocation cards.",
		icon: "MessageSquare" as IconName,
		category: "Agent & Chat",
		badge: "Agent Spec",
	},
	{
		id: "security",
		title: "Security & Passkeys",
		description: "Two-factor biometric auth, passkeys list, and session revocation.",
		icon: "Shield" as IconName,
		category: "Security",
		badge: "Enterprise",
	},
	{
		id: "settings",
		title: "System Preferences",
		description: "Categorized preference rows, theme swappers, and notification toggles.",
		icon: "Settings" as IconName,
		category: "System",
		badge: "Essential",
	},
	{
		id: "onboarding",
		title: "Onboarding Walkthrough",
		description: "Multi-step welcome tour, feature slides, and account initialization.",
		icon: "Compass" as IconName,
		category: "Auth",
		badge: "First-Run",
	},
	{
		id: "orders",
		title: "Order History & Status",
		description: "Itemized receipts, timeline delivery tracking, and invoice downloads.",
		icon: "ShoppingBag" as IconName,
		category: "Commerce",
		badge: "Commerce",
	},
	{
		id: "notifications",
		title: "Notifications Inbox",
		description: "Categorized alert feed, unread indicators, and bulk mark-as-read.",
		icon: "Bell" as IconName,
		category: "System",
		badge: "Inbox",
	},
	{
		id: "file-explorer",
		title: "File & Asset Browser",
		description: "Breadcrumb navigation, tree views, file size badges, and quick previews.",
		icon: "Folder" as IconName,
		category: "Operations",
		badge: "Files",
	},
	{
		id: "metrics",
		title: "Metric Analytics Hub",
		description: "Conversion rates, dual-axis charts, telemetry logs, and export actions.",
		icon: "Activity" as IconName,
		category: "Operations",
		badge: "Pro",
	},
	{
		id: "checkout",
		title: "Payment & Checkout",
		description: "Cart summaries, address pickers, discount codes, and Apple/Google Pay.",
		icon: "CreditCard" as IconName,
		category: "Commerce",
		badge: "Payment",
	},
	{
		id: "members",
		title: "Team Members & RBAC",
		description: "Organization seats, permission role pills, and email invite sheets.",
		icon: "Users" as IconName,
		category: "Security",
		badge: "Teams",
	},
];

const CATEGORIES = [
	"All",
	"Operations",
	"Social",
	"Agent & Chat",
	"Security",
	"System",
	"Commerce",
] as const;

export default function KitTemplatesScreen() {
	const { colors, mode, toggleMode } = useTheme();
	const router = useRouter();

	const [selectedCategory, setSelectedCategory] = useState<string>("All");

	const filteredTemplates = useMemo(() => {
		if (selectedCategory === "All") return TEMPLATES;
		return TEMPLATES.filter((tpl) => tpl.category === selectedCategory);
	}, [selectedCategory]);

	return (
		<Screen style={[styles.screen, { backgroundColor: colors.background }]}>
			<TopBar
				title="Kit Community Templates"
				subtitle="12 Production-Ready Screen Blueprints"
				actions={[
					{
						icon: mode === "dark" ? "Sun" : "Moon",
						onPress: toggleMode,
						label: "Toggle Theme",
					},
				]}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Banner Card */}
				<Card variant="raised" border="subtle" padding="md" style={styles.bannerCard}>
					<View style={styles.bannerBadgeRow}>
						<Badge variant="primary" display="label">
							@osuki-dev/kit-community
						</Badge>
						<Text variant="caption" colorKey="textMuted">
							12 Interactive Screens
						</Text>
					</View>
					<Text variant="heading" colorKey="text" style={{ marginTop: 4 }}>
						Application Templates
					</Text>
					<Text variant="bodySmall" colorKey="textMuted" style={{ marginTop: 4, lineHeight: 19 }}>
						Pre-composed full-screen templates built on @osuki-dev/ui primitives. Tap any card to
						launch its live interactive preview screen.
					</Text>
				</Card>

				{/* Category Filter Chips */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.categoryScroll}
				>
					{CATEGORIES.map((cat) => {
						const active = selectedCategory === cat;
						const count =
							cat === "All" ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === cat).length;
						return (
							<Pressable
								key={cat}
								onPress={() => setSelectedCategory(cat)}
								style={[
									styles.categoryChip,
									{
										backgroundColor: active ? colors.primary : colors.surface,
										borderColor: active ? colors.primary : colors.border,
									},
								]}
							>
								<Text
									variant="caption"
									style={{
										color: active ? colors.onPrimary : colors.text,
										fontWeight: "600",
										fontSize: 12,
									}}
								>
									{`${cat} (${count})`}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				{/* Template List */}
				<View style={styles.templateList}>
					{filteredTemplates.map((tpl) => (
						<Pressable
							key={tpl.id}
							onPress={() =>
								router.push({
									pathname: "/template-preview",
									params: { templateId: tpl.id, title: tpl.title },
								})
							}
							style={({ pressed }) => [styles.cardPressable, { opacity: pressed ? 0.92 : 1 }]}
						>
							<Card variant="raised" border="subtle" padding="md" style={styles.templateCard}>
								<View style={styles.cardHeaderRow}>
									{/* Leading Icon Box */}
									<View style={[styles.iconBox, { backgroundColor: colors.surfaceRaised }]}>
										<Icon name={tpl.icon} size={22} color={colors.primary} />
									</View>

									{/* Title & Category Column */}
									<View style={styles.cardTitleCol}>
										<View style={styles.titleBadgeRow}>
											<Text variant="subheading" colorKey="text" style={styles.titleText}>
												{tpl.title}
											</Text>
											<Badge variant="primary" display="label">
												{tpl.badge}
											</Badge>
										</View>
										<Text variant="caption" colorKey="primary" style={styles.categoryLabel}>
											{tpl.category.toUpperCase()}
										</Text>
									</View>

									{/* Trailing Chevron */}
									<View style={styles.chevronBox}>
										<Icon name="ChevronRight" size={18} color={colors.textMuted} />
									</View>
								</View>

								{/* Description */}
								<Text
									variant="bodySmall"
									colorKey="textMuted"
									style={styles.descText}
									numberOfLines={2}
								>
									{tpl.description}
								</Text>
							</Card>
						</Pressable>
					))}
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		gap: 16,
	},
	bannerCard: {
		borderRadius: 16,
	},
	bannerBadgeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},
	categoryScroll: {
		gap: 8,
		paddingVertical: 2,
	},
	categoryChip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	templateList: {
		gap: 12,
	},
	cardPressable: {
		borderRadius: 16,
	},
	templateCard: {
		borderRadius: 16,
		gap: 10,
	},
	cardHeaderRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconBox: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	cardTitleCol: {
		flex: 1,
		minWidth: 0,
		gap: 2,
	},
	titleBadgeRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8,
	},
	titleText: {
		fontWeight: "700",
		fontSize: 15,
		flexShrink: 1,
	},
	categoryLabel: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	chevronBox: {
		marginLeft: 4,
	},
	descText: {
		fontSize: 13,
		lineHeight: 18,
	},
});
