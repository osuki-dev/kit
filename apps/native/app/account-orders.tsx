import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import {
	Screen,
	Button,
	Card,
	Icon,
	Image,
	ResponsiveContainer,
	Tag,
	Text,
	useResponsiveTheme,
	useTheme,
} from "@osuki-dev/ui";

import { Container } from "@/components/container";
import { useAccount, useAccountOrders } from "@/lib/data";
import type { OrderRecord } from "@/lib/data";

type OrderFilter = "all" | OrderRecord["status"];

const orderFilters: Array<{ id: OrderFilter; label: string }> = [
	{ id: "all", label: "All" },
	{ id: "confirmed", label: "Confirmed" },
	{ id: "processing", label: "Processing" },
	{ id: "shipped", label: "Shipped" },
	{ id: "delivered", label: "Delivered" },
];

export default function AccountOrdersRoute() {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const { signedIn } = useAccount();
	const { orders, loading } = useAccountOrders();
	const [filter, setFilter] = useState<OrderFilter>("all");
	const filteredOrders = useMemo(
		() => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
		[filter, orders],
	);

	return (
		<Container>
			<Screen>
				<ScrollView
					contentInsetAdjustmentBehavior="never"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingTop: 24, paddingBottom: 80 }}
				>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 680, lg: 820 }}
						horizontalPadding={pagePadding}
						alignment="center"
						style={{ gap: spacing.xl }}
					>
						<View style={styles.header}>
							<Text variant="display" colorKey="text">
								Order history
							</Text>
							<Text variant="body" colorKey="textMuted">
								Track recent purchases, delivery status, and saved order details.
							</Text>
						</View>

						{!signedIn ? (
							<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
								<Icon name="UserRound" size={32} color={colors.primary} />
								<Text variant="heading" colorKey="text">
									Sign in to view orders
								</Text>
								<Text variant="body" colorKey="textMuted">
									Order history is tied to your customer profile.
								</Text>
								<Button
									variant="primary"
									onPress={() => router.push("/auth-screen")}
									testID="account-orders-sign-in-button"
								>
									SIGN IN
								</Button>
							</Card>
						) : loading ? (
							<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
								<Icon name="PackageSearch" size={32} color={colors.primary} />
								<Text variant="heading" colorKey="text">
									Loading orders
								</Text>
								<Text variant="body" colorKey="textMuted">
									Fetching the purchases tied to this account.
								</Text>
							</Card>
						) : orders.length ? (
							<View style={{ gap: spacing.md }}>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={styles.filterRow}
								>
									{orderFilters.map((item) => (
										<Pressable
											key={item.id}
											onPress={() => setFilter(item.id)}
											testID={`account-orders-filter-${item.id}`}
										>
											<Tag variant={filter === item.id ? "active" : "pill"}>{item.label}</Tag>
										</Pressable>
									))}
								</ScrollView>

								{filteredOrders.map((order) => (
									<Pressable
										key={order.id}
										onPress={() =>
											router.push({ pathname: "/order", params: { orderId: order.id } })
										}
										testID={`account-order-${order.id}`}
									>
										<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
											<View style={styles.orderTopRow}>
												<View style={styles.copy}>
													<Tag variant="active">{order.status.toUpperCase()}</Tag>
													<Text
														variant="heading"
														colorKey="text"
														overflowMode="marquee"
														marqueePlayback="manual"
													>
														{order.id}
													</Text>
													<Text variant="caption" colorKey="textMuted">
														{new Date(order.createdAt).toLocaleString()}
													</Text>
													<Text
														variant="caption"
														colorKey="textMuted"
														testID={`account-order-address-${order.id}`}
													>
														{order.street}, {order.city} {order.zip}
													</Text>
												</View>
												<Icon name="ChevronRight" size={22} color={colors.textMuted} />
											</View>

											{order.items.slice(0, 2).map((item) => (
												<View key={item.id} style={styles.itemRow}>
													<Image
														source={{ uri: item.image }}
														style={styles.itemImage}
														contentFit="cover"
														cachePolicy="memory-disk"
														transition={160}
													/>
													<View style={styles.copy}>
														<Text
															variant="body"
															colorKey="text"
															overflowMode="marquee"
															marqueePlayback="manual"
														>
															{item.name}
														</Text>
														<Text variant="caption" colorKey="textMuted">
															{item.quantity} x ${item.price}
														</Text>
													</View>
												</View>
											))}

											<View style={styles.totalRow}>
												<Text variant="label" colorKey="textMuted">
													TOTAL
												</Text>
												<Text variant="heading" colorKey="text">
													${order.total.toFixed(2)}
												</Text>
											</View>
										</Card>
									</Pressable>
								))}

								{filteredOrders.length === 0 ? (
									<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
										<Icon name="PackageSearch" size={32} color={colors.primary} />
										<Text variant="heading" colorKey="text">
											No {filter} orders
										</Text>
										<Text variant="body" colorKey="textMuted">
											Try another status or place a new order from the cart.
										</Text>
									</Card>
								) : null}
							</View>
						) : (
							<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
								<Icon name="PackageOpen" size={32} color={colors.primary} />
								<Text variant="heading" colorKey="text">
									No account orders yet
								</Text>
								<Text variant="body" colorKey="textMuted">
									Place an order from the cart and it will appear here.
								</Text>
								<Button
									variant="primary"
									onPress={() => router.push("/")}
									testID="account-orders-shop-button"
								>
									SHOP PRODUCTS
								</Button>
							</Card>
						)}
					</ResponsiveContainer>
				</ScrollView>
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	header: {
		gap: 8,
	},
	filterRow: {
		gap: 8,
		paddingRight: 24,
	},
	orderTopRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	copy: {
		flex: 1,
		minWidth: 0,
		gap: 4,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	itemImage: {
		width: 54,
		height: 54,
		borderRadius: 12,
	},
	totalRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
});
