import { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

import {
	Screen,
	Button,
	Card,
	Icon,
	Image,
	ResponsiveContainer,
	Tag,
	Text,
	useHaptics,
	useResponsiveTheme,
	useTheme,
	type IconName,
} from "@osuki-dev/ui";
import { Container } from "@/components/container";
import { useTabChromeScreen } from "@/components/tab-chrome-context";
import { catalogAssets } from "@/lib/catalog-assets";
import { useProducts, type Product } from "@/lib/data";

const categoryHeroImage = require("../../assets/commerce/osuki-gift-bundle.jpg");

type CategorySummary = {
	id: string;
	label: string;
	count: number;
	image: string;
	minPrice: number;
	maxPrice: number;
	description: string;
	icon: IconName;
	query: string;
};

type CommerceShelf = {
	id: string;
	label: string;
	query: string;
	icon: IconName;
	description: string;
	match: (product: Product) => boolean;
};

const productText = (product: Product) =>
	`${product.name} ${product.description} ${product.variant} ${product.category}`.toLowerCase();

const merchandiseFallbackProducts: Product[] = [
	{
		id: "merch-snowboard-minimal",
		name: "The Minimal Snowboard",
		description: "A soft coral and ice blue directional board for everyday resort riding.",
		image: catalogAssets.cafe,
		price: 780,
		originalPrice: 920,
		variant: "156 cm",
		stock: 8,
		rating: 4.8,
		reviews: 116,
		category: "Snowboards",
	},
	{
		id: "merch-snowboard-alpine",
		name: "Alpine Powder Snowboard",
		description: "A wider winter board with stable edge control and a clean Osuki graphic.",
		image: catalogAssets.workspace,
		price: 940,
		variant: "Powder 160",
		stock: 5,
		rating: 4.9,
		reviews: 84,
		category: "Snowboards",
	},
	{
		id: "merch-winter-shell-pack",
		name: "Winter Shell Pack",
		description: "Packable weather shell, thermal liner, and small mountain accessories.",
		image: catalogAssets.chargingDock,
		price: 168,
		originalPrice: 210,
		variant: "Cloud Grey",
		stock: 18,
		rating: 4.7,
		reviews: 52,
		category: "Winter Gear",
	},
	{
		id: "merch-audio-studio",
		name: "Studio Travel Headphones",
		description: "Noise-canceling headphones tuned for commuting, focus, and long-haul travel.",
		image: catalogAssets.headphones,
		price: 299,
		originalPrice: 399,
		variant: "Midnight Black",
		stock: 15,
		rating: 4.8,
		reviews: 128,
		category: "Audio",
	},
	{
		id: "merch-speaker-soft",
		name: "Portable Room Speaker",
		description: "Warm bass, USB-C fast charging, and a soft white shell for small spaces.",
		image: catalogAssets.speaker,
		price: 89,
		variant: "Soft White",
		stock: 24,
		rating: 4.5,
		reviews: 74,
		category: "Audio",
	},
	{
		id: "merch-workspace-dock",
		name: "Desk Charging Dock",
		description: "Weighted charging dock with clean cable routing for phone, earbuds, and watch.",
		image: catalogAssets.chargingDock,
		price: 59,
		variant: "Desk Black",
		stock: 31,
		rating: 4.6,
		reviews: 42,
		category: "Workspace",
	},
	{
		id: "merch-gift-bundle",
		name: "Daily Carry Gift Bundle",
		description: "Gift-ready carry pouch, cable kit, compact speaker, and travel tags.",
		image: catalogAssets.cafe,
		price: 128,
		originalPrice: 156,
		variant: "Gift Set",
		stock: 12,
		rating: 4.7,
		reviews: 68,
		category: "Accessories",
	},
];

const commerceShelves: CommerceShelf[] = [
	{
		id: "all",
		label: "All",
		query: "",
		icon: "ShoppingBag",
		description: "Everything currently available in the storefront.",
		match: () => true,
	},
	{
		id: "snowboards",
		label: "Snowboards",
		query: "snowboard",
		icon: "Snowflake",
		description: "Boards, seasonal shapes, and mountain-ready highlights from the current drop.",
		match: (product) => productText(product).includes("snowboard"),
	},
	{
		id: "winter-gear",
		label: "Winter Gear",
		query: "winter",
		icon: "Snowflake",
		description: "Cold-weather pieces and sport gear grouped for the winter edit.",
		match: (product) => /\bwinter\b|snow|sport|mountain/.test(productText(product)),
	},
	{
		id: "accessories",
		label: "Accessories",
		query: "accessory",
		icon: "Gift",
		description: "Giftable add-ons, small upgrades, and lightweight essentials.",
		match: (product) => /accessor|gift|bundle|bag|case|dock|carry/.test(productText(product)),
	},
	{
		id: "audio",
		label: "Audio",
		query: "audio",
		icon: "Headphones",
		description: "Headphones, speakers, and listening gear for work and travel.",
		match: (product) => /audio|headphone|speaker|sound|music/.test(productText(product)),
	},
	{
		id: "workspace",
		label: "Workspace",
		query: "workspace",
		icon: "LampDesk",
		description: "Desk pieces, charging, and setup upgrades for a cleaner daily flow.",
		match: (product) =>
			/workspace|desk|dock|charging|charger|lamp|setup/.test(productText(product)),
	},
	{
		id: "sale",
		label: "Sale",
		query: "sale",
		icon: "BadgePercent",
		description: "Price drops and limited offers worth checking before checkout.",
		match: (product) => Boolean(product.originalPrice && product.originalPrice > product.price),
	},
	{
		id: "in-stock",
		label: "In Stock",
		query: "available",
		icon: "BadgeCheck",
		description: "Available products ready to move through cart and checkout.",
		match: (product) => product.stock > 0,
	},
];

function priceRange(minPrice: number, maxPrice: number) {
	if (minPrice === maxPrice) return `$${minPrice}`;
	return `$${minPrice} - $${maxPrice}`;
}

function buildCategories(products: Product[]): CategorySummary[] {
	const merchandiseProducts =
		products.length >= 6 ? products : [...products, ...merchandiseFallbackProducts];

	return commerceShelves
		.map((shelf) => {
			const items = merchandiseProducts.filter(shelf.match);
			if (!items.length) return null;
			const prices = items.map((item) => item.price);
			const featured = [...items].sort((a, b) => b.rating - a.rating)[0];

			return {
				id: shelf.id,
				label: shelf.label,
				count: items.length,
				image: featured.image,
				minPrice: Math.min(...prices),
				maxPrice: Math.max(...prices),
				description: shelf.description,
				icon: shelf.icon,
				query: shelf.query,
			};
		})
		.filter((shelf): shelf is CategorySummary => Boolean(shelf));
}

function productsForCategory(products: Product[], category: CategorySummary | null) {
	if (!category) return [];
	const shelf = commerceShelves.find((item) => item.id === category.id);
	if (!shelf) return [];
	const merchandiseProducts =
		products.length >= 6 ? products : [...products, ...merchandiseFallbackProducts];
	return merchandiseProducts.filter(shelf.match);
}

function CategoryRailItem({
	item,
	active,
	onPress,
}: {
	item: CategorySummary;
	active: boolean;
	onPress: () => void;
}) {
	const { colors, mode, shadow } = useTheme();

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.railItem,
				{
					backgroundColor: active ? colors.surface : "transparent",
					opacity: pressed ? 0.68 : 1,
					...(active && mode === "light" ? shadow.pill : {}),
				},
			]}
			testID={`category-rail-${item.id}`}
			accessibilityRole="button"
			accessibilityState={{ selected: active }}
			accessibilityLabel={item.label}
		>
			<View
				style={[
					styles.railIcon,
					{
						backgroundColor: active ? colors.primarySubtle : colors.surfaceRaised,
					},
				]}
			>
				<Icon name={item.icon} size={18} color={active ? colors.primary : colors.textMuted} />
			</View>
			<Text
				variant="caption"
				color={active ? colors.text : colors.textMuted}
				numberOfLines={2}
				style={styles.railLabel}
			>
				{item.label}
			</Text>
		</Pressable>
	);
}

function ProductPreviewRow({ item, searchQuery }: { item: Product; searchQuery: string }) {
	const { colors, spacing } = useTheme();
	const haptics = useHaptics();

	return (
		<View style={styles.productShell}>
			<Pressable
				onPress={() => {
					haptics.feedback("selection");
					if (item.id.startsWith("merch-")) {
						router.push(
							searchQuery ? { pathname: "/search", params: { q: searchQuery } } : "/search",
						);
						return;
					}

					router.push({ pathname: "/product", params: { id: item.id } });
				}}
				style={({ pressed }) => [
					styles.productPressable,
					{
						opacity: pressed ? 0.72 : 1,
						transform: [{ scale: pressed ? 0.985 : 1 }],
					},
				]}
				testID={`category-product-${item.id}`}
				accessibilityRole="button"
				accessibilityLabel={item.name}
			>
				<Card variant="raised" border="subtle" padding="sm">
					<View style={[styles.productRow, { gap: spacing["sm"] }]}>
						<Image
							source={{ uri: item.image }}
							style={styles.productImage}
							contentFit="cover"
							cachePolicy="memory-disk"
							transition={140}
						/>
						<View style={styles.productCopy}>
							<Text variant="bodySmall" colorKey="text" numberOfLines={2}>
								{item.name}
							</Text>
							<Text variant="caption" colorKey="textMuted" numberOfLines={1}>
								{item.variant}
							</Text>
							<View style={styles.productMeta}>
								<Text variant="body" colorKey="text">
									${item.price}
								</Text>
								<View style={styles.rating}>
									<Icon name="Star" size={13} color={colors.warning} />
									<Text variant="caption" colorKey="textMuted">
										{item.rating.toFixed(1)}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</Card>
			</Pressable>
		</View>
	);
}

export default function Categories() {
	const { colors, spacing, mode, shadow } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const haptics = useHaptics();
	const { items, refreshing, refresh } = useProducts({ limit: 40 });
	const handleChromeScroll = useTabChromeScreen("Categories");
	const categories = useMemo(() => buildCategories(items), [items]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selectedCategory =
		categories.find((category) => category.id === selectedId) ?? categories[0] ?? null;
	const selectedProducts = useMemo(
		() => productsForCategory(items, selectedCategory),
		[items, selectedCategory],
	);

	useEffect(() => {
		if (!categories.length) {
			setSelectedId(null);
			return;
		}

		if (!selectedId || !categories.some((category) => category.id === selectedId)) {
			setSelectedId(categories[0].id);
		}
	}, [categories, selectedId]);

	const openSearch = () => {
		haptics.feedback("selection");
		router.push(
			selectedCategory?.query
				? { pathname: "/search", params: { q: selectedCategory.query } }
				: "/search",
		);
	};

	const selectCategory = (category: CategorySummary) => {
		haptics.feedback(category.id === selectedCategory?.id ? "selection" : "light");
		setSelectedId(category.id);
	};

	return (
		<Container topInset>
			<Screen>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 760, lg: 860 }}
					horizontalPadding={pagePadding}
					alignment="center"
					style={styles.container}
				>
					<View style={[styles.header, { gap: spacing["md"] }]}>
						<Animated.View entering={FadeInUp.duration(240)} style={styles.topHeroShell}>
							<Pressable
								onPress={openSearch}
								style={({ pressed }) => [
									styles.topHero,
									{
										opacity: pressed ? 0.82 : 1,
										backgroundColor: colors.surface,
										...(mode === "light" ? shadow.soft : {}),
									},
								]}
								testID="categories-hero"
								accessibilityRole="button"
								accessibilityLabel="Open category search"
							>
								<Image
									source={categoryHeroImage}
									style={StyleSheet.absoluteFill}
									contentFit="cover"
									cachePolicy="memory-disk"
									transition={180}
								/>
								<LinearGradient
									colors={[
										"rgba(255,255,255,0.12)",
										"rgba(255,255,255,0.48)",
										"rgba(255,255,255,0.94)",
									]}
									locations={[0, 0.5, 1]}
									style={StyleSheet.absoluteFill}
								/>
								<View style={styles.topHeroCopy}>
									<Pressable
										onPress={openSearch}
										style={({ pressed }) => [
											styles.topHeroSearchIcon,
											{
												backgroundColor: colors.surface,
												opacity: pressed ? 0.72 : 1,
												...(mode === "light" ? shadow.pill : {}),
											},
										]}
										testID="categories-search"
										accessibilityRole="button"
										accessibilityLabel="Search categories"
									>
										<Icon name="Search" size={20} color={colors.primary} />
									</Pressable>
									<View style={styles.topHeroTopRow}>
										<Text variant="display" colorKey="text" style={styles.heroTitle}>
											Categories
										</Text>
									</View>
									<Text
										variant="bodySmall"
										colorKey="textMuted"
										numberOfLines={2}
										style={styles.heroSubtitle}
									>
										Shop by shelf, then jump straight into the products that fit.
									</Text>
								</View>
							</Pressable>
						</Animated.View>
					</View>

					{selectedCategory ? (
						<View style={[styles.browser, { gap: spacing["sm"] }]}>
							<View
								style={[
									styles.rail,
									{
										backgroundColor: colors.surfaceRaised,
										...(mode === "light" ? shadow.soft : {}),
									},
								]}
							>
								<ScrollView
									showsVerticalScrollIndicator={false}
									contentContainerStyle={[styles.railContent, { gap: spacing["sm"] }]}
								>
									{categories.map((category) => (
										<CategoryRailItem
											key={category.id}
											item={category}
											active={category.id === selectedCategory.id}
											onPress={() => selectCategory(category)}
										/>
									))}
								</ScrollView>
								<View
									pointerEvents="none"
									style={[
										styles.railFade,
										styles.railFadeTop,
										{ backgroundColor: colors.surfaceRaised },
									]}
								/>
								<View
									pointerEvents="none"
									style={[
										styles.railFade,
										styles.railFadeBottom,
										{ backgroundColor: colors.surfaceRaised },
									]}
								/>
							</View>

							<View style={styles.detailColumn}>
								<ScrollView
									style={styles.detailScroll}
									showsVerticalScrollIndicator={false}
									contentInsetAdjustmentBehavior="automatic"
									onScroll={handleChromeScroll}
									scrollEventThrottle={16}
									refreshControl={
										<RefreshControl
											refreshing={refreshing}
											onRefresh={refresh}
											tintColor={colors.primary}
											colors={[colors.primary]}
										/>
									}
									contentContainerStyle={{
										gap: spacing["md"],
										paddingBottom: 196,
									}}
								>
									<View style={styles.featureShell}>
										<Card
											variant="raised"
											border="subtle"
											padding="none"
											style={styles.featureCard}
										>
											<View style={styles.featureImageFrame}>
												<Image
													source={{ uri: selectedCategory.image }}
													style={styles.featureImage}
													contentFit="cover"
													cachePolicy="memory-disk"
													transition={180}
												/>
												<View style={[styles.featureWash, { backgroundColor: colors.surface }]} />
											</View>
											<View style={[styles.featureCopy, { gap: spacing["sm"] }]}>
												<View style={styles.featureTopRow}>
													<Tag variant="active">{selectedCategory.label}</Tag>
													<Tag variant="default">
														{`${selectedCategory.count} item${selectedCategory.count === 1 ? "" : "s"}`}
													</Tag>
												</View>
												<Text variant="heading" colorKey="text" numberOfLines={2}>
													{selectedCategory.label}
												</Text>
												<Text variant="bodySmall" colorKey="textMuted" numberOfLines={3}>
													{selectedCategory.description}
												</Text>
												<View style={styles.featureBottomRow}>
													<Text variant="body" colorKey="text">
														{priceRange(selectedCategory.minPrice, selectedCategory.maxPrice)}
													</Text>
													<Button
														variant="secondary"
														onPress={openSearch}
														testID="category-view-all"
													>
														View all
													</Button>
												</View>
											</View>
										</Card>
									</View>

									<View style={styles.sectionHeader}>
										<View style={styles.sectionCopy}>
											<Text variant="heading" colorKey="text">
												Featured picks
											</Text>
											<Text variant="caption" colorKey="textMuted">
												Sorted by the current shelf.
											</Text>
										</View>
									</View>

									<View style={{ gap: spacing["sm"] }}>
										{selectedProducts.map((product) => (
											<ProductPreviewRow
												key={product.id}
												item={product}
												searchQuery={selectedCategory.query || selectedCategory.label}
											/>
										))}
									</View>
								</ScrollView>
							</View>
						</View>
					) : (
						<Card variant="raised" border="subtle" padding="lg" style={styles.emptyCard}>
							<Icon name="PackageSearch" size={34} color={colors.textMuted} />
							<Text variant="heading" colorKey="text">
								Catalog is refreshing
							</Text>
							<Text variant="bodySmall" colorKey="textMuted" style={styles.center}>
								Pull to refresh or try search while the storefront syncs.
							</Text>
						</Card>
					)}
				</ResponsiveContainer>
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingTop: 0,
		paddingBottom: 16,
	},
	topHeroShell: {
		overflow: "visible",
	},
	topHero: {
		height: 196,
		borderRadius: 32,
		overflow: "hidden",
		justifyContent: "flex-end",
		padding: 18,
	},
	topHeroCopy: {
		gap: 8,
		alignItems: "flex-start",
		position: "relative",
	},
	topHeroTopRow: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		paddingRight: 70,
	},
	heroTitle: {
		flex: 1,
		minWidth: 0,
	},
	topHeroSearchIcon: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 52,
		height: 52,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2,
	},
	heroSubtitle: {
		maxWidth: 380,
	},
	browser: {
		flex: 1,
		flexDirection: "row",
		minHeight: 0,
	},
	rail: {
		width: 104,
		maxHeight: 458,
		borderRadius: 28,
		overflow: "hidden",
		marginTop: 10,
		marginBottom: 112,
	},
	railContent: {
		padding: 8,
		paddingTop: 18,
		paddingBottom: 36,
	},
	railFade: {
		position: "absolute",
		left: 0,
		right: 0,
		height: 28,
		opacity: 0.82,
	},
	railFadeTop: {
		top: 0,
	},
	railFadeBottom: {
		bottom: 0,
	},
	railItem: {
		position: "relative",
		minHeight: 96,
		borderRadius: 24,
		paddingHorizontal: 8,
		paddingVertical: 10,
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
	},
	railIcon: {
		width: 40,
		height: 40,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	railLabel: {
		textAlign: "center",
		textTransform: "none",
	},
	detailScroll: {
		flex: 1,
		minWidth: 0,
	},
	detailColumn: {
		flex: 1,
		minWidth: 0,
		alignSelf: "stretch",
	},
	featureCard: {
		overflow: "hidden",
	},
	featureShell: {
		overflow: "visible",
	},
	featureImageFrame: {
		height: 132,
		overflow: "hidden",
	},
	featureImage: {
		width: "100%",
		height: "100%",
	},
	featureWash: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: 54,
		opacity: 0.82,
	},
	featureCopy: {
		padding: 16,
		paddingTop: 12,
	},
	featureTopRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
	},
	featureBottomRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	sectionCopy: {
		gap: 3,
	},
	productShell: {
		overflow: "visible",
	},
	productPressable: {
		overflow: "visible",
	},
	productRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	productImage: {
		width: 72,
		height: 72,
		borderRadius: 18,
	},
	productCopy: {
		flex: 1,
		minWidth: 0,
		gap: 5,
	},
	productMeta: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	rating: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	emptyCard: {
		alignItems: "center",
		gap: 10,
	},
	center: {
		textAlign: "center",
	},
});
