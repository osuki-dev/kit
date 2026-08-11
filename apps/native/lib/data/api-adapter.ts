import type {
	AccountAddress,
	AccountAddressInput,
	AccountAddressUpdateInput,
	AccountProfile,
	AccountProfileUpdateInput,
	AccountSession,
	AccountSignInInput,
	AccountSignUpInput,
	CartItemRecord,
	CreateOrderInput,
	OrderWithItems,
	OsukiDataAdapter,
	Product,
	SettingUpdate,
	UserRecord,
} from "./types";

type ApiAdapterConfig = {
	baseUrl: string;
	getToken?: () => string | Promise<string | null> | null;
};

async function request<T>(config: ApiAdapterConfig, path: string, init?: RequestInit): Promise<T> {
	const token = await config.getToken?.();
	const response = await fetch(`${config.baseUrl}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init?.headers,
		},
	});

	if (!response.ok) {
		throw new Error(`Osuki API request failed: ${response.status}`);
	}

	return response.json() as Promise<T>;
}

export class ApiOsukiAdapter implements OsukiDataAdapter {
	constructor(private readonly config: ApiAdapterConfig) {}

	async init() {}

	listProducts(params: { offset?: number; limit?: number; query?: string } = {}) {
		const search = new URLSearchParams();
		if (params.offset !== undefined) search.set("offset", String(params.offset));
		if (params.limit !== undefined) search.set("limit", String(params.limit));
		if (params.query) search.set("query", params.query);
		return request<Product[]>(this.config, `/products?${search.toString()}`);
	}

	getProduct(id: string) {
		return request<Product | null>(this.config, `/products/${id}`);
	}

	listCartItems() {
		return request<CartItemRecord[]>(this.config, "/cart");
	}

	setCartQuantity(productId: string, quantity: number) {
		return request<void>(this.config, `/cart/${productId}`, {
			method: "PUT",
			body: JSON.stringify({ quantity }),
		});
	}

	removeCartItem(productId: string) {
		return request<void>(this.config, `/cart/${productId}`, { method: "DELETE" });
	}

	addToCart(productId: string, quantity = 1) {
		return request<void>(this.config, "/cart", {
			method: "POST",
			body: JSON.stringify({ productId, quantity }),
		});
	}

	listUsers(params: { offset?: number; limit?: number; query?: string } = {}) {
		const search = new URLSearchParams();
		if (params.offset !== undefined) search.set("offset", String(params.offset));
		if (params.limit !== undefined) search.set("limit", String(params.limit));
		if (params.query) search.set("query", params.query);
		return request<UserRecord[]>(this.config, `/users?${search.toString()}`);
	}

	getAccountSession() {
		return request<AccountSession>(this.config, "/account/session");
	}

	signIn(input: AccountSignInInput) {
		return request<AccountSession>(this.config, "/account/session", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	signUp(input: AccountSignUpInput) {
		return request<AccountSession>(this.config, "/account/register", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	signOut() {
		return request<void>(this.config, "/account/session", { method: "DELETE" });
	}

	getAccountProfile() {
		return request<AccountProfile | null>(this.config, "/account/profile");
	}

	updateAccountProfile(input: AccountProfileUpdateInput) {
		return request<AccountProfile>(this.config, "/account/profile", {
			method: "PATCH",
			body: JSON.stringify(input),
		});
	}

	listAccountAddresses() {
		return request<AccountAddress[]>(this.config, "/account/addresses");
	}

	addAccountAddress(input: AccountAddressInput) {
		return request<AccountAddress[]>(this.config, "/account/addresses", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	updateAccountAddress(addressId: string, input: AccountAddressUpdateInput) {
		return request<AccountAddress[]>(this.config, `/account/addresses/${addressId}`, {
			method: "PATCH",
			body: JSON.stringify(input),
		});
	}

	removeAccountAddress(addressId: string) {
		return request<AccountAddress[]>(this.config, `/account/addresses/${addressId}`, {
			method: "DELETE",
		});
	}

	setDefaultAccountAddress(addressId: string) {
		return request<AccountAddress[]>(this.config, "/account/addresses/default", {
			method: "PATCH",
			body: JSON.stringify({ addressId }),
		});
	}

	listAccountOrders(params: { offset?: number; limit?: number } = {}) {
		const search = new URLSearchParams();
		if (params.offset !== undefined) search.set("offset", String(params.offset));
		if (params.limit !== undefined) search.set("limit", String(params.limit));
		return request<OrderWithItems[]>(this.config, `/account/orders?${search.toString()}`);
	}

	createOrderFromCart(input?: CreateOrderInput) {
		return request<OrderWithItems>(this.config, "/orders", {
			method: "POST",
			body: JSON.stringify(input ?? {}),
		});
	}

	listOrders(params: { offset?: number; limit?: number } = {}) {
		const search = new URLSearchParams();
		if (params.offset !== undefined) search.set("offset", String(params.offset));
		if (params.limit !== undefined) search.set("limit", String(params.limit));
		return request<OrderWithItems[]>(this.config, `/orders?${search.toString()}`);
	}

	getLatestOrder() {
		return request<OrderWithItems | null>(this.config, "/orders/latest");
	}

	listSettings() {
		return request<Record<string, string>>(this.config, "/settings");
	}

	updateSetting(update: SettingUpdate) {
		return request<void>(this.config, `/settings/${update.key}`, {
			method: "PUT",
			body: JSON.stringify({ value: update.value }),
		});
	}

	async resetSeedData() {
		throw new Error("resetSeedData is only available for local adapters.");
	}
}
