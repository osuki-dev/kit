import { useMemo } from "react";

import { DashboardScreen } from "@osuki-dev/kit-community";
import type { DashboardScreenConfig } from "@osuki-dev/kit-community";

import { useCart, useProducts, useUsers } from "@/lib/data";

export default function Dashboard() {
	const { items: products } = useProducts({ limit: 20 });
	const { items: cartItems } = useCart();
	const { items: users } = useUsers({ limit: 20 });

	const dashboardConfig = useMemo<DashboardScreenConfig>(() => {
		const inventoryValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
		const cartValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const activeUsers = users.filter((user) => user.status === "active");

		return {
			title: "COMMERCE OVERVIEW",
			widgets: [
				{
					id: "inventory-value",
					title: "INVENTORY VALUE",
					type: "hero",
					data: [{ value: inventoryValue }],
					field: "value",
					format: (val) => `$${(val as number).toLocaleString()}`,
				},
				{
					id: "cart-value",
					title: "ACTIVE CART",
					type: "hero",
					data: [{ value: cartValue }],
					field: "value",
					format: (val) => `$${(val as number).toLocaleString()}`,
				},
				{
					id: "stock-health",
					title: "STOCK HEALTH",
					type: "progress",
					data: products.map((product) => ({
						name: product.name,
						stock: Math.min(100, (product.stock / 32) * 100),
					})),
					field: "stock",
					label: "STOCK",
				},
				{
					id: "products",
					title: "PRODUCTS",
					type: "list",
					data: products.map((product) => ({
						name: product.name,
						value: `$${product.price}`,
					})),
					field: "value",
				},
				{
					id: "active-users",
					title: "ACTIVE USERS",
					type: "stat",
					data: activeUsers.map((user) => ({
						name: user.name,
						value: user.role,
					})),
					field: "value",
					label: "ROLE",
				},
				{
					id: "cart-lines",
					title: "CART ITEMS",
					type: "list",
					data: cartItems.map((item) => ({
						name: item.name,
						quantity: `${item.quantity} pcs`,
					})),
					field: "quantity",
				},
			],
		};
	}, [cartItems, products, users]);

	return <DashboardScreen config={dashboardConfig} />;
}
