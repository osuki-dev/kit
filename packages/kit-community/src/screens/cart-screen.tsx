import React, { useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	type ImageSourcePropType,
	type ScrollViewProps,
	type ViewStyle,
	type ImageStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Card,
	Text,
	Button,
	Icon,
	Image,
	Tag,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";
import { useI18n } from "../i18n";

export interface CartItem {
	id: string;
	name: string;
	image?: string;
	price: number;
	quantity: number;
	variant?: string;
	maxQuantity?: number;
}

export interface CartScreenConfig {
	/** Page title shown above cart contents */
	title?: string;
	/** Supporting copy below title */
	description?: string;
	/** Cart items */
	items: CartItem[];
	/** Currency symbol */
	currency?: string;
	/** Tax rate (0-1) */
	taxRate?: number;
	/** Shipping cost */
	shipping?: number;
	/** Free shipping threshold */
	freeShippingThreshold?: number;
	/** Defer shipping, tax, discounts, and the final total to an external checkout */
	externalPricing?: {
		label?: string;
		notice?: string;
	};
	/** Promo code discount */
	discount?: {
		code: string;
		amount: number;
		type: "fixed" | "percentage";
	};
	/** Promo code status message */
	promoMessage?: {
		type: "success" | "error" | "info";
		text: string;
	};
	/** Optional empty cart artwork shown behind the empty state */
	emptyArtwork?: ImageSourcePropType;
	/** Primary CTA */
	primaryAction: {
		label: string;
		onPress: () => void;
		disabled?: boolean;
		testID?: string;
	};
	/** Secondary action (continue shopping) */
	secondaryAction?: {
		label: string;
		onPress: () => void;
	};
}

export interface CartScreenProps {
	config: CartScreenConfig;
	/** Loading state */
	isLoading?: boolean;
	/** Item quantity change handler */
	onQuantityChange?: (itemId: string, quantity: number) => void;
	/** Item remove handler */
	onRemoveItem?: (itemId: string) => void;
	/** Promo code apply handler */
	onApplyPromoCode?: (code: string) => void;
	/** Scroll handler for host navigation chrome */
	onScroll?: ScrollViewProps["onScroll"];
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		item?: ViewStyle;
		itemImage?: ImageStyle;
		itemInfo?: ViewStyle;
		quantityControls?: ViewStyle;
		summarySection?: ViewStyle;
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
		paddingBottom: 200,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	emptyArtwork: {
		position: "absolute",
		left: 0,
		right: 0,
		top: "22%",
		height: "46%",
		opacity: 0.5,
	},
	emptyFade: {
		position: "absolute",
		left: 0,
		right: 0,
		height: "18%",
	},
	emptyFadeTop: {
		top: "20%",
	},
	emptyFadeBottom: {
		top: "50%",
	},
	emptyContent: {
		alignItems: "center",
		zIndex: 1,
	},
	emptyTitle: {
		marginTop: 16,
		maxWidth: 320,
		textAlign: "center",
	},
	emptyDescription: {
		marginTop: 8,
		maxWidth: 300,
		textAlign: "center",
	},
	header: {
		gap: 6,
		marginBottom: 18,
	},
	itemCard: {
		marginBottom: 12,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	itemImage: {
		width: 80,
		height: 80,
		borderRadius: 4,
		backgroundColor: "transparent",
	},
	itemInfo: {
		flex: 1,
		justifyContent: "space-between",
	},
	itemHeader: {
		gap: 4,
	},
	itemFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	quantityControls: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	quantityButton: {
		width: 32,
		height: 32,
		borderRadius: 999,
		justifyContent: "center",
		alignItems: "center",
	},
	quantityButtonDisabled: {
		opacity: 0.42,
	},
	quantityText: {
		minWidth: 24,
		textAlign: "center",
		fontVariant: ["tabular-nums"],
	},
	removeButton: {
		padding: 4,
	},
	summaryCard: {
		marginTop: 16,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
	},
	summaryDivider: {
		height: 1,
		marginVertical: 8,
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		gap: 12,
		marginTop: 8,
	},
	totalAmount: {
		flexShrink: 1,
		textAlign: "right",
	},
	actionsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	stickyActions: {
		position: "absolute",
		left: 0,
		right: 0,
	},
	stickyActionsBackground: {
		paddingVertical: 8,
	},
	promoContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 16,
	},
	promoInput: {
		flex: 1,
		height: 44,
		borderRadius: 999,
		paddingHorizontal: 12,
	},
	promoMessage: {
		alignSelf: "flex-start",
		maxWidth: "100%",
		borderRadius: 999,
		paddingHorizontal: 16,
		paddingVertical: 8,
		marginBottom: 12,
	},
});

/**
 * Cart screen template
 *
 * Features:
 * - Item list with images
 * - Quantity adjustment
 * - Remove items
 * - Price summary with tax/shipping
 * - Promo code support
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <CartScreen
 *   config={{
 *     items: [
 *       { id: "1", name: "Headphones", price: 299, quantity: 1 },
 *     ],
 *     currency: "$",
 *     shipping: 10,
 *     primaryAction: { label: "CHECKOUT", onPress: () => {} },
 *   }}
 * />
 * ```
 */
export function CartScreen({
	config,
	onQuantityChange,
	onRemoveItem,
	onApplyPromoCode,
	onScroll,
	styleOverrides,
}: CartScreenProps) {
	const { colors, spacing, shadow, mode } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const insets = useSafeAreaInsets();
	const { t } = useI18n();
	const [promoCode, setPromoCode] = useState("");

	const {
		items,
		currency = "$",
		taxRate = 0,
		shipping = 0,
		freeShippingThreshold,
		discount,
		externalPricing,
		promoMessage,
		emptyArtwork,
		primaryAction,
		secondaryAction,
		title = t("ecommerce.cart"),
		description = t("ecommerce.cartDescription"),
	} = config;

	// Calculate totals
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const discountAmount = discount
		? discount.type === "percentage"
			? subtotal * (discount.amount / 100)
			: discount.amount
		: 0;
	const discountedSubtotal = subtotal - discountAmount;
	const tax = discountedSubtotal * taxRate;
	const isFreeShipping = freeShippingThreshold && subtotal >= freeShippingThreshold;
	const finalShipping = isFreeShipping ? 0 : shipping;
	const total = discountedSubtotal + tax + finalShipping;
	const promoMessageBackground =
		promoMessage?.type === "error" ? colors.dangerSubtle : colors.surfaceRaised;
	const promoMessageColor =
		promoMessage?.type === "error" ? "danger" : promoMessage?.type === "info" ? "info" : "success";
	const applyPromoCode = () => {
		const code = promoCode.trim();
		if (!code) return;
		onApplyPromoCode?.(code);
		setPromoCode("");
	};

	// Empty state
	if (items.length === 0) {
		return (
			<Screen style={staticStyles.container}>
				<View style={staticStyles.emptyContainer}>
					{emptyArtwork ? (
						<>
							<Image
								source={emptyArtwork}
								style={staticStyles.emptyArtwork}
								contentFit="cover"
								cachePolicy="memory-disk"
								transition={180}
							/>
							<View
								style={[
									staticStyles.emptyFade,
									staticStyles.emptyFadeTop,
									{ backgroundColor: colors.background, opacity: 0.62 },
								]}
							/>
							<View
								style={[
									staticStyles.emptyFade,
									staticStyles.emptyFadeBottom,
									{ backgroundColor: colors.background, opacity: 0.7 },
								]}
							/>
						</>
					) : null}
					<View style={staticStyles.emptyContent}>
						<Icon name="ShoppingCart" size={64} color={colors.textDisabled} />
						<Text
							variant="heading"
							color={colors.textMuted}
							style={staticStyles.emptyTitle}
							numberOfLines={2}
							adjustsFontSizeToFit
						>
							{t("ecommerce.cartEmptyTitle")}
						</Text>
						<Text
							variant="bodySmall"
							color={colors.textMuted}
							style={staticStyles.emptyDescription}
						>
							{t("ecommerce.cartEmptyDescription")}
						</Text>
						{secondaryAction && (
							<Button variant="primary" onPress={secondaryAction.onPress} style={{ marginTop: 24 }}>
								{secondaryAction.label}
							</Button>
						)}
					</View>
				</View>
			</Screen>
		);
	}

	return (
		<Screen style={staticStyles.container}>
			<ScrollView
				style={staticStyles.scrollView}
				contentContainerStyle={[
					staticStyles.scrollContent,
					{ paddingBottom: Math.max(200, insets.bottom + 220) },
				]}
				showsVerticalScrollIndicator={false}
				onScroll={onScroll}
				scrollEventThrottle={16}
			>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					<View style={[staticStyles.header, { paddingTop: insets.top + spacing["lg"] }]}>
						<Text variant="display" color={colors.text}>
							{title}
						</Text>
						<Text variant="body" color={colors.textMuted}>
							{description}
						</Text>
					</View>

					{/* Items List */}
					<View>
						{items.map((item) => {
							const decreaseDisabled = item.quantity <= 1;
							const increaseDisabled =
								item.maxQuantity !== undefined && item.quantity >= item.maxQuantity;

							return (
								<Card
									key={item.id}
									variant="raised"
									border="subtle"
									padding="md"
									style={[staticStyles.itemCard, styleOverrides?.item || {}]}
								>
									<View style={staticStyles.itemRow}>
										{/* Item Image */}
										{item.image ? (
											<Image
												source={{ uri: item.image }}
												style={[staticStyles.itemImage, styleOverrides?.itemImage]}
												contentFit="cover"
												cachePolicy="memory-disk"
												transition={160}
											/>
										) : (
											<View
												style={[staticStyles.itemImage, { backgroundColor: colors.surfaceRaised }]}
											/>
										)}

										{/* Item Info */}
										<View style={[staticStyles.itemInfo, styleOverrides?.itemInfo]}>
											<View style={staticStyles.itemHeader}>
												<Text variant="body" color={colors.text}>
													{item.name}
												</Text>
												{item.variant && (
													<Text variant="caption" color={colors.textMuted}>
														{item.variant}
													</Text>
												)}
												{item.maxQuantity !== undefined ? (
													<Text variant="caption" color={colors.textSubtle}>
														{item.quantity >= item.maxQuantity
															? "Maximum available quantity in cart"
															: `${item.maxQuantity} available`}
													</Text>
												) : null}
												<Text variant="body" color={colors.text}>
													{currency}
													{item.price}
												</Text>
											</View>

											<View style={staticStyles.itemFooter}>
												{/* Quantity Controls */}
												<View
													style={[staticStyles.quantityControls, styleOverrides?.quantityControls]}
												>
													<TouchableOpacity
														onPress={() =>
															onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))
														}
														disabled={decreaseDisabled}
														style={[
															staticStyles.quantityButton,
															decreaseDisabled ? staticStyles.quantityButtonDisabled : null,
															{
																backgroundColor: colors.surfaceRaised,
																...(mode === "light" ? shadow.pill : {}),
															},
														]}
														testID={`cart-decrease-${item.id}`}
														accessibilityRole="button"
														accessibilityLabel={t("ecommerce.decreaseItem", {
															item: item.name,
														})}
													>
														<Icon name="Minus" size={16} color={colors.textMuted} />
													</TouchableOpacity>

													<Text
														variant="body"
														color={colors.text}
														style={staticStyles.quantityText}
													>
														{item.quantity}
													</Text>

													<TouchableOpacity
														onPress={() =>
															onQuantityChange?.(
																item.id,
																Math.min(item.maxQuantity || 99, item.quantity + 1),
															)
														}
														disabled={increaseDisabled}
														style={[
															staticStyles.quantityButton,
															increaseDisabled ? staticStyles.quantityButtonDisabled : null,
															{
																backgroundColor: colors.surfaceRaised,
																...(mode === "light" ? shadow.pill : {}),
															},
														]}
														testID={`cart-increase-${item.id}`}
														accessibilityRole="button"
														accessibilityLabel={t("ecommerce.increaseItem", {
															item: item.name,
														})}
													>
														<Icon name="Plus" size={16} color={colors.textMuted} />
													</TouchableOpacity>
												</View>

												{/* Remove Button */}
												<TouchableOpacity
													onPress={() => onRemoveItem?.(item.id)}
													style={staticStyles.removeButton}
													testID={`cart-remove-${item.id}`}
													accessibilityRole="button"
													accessibilityLabel={t("ecommerce.removeItem", { item: item.name })}
												>
													<Icon name="Trash2" size={20} color={colors.primary} />
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</Card>
							);
						})}
					</View>

					{/* Summary Section */}
					<Card
						variant="raised"
						border="subtle"
						padding="lg"
						style={[staticStyles.summaryCard, styleOverrides?.summarySection || {}]}
					>
						{/* Promo Code */}
						{onApplyPromoCode && (
							<View style={staticStyles.promoContainer}>
								<TextInput
									value={promoCode}
									onChangeText={setPromoCode}
									placeholder={t("ecommerce.promoCode")}
									placeholderTextColor={colors.textDisabled}
									autoCapitalize="characters"
									autoCorrect={false}
									autoComplete="off"
									returnKeyType="done"
									selectTextOnFocus
									onSubmitEditing={applyPromoCode}
									style={[
										staticStyles.promoInput,
										{
											color: colors.text,
											backgroundColor: colors.surfaceRaised,
										},
									]}
									testID="cart-promo-input"
									accessibilityLabel={t("ecommerce.promoCode")}
								/>
								<Button
									variant="secondary"
									onPress={applyPromoCode}
									disabled={!promoCode.trim()}
									testID="cart-promo-apply"
								>
									{t("common.apply")}
								</Button>
							</View>
						)}

						{promoMessage ? (
							<View
								style={[
									staticStyles.promoMessage,
									{
										backgroundColor: promoMessageBackground,
									},
								]}
								testID={`cart-promo-${promoMessage.type}`}
							>
								<Text variant="caption" colorKey={promoMessageColor}>
									{promoMessage.text}
								</Text>
							</View>
						) : null}

						{/* Applied Discount */}
						{discount && (
							<View style={staticStyles.summaryRow}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.discount")} ({discount.code})
								</Text>
								<Text variant="body" color={colors.success}>
									-{currency}
									{discountAmount.toFixed(2)}
								</Text>
							</View>
						)}

						{/* Subtotal */}
						<View style={staticStyles.summaryRow}>
							<Text variant="body" color={colors.textMuted}>
								{t("ecommerce.subtotal")}
							</Text>
							<Text variant="body" color={colors.text}>
								{currency}
								{subtotal.toFixed(2)}
							</Text>
						</View>

						{/* Shipping */}
						<View style={staticStyles.summaryRow}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.shipping")}
								</Text>
								{isFreeShipping && <Tag variant="active">{t("ecommerce.free")}</Tag>}
							</View>
							<Text variant="body" color={isFreeShipping ? colors.success : colors.text}>
								{externalPricing?.label ??
									(isFreeShipping ? t("ecommerce.free") : `${currency}${shipping.toFixed(2)}`)}
							</Text>
						</View>

						{/* Tax */}
						{externalPricing ? (
							<View style={staticStyles.summaryRow}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.tax")}
								</Text>
								<Text variant="body" color={colors.text}>
									{externalPricing.label ?? "At checkout"}
								</Text>
							</View>
						) : taxRate > 0 ? (
							<View style={staticStyles.summaryRow}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.tax")} ({(taxRate * 100).toFixed(0)}%)
								</Text>
								<Text variant="body" color={colors.text}>
									{currency}
									{tax.toFixed(2)}
								</Text>
							</View>
						) : null}

						{/* Divider */}
						<View style={[staticStyles.summaryDivider, { backgroundColor: colors.border }]} />

						{/* Total */}
						<View style={staticStyles.totalRow}>
							<Text variant="heading" color={colors.text}>
								{externalPricing ? t("ecommerce.subtotal") : t("ecommerce.total")}
							</Text>
							<Text
								variant="heading"
								color={colors.text}
								style={staticStyles.totalAmount}
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.72}
							>
								{currency}
								{(externalPricing ? discountedSubtotal : total).toFixed(2)}
							</Text>
						</View>
						{externalPricing?.notice ? (
							<Text variant="caption" color={colors.textMuted}>
								{externalPricing.notice}
							</Text>
						) : null}
					</Card>

					<View style={{ height: spacing["xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
			<View style={[staticStyles.stickyActions, { bottom: insets.bottom + 78 }]}>
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
						]}
					>
						<View style={staticStyles.actionsContainer}>
							{secondaryAction && (
								<Button variant="secondary" onPress={secondaryAction.onPress}>
									{secondaryAction.label}
								</Button>
							)}
							<Button
								variant="primary"
								onPress={primaryAction.onPress}
								disabled={primaryAction.disabled || items.length === 0}
								style={{ flex: 1 }}
								testID={primaryAction.testID}
							>
								{primaryAction.label}
							</Button>
						</View>
					</Card>
				</ResponsiveContainer>
			</View>
		</Screen>
	);
}
