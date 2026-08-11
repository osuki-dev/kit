import { Platform } from "react-native";

import { createDefaultAccountAdapter } from "./account-adapter-factory";
import { SQLiteOsukiAdapter } from "./sqlite-adapter";
import type {
	AccountDataAdapter,
	AccountProfileUpdateInput,
	AccountSignInInput,
	AccountSignUpInput,
	CreateOrderInput,
	OrderRecord,
	OrderWithItems,
	OsukiDataAdapter,
	Product,
	SettingUpdate,
	UserRecord,
} from "./types";

const storefrontDomain =
	process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN ?? "osuki-77sfxugu.myshopify.com";
const storefrontAccessToken =
	process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "00d6e97888db6319179a6e598fd6eb20";
const storefrontApiVersion = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION ?? "2026-04";
let nitroFetch: typeof globalThis.fetch | null | undefined;

type ShopifyMoney = {
	amount: string;
	currencyCode: string;
};

type ShopifyImage = {
	url: string;
	altText?: string | null;
} | null;

type ShopifyProductNode = {
	id: string;
	handle: string;
	title: string;
	description?: string;
	featuredImage: ShopifyImage;
	priceRange: {
		minVariantPrice: ShopifyMoney;
	};
	compareAtPriceRange: {
		minVariantPrice: ShopifyMoney;
	};
	variants: {
		edges: Array<{
			node: {
				id: string;
				title: string;
				availableForSale: boolean;
				image: ShopifyImage;
			};
		}>;
	};
	tags: string[];
	productType?: string;
	vendor?: string;
};

type ShopifyProductsResponse = {
	products: {
		edges: Array<{ node: ShopifyProductNode }>;
	};
};

type ShopifyProductResponse = {
	product?: ShopifyProductNode | null;
	node?: ShopifyProductNode | null;
};

type ShopifyGraphQLResponse<T> = {
	data?: T;
	errors?: Array<{ message: string }>;
};

export type ShopifyStorefrontAdapterOptions = {
	accountAdapter?: AccountDataAdapter;
	localStore?: SQLiteOsukiAdapter;
};

export class ShopifyStorefrontAdapter implements OsukiDataAdapter {
	private readonly localStore: SQLiteOsukiAdapter;
	private readonly accountAdapter: AccountDataAdapter;

	constructor(options: ShopifyStorefrontAdapterOptions = {}) {
		this.localStore = options.localStore ?? new SQLiteOsukiAdapter();
		this.accountAdapter =
			options.accountAdapter ?? createDefaultAccountAdapter(this.localStore).adapter;
	}

	async init() {
		await this.localStore.init();
	}

	async listProducts(params: { offset?: number; limit?: number; query?: string } = {}) {
		const first = Math.min(Math.max((params.limit ?? 20) + (params.offset ?? 0), 1), 50);
		const data = await storefrontRequest<ShopifyProductsResponse>(
			`query Products($first: Int!, $query: String) {
				products(first: $first, query: $query) {
					edges {
						node {
							id
							handle
							title
							description
							featuredImage {
								url
								altText
							}
							priceRange {
								minVariantPrice {
									amount
									currencyCode
								}
							}
							compareAtPriceRange {
								minVariantPrice {
									amount
									currencyCode
								}
							}
							variants(first: 1) {
								edges {
									node {
										id
										title
										availableForSale
										image {
											url
											altText
										}
									}
								}
							}
							tags
							productType
							vendor
						}
					}
				}
			}`,
			{
				first,
				query: params.query ? `title:*${params.query}* OR tag:${params.query}` : undefined,
			},
		);

		const products = data.products.edges.map(({ node }) => mapShopifyProduct(node));
		await this.localStore.cacheProducts(products);
		return products.slice(
			params.offset ?? 0,
			(params.offset ?? 0) + (params.limit ?? products.length),
		);
	}

	async getProduct(id: string) {
		const isShopifyGid = id.startsWith("gid://shopify/Product/");
		const data = await storefrontRequest<ShopifyProductResponse>(
			isShopifyGid
				? `query ProductById($id: ID!) {
					node(id: $id) {
						... on Product {
							id
							handle
							title
							description
							featuredImage { url altText }
							priceRange { minVariantPrice { amount currencyCode } }
							compareAtPriceRange { minVariantPrice { amount currencyCode } }
							variants(first: 1) {
								edges { node { id title availableForSale image { url altText } } }
							}
							tags
							productType
							vendor
						}
					}
				}`
				: `query ProductByHandle($handle: String!) {
					product(handle: $handle) {
						id
						handle
						title
						description
						featuredImage { url altText }
						priceRange { minVariantPrice { amount currencyCode } }
						compareAtPriceRange { minVariantPrice { amount currencyCode } }
						variants(first: 1) {
							edges { node { id title availableForSale image { url altText } } }
						}
						tags
						productType
						vendor
					}
				}`,
			isShopifyGid ? { id } : { handle: id },
		);

		const node = data.node ?? data.product;
		if (!node) return this.localStore.getProduct(id);

		const product = mapShopifyProduct(node);
		await this.localStore.cacheProducts([product]);
		return product;
	}

	async listCartItems() {
		return this.localStore.listCartItems();
	}

	async setCartQuantity(productId: string, quantity: number) {
		await this.ensureProductCached(productId);
		return this.localStore.setCartQuantity(productId, quantity);
	}

	async removeCartItem(productId: string) {
		return this.localStore.removeCartItem(productId);
	}

	async addToCart(productId: string, quantity = 1) {
		await this.ensureProductCached(productId);
		return this.localStore.addToCart(productId, quantity);
	}

	listUsers(params?: { offset?: number; limit?: number; query?: string }): Promise<UserRecord[]> {
		return this.localStore.listUsers(params);
	}

	getAccountSession() {
		return this.accountAdapter.getAccountSession();
	}

	signIn(input: AccountSignInInput) {
		return this.accountAdapter.signIn(input);
	}

	signUp(input: AccountSignUpInput) {
		return this.accountAdapter.signUp(input);
	}

	signOut() {
		return this.accountAdapter.signOut();
	}

	getAccountProfile() {
		return this.accountAdapter.getAccountProfile();
	}

	updateAccountProfile(input: AccountProfileUpdateInput) {
		return this.accountAdapter.updateAccountProfile(input);
	}

	listAccountAddresses() {
		return this.accountAdapter.listAccountAddresses();
	}

	addAccountAddress(input: Parameters<AccountDataAdapter["addAccountAddress"]>[0]) {
		return this.accountAdapter.addAccountAddress(input);
	}

	updateAccountAddress(
		addressId: string,
		input: Parameters<AccountDataAdapter["updateAccountAddress"]>[1],
	) {
		return this.accountAdapter.updateAccountAddress(addressId, input);
	}

	removeAccountAddress(addressId: string) {
		return this.accountAdapter.removeAccountAddress(addressId);
	}

	setDefaultAccountAddress(addressId: string) {
		return this.accountAdapter.setDefaultAccountAddress(addressId);
	}

	listAccountOrders(params?: { offset?: number; limit?: number }) {
		return this.accountAdapter.listAccountOrders(params);
	}

	createOrderFromCart(input?: CreateOrderInput): Promise<OrderWithItems> {
		return this.localStore.createOrderFromCart(input);
	}

	listOrders(params?: { offset?: number; limit?: number }): Promise<OrderRecord[]> {
		return this.localStore.listOrders(params);
	}

	getLatestOrder(): Promise<OrderWithItems | null> {
		return this.localStore.getLatestOrder();
	}

	listSettings(): Promise<Record<string, string>> {
		return this.localStore.listSettings();
	}

	updateSetting(update: SettingUpdate): Promise<void> {
		return this.localStore.updateSetting(update);
	}

	resetSeedData(): Promise<void> {
		return this.localStore.resetSeedData();
	}

	private async ensureProductCached(productId: string) {
		const existing = await this.localStore.getProduct(productId);
		if (existing) return;

		const product = await this.getProduct(productId);
		if (product) {
			await this.localStore.cacheProducts([product]);
		}
	}
}

async function storefrontRequest<T>(
	query: string,
	variables?: Record<string, unknown>,
): Promise<T> {
	const response = await nativeFetch(
		`https://${storefrontDomain}/api/${storefrontApiVersion}/graphql.json`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": storefrontAccessToken,
			},
			body: JSON.stringify({ query, variables }),
		},
	);

	if (!response.ok) {
		throw new Error(`Shopify Storefront request failed: ${response.status}`);
	}

	const payload = (await response.json()) as ShopifyGraphQLResponse<T>;
	if (payload.errors?.length) {
		throw new Error(payload.errors.map((error) => error.message).join("; "));
	}
	if (!payload.data) {
		throw new Error("Shopify Storefront request returned no data.");
	}

	return payload.data;
}

function nativeFetch(input: RequestInfo | URL, init?: RequestInit) {
	if (Platform.OS === "web") {
		return globalThis.fetch(input, init);
	}

	if (nitroFetch === undefined) {
		try {
			const mod = require("react-native-nitro-fetch") as {
				fetch?: typeof globalThis.fetch;
			};
			nitroFetch = mod.fetch ?? null;
		} catch {
			nitroFetch = null;
		}
	}

	return (nitroFetch ?? globalThis.fetch)(input, init);
}

function mapShopifyProduct(node: ShopifyProductNode): Product {
	const variant = node.variants.edges[0]?.node;
	const image = variant?.image?.url ?? node.featuredImage?.url ?? "";
	const price = Number(node.priceRange.minVariantPrice.amount);
	const compareAtPrice = Number(node.compareAtPriceRange.minVariantPrice.amount);
	const category = normalizeCategory(node.productType || node.tags[0] || node.vendor || "other");

	return {
		id: node.id,
		name: node.title,
		description:
			node.description?.trim() ||
			[node.vendor, node.productType, node.tags.slice(0, 2).join(" / ")]
				.filter(Boolean)
				.join(" · ") ||
			"Curated by Osuki Market.",
		image,
		price,
		originalPrice: compareAtPrice > price ? compareAtPrice : undefined,
		variant: variant?.title && variant.title !== "Default Title" ? variant.title : "Standard",
		stock: variant?.availableForSale ? 12 : 0,
		rating: 4.8,
		reviews: 128,
		category,
	};
}

function normalizeCategory(value: string) {
	const normalized = value.toLowerCase().trim();
	if (normalized.includes("snow")) return "winter";
	if (normalized.includes("gift")) return "gift";
	if (normalized.includes("access")) return "accessory";
	return normalized || "other";
}
