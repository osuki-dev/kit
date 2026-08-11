import {
	seedAccountAddresses,
	seedAccountProfile,
	seedOrderItems,
	seedOrders,
	seedSettings,
	seedUsers,
} from "./seed";
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
	OrderShippingAddress,
	OrderWithItems,
	OsukiDataAdapter,
	Product,
	SettingUpdate,
	UserRecord,
} from "./types";

const settingsStorageKey = "osuki-market-settings";

const defaultShippingAddress: OrderShippingAddress = {
	customerName: seedAccountProfile.name,
	street: seedAccountAddresses[0]?.street ?? "12 Kit Studio Lane",
	city: seedAccountAddresses[0]?.city ?? "San Francisco",
	zip: seedAccountAddresses[0]?.zip ?? "94107",
	country: seedAccountAddresses[0]?.country ?? "USA",
};

function createDefaultSettings() {
	return new Map(seedSettings.map((setting) => [setting.key, String(setting.value)]));
}

function loadSettings() {
	const settings = createDefaultSettings();
	try {
		const stored = globalThis.localStorage?.getItem(settingsStorageKey);
		if (!stored) return settings;
		const parsed = JSON.parse(stored) as Record<string, string>;
		for (const [key, value] of Object.entries(parsed)) {
			settings.set(key, String(value));
		}
	} catch {
		return settings;
	}
	return settings;
}

function persistSettings(settings: Map<string, string>) {
	try {
		globalThis.localStorage?.setItem(
			settingsStorageKey,
			JSON.stringify(Object.fromEntries(settings)),
		);
	} catch {
		// Persistence is best-effort in browser previews.
	}
}

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function normalizeAddressInput(input: AccountAddressInput): AccountAddressInput {
	const next = {
		name: input.name.trim(),
		street: input.street.trim(),
		city: input.city.trim(),
		zip: input.zip.trim(),
		country: input.country.trim(),
		phone: input.phone?.trim(),
		isDefault: input.isDefault,
	};

	if (!next.name) throw new Error("Name is required.");
	if (!next.street) throw new Error("Street address is required.");
	if (!next.city) throw new Error("City is required.");
	if (!next.zip) throw new Error("ZIP or postal code is required.");
	if (!next.country) throw new Error("Country is required.");

	return next;
}

export class SQLiteOsukiAdapter implements OsukiDataAdapter {
	private products = new Map<string, Product>();
	private cart = new Map<string, number>();
	private users: UserRecord[] = seedUsers.map((user, index) => ({
		...user,
		createdAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
		lastLogin: new Date(Date.UTC(2026, 5, index + 1)).toISOString(),
	}));
	private settings = loadSettings();
	private orders: OrderWithItems[] = [];

	async init() {
		if (this.orders.length === 0) {
			this.hydrateSeedOrders();
		}
	}

	async cacheProducts(products: Product[]) {
		for (const product of products) {
			this.products.set(product.id, product);
		}
	}

	async listProducts(params: { offset?: number; limit?: number; query?: string } = {}) {
		const query = params.query?.trim().toLowerCase();
		const products = [...this.products.values()].filter((product) => {
			if (!query) return true;
			return (
				product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)
			);
		});

		return products.slice(
			params.offset ?? 0,
			(params.offset ?? 0) + (params.limit ?? products.length),
		);
	}

	async getProduct(id: string) {
		return this.products.get(id) ?? null;
	}

	async listCartItems() {
		return [...this.cart.entries()]
			.map(([productId, quantity]) => {
				const product = this.products.get(productId);
				return product ? { ...product, quantity } : null;
			})
			.filter((item): item is CartItemRecord => Boolean(item));
	}

	async setCartQuantity(productId: string, quantity: number) {
		const product = this.requirePurchasableProduct(productId);
		const normalized = Math.max(0, Math.floor(quantity));
		if (normalized <= 0) {
			this.cart.delete(productId);
			return;
		}
		if (normalized > product.stock) throw new Error(`Only ${product.stock} items are available.`);
		this.cart.set(productId, normalized);
	}

	async removeCartItem(productId: string) {
		this.cart.delete(productId);
	}

	async addToCart(productId: string, quantity = 1) {
		const product = this.requirePurchasableProduct(productId);
		const nextQuantity = (this.cart.get(productId) ?? 0) + Math.max(1, Math.floor(quantity));
		if (nextQuantity > product.stock) throw new Error(`Only ${product.stock} items are available.`);
		this.cart.set(productId, nextQuantity);
	}

	async listUsers(params: { offset?: number; limit?: number; query?: string } = {}) {
		const query = params.query?.trim().toLowerCase();
		const users = this.users.filter((user) => {
			if (!query) return true;
			return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
		});
		return users.slice(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? users.length));
	}

	async getAccountSession(): Promise<AccountSession> {
		if (this.settings.get("accountSession") !== "authenticated") return { status: "guest" };
		return {
			status: "authenticated",
			customerId: seedAccountProfile.id,
			email: this.settings.get("accountEmail") ?? seedAccountProfile.email,
		};
	}

	async signIn(input: AccountSignInInput): Promise<AccountSession> {
		const email = normalizeEmail(input.email);
		if (!email || !input.password) {
			throw new Error("Email and password are required.");
		}

		this.settings.set("accountSession", "authenticated");
		this.settings.set("accountEmail", email);
		persistSettings(this.settings);
		return { status: "authenticated", customerId: seedAccountProfile.id, email };
	}

	async signUp(input: AccountSignUpInput): Promise<AccountSession> {
		const email = normalizeEmail(input.email);
		if (!input.name.trim() || !email || !input.password) {
			throw new Error("Name, email, and password are required.");
		}

		this.settings.set("accountSession", "authenticated");
		this.settings.set("accountName", input.name.trim());
		this.settings.set("accountEmail", email);
		persistSettings(this.settings);
		return { status: "authenticated", customerId: seedAccountProfile.id, email };
	}

	async signOut(): Promise<void> {
		this.settings.set("accountSession", "guest");
		persistSettings(this.settings);
	}

	async getAccountProfile() {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") return null;
		return {
			...seedAccountProfile,
			name: this.settings.get("accountName") ?? seedAccountProfile.name,
			email: this.settings.get("accountEmail") ?? seedAccountProfile.email,
			phone: this.settings.get("accountPhone") ?? seedAccountProfile.phone,
			defaultAddressId:
				this.settings.get("accountDefaultAddressId") ?? seedAccountProfile.defaultAddressId,
		};
	}

	async updateAccountProfile(input: AccountProfileUpdateInput): Promise<AccountProfile> {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") {
			throw new Error("Sign in before updating your profile.");
		}

		const nextName = input.name?.trim();
		const nextEmail = input.email?.trim().toLowerCase();
		const nextPhone = input.phone?.trim();

		if (input.name !== undefined && !nextName) {
			throw new Error("Name is required.");
		}
		if (input.email !== undefined && !nextEmail) {
			throw new Error("Email is required.");
		}

		if (nextName) this.settings.set("accountName", nextName);
		if (nextEmail) this.settings.set("accountEmail", nextEmail);
		if (nextPhone !== undefined) this.settings.set("accountPhone", nextPhone);
		persistSettings(this.settings);

		const profile = await this.getAccountProfile();
		if (!profile) throw new Error("Unable to load profile.");
		return profile;
	}

	async listAccountAddresses() {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") return [];

		const defaultAddressId =
			this.settings.get("accountDefaultAddressId") ?? seedAccountProfile.defaultAddressId;
		const customAddresses = parseCustomAddresses(this.settings.get("accountAddresses"));
		const deletedIds = parseAddressIds(this.settings.get("deletedAccountAddressIds"));
		return mergeAccountAddresses(customAddresses)
			.filter((address) => !deletedIds.has(address.id))
			.map((address) => ({
				...address,
				isDefault: address.id === defaultAddressId,
			}));
	}

	async addAccountAddress(input: AccountAddressInput) {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") {
			throw new Error("Sign in before adding an address.");
		}

		const customAddresses = parseCustomAddresses(this.settings.get("accountAddresses"));
		const address: AccountAddress = {
			...normalizeAddressInput(input),
			id: `addr-${Date.now().toString(36)}`,
		};
		this.settings.set("accountAddresses", JSON.stringify([...customAddresses, address]));
		if (input.isDefault || !this.settings.get("accountDefaultAddressId")) {
			this.settings.set("accountDefaultAddressId", address.id);
		}
		persistSettings(this.settings);

		return this.listAccountAddresses();
	}

	async updateAccountAddress(addressId: string, input: AccountAddressUpdateInput) {
		const addresses = await this.listAccountAddresses();
		const current = addresses.find((address) => address.id === addressId);
		if (!current) throw new Error("Address was not found.");
		const customAddresses = parseCustomAddresses(this.settings.get("accountAddresses"));
		const updated = {
			...current,
			...normalizeAddressInput({ ...current, ...input }),
			id: addressId,
		};
		this.settings.set(
			"accountAddresses",
			JSON.stringify([...customAddresses.filter((address) => address.id !== addressId), updated]),
		);
		persistSettings(this.settings);
		return this.listAccountAddresses();
	}

	async removeAccountAddress(addressId: string) {
		const addresses = await this.listAccountAddresses();
		if (!addresses.some((address) => address.id === addressId))
			throw new Error("Address was not found.");
		if (addresses.length === 1) throw new Error("Keep at least one address.");
		const deletedIds = parseAddressIds(this.settings.get("deletedAccountAddressIds"));
		deletedIds.add(addressId);
		this.settings.set("deletedAccountAddressIds", JSON.stringify([...deletedIds]));
		const customAddresses = parseCustomAddresses(this.settings.get("accountAddresses"));
		this.settings.set(
			"accountAddresses",
			JSON.stringify(customAddresses.filter((address) => address.id !== addressId)),
		);
		if (addresses.find((address) => address.id === addressId)?.isDefault) {
			this.settings.set(
				"accountDefaultAddressId",
				addresses.find((address) => address.id !== addressId)!.id,
			);
		}
		persistSettings(this.settings);
		return this.listAccountAddresses();
	}

	async setDefaultAccountAddress(addressId: string) {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") {
			throw new Error("Sign in before changing addresses.");
		}
		const addresses = await this.listAccountAddresses();
		if (!addresses.some((address) => address.id === addressId)) {
			throw new Error("Address was not found.");
		}

		this.settings.set("accountDefaultAddressId", addressId);
		persistSettings(this.settings);
		return this.listAccountAddresses();
	}

	async listAccountOrders(params: { offset?: number; limit?: number } = {}) {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") return [];
		return this.orders.slice(
			params.offset ?? 0,
			(params.offset ?? 0) + (params.limit ?? this.orders.length),
		);
	}

	async createOrderFromCart(input: CreateOrderInput = {}) {
		const items = await this.listCartItems();
		if (items.length === 0) {
			throw new Error("Cannot create an order from an empty cart.");
		}

		const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const shipping = subtotal >= 500 ? 0 : 10;
		const tax = subtotal * 0.08;
		const shippingAddress = input.shippingAddress ?? defaultShippingAddress;
		const order: OrderWithItems = {
			id: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
			status: "confirmed",
			createdAt: new Date().toISOString(),
			subtotal,
			shipping,
			tax,
			total: subtotal + shipping + tax,
			customerName: shippingAddress.customerName,
			street: shippingAddress.street,
			city: shippingAddress.city,
			zip: shippingAddress.zip,
			country: shippingAddress.country,
			paymentType: "card",
			paymentBrand: "Visa",
			paymentLast4: "4242",
			trackingNumber: `OSK${String(Date.now()).slice(-8)}`,
			items,
		};

		this.orders.unshift(order);
		this.cart.clear();
		return order;
	}

	async listOrders(params: { offset?: number; limit?: number } = {}) {
		return this.orders
			.map((orderWithItems) => {
				const { items: _items, ...order } = orderWithItems;
				return order;
			})
			.slice(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? this.orders.length));
	}

	async getLatestOrder() {
		return this.orders[0] ?? null;
	}

	async listSettings() {
		return Object.fromEntries(this.settings);
	}

	async updateSetting(update: SettingUpdate) {
		this.settings.set(update.key, String(update.value));
		persistSettings(this.settings);
	}

	async resetSeedData() {
		this.cart.clear();
		this.orders = [];
		this.settings = createDefaultSettings();
		persistSettings(this.settings);
	}

	private hydrateSeedOrders() {
		this.orders = seedOrders.map((order) => ({
			...order,
			items: seedOrderItems
				.filter((item) => item.orderId === order.id)
				.map((item) => {
					const product = this.products.get(item.productId);
					return product ? { ...product, quantity: item.quantity, price: item.price } : null;
				})
				.filter((item): item is CartItemRecord => Boolean(item)),
		}));
	}

	private requirePurchasableProduct(productId: string) {
		const product = this.products.get(productId);
		if (!product) throw new Error("Product was not found.");
		if (product.stock <= 0) throw new Error("Product is unavailable.");
		return product;
	}
}

function parseCustomAddresses(value?: string): AccountAddress[] {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value) as AccountAddress[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function parseAddressIds(value?: string) {
	try {
		return new Set(typeof value === "string" ? (JSON.parse(value) as string[]) : []);
	} catch {
		return new Set<string>();
	}
}

function mergeAccountAddresses(customAddresses: AccountAddress[]) {
	const addresses = new Map(seedAccountAddresses.map((address) => [address.id, address]));
	for (const address of customAddresses) addresses.set(address.id, address);
	return [...addresses.values()];
}
