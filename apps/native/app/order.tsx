import { useMemo } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { OrderScreen } from "@osuki-dev/kit-community";
import type { OrderScreenConfig } from "@osuki-dev/kit-community";

import { useAccountOrders, useCart, useOrders } from "@/lib/data";

export default function OrderRoute() {
	const params = useLocalSearchParams<{ orderId?: string }>();
	const { items } = useCart();
	const { latestOrder } = useOrders();
	const { orders: accountOrders } = useAccountOrders();
	const selectedOrder =
		typeof params.orderId === "string"
			? accountOrders.find((order) => order.id === params.orderId)
			: null;
	const activeOrder = selectedOrder ?? latestOrder;

	const fallbackTotals = useMemo(() => {
		const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const shipping = subtotal >= 500 ? 0 : 10;
		const tax = subtotal * 0.08;
		return { subtotal, shipping, tax, total: subtotal + shipping + tax };
	}, [items]);

	const sourceItems = activeOrder?.items ?? items;
	const createdAt = activeOrder?.createdAt ? new Date(activeOrder.createdAt) : new Date();
	const orderId = activeOrder?.id ?? "ORD-2026-PREVIEW";

	const orderConfig: OrderScreenConfig = {
		orderId,
		status: activeOrder?.status ?? "confirmed",
		orderDate: createdAt,
		items: sourceItems.map((item) => ({
			id: item.id,
			name: item.name,
			price: item.price,
			quantity: item.quantity,
			variant: item.variant,
			image: item.image,
		})),
		currency: "$",
		subtotal: activeOrder?.subtotal ?? fallbackTotals.subtotal,
		shipping: activeOrder?.shipping ?? fallbackTotals.shipping,
		tax: activeOrder?.tax ?? fallbackTotals.tax,
		total: activeOrder?.total ?? fallbackTotals.total,
		shippingAddress: {
			name: activeOrder?.customerName ?? "Avery Chen",
			street: activeOrder?.street ?? "12 Kit Studio Lane",
			city: activeOrder?.city ?? "San Francisco",
			zip: activeOrder?.zip ?? "94107",
			country: activeOrder?.country ?? "USA",
		},
		paymentMethod: {
			type: activeOrder?.paymentType ?? "card",
			brand: activeOrder?.paymentBrand ?? "Visa",
			last4: activeOrder?.paymentLast4 ?? "4242",
		},
		trackingNumber: activeOrder?.trackingNumber ?? "OSK-PREVIEW-READY",
		estimatedDelivery: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000),
		timeline: [
			{
				status: "confirmed",
				date: createdAt,
				description: "Order confirmed from the local repository",
			},
			{
				status: "processing",
				date: new Date(createdAt.getTime() + 30 * 60 * 1000),
				description: "Fulfillment task created",
				location: "Osuki Studio",
			},
			{
				status: activeOrder?.status === "shipped" ? "shipped" : "processing",
				date: new Date(createdAt.getTime() + 90 * 60 * 1000),
				description: "Package is ready for carrier pickup",
				location: "San Francisco, CA",
			},
		],
		primaryAction: {
			label: "TRACK PACKAGE",
			onPress: () => router.push("/notifications"),
		},
		secondaryActions: [
			{
				label: "SHOP MORE",
				onPress: () => router.push({ pathname: "/product", params: { id: "headphones" } }),
			},
		],
	};

	return (
		<>
			<Stack.Screen options={{ title: orderId }} />
			<OrderScreen config={orderConfig} />
		</>
	);
}
