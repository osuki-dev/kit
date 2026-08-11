import React from "react";
import { View, ScrollView, StyleSheet, type ViewStyle } from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	Image,
	Timeline,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	type IconName,
	type TimelineItem,
	type TimelineTone,
} from "@osuki-dev/ui";
import { useI18n, type TranslationKey } from "../i18n";

export type OrderStatus =
	| "pending"
	| "confirmed"
	| "processing"
	| "shipped"
	| "delivered"
	| "cancelled";

export interface OrderItem {
	id: string;
	name: string;
	image?: string;
	price: number;
	quantity: number;
	variant?: string;
}

export interface OrderTimelineEvent {
	status: OrderStatus;
	date: Date;
	description: string;
	location?: string;
}

export interface OrderScreenConfig {
	/** Order ID */
	orderId: string;
	/** Current status */
	status: OrderStatus;
	/** Order date */
	orderDate: Date;
	/** Items */
	items: OrderItem[];
	/** Currency symbol */
	currency?: string;
	/** Subtotal */
	subtotal: number;
	/** Shipping cost */
	shipping: number;
	/** Tax amount */
	tax: number;
	/** Total */
	total: number;
	/** Shipping address */
	shippingAddress: {
		name: string;
		street: string;
		city: string;
		zip: string;
		country: string;
	};
	/** Payment method */
	paymentMethod: {
		type: "card" | "paypal" | "apple_pay";
		last4?: string;
		brand?: string;
		/** Truthful provider label when card details are unavailable */
		displayLabel?: string;
	};
	/** Timeline events */
	timeline?: OrderTimelineEvent[];
	/** Tracking number (for shipped orders) */
	trackingNumber?: string;
	/** Estimated delivery */
	estimatedDelivery?: Date;
	/** Optional order-state notice shown in the status card */
	notice?: string;
	/** Primary action */
	primaryAction?: {
		label: string;
		onPress: () => void;
	};
	/** Secondary actions */
	secondaryActions?: Array<{
		label: string;
		onPress: () => void;
		variant?: "default" | "destructive";
	}>;
}

export interface OrderScreenProps {
	config: OrderScreenConfig;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		statusSection?: ViewStyle;
		itemsSection?: ViewStyle;
		timelineSection?: ViewStyle;
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
	statusHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	statusBadge: {
		paddingVertical: 7,
		paddingHorizontal: 14,
		borderRadius: 999,
	},
	orderMeta: {
		gap: 4,
	},
	notice: {
		marginTop: 16,
		borderRadius: 18,
		padding: 14,
	},
	itemCard: {
		marginBottom: 12,
		borderRadius: 22,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	itemImage: {
		width: 80,
		height: 80,
		borderRadius: 18,
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
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	addressSection: {
		gap: 4,
	},
	actionsContainer: {
		flexDirection: "row",
		gap: 12,
		marginTop: 24,
		marginBottom: 8,
	},
});

const statusConfig: Record<
	OrderStatus,
	{ labelKey: TranslationKey; color: "text" | "primary" | "success" | "warning"; icon: IconName }
> = {
	pending: { labelKey: "ecommerce.orderPending", color: "warning", icon: "Clock" },
	confirmed: { labelKey: "ecommerce.orderConfirmed", color: "text", icon: "CheckCircle" },
	processing: { labelKey: "ecommerce.orderProcessing", color: "text", icon: "Package" },
	shipped: { labelKey: "ecommerce.orderShipped", color: "success", icon: "Truck" },
	delivered: { labelKey: "ecommerce.orderDelivered", color: "success", icon: "CheckCircle" },
	cancelled: { labelKey: "ecommerce.orderCancelled", color: "primary", icon: "XCircle" },
};

/**
 * Order screen template
 *
 * Features:
 * - Order status display
 * - Items list with images
 * - Timeline of events
 * - Shipping address
 * - Payment method
 * - Cost breakdown
 * - Tracking information
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <OrderScreen
 *   config={{
 *     orderId: "ORD-1234",
 *     status: "shipped",
 *     items: [...],
 *     subtotal: 299,
 *     shipping: 10,
 *     tax: 24,
 *     total: 333,
 *     shippingAddress: {...},
 *   }}
 * />
 * ```
 */
export function OrderScreen({ config, styleOverrides }: OrderScreenProps) {
	const { colors, spacing, radius } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const { t } = useI18n();

	const {
		orderId,
		status,
		orderDate,
		items,
		currency = "$",
		subtotal,
		shipping,
		tax,
		total,
		shippingAddress,
		paymentMethod,
		timeline,
		trackingNumber,
		estimatedDelivery,
		notice,
		primaryAction,
		secondaryActions,
	} = config;

	const statusInfo = statusConfig[status];
	const statusColor = colors[statusInfo.color];
	const statusLabel = t(statusInfo.labelKey);
	const timelineItems: TimelineItem[] | undefined = timeline?.map((event, index) => {
		const eventStatus = statusConfig[event.status];
		const tone: TimelineTone = eventStatus.color === "text" ? "neutral" : eventStatus.color;
		return {
			id: `${event.status}-${event.date.toISOString()}-${index}`,
			title: event.description,
			description: event.location,
			timestamp: event.date.toLocaleString(),
			icon: eventStatus.icon,
			tone,
			status: event.status === status ? "active" : "completed",
		};
	});

	return (
		<Screen style={staticStyles.container}>
			<ScrollView style={staticStyles.scrollView} showsVerticalScrollIndicator={false}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					<View style={{ marginTop: spacing["lg"] }}>
						{/* Status Section */}
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={styleOverrides?.statusSection || {}}
						>
							<View style={staticStyles.statusHeader}>
								<View style={staticStyles.orderMeta}>
									<Text variant="label" color={colors.textMuted}>
										{t("ecommerce.orderNumber", { id: orderId })}
									</Text>
									<Text variant="caption" color={colors.textDisabled}>
										{t("ecommerce.placedOn", { date: orderDate.toLocaleDateString() })}
									</Text>
								</View>
								<View
									style={[
										staticStyles.statusBadge,
										{
											backgroundColor:
												statusInfo.color === "success"
													? "rgba(18, 183, 106, 0.12)"
													: statusInfo.color === "warning"
														? "rgba(247, 144, 9, 0.14)"
														: statusInfo.color === "primary"
															? colors.primarySubtle
															: colors.surfaceRaised,
										},
									]}
								>
									<Text variant="caption" color={statusColor}>
										{statusLabel}
									</Text>
								</View>
							</View>

							{notice ? (
								<View style={[staticStyles.notice, { backgroundColor: colors.surfaceRaised }]}>
									<Text variant="bodySmall" color={colors.textMuted}>
										{notice}
									</Text>
								</View>
							) : null}

							{/* Tracking Info */}
							{trackingNumber && (
								<View style={{ marginTop: 16 }}>
									<Text variant="caption" color={colors.textMuted}>
										{t("ecommerce.trackingNumber")}
									</Text>
									<Text variant="body" color={colors.text}>
										{trackingNumber}
									</Text>
								</View>
							)}

							{estimatedDelivery && (
								<View style={{ marginTop: 8 }}>
									<Text variant="caption" color={colors.textMuted}>
										{t("ecommerce.estimatedDelivery").toUpperCase()}
									</Text>
									<Text variant="body" color={colors.success}>
										{estimatedDelivery.toLocaleDateString()}
									</Text>
								</View>
							)}
						</Card>

						{/* Timeline Section */}
						{timeline && timeline.length > 0 && (
							<Card
								variant="flat"
								border="subtle"
								padding="lg"
								style={[{ marginTop: 16 }, styleOverrides?.timelineSection || {}]}
							>
								<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
									{t("ecommerce.orderTimeline")}
								</Text>

								<Timeline items={timelineItems ?? []} size="compact" testID="order-timeline" />
							</Card>
						)}

						{/* Items Section */}
						<Card
							variant="flat"
							border="subtle"
							padding="lg"
							style={[{ marginTop: 16 }, styleOverrides?.itemsSection || {}]}
						>
							<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
								{t("ecommerce.orderItems", { count: items.length })}
							</Text>

							{items.map((item) => (
								<View
									key={item.id}
									style={[
										staticStyles.itemCard,
										{
											backgroundColor: colors.surfaceRaised,
											borderRadius: radius.lg,
											padding: spacing.md,
										},
									]}
								>
									<View style={staticStyles.itemRow}>
										{item.image ? (
											<Image
												source={{ uri: item.image }}
												style={staticStyles.itemImage}
												contentFit="cover"
												cachePolicy="memory-disk"
												transition={160}
											/>
										) : (
											<View
												style={[staticStyles.itemImage, { backgroundColor: colors.surfaceRaised }]}
											/>
										)}

										<View style={staticStyles.itemInfo}>
											<View style={staticStyles.itemHeader}>
												<Text variant="body" color={colors.text}>
													{item.name}
												</Text>
												{item.variant && (
													<Text variant="caption" color={colors.textMuted}>
														{item.variant}
													</Text>
												)}
											</View>

											<View style={staticStyles.itemFooter}>
												<Text variant="caption" color={colors.textMuted}>
													{t("ecommerce.quantityShort", { count: item.quantity })}
												</Text>
												<Text variant="body" color={colors.text}>
													{currency}
													{(item.price * item.quantity).toFixed(2)}
												</Text>
											</View>
										</View>
									</View>
								</View>
							))}
						</Card>

						{/* Address & Payment */}
						<Card variant="flat" border="subtle" padding="lg" style={{ marginTop: 16 }}>
							<View style={{ gap: 16 }}>
								<View style={staticStyles.addressSection}>
									<Text variant="label" color={colors.textMuted}>
										{t("ecommerce.shippingAddress")}
									</Text>
									<Text variant="body" color={colors.text}>
										{shippingAddress.name}
									</Text>
									<Text variant="body" color={colors.text}>
										{shippingAddress.street}
									</Text>
									<Text variant="body" color={colors.text}>
										{shippingAddress.city}, {shippingAddress.zip}
									</Text>
									<Text variant="body" color={colors.text}>
										{shippingAddress.country}
									</Text>
								</View>

								<View style={staticStyles.addressSection}>
									<Text variant="label" color={colors.textMuted}>
										{t("ecommerce.paymentMethod")}
									</Text>
									<Text variant="body" color={colors.text}>
										{paymentMethod.displayLabel ??
											(paymentMethod.type === "card"
												? [
														paymentMethod.brand,
														paymentMethod.last4 ? `•••• ${paymentMethod.last4}` : null,
													]
														.filter(Boolean)
														.join(" ")
												: paymentMethod.type)}
									</Text>
								</View>
							</View>
						</Card>

						{/* Summary Section */}
						<Card
							variant="flat"
							border="subtle"
							padding="lg"
							style={[{ marginTop: 16 }, styleOverrides?.summarySection || {}]}
						>
							<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
								{t("ecommerce.orderSummary")}
							</Text>

							<View style={staticStyles.summaryRow}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.subtotal")}
								</Text>
								<Text variant="body" color={colors.text}>
									{currency}
									{subtotal.toFixed(2)}
								</Text>
							</View>

							<View style={staticStyles.summaryRow}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.shipping")}
								</Text>
								<Text variant="body" color={colors.text}>
									{currency}
									{shipping.toFixed(2)}
								</Text>
							</View>

							<View style={staticStyles.summaryRow}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.tax")}
								</Text>
								<Text variant="body" color={colors.text}>
									{currency}
									{tax.toFixed(2)}
								</Text>
							</View>

							<View style={[staticStyles.totalRow, { borderTopColor: colors.border }]}>
								<Text variant="heading" color={colors.text}>
									{t("ecommerce.total")}
								</Text>
								<Text
									variant="dataLarge"
									color={colors.text}
									numberOfLines={1}
									adjustsFontSizeToFit
									minimumFontScale={0.78}
								>
									{currency}
									{total.toFixed(2)}
								</Text>
							</View>
						</Card>

						{/* Actions */}
						{(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
							<View style={staticStyles.actionsContainer}>
								{secondaryActions?.map((action) => (
									<Button
										key={action.label}
										variant={action.variant === "destructive" ? "destructive" : "secondary"}
										onPress={action.onPress}
									>
										{action.label}
									</Button>
								))}

								{primaryAction && (
									<Button variant="primary" style={{ flex: 1 }} onPress={primaryAction.onPress}>
										{primaryAction.label}
									</Button>
								)}
							</View>
						)}

						<View style={{ height: spacing["4xl"] }} />
					</View>
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}
