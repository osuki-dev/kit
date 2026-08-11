import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { CheckoutScreen } from "@osuki-dev/kit-community";
import type { CheckoutScreenConfig, CheckoutStep } from "@osuki-dev/kit-community";
import {
	Screen,
	Button,
	Card,
	Icon,
	Image,
	ResponsiveContainer,
	Text,
	useResponsiveTheme,
	useTheme,
} from "@osuki-dev/ui";

import { Container } from "@/components/container";
import { useAccount, useCart, useOrders } from "@/lib/data";

const checkoutDeliveryImage = require("../assets/commerce/osuki-checkout-delivery.jpg");

type ShippingAddress = NonNullable<CheckoutScreenConfig["shippingAddress"]>;

const fallbackShippingAddress: ShippingAddress = {
	name: "Avery Chen",
	street: "12 Kit Studio Lane",
	city: "San Francisco",
	zip: "94107",
	country: "USA",
};

export default function CheckoutRoute() {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
	const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(fallbackShippingAddress);
	const [addressWasEdited, setAddressWasEdited] = useState(false);
	const [placingOrder, setPlacingOrder] = useState(false);
	const { items, loading } = useCart();
	const { createFromCart } = useOrders();
	const { profile, addresses, signedIn } = useAccount();
	const defaultAddress = useMemo(
		() => addresses.find((address) => address.isDefault) ?? addresses[0],
		[addresses],
	);

	useEffect(() => {
		if (!signedIn || !defaultAddress || addressWasEdited) return;
		setShippingAddress({
			name: defaultAddress.name || profile?.name || fallbackShippingAddress.name,
			street: defaultAddress.street,
			city: defaultAddress.city,
			zip: defaultAddress.zip,
			country: defaultAddress.country,
		});
	}, [addressWasEdited, defaultAddress, profile, signedIn]);

	const totals = useMemo(() => {
		const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const shipping = subtotal >= 500 ? 0 : 10;
		const tax = subtotal * 0.08;
		return { subtotal, shipping, tax, total: subtotal + shipping + tax };
	}, [items]);

	if (!loading && items.length === 0) {
		return (
			<Container topInset>
				<Screen>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 560, lg: 640 }}
						horizontalPadding={pagePadding}
						alignment="center"
						style={styles.emptyContainer}
					>
						<Card variant="raised" padding="lg" style={{ gap: spacing.md }}>
							<View style={styles.emptyVisualWrap}>
								<Image
									source={checkoutDeliveryImage}
									style={styles.emptyVisual}
									contentFit="cover"
									cachePolicy="memory-disk"
									transition={180}
								/>
								<View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
									<Icon name="ShoppingBag" size={26} color={colors.primary} />
								</View>
							</View>
							<Text variant="heading" colorKey="text" testID="checkout-empty-title">
								Your cart is empty
							</Text>
							<Text variant="body" colorKey="textMuted">
								Add a product before starting checkout.
							</Text>
							<Button
								variant="primary"
								onPress={() => router.replace("/")}
								testID="checkout-empty-shop-button"
							>
								SHOP PRODUCTS
							</Button>
						</Card>
					</ResponsiveContainer>
				</Screen>
			</Container>
		);
	}

	const checkoutConfig: CheckoutScreenConfig = {
		currentStep,
		items: items.map((item) => ({
			id: item.id,
			name: item.name,
			price: item.price,
			quantity: item.quantity,
		})),
		...totals,
		currency: "$",
		shippingAddress,
		shippingAddressNotice:
			signedIn && defaultAddress && !addressWasEdited
				? "Using your default account address."
				: undefined,
		onShippingAddressChange: (nextAddress) => {
			setAddressWasEdited(true);
			setShippingAddress(nextAddress);
		},
		paymentMethod: {
			type: "card",
			brand: "Visa",
			last4: "4242",
		},
		onStepChange: setCurrentStep,
		continueTestID: "checkout-continue",
		placeOrderTestID: "checkout-place-order",
		placingOrder,
		onPlaceOrder: async () => {
			setPlacingOrder(true);
			try {
				await createFromCart({
					shippingAddress: {
						customerName: shippingAddress.name,
						street: shippingAddress.street,
						city: shippingAddress.city,
						zip: shippingAddress.zip,
						country: shippingAddress.country,
					},
				});
				router.replace("/order");
			} finally {
				setPlacingOrder(false);
			}
		},
	};

	return <CheckoutScreen config={checkoutConfig} />;
}

const styles = StyleSheet.create({
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
	},
	emptyVisualWrap: {
		height: 190,
		borderRadius: 28,
		overflow: "hidden",
	},
	emptyVisual: {
		width: "100%",
		height: "100%",
	},
	emptyIcon: {
		position: "absolute",
		left: 16,
		bottom: 16,
		width: 58,
		height: 58,
		borderRadius: 29,
		alignItems: "center",
		justifyContent: "center",
	},
});
