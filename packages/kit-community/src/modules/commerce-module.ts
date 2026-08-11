import type { KitModuleDefinition, KitModuleRoute, KitScreenName } from "./module-types";

export type CommerceFeature = "product" | "search" | "cart" | "checkout" | "orders";

export interface CommerceModuleOptions {
	routePrefix?: string;
	features?: CommerceFeature[];
	enableTabs?: boolean;
}

const defaultFeatures: CommerceFeature[] = ["product", "search", "cart", "checkout", "orders"];

const featureScreens: Record<CommerceFeature, KitScreenName> = {
	product: "ProductScreen",
	search: "SearchScreen",
	cart: "CartScreen",
	checkout: "CheckoutScreen",
	orders: "OrderScreen",
};

const joinPath = (prefix: string, path: string) =>
	`${prefix.replace(/\/$/, "")}/${path.replace(/^\//, "")}`.replace(/\/+/g, "/");

export function createCommerceModule(options: CommerceModuleOptions = {}): KitModuleDefinition {
	const routePrefix = options.routePrefix ?? "";
	const features = options.features ?? defaultFeatures;
	const enableTabs = options.enableTabs ?? true;

	const hasFeature = (feature: CommerceFeature) => features.includes(feature);
	const routes: KitModuleRoute[] = [];

	if (hasFeature("product")) {
		routes.push({
			id: "commerce.product",
			path: joinPath(routePrefix, "/products/:id"),
			label: "Product",
			screen: "ProductScreen",
			icon: "Package",
			required: true,
		});
	}

	if (hasFeature("search")) {
		routes.push({
			id: "commerce.search",
			path: joinPath(routePrefix, "/search"),
			label: "Search",
			screen: "SearchScreen",
			icon: "Search",
			tab: enableTabs,
		});
	}

	if (hasFeature("cart")) {
		routes.push({
			id: "commerce.cart",
			path: joinPath(routePrefix, "/cart"),
			label: "Cart",
			screen: "CartScreen",
			icon: "ShoppingCart",
			tab: enableTabs,
			required: true,
		});
	}

	if (hasFeature("checkout")) {
		routes.push({
			id: "commerce.checkout",
			path: joinPath(routePrefix, "/checkout"),
			label: "Checkout",
			screen: "CheckoutScreen",
			icon: "CreditCard",
			required: true,
		});
	}

	if (hasFeature("orders")) {
		routes.push({
			id: "commerce.orders",
			path: joinPath(routePrefix, "/orders/:id"),
			label: "Orders",
			screen: "OrderScreen",
			icon: "Truck",
			tab: enableTabs,
		});
	}

	return {
		id: "commerce",
		title: "Commerce",
		description: "Product discovery, cart, checkout, and order tracking screens.",
		audience: "public",
		screens: features.map((feature) => featureScreens[feature]),
		routes,
		capabilities: [
			{
				id: "commerce.productDisplay",
				label: "Product display",
				description: "Product media, variants, pricing, stock, and recommendations.",
				required: hasFeature("product"),
			},
			{
				id: "commerce.search",
				label: "Product search",
				description: "Search input, filters, recent searches, and result list.",
				required: hasFeature("search"),
			},
			{
				id: "commerce.cart",
				label: "Cart",
				description: "Item quantities, promo code, shipping, tax, and totals.",
				required: hasFeature("cart"),
			},
			{
				id: "commerce.checkout",
				label: "Checkout",
				description: "Shipping, payment, review, and order placement flow.",
				required: hasFeature("checkout"),
			},
			{
				id: "commerce.orders",
				label: "Orders",
				description: "Order summary, tracking, timeline, address, and payment review.",
				required: hasFeature("orders"),
			},
		],
		e2eFlows: ["purchase-loop", "account-checkout-flow", "search-interactions"],
	};
}
