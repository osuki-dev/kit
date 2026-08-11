import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Card,
	Text,
	Button,
	Tag,
	Icon,
	Image,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	type IconName,
} from "@osuki-dev/ui";
import { useI18n } from "../i18n";

export interface ProductSpec {
	name: string;
	value: string;
}

export interface ProductVariant {
	id: string;
	name: string;
	available: boolean;
	selected?: boolean;
}

export interface ProductRecommendation {
	id: string;
	name: string;
	price: number;
	image?: string;
	onPress?: () => void;
}

export interface ProductScreenConfig {
	/** Product name */
	name: string;
	/** Product description */
	description?: string;
	/** Main product images */
	images: string[];
	/** Current price */
	price: number;
	/** Original price (if on sale) */
	originalPrice?: number;
	/** Currency symbol */
	currency?: string;
	/** Product specifications */
	specs?: ProductSpec[];
	/** Product variants (size, color, etc.) */
	variants?: ProductVariant[];
	/** Product tags */
	tags?: string[];
	/** Stock status */
	inStock?: boolean;
	/** Stock quantity */
	stockCount?: number;
	/** Rating (1-5) */
	rating?: number;
	/** Number of reviews */
	reviewCount?: number;
	/** Recommendations */
	recommendations?: ProductRecommendation[];
	/** Trust and conversion points shown near product decision areas */
	sellingPoints?: Array<{
		icon: IconName;
		title: string;
		description: string;
	}>;
	/** Primary CTA */
	primaryAction: {
		label: string;
		onPress: () => void;
		disabled?: boolean;
		testID?: string;
	};
	/** Secondary actions */
	secondaryActions?: Array<{
		icon: IconName;
		label: string;
		onPress: () => void;
	}>;
}

export interface ProductScreenProps {
	config: ProductScreenConfig;
	/** Loading state */
	isLoading?: boolean;
	/** Selected image index */
	selectedImageIndex?: number;
	/** Image selection handler */
	onImageSelect?: (index: number) => void;
	/** Variant selection handler */
	onVariantSelect?: (variantId: string) => void;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		header?: ViewStyle;
		imageSection?: ViewStyle;
		infoSection?: ViewStyle;
		specsSection?: ViewStyle;
		variantsSection?: ViewStyle;
		purchaseSection?: ViewStyle;
		recommendationsSection?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 176,
	},
	imageContainer: {
		aspectRatio: 1,
		width: "100%",
		backgroundColor: "transparent",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	imageFallback: {
		width: "100%",
		height: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	thumbnailContainer: {
		flexDirection: "row",
		gap: 8,
		marginTop: 12,
	},
	thumbnail: {
		width: 64,
		height: 64,
		borderRadius: 16,
	},
	infoHeader: {
		gap: 8,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 8,
	},
	price: {
		fontSize: 24,
	},
	originalPrice: {
		textDecorationLine: "line-through",
	},
	ratingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	specsGrid: {
		gap: 8,
	},
	specRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	variantRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 8,
	},
	variantChip: {
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderRadius: 999,
	},
	purchaseContainer: {
		flexDirection: "row",
		gap: 12,
		alignItems: "center",
	},
	stickyPrice: {
		minWidth: 82,
		gap: 2,
	},
	primaryButton: {
		flex: 1,
		minHeight: 52,
	},
	secondaryButtons: {
		flexDirection: "row",
		gap: 8,
	},
	secondaryButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
	},
	sellingPointsGrid: {
		gap: 10,
		marginTop: 16,
	},
	sellingPointRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	sellingPointIcon: {
		width: 34,
		height: 34,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	stickyActions: {
		position: "absolute",
		left: 0,
		right: 0,
	},
	stickyActionsBackground: {
		paddingVertical: 8,
	},
	recommendationsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	recommendationCard: {
		flex: 1,
		minWidth: 140,
		maxWidth: "50%",
	},
	recommendationImage: {
		aspectRatio: 1,
		width: "100%",
		borderRadius: 18,
	},
	recommendationImageFallback: {
		aspectRatio: 1,
		width: "100%",
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	recommendationName: {
		marginTop: 8,
	},
	recommendationPrice: {
		marginTop: 4,
	},
});

/**
 * Product screen template
 *
 * Features:
 * - Image gallery with thumbnails
 * - Price display with sale support
 * - Rating and reviews
 * - Product specifications
 * - Variant selection
 * - Stock status
 * - Recommendations
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <ProductScreen
 *   config={{
 *     name: "Wireless Headphones",
 *     images: ["url1", "url2"],
 *     price: 299,
 *     originalPrice: 399,
 *     rating: 4.5,
 *     reviewCount: 128,
 *     inStock: true,
 *     tags: ["NEW", "BESTSELLER"],
 *     primaryAction: { label: "ADD TO CART", onPress: () => {} },
 *   }}
 * />
 * ```
 */
export function ProductScreen({
	config,
	selectedImageIndex = 0,
	onImageSelect,
	onVariantSelect,
	styleOverrides,
}: ProductScreenProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const insets = useSafeAreaInsets();
	const { t } = useI18n();

	const {
		name,
		description,
		images,
		price,
		originalPrice,
		currency = "$",
		specs,
		variants,
		tags,
		inStock = true,
		stockCount,
		rating,
		reviewCount,
		recommendations,
		sellingPoints,
		primaryAction,
		secondaryActions,
	} = config;

	const hasDiscount = originalPrice && originalPrice > price;
	const discountPercent = hasDiscount
		? Math.round(((originalPrice - price) / originalPrice) * 100)
		: 0;
	const visibleImages = images.filter(Boolean);
	const currentImage = visibleImages[selectedImageIndex] ?? visibleImages[0];
	const stockLabel = inStock
		? stockCount
			? t("ecommerce.inStockCount", { count: stockCount })
			: t("ecommerce.inStock")
		: t("ecommerce.outOfStock");

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container]}>
			<ScrollView
				style={staticStyles.scrollView}
				contentContainerStyle={[
					staticStyles.scrollContent,
					{ paddingBottom: Math.max(176, insets.bottom + 164) },
				]}
				showsVerticalScrollIndicator={false}
			>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					{/* Image Section */}
					<View style={[{ marginTop: spacing["md"] }, styleOverrides?.imageSection || {}]}>
						<Card variant="raised" border="subtle" style={staticStyles.imageContainer}>
							{currentImage ? (
								<Image
									source={{ uri: currentImage }}
									style={staticStyles.image}
									contentFit="cover"
									cachePolicy="memory-disk"
									transition={180}
								/>
							) : (
								<View
									style={[staticStyles.imageFallback, { backgroundColor: colors.surfaceRaised }]}
								>
									<Icon name="Package" size={48} color={colors.textMuted} />
								</View>
							)}
						</Card>

						{/* Thumbnails */}
						{visibleImages.length > 1 && (
							<View style={staticStyles.thumbnailContainer}>
								{visibleImages.map((img, index) => (
									<TouchableOpacity key={index} onPress={() => onImageSelect?.(index)}>
										<Image
											source={{ uri: img }}
											style={[
												staticStyles.thumbnail,
												{
													opacity: index === selectedImageIndex ? 1 : 0.72,
												},
											]}
											contentFit="cover"
											cachePolicy="memory-disk"
											transition={120}
										/>
									</TouchableOpacity>
								))}
							</View>
						)}
					</View>

					{/* Info Section */}
					<View style={[{ marginTop: spacing["lg"] }, styleOverrides?.infoSection]}>
						<Card variant="raised" border="subtle" padding="lg">
							<View style={staticStyles.infoHeader}>
								{/* Tags */}
								{tags && tags.length > 0 && (
									<View
										style={{
											flexDirection: "row",
											flexWrap: "wrap",
											gap: 8,
										}}
									>
										{tags.map((tag) => (
											<Tag key={tag} variant="active">
												{tag}
											</Tag>
										))}
									</View>
								)}

								{/* Name */}
								<Text variant="heading" color={colors.text}>
									{name}
								</Text>

								{/* Rating */}
								{rating !== undefined && (
									<View style={[staticStyles.ratingRow, { alignItems: "center" }]}>
										<Icon name="Star" size={16} color={colors.warning} />
										<Text variant="body" color={colors.text}>
											{rating.toFixed(1)}
										</Text>
										{reviewCount !== undefined && (
											<Text variant="caption" color={colors.textMuted}>
												({t("ecommerce.reviews", { count: reviewCount })})
											</Text>
										)}
									</View>
								)}

								{/* Price */}
								<View style={[staticStyles.priceRow, { alignItems: "center" }]}>
									<Text variant="heading" color={colors.text} style={staticStyles.price}>
										{currency}
										{price}
									</Text>
									{hasDiscount && (
										<>
											<Text
												variant="body"
												color={colors.textDisabled}
												style={staticStyles.originalPrice}
											>
												{currency}
												{originalPrice}
											</Text>
											<Tag variant="active">{`-${discountPercent}%`}</Tag>
										</>
									)}
								</View>

								{/* Stock Status */}
								<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
									<Icon
										name={inStock ? "CheckCircle2" : "XCircle"}
										size={12}
										color={inStock ? colors.success : colors.primary}
									/>
									<Text variant="caption" color={inStock ? colors.success : colors.primary}>
										{stockLabel}
									</Text>
								</View>

								{/* Description */}
								{description && (
									<Text
										variant="body"
										color={colors.textMuted}
										style={{ marginTop: spacing["md"] }}
									>
										{description}
									</Text>
								)}

								{sellingPoints && sellingPoints.length > 0 ? (
									<View style={staticStyles.sellingPointsGrid}>
										{sellingPoints.map((point) => (
											<View key={point.title} style={staticStyles.sellingPointRow}>
												<View
													style={[
														staticStyles.sellingPointIcon,
														{ backgroundColor: colors.primarySubtle },
													]}
												>
													<Icon name={point.icon} size={16} color={colors.primary} />
												</View>
												<View style={{ flex: 1, minWidth: 0 }}>
													<Text variant="caption" color={colors.text}>
														{point.title}
													</Text>
													<Text variant="caption" color={colors.textMuted} numberOfLines={1}>
														{point.description}
													</Text>
												</View>
											</View>
										))}
									</View>
								) : null}
							</View>
						</Card>
					</View>

					{/* Specs Section */}
					{specs && specs.length > 0 && (
						<View style={[{ marginTop: spacing["md"] }, styleOverrides?.specsSection]}>
							<Card variant="raised" border="subtle" padding="lg">
								<Text
									variant="label"
									color={colors.textMuted}
									style={{ marginBottom: spacing["sm"] }}
								>
									{t("ecommerce.specifications")}
								</Text>
								<View style={staticStyles.specsGrid}>
									{specs.map((spec) => (
										<View key={spec.name} style={staticStyles.specRow}>
											<Text variant="caption" color={colors.textMuted}>
												{spec.name}
											</Text>
											<Text variant="body" color={colors.text}>
												{spec.value}
											</Text>
										</View>
									))}
								</View>
							</Card>
						</View>
					)}

					{/* Variants Section */}
					{variants && variants.length > 0 && (
						<View style={[{ marginTop: spacing["md"] }, styleOverrides?.variantsSection]}>
							<Card variant="raised" border="subtle" padding="lg">
								<Text
									variant="label"
									color={colors.textMuted}
									style={{ marginBottom: spacing["sm"] }}
								>
									{t("ecommerce.selectOption")}
								</Text>
								<View style={staticStyles.variantRow}>
									{variants.map((variant) => (
										<TouchableOpacity
											key={variant.id}
											onPress={() => variant.available && onVariantSelect?.(variant.id)}
											disabled={!variant.available}
											style={[
												staticStyles.variantChip,
												{
													backgroundColor: variant.selected ? colors.surface : colors.surfaceRaised,
													opacity: variant.available ? 1 : 0.4,
												},
											]}
										>
											<Text
												variant="body"
												color={variant.selected ? colors.text : colors.textMuted}
											>
												{variant.name}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</Card>
						</View>
					)}

					{/* Recommendations */}
					{recommendations && recommendations.length > 0 && (
						<View
							style={[{ marginBottom: spacing["4xl"] }, styleOverrides?.recommendationsSection]}
						>
							<Text
								variant="label"
								color={colors.textMuted}
								style={{ marginBottom: spacing["sm"] }}
							>
								{t("ecommerce.youMayAlsoLike")}
							</Text>
							<View style={staticStyles.recommendationsGrid}>
								{recommendations.map((item) => (
									<TouchableOpacity
										key={item.id}
										onPress={item.onPress}
										style={staticStyles.recommendationCard}
										testID={`product-recommendation-${item.id}`}
										accessibilityRole="button"
										accessibilityLabel={item.name}
									>
										{item.image ? (
											<Image
												source={{ uri: item.image }}
												style={staticStyles.recommendationImage}
												contentFit="cover"
												cachePolicy="memory-disk"
												transition={160}
											/>
										) : (
											<View
												style={[
													staticStyles.recommendationImageFallback,
													{ backgroundColor: colors.surfaceRaised },
												]}
											>
												<Icon name="Package" size={24} color={colors.textMuted} />
											</View>
										)}
										<Text
											variant="body"
											color={colors.text}
											style={staticStyles.recommendationName}
										>
											{item.name}
										</Text>
										<Text
											variant="caption"
											color={colors.text}
											style={staticStyles.recommendationPrice}
										>
											{currency}
											{item.price}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					)}
				</ResponsiveContainer>
			</ScrollView>
			<View style={[staticStyles.stickyActions, { bottom: insets.bottom + 10 }]}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					<Card
						variant="raised"
						border="subtle"
						padding="sm"
						style={[
							staticStyles.stickyActionsBackground,
							{ backgroundColor: colors.surfaceRaised },
							styleOverrides?.purchaseSection,
						]}
					>
						<View style={staticStyles.purchaseContainer}>
							<View style={staticStyles.stickyPrice}>
								<Text variant="caption" color={colors.textMuted}>
									{t("ecommerce.total")}
								</Text>
								<Text variant="body" color={colors.text} numberOfLines={1}>
									{currency}
									{price}
								</Text>
							</View>
							<Button
								onPress={primaryAction.onPress}
								disabled={primaryAction.disabled || !inStock}
								style={staticStyles.primaryButton}
								testID={primaryAction.testID}
								accessibilityLabel={primaryAction.label}
								variant="primary"
							>
								{primaryAction.label}
							</Button>

							{secondaryActions && secondaryActions.length > 0 && (
								<View style={staticStyles.secondaryButtons}>
									{secondaryActions.map((action) => (
										<TouchableOpacity
											key={action.label}
											onPress={action.onPress}
											style={[staticStyles.secondaryButton, { backgroundColor: colors.surface }]}
										>
											<Icon name={action.icon} size={20} color={colors.text} />
										</TouchableOpacity>
									))}
								</View>
							)}
						</View>
					</Card>
				</ResponsiveContainer>
			</View>
		</Screen>
	);
}
