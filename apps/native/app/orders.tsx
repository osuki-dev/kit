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
	useTheme,
} from "@osuki-dev/ui";

import { Container } from "@/components/container";
import { useTabChromeScreen } from "@/components/tab-chrome-context";
import { useAccountOrders, useOrders } from "@/lib/data";

export default function OrdersScreen() {
	const { spacing, colors } = useTheme();
	const { latestOrder } = useOrders();
	const { latestOrder: latestAccountOrder } = useAccountOrders();
	const handleChromeScroll = useTabChromeScreen("Orders");
	const order = latestAccountOrder ?? latestOrder;
	const itemCount = order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

	return (
		<Container topInset>
			<Screen>
				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					showsVerticalScrollIndicator={false}
					onScroll={handleChromeScroll}
					scrollEventThrottle={16}
					contentContainerStyle={{ paddingTop: 18, paddingBottom: 48 }}
				>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 680, lg: 820 }}
						horizontalPadding={{ xs: 16, md: 24, lg: 32 }}
						style={{ gap: spacing.xl }}
					>
						<View style={styles.header}>
							<Text variant="display" colorKey="text">
								Orders
							</Text>
							<Text variant="body" colorKey="textMuted">
								Track recent purchases and return to products you already chose.
							</Text>
						</View>

						{order ? (
							<Pressable
								onPress={() => router.push("/order")}
								style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
								testID="orders-latest-order"
							>
								<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
									<View style={styles.orderTopRow}>
										<View style={{ gap: 6 }}>
											<Tag variant="active">{order.status.toUpperCase()}</Tag>
											<Text variant="heading" colorKey="text">
												{order.id}
											</Text>
										</View>
										<Icon name="ChevronRight" size={22} color={colors.textMuted} />
									</View>

									<View style={styles.orderStats}>
										<View>
											<Text variant="label" colorKey="textMuted">
												TOTAL
											</Text>
											<Text variant="heading" colorKey="text">
												${order.total.toFixed(2)}
											</Text>
										</View>
										<View>
											<Text variant="label" colorKey="textMuted">
												ITEMS
											</Text>
											<Text variant="heading" colorKey="text">
												{itemCount}
											</Text>
										</View>
									</View>

									{order.items.slice(0, 3).map((item) => (
										<View key={item.id} style={styles.itemRow}>
											<Image
												source={{ uri: item.image }}
												style={styles.itemImage}
												contentFit="cover"
												cachePolicy="memory-disk"
												transition={160}
											/>
											<View style={{ flex: 1 }}>
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
								</Card>
							</Pressable>
						) : (
							<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
								<Icon name="PackageOpen" size={32} color={colors.primary} />
								<Text variant="heading" colorKey="text">
									No orders yet
								</Text>
								<Text variant="body" colorKey="textMuted">
									When you place an order, delivery status and receipts will appear here.
								</Text>
								<Button variant="primary" onPress={() => router.push("/")}>
									START SHOPPING
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
	orderTopRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	orderStats: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 16,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	itemImage: {
		width: 56,
		height: 56,
		borderRadius: 12,
	},
});
