import { useEffect, useMemo, useRef, useState } from "react";
import {
	NativeScrollEvent,
	NativeSyntheticEvent,
	Platform,
	Pressable,
	ScrollView,
	StatusBar as NativeStatusBar,
	StyleSheet,
	View,
	useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Card,
	Text,
	Button,
	Tag,
	Icon,
	Image,
	useHaptics,
	useTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";
import { Container } from "@/components/container";
import { DataList } from "@/components/data-list";
import { useTabChromeScreen } from "@/components/tab-chrome-context";
import { catalogAssets } from "@/lib/catalog-assets";
import { useCart, useProducts, type Product } from "@/lib/data";

const winterHeroImage = require("../../assets/commerce/osuki-winter-hero.jpg");
const giftHeroImage = require("../../assets/commerce/osuki-gift-bundle.jpg");
const deliveryHeroImage = require("../../assets/commerce/osuki-checkout-delivery.jpg");

const heroSlides = [
	{
		id: "market",
		title: "Osuki Market",
		subtitle: "Curated gear, fast checkout, and clean order tracking.",
		cta: "SHOP BESTSELLERS",
		image: winterHeroImage,
		query: "snowboard",
	},
	{
		id: "gifts",
		title: "Gift-ready edits",
		subtitle: "Small upgrades, soft essentials, and easy add-ons.",
		cta: "SHOP GIFTS",
		image: giftHeroImage,
		query: "gift",
	},
	{
		id: "delivery",
		title: "Ready to ship",
		subtitle: "Popular picks with checkout, delivery, and returns built in.",
		cta: "SHOP FAST SHIP",
		image: deliveryHeroImage,
		query: "available",
	},
] as const;

type ProductLayout = "single" | "grid";
type ProductListEntry =
	| { type: "single"; id: string; item: Product }
	| { type: "pair"; id: string; items: Product[] };

const homeFallbackProducts: Product[] = [
	{
		id: "headphones",
		name: "Wireless Noise-Canceling Headphones",
		description: "Premium over-ear headphones with adaptive noise cancellation.",
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
		id: "workspace",
		name: "Desk Setup Kit",
		description: "A clean desk set with focused storage and charging.",
		image: catalogAssets.workspace,
		price: 129,
		originalPrice: 159,
		variant: "Studio Set",
		stock: 9,
		rating: 4.7,
		reviews: 72,
		category: "Workspace",
	},
	{
		id: "dock",
		name: "Charging Dock",
		description: "Weighted charging dock with clean cable routing.",
		image: catalogAssets.chargingDock,
		price: 59,
		variant: "Desk Black",
		stock: 31,
		rating: 4.6,
		reviews: 42,
		category: "Accessories",
	},
	{
		id: "speaker",
		name: "Portable Speaker",
		description: "Compact speaker with warm bass and USB-C charging.",
		image: catalogAssets.speaker,
		price: 89,
		variant: "Soft White",
		stock: 24,
		rating: 4.5,
		reviews: 74,
		category: "Audio",
	},
];

function openHomeProduct(item: Product) {
	router.push({ pathname: "/product", params: { id: item.id } });
}

function featuredDisplayName(name: string) {
	const normalized = name.toLowerCase();

	if (normalized.includes("gift card")) return "Gift Card";
	if (normalized.includes("headphone")) return "Headphones";
	if (normalized.includes("workspace") || normalized.includes("desk setup")) return "Workspace Kit";
	if (normalized.includes("charging dock") || normalized.includes("dock")) return "Charging Dock";
	if (normalized.includes("minimal") && normalized.includes("snowboard"))
		return "Minimal Snowboard";
	if (normalized.includes("snowboard")) return "Inventory Snowboard";
	if (normalized.includes("speaker")) return "Portable Speaker";

	return name
		.replace(/^The\s+/i, "")
		.replace(/\s+Snowboard:?/i, " Snowboard")
		.replace(/\s+Noise-Canceling\s+/i, " NC ")
		.trim();
}

function ProductRow({ item, index }: { item: Product; index: number }) {
	const { colors, spacing } = useTheme();
	const haptics = useHaptics();

	return (
		<Animated.View
			entering={FadeInUp.duration(220).delay(Math.min(index, 8) * 28)}
			style={[styles.productRowShell, index === 0 ? styles.firstProductRow : undefined]}
		>
			<Pressable
				onPress={() => {
					haptics.feedback("selection");
					openHomeProduct(item);
				}}
				style={({ pressed }) => [styles.productPressable, { opacity: pressed ? 0.72 : 1 }]}
				testID={`home-product-${item.id}`}
			>
				<Card variant="raised" border="subtle" padding="md">
					<View style={[styles.productRow, { gap: spacing["md"] }]}>
						<Image
							source={{ uri: item.image }}
							style={styles.productImage}
							contentFit="cover"
							cachePolicy="memory-disk"
							transition={160}
						/>
						<View style={styles.productInfo}>
							<View style={styles.productTitleRow}>
								<Text variant="body" colorKey="text" numberOfLines={2} style={styles.productName}>
									{item.name}
								</Text>
								<Tag variant="default">{item.category}</Tag>
							</View>
							<Text variant="caption" colorKey="textMuted" numberOfLines={2}>
								{item.description}
							</Text>
							<View style={styles.productMeta}>
								<Text variant="body" colorKey="text">
									${item.price}
								</Text>
								<View style={styles.rating}>
									<Icon name="Star" size={14} color={colors.warning} />
									<Text variant="caption" colorKey="textMuted">
										{item.rating.toFixed(1)}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</Card>
			</Pressable>
		</Animated.View>
	);
}

function ProductTile({ item, index }: { item: Product; index: number }) {
	const { colors, spacing } = useTheme();
	const haptics = useHaptics();

	return (
		<Animated.View
			entering={FadeInUp.duration(220).delay(Math.min(index, 8) * 24)}
			style={styles.tileShell}
		>
			<Pressable
				onPress={() => {
					haptics.feedback("selection");
					openHomeProduct(item);
				}}
				style={({ pressed }) => [styles.productPressable, { opacity: pressed ? 0.72 : 1 }]}
				testID={`home-product-tile-${item.id}`}
			>
				<Card
					variant="raised"
					border="subtle"
					padding="sm"
					style={[styles.productTile, { gap: spacing["sm"] }]}
				>
					<Image
						source={{ uri: item.image }}
						style={styles.tileImage}
						contentFit="cover"
						cachePolicy="memory-disk"
						transition={160}
					/>
					<View style={styles.tileInfo}>
						<Text variant="bodySmall" colorKey="text" numberOfLines={2} style={styles.tileTitle}>
							{item.name}
						</Text>
						<Text variant="caption" colorKey="textMuted" numberOfLines={1}>
							${item.price}
						</Text>
						<View style={styles.rating}>
							<Icon name="Star" size={12} color={colors.warning} />
							<Text variant="caption" colorKey="textMuted">
								{item.rating.toFixed(1)}
							</Text>
						</View>
					</View>
				</Card>
			</Pressable>
		</Animated.View>
	);
}

function ProductPairRow({ items, rowIndex }: { items: Product[]; rowIndex: number }) {
	const { spacing } = useTheme();

	return (
		<View style={[styles.productPairRow, { gap: spacing["md"] }]}>
			{items.map((item, index) => (
				<ProductTile key={item.id} item={item} index={rowIndex * 2 + index} />
			))}
			{items.length === 1 ? <View style={styles.tileShell} /> : null}
		</View>
	);
}

function LayoutToggle({
	layout,
	onLayoutChange,
}: {
	layout: ProductLayout;
	onLayoutChange: (layout: ProductLayout) => void;
}) {
	const { colors, mode, shadow } = useTheme();
	const haptics = useHaptics();

	return (
		<View style={[styles.layoutToggle, { backgroundColor: colors.surfaceRaised }]}>
			{(["single", "grid"] as const).map((value) => {
				const active = layout === value;

				return (
					<Pressable
						key={value}
						onPress={() => {
							haptics.feedback(layout === value ? "selection" : "light");
							onLayoutChange(value);
						}}
						testID={`home-layout-${value}`}
						accessibilityRole="button"
						accessibilityLabel={
							value === "single" ? "Show one product per row" : "Show two products per row"
						}
						accessibilityState={{ selected: active }}
						style={({ pressed }) => [
							styles.layoutButton,
							{
								backgroundColor: active ? colors.surface : "transparent",
								opacity: pressed ? 0.72 : 1,
								...(active && mode === "light" ? shadow.pill : {}),
							},
						]}
					>
						<Icon
							name={value === "single" ? "List" : "Grid2X2"}
							size={17}
							color={active ? colors.primary : colors.textMuted}
						/>
					</Pressable>
				);
			})}
		</View>
	);
}

function HomeHeader({
	featuredProduct,
	featuredProducts,
	layout,
	onLayoutChange,
}: {
	featuredProduct?: Product;
	featuredProducts: Product[];
	layout: ProductLayout;
	onLayoutChange: (layout: ProductLayout) => void;
}) {
	const { colors, spacing, mode, shadow } = useTheme();
	const haptics = useHaptics();
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const { items } = useCart();
	const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
	const heroScrollRef = useRef<ScrollView>(null);
	const [heroIndex, setHeroIndex] = useState(0);
	const [featuredIndex, setFeaturedIndex] = useState(0);
	const searchProgress = useSharedValue(0);
	const bleed = width >= 1024 ? 32 : width >= 768 ? 24 : 16;
	const heroPageWidth = width;
	const activeHero = heroSlides[heroIndex % heroSlides.length];
	const rotatingProduct = featuredProducts[featuredIndex % Math.max(featuredProducts.length, 1)];
	const sideProducts = featuredProducts
		.filter((item) => item.id !== rotatingProduct?.id)
		.slice(0, 2);
	const rotatingProductName = rotatingProduct ? featuredDisplayName(rotatingProduct.name) : "";

	useEffect(() => {
		if (featuredProducts.length < 2) return;
		const timer = setInterval(() => {
			setFeaturedIndex((current) => (current + 1) % featuredProducts.length);
		}, 4200);

		return () => clearInterval(timer);
	}, [featuredProducts.length]);

	useEffect(() => {
		const timer = setInterval(() => {
			setHeroIndex((current) => {
				const next = (current + 1) % heroSlides.length;
				heroScrollRef.current?.scrollTo({ x: next * heroPageWidth, animated: true });
				return next;
			});
		}, 5200);

		return () => clearInterval(timer);
	}, [heroPageWidth]);

	const searchAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: 1 + searchProgress.value * 0.045 },
			{ translateX: -searchProgress.value * 14 },
		],
	}));

	const openSearch = () => {
		haptics.feedback("selection");
		searchProgress.value = withTiming(1, { duration: 90 });
		router.push("/search");
		requestAnimationFrame(() => {
			searchProgress.value = withTiming(0, { duration: 120 });
		});
	};

	const openHero = (slide = activeHero) => {
		haptics.feedback("selection");
		const heroProduct = featuredProducts[0] ?? featuredProduct;
		if (slide.id === "market" && heroProduct) {
			openHomeProduct(heroProduct);
			return;
		}

		router.push({ pathname: "/search", params: { q: slide.query } });
	};

	const handleHeroMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const nextIndex = Math.round(event.nativeEvent.contentOffset.x / heroPageWidth);
		setHeroIndex(Math.max(0, Math.min(heroSlides.length - 1, nextIndex)));
	};

	return (
		<View style={{ gap: spacing["xl"] }}>
			<Animated.View entering={FadeInUp.duration(260)} style={styles.hero}>
				<View
					style={[
						styles.heroBanner,
						{
							backgroundColor: colors.surface,
							...(mode === "light" ? shadow.soft : {}),
						},
					]}
				>
					<ScrollView
						ref={heroScrollRef}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						bounces={false}
						decelerationRate="fast"
						scrollEventThrottle={16}
						onMomentumScrollEnd={handleHeroMomentumEnd}
						testID="home-hero-carousel"
					>
						{heroSlides.map((slide) => (
							<Pressable
								key={slide.id}
								onPress={() => openHero(slide)}
								style={({ pressed }) => [
									styles.heroSlide,
									{
										width: heroPageWidth,
										paddingTop: insets.top + 16,
										paddingHorizontal: bleed + 18,
										opacity: pressed ? 0.78 : 1,
									},
								]}
								testID={`home-hero-slide-${slide.id}`}
							>
								<Image
									source={slide.image}
									style={StyleSheet.absoluteFill}
									contentFit="cover"
									cachePolicy="memory-disk"
									transition={220}
								/>
								<LinearGradient
									colors={[
										"rgba(255,255,255,0.08)",
										"rgba(255,255,255,0.36)",
										"rgba(255,255,255,0.92)",
									]}
									locations={[0, 0.42, 1]}
									style={StyleSheet.absoluteFill}
								/>
								<LinearGradient
									colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.92)"]}
									locations={[0, 1]}
									style={styles.heroBottomWash}
								/>
								<View style={styles.heroTopBar}>
									<View />
									<Animated.View style={searchAnimatedStyle}>
										<Pressable
											onPress={openSearch}
											style={({ pressed }) => [
												styles.searchPill,
												{
													backgroundColor: colors.surface,
													opacity: pressed ? 0.72 : 1,
													...(mode === "light" ? shadow.pill : {}),
												},
											]}
											testID="home-search"
											accessibilityRole="button"
											accessibilityLabel="Search products"
										>
											<Icon name="Search" size={19} color={colors.primary} />
											<Text variant="bodySmall" colorKey="textMuted" style={styles.searchText}>
												Search
											</Text>
										</Pressable>
									</Animated.View>
								</View>
								<View style={styles.heroContent}>
									<Text variant="display" colorKey="text" style={styles.heroTitle}>
										{slide.title}
									</Text>
									<Text
										variant="bodySmall"
										colorKey="textMuted"
										numberOfLines={2}
										style={styles.heroSubtitle}
									>
										{slide.subtitle}
									</Text>
									<View style={[styles.heroActions, { gap: spacing["sm"] }]}>
										<Button
											variant="primary"
											onPress={() => openHero(slide)}
											testID="home-shop-featured"
										>
											{slide.cta}
										</Button>
										<Button variant="secondary" onPress={() => router.push("/bag")}>
											{`CART (${cartCount})`}
										</Button>
									</View>
								</View>
							</Pressable>
						))}
					</ScrollView>
					<View style={styles.heroDots}>
						{heroSlides.map((slide, index) => (
							<View
								key={slide.id}
								style={[
									styles.heroDot,
									{
										backgroundColor:
											index === heroIndex % heroSlides.length
												? colors.primary
												: colors.textDisabled,
									},
								]}
							/>
						))}
					</View>
				</View>
			</Animated.View>

			{rotatingProduct ? (
				<View style={styles.featuredSection}>
					<View style={[styles.featuredHeader, { paddingHorizontal: bleed }]}>
						<View style={styles.sectionTitle}>
							<Text variant="heading" colorKey="text">
								Featured picks
							</Text>
							<Text variant="caption" colorKey="textMuted">
								Best sellers and giftable edits.
							</Text>
						</View>
					</View>
					<View style={[styles.featuredGrid, { gap: spacing["md"], paddingHorizontal: bleed }]}>
						<Pressable
							onPress={() => {
								haptics.feedback("selection");
								openHomeProduct(rotatingProduct);
							}}
							style={({ pressed }) => [
								styles.featuredMainPressable,
								{ opacity: pressed ? 0.78 : 1 },
							]}
							testID="home-featured-main"
						>
							<Card variant="raised" border="subtle" padding="none" style={styles.featuredMainCard}>
								<Image
									source={{ uri: rotatingProduct.image }}
									style={styles.featuredMainImage}
									contentFit="contain"
									contentPosition="center"
									cachePolicy="memory-disk"
									transition={180}
								/>
								<LinearGradient
									colors={[
										"rgba(255,255,255,0)",
										"rgba(255,255,255,0.18)",
										"rgba(255,255,255,0.9)",
									]}
									locations={[0, 0.52, 1]}
									style={styles.featuredMainWash}
								/>
								<View style={styles.featuredMainCopy}>
									<View style={styles.featuredCaptionText}>
										<Text variant="bodySmall" colorKey="text" numberOfLines={1}>
											{rotatingProductName}
										</Text>
									</View>
									<Icon name="ChevronRight" size={18} color={colors.textMuted} />
								</View>
							</Card>
						</Pressable>
						<View style={[styles.featuredSideColumn, { gap: spacing["md"] }]}>
							{sideProducts.map((product) => (
								<Pressable
									key={product.id}
									onPress={() => {
										haptics.feedback("selection");
										openHomeProduct(product);
									}}
									style={({ pressed }) => [
										styles.featuredSidePressable,
										{ opacity: pressed ? 0.78 : 1 },
									]}
									testID={`home-featured-side-${product.id}`}
								>
									<Card
										variant="raised"
										border="subtle"
										padding="none"
										style={styles.featuredSideCard}
									>
										<Image
											source={{ uri: product.image }}
											style={styles.featuredSideImage}
											contentFit="contain"
											contentPosition="center"
											cachePolicy="memory-disk"
											transition={160}
										/>
										<LinearGradient
											colors={[
												"rgba(255,255,255,0)",
												"rgba(255,255,255,0.18)",
												"rgba(255,255,255,0.9)",
											]}
											locations={[0, 0.58, 1]}
											style={styles.featuredSideWash}
										/>
										<View style={styles.featuredSideCopy}>
											<Text variant="caption" colorKey="text" numberOfLines={1}>
												{featuredDisplayName(product.name)}
											</Text>
										</View>
									</Card>
								</Pressable>
							))}
						</View>
					</View>
				</View>
			) : null}

			<View style={[styles.sectionHeader, { paddingHorizontal: bleed }]}>
				<View style={styles.sectionTitle}>
					<Text variant="heading" colorKey="text">
						Latest
					</Text>
					<Text variant="caption" colorKey="textMuted">
						Fresh arrivals ready for cart and checkout.
					</Text>
				</View>
				<LayoutToggle layout={layout} onLayoutChange={onLayoutChange} />
			</View>
		</View>
	);
}

export default function Home() {
	const { items, refreshing, loadingMore, hasMore, refresh, loadMore } = useProducts({ limit: 6 });
	const [layout, setLayout] = useState<ProductLayout>("single");
	const handleChromeScroll = useTabChromeScreen("Osuki Market");
	const displayItems = items.length > 0 ? items : homeFallbackProducts;
	const featuredProducts = homeFallbackProducts.slice(0, 3);

	useEffect(() => {
		if (Platform.OS !== "android") {
			return;
		}

		NativeStatusBar.setTranslucent(true);
		NativeStatusBar.setBackgroundColor("transparent");
	}, []);
	const listData = useMemo<ProductListEntry[]>(() => {
		if (layout === "single") {
			return displayItems.map((item) => ({ type: "single", id: item.id, item }));
		}

		const rows: ProductListEntry[] = [];
		for (let index = 0; index < displayItems.length; index += 2) {
			const pair = displayItems.slice(index, index + 2);
			rows.push({ type: "pair", id: pair.map((item) => item.id).join(":"), items: pair });
		}
		return rows;
	}, [displayItems, layout]);

	return (
		<>
			<StatusBar style="dark" />
			<Container horizontalInsets={false}>
				<Screen>
					<ResponsiveContainer widthMode="full" horizontalPadding={0} style={styles.container}>
						<DataList
							testID="home-product-list"
							data={listData}
							keyExtractor={(item) => item.id}
							renderItem={({ item, index }) =>
								item.type === "single" ? (
									<ProductRow item={item.item} index={index} />
								) : (
									<ProductPairRow items={item.items} rowIndex={index} />
								)
							}
							refreshing={refreshing}
							loadingMore={loadingMore}
							hasMore={hasMore}
							onRefresh={refresh}
							onLoadMore={loadMore}
							onScroll={handleChromeScroll}
							contentInsetAdjustmentBehavior="never"
							ListHeaderComponent={
								<HomeHeader
									featuredProduct={displayItems[0]}
									featuredProducts={featuredProducts}
									layout={layout}
									onLayoutChange={setLayout}
								/>
							}
							contentContainerStyle={{
								paddingTop: 0,
								paddingBottom: Platform.OS === "ios" ? 132 : 172,
							}}
							emptyTitle="No products"
							emptyDescription="The catalog is being refreshed. Please check back shortly."
						/>
					</ResponsiveContainer>
				</Screen>
			</Container>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	hero: {
		overflow: "visible",
	},
	heroBanner: {
		minHeight: 330,
		borderBottomLeftRadius: 38,
		borderBottomRightRadius: 38,
		overflow: "hidden",
	},
	heroSlide: {
		minHeight: 330,
		paddingBottom: 26,
		justifyContent: "flex-start",
	},
	heroBottomWash: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: 122,
	},
	heroTopBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
	},
	heroContent: {
		gap: 10,
		maxWidth: 520,
		alignItems: "flex-start",
		marginTop: 42,
	},
	heroTitle: {
		fontSize: 44,
		lineHeight: 49,
		letterSpacing: 0,
	},
	heroSubtitle: {
		maxWidth: 360,
	},
	searchPill: {
		width: 168,
		minHeight: 48,
		borderRadius: 999,
		paddingHorizontal: 18,
		flexDirection: "row",
		alignItems: "center",
		gap: 7,
	},
	searchText: {
		textTransform: "none",
	},
	heroActions: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	heroDots: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 7,
	},
	heroDot: {
		width: 6,
		height: 6,
		borderRadius: 999,
	},
	featuredSection: {
		gap: 10,
		marginTop: -18,
	},
	featuredHeader: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		gap: 12,
		minHeight: 56,
	},
	featuredGrid: {
		height: 196,
		flexDirection: "row",
		alignItems: "stretch",
	},
	featuredMainPressable: {
		flex: 1.62,
		minWidth: 0,
	},
	featuredMainCard: {
		height: "100%",
		overflow: "hidden",
	},
	featuredMainImage: {
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(250,250,251,0.72)",
	},
	featuredMainWash: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: 50,
	},
	featuredMainCopy: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		minHeight: 42,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
		paddingHorizontal: 16,
		paddingBottom: 12,
		paddingTop: 9,
		backgroundColor: "rgba(255,255,255,0.18)",
	},
	featuredCaptionText: {
		flex: 1,
		minWidth: 0,
		gap: 1,
	},
	featuredSideColumn: {
		flex: 1,
		minWidth: 0,
	},
	featuredSidePressable: {
		flex: 1,
		minWidth: 0,
	},
	featuredSideCard: {
		height: "100%",
		overflow: "hidden",
	},
	featuredSideImage: {
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(250,250,251,0.72)",
	},
	featuredSideWash: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: 38,
	},
	featuredSideCopy: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		minHeight: 32,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 12,
		paddingTop: 7,
		paddingBottom: 8,
		backgroundColor: "rgba(255,255,255,0.16)",
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		gap: 12,
		minHeight: 58,
		paddingBottom: 8,
	},
	sectionTitle: {
		flex: 1,
		minWidth: 0,
		gap: 3,
	},
	layoutToggle: {
		minHeight: 44,
		borderRadius: 999,
		padding: 4,
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	layoutButton: {
		width: 42,
		height: 36,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	productRow: {
		flexDirection: "row",
	},
	productRowShell: {
		overflow: "visible",
		paddingHorizontal: 16,
	},
	productPressable: {
		overflow: "visible",
	},
	firstProductRow: {
		marginTop: 18,
	},
	productImage: {
		width: 92,
		height: 92,
		borderRadius: 10,
	},
	productPairRow: {
		flexDirection: "row",
		alignItems: "stretch",
		paddingHorizontal: 16,
	},
	tileShell: {
		flex: 1,
		minWidth: 0,
		overflow: "visible",
	},
	productTile: {
		minHeight: 230,
	},
	tileImage: {
		width: "100%",
		aspectRatio: 1,
		borderRadius: 18,
	},
	tileInfo: {
		gap: 5,
	},
	tileTitle: {
		minHeight: 42,
	},
	productInfo: {
		flex: 1,
		minWidth: 0,
		gap: 8,
	},
	productTitleRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: 10,
		minWidth: 0,
	},
	productName: {
		flex: 1,
		minWidth: 0,
	},
	productMeta: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	rating: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
});
