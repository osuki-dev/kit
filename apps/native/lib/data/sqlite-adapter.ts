import * as SQLite from "expo-sqlite";

import {
	seedAccountAddresses,
	seedAccountProfile,
	seedCart,
	seedOrderItems,
	seedOrders,
	seedProducts,
	seedSettings,
	seedUsers,
} from "./seed";
import type {
	AccountProfile,
	AccountProfileUpdateInput,
	AccountSession,
	AccountAddress,
	AccountAddressInput,
	AccountAddressUpdateInput,
	AccountSignInInput,
	AccountSignUpInput,
	CartItemRecord,
	CreateOrderInput,
	OrderShippingAddress,
	OrderRecord,
	OrderWithItems,
	OsukiDataAdapter,
	Product,
	SettingUpdate,
	UserRecord,
} from "./types";

type CountRow = { count: number };

const defaultShippingAddress: OrderShippingAddress = {
	customerName: seedAccountProfile.name,
	street: seedAccountAddresses[0]?.street ?? "12 Kit Studio Lane",
	city: seedAccountAddresses[0]?.city ?? "San Francisco",
	zip: seedAccountAddresses[0]?.zip ?? "94107",
	country: seedAccountAddresses[0]?.country ?? "USA",
};

const databaseName = process.env.EXPO_PUBLIC_OSUKI_DATABASE_NAME ?? "osuki-market.db";
const shouldResetDatabase = process.env.EXPO_PUBLIC_OSUKI_RESET_DB === "1";

function settingValue(value: SettingUpdate["value"]) {
	return typeof value === "boolean" ? String(value) : String(value);
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
	private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
	private initPromise: Promise<void> | null = null;

	async init() {
		this.initPromise ??= this.initDatabase();
		return this.initPromise;
	}

	private async initDatabase() {
		const db = await this.database();

		await db.execAsync(`
			PRAGMA journal_mode = WAL;
			CREATE TABLE IF NOT EXISTS products (
				id TEXT PRIMARY KEY NOT NULL,
				name TEXT NOT NULL,
				description TEXT NOT NULL,
				image TEXT NOT NULL,
				price REAL NOT NULL,
				original_price REAL,
				variant TEXT NOT NULL,
				stock INTEGER NOT NULL,
				rating REAL NOT NULL,
				reviews INTEGER NOT NULL,
				category TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS cart_items (
				product_id TEXT PRIMARY KEY NOT NULL,
				quantity INTEGER NOT NULL CHECK(quantity >= 0),
				updated_at TEXT NOT NULL,
				FOREIGN KEY(product_id) REFERENCES products(id)
			);
			CREATE TABLE IF NOT EXISTS settings (
				key TEXT PRIMARY KEY NOT NULL,
				value TEXT NOT NULL,
				updated_at TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY NOT NULL,
				name TEXT NOT NULL,
				email TEXT NOT NULL,
				role TEXT NOT NULL,
				status TEXT NOT NULL,
				department TEXT,
				location TEXT,
				created_at TEXT NOT NULL,
				last_login TEXT
			);
			CREATE TABLE IF NOT EXISTS orders (
				id TEXT PRIMARY KEY NOT NULL,
				status TEXT NOT NULL,
				created_at TEXT NOT NULL,
				subtotal REAL NOT NULL,
				shipping REAL NOT NULL,
				tax REAL NOT NULL,
				total REAL NOT NULL,
				customer_name TEXT NOT NULL,
				street TEXT NOT NULL,
				city TEXT NOT NULL,
				zip TEXT NOT NULL,
				country TEXT NOT NULL,
				payment_type TEXT NOT NULL,
				payment_brand TEXT,
				payment_last4 TEXT,
				tracking_number TEXT
			);
			CREATE TABLE IF NOT EXISTS order_items (
				order_id TEXT NOT NULL,
				product_id TEXT NOT NULL,
				quantity INTEGER NOT NULL,
				price REAL NOT NULL,
				PRIMARY KEY(order_id, product_id),
				FOREIGN KEY(order_id) REFERENCES orders(id),
				FOREIGN KEY(product_id) REFERENCES products(id)
			);
			CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
			CREATE INDEX IF NOT EXISTS cart_updated_idx ON cart_items(updated_at);
			CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);
			CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at);
		`);

		if (shouldResetDatabase) {
			await this.resetSeedData();
			return;
		}

		const row = await db.getFirstAsync<CountRow>("SELECT COUNT(*) as count FROM products");
		if (!row?.count) {
			await this.seed();
		} else {
			await this.ensureStaticSeedData();
		}
	}

	async listProducts(params: { offset?: number; limit?: number; query?: string } = {}) {
		const db = await this.database();
		const limit = params.limit ?? 20;
		const offset = params.offset ?? 0;
		const query = params.query?.trim();

		if (query) {
			return db.getAllAsync<Product>(
				`SELECT
					id, name, description, image, price, original_price as originalPrice,
					variant, stock, rating, reviews, category
				FROM products
				WHERE name LIKE ? OR category LIKE ?
				ORDER BY category, name
				LIMIT ? OFFSET ?`,
				`%${query}%`,
				`%${query}%`,
				limit,
				offset,
			);
		}

		return db.getAllAsync<Product>(
			`SELECT
				id, name, description, image, price, original_price as originalPrice,
				variant, stock, rating, reviews, category
			FROM products
			ORDER BY category, name
			LIMIT ? OFFSET ?`,
			limit,
			offset,
		);
	}

	async getProduct(id: string) {
		const db = await this.database();
		return db.getFirstAsync<Product>(
			`SELECT
				id, name, description, image, price, original_price as originalPrice,
				variant, stock, rating, reviews, category
			FROM products
			WHERE id = ?`,
			id,
		);
	}

	async cacheProducts(products: Product[]) {
		if (products.length === 0) return;

		const db = await this.database();
		await db.withTransactionAsync(async () => {
			for (const product of products) {
				await db.runAsync(
					`INSERT INTO products (
						id, name, description, image, price, original_price,
						variant, stock, rating, reviews, category
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(id) DO UPDATE SET
						name = excluded.name,
						description = excluded.description,
						image = excluded.image,
						price = excluded.price,
						original_price = excluded.original_price,
						variant = excluded.variant,
						stock = excluded.stock,
						rating = excluded.rating,
						reviews = excluded.reviews,
						category = excluded.category`,
					product.id,
					product.name,
					product.description,
					product.image,
					product.price,
					product.originalPrice ?? null,
					product.variant,
					product.stock,
					product.rating,
					product.reviews,
					product.category,
				);
			}
		});
	}

	async listCartItems() {
		const db = await this.database();
		return db.getAllAsync<CartItemRecord>(
			`SELECT
				products.id, products.name, products.description, products.image,
				products.price, products.original_price as originalPrice,
				products.variant, products.stock, products.rating, products.reviews,
				products.category, cart_items.quantity
			FROM cart_items
			INNER JOIN products ON products.id = cart_items.product_id
			WHERE cart_items.quantity > 0
			ORDER BY cart_items.updated_at DESC`,
		);
	}

	async listUsers(params: { offset?: number; limit?: number; query?: string } = {}) {
		const db = await this.database();
		const limit = params.limit ?? 20;
		const offset = params.offset ?? 0;
		const query = params.query?.trim();

		if (query) {
			return db.getAllAsync<UserRecord>(
				`SELECT
					id, name, email, role, status, department, location,
					created_at as createdAt, last_login as lastLogin
				FROM users
				WHERE name LIKE ? OR email LIKE ? OR department LIKE ?
				ORDER BY status, name
				LIMIT ? OFFSET ?`,
				`%${query}%`,
				`%${query}%`,
				`%${query}%`,
				limit,
				offset,
			);
		}

		return db.getAllAsync<UserRecord>(
			`SELECT
				id, name, email, role, status, department, location,
				created_at as createdAt, last_login as lastLogin
			FROM users
			ORDER BY status, name
			LIMIT ? OFFSET ?`,
			limit,
			offset,
		);
	}

	async getAccountSession(): Promise<AccountSession> {
		const settings = await this.listSettings();
		if (settings.accountSession !== "authenticated") return { status: "guest" };

		return {
			status: "authenticated",
			customerId: seedAccountProfile.id,
			email: settings.accountEmail ?? seedAccountProfile.email,
		};
	}

	async signIn(input: AccountSignInInput): Promise<AccountSession> {
		const email = normalizeEmail(input.email);
		if (!email || !input.password) {
			throw new Error("Email and password are required.");
		}

		await this.updateSetting({ key: "accountSession", value: "authenticated" });
		await this.updateSetting({ key: "accountEmail", value: email });
		return { status: "authenticated", customerId: seedAccountProfile.id, email };
	}

	async signUp(input: AccountSignUpInput): Promise<AccountSession> {
		const email = normalizeEmail(input.email);
		if (!input.name.trim() || !email || !input.password) {
			throw new Error("Name, email, and password are required.");
		}

		await this.updateSetting({ key: "accountSession", value: "authenticated" });
		await this.updateSetting({ key: "accountName", value: input.name.trim() });
		await this.updateSetting({ key: "accountEmail", value: email });
		return { status: "authenticated", customerId: seedAccountProfile.id, email };
	}

	async signOut(): Promise<void> {
		await this.updateSetting({ key: "accountSession", value: "guest" });
	}

	async getAccountProfile() {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") return null;

		const settings = await this.listSettings();
		return {
			...seedAccountProfile,
			name: settings.accountName ?? seedAccountProfile.name,
			email: settings.accountEmail ?? seedAccountProfile.email,
			phone: settings.accountPhone ?? seedAccountProfile.phone,
			defaultAddressId: settings.accountDefaultAddressId ?? seedAccountProfile.defaultAddressId,
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

		if (nextName) await this.updateSetting({ key: "accountName", value: nextName });
		if (nextEmail) await this.updateSetting({ key: "accountEmail", value: nextEmail });
		if (nextPhone !== undefined)
			await this.updateSetting({ key: "accountPhone", value: nextPhone });

		const profile = await this.getAccountProfile();
		if (!profile) throw new Error("Unable to load profile.");
		return profile;
	}

	async listAccountAddresses() {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") return [];

		const settings = await this.listSettings();
		const defaultAddressId =
			settings.accountDefaultAddressId ?? seedAccountProfile.defaultAddressId;
		const customAddresses = parseCustomAddresses(settings.accountAddresses);
		const deletedIds = parseAddressIds(settings.deletedAccountAddressIds);
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

		const settings = await this.listSettings();
		const customAddresses = parseCustomAddresses(settings.accountAddresses);
		const address: AccountAddress = {
			...normalizeAddressInput(input),
			id: `addr-${Date.now().toString(36)}`,
		};
		const nextAddresses = [...customAddresses, address];

		await this.updateSetting({ key: "accountAddresses", value: JSON.stringify(nextAddresses) });
		if (input.isDefault || !settings.accountDefaultAddressId) {
			await this.updateSetting({ key: "accountDefaultAddressId", value: address.id });
		}

		return this.listAccountAddresses();
	}

	async updateAccountAddress(addressId: string, input: AccountAddressUpdateInput) {
		const addresses = await this.listAccountAddresses();
		const current = addresses.find((address) => address.id === addressId);
		if (!current) throw new Error("Address was not found.");
		const settings = await this.listSettings();
		const customAddresses = parseCustomAddresses(settings.accountAddresses);
		const updated = {
			...current,
			...normalizeAddressInput({ ...current, ...input }),
			id: addressId,
		};
		await this.updateSetting({
			key: "accountAddresses",
			value: JSON.stringify([
				...customAddresses.filter((address) => address.id !== addressId),
				updated,
			]),
		});
		return this.listAccountAddresses();
	}

	async removeAccountAddress(addressId: string) {
		const addresses = await this.listAccountAddresses();
		if (!addresses.some((address) => address.id === addressId))
			throw new Error("Address was not found.");
		if (addresses.length === 1) throw new Error("Keep at least one address.");
		const settings = await this.listSettings();
		const deletedIds = parseAddressIds(settings.deletedAccountAddressIds);
		deletedIds.add(addressId);
		await this.updateSetting({
			key: "deletedAccountAddressIds",
			value: JSON.stringify([...deletedIds]),
		});
		const customAddresses = parseCustomAddresses(settings.accountAddresses);
		await this.updateSetting({
			key: "accountAddresses",
			value: JSON.stringify(customAddresses.filter((address) => address.id !== addressId)),
		});
		if (addresses.find((address) => address.id === addressId)?.isDefault) {
			await this.updateSetting({
				key: "accountDefaultAddressId",
				value: addresses.find((address) => address.id !== addressId)!.id,
			});
		}
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

		await this.updateSetting({ key: "accountDefaultAddressId", value: addressId });
		return this.listAccountAddresses();
	}

	async listAccountOrders(params: { offset?: number; limit?: number } = {}) {
		const session = await this.getAccountSession();
		if (session.status !== "authenticated") return [];

		const orders = await this.listOrders(params);
		const hydrated = await Promise.all(
			orders.map(async (order) => {
				const db = await this.database();
				const items = await db.getAllAsync<CartItemRecord>(
					`SELECT
						products.id, products.name, products.description, products.image,
						order_items.price, products.original_price as originalPrice,
						products.variant, products.stock, products.rating, products.reviews,
						products.category, order_items.quantity
					FROM order_items
					INNER JOIN products ON products.id = order_items.product_id
					WHERE order_items.order_id = ?
					ORDER BY products.name`,
					order.id,
				);
				return { ...order, items };
			}),
		);

		return hydrated;
	}

	async createOrderFromCart(input: CreateOrderInput = {}) {
		const items = await this.listCartItems();
		if (items.length === 0) {
			throw new Error("Cannot create an order from an empty cart.");
		}

		const db = await this.database();
		const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const shipping = subtotal >= 500 ? 0 : 10;
		const tax = subtotal * 0.08;
		const total = subtotal + shipping + tax;
		const createdAt = new Date().toISOString();
		const shippingAddress = input.shippingAddress ?? defaultShippingAddress;
		const order: OrderRecord = {
			id: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
			status: "confirmed",
			createdAt,
			subtotal,
			shipping,
			tax,
			total,
			customerName: shippingAddress.customerName,
			street: shippingAddress.street,
			city: shippingAddress.city,
			zip: shippingAddress.zip,
			country: shippingAddress.country,
			paymentType: "card",
			paymentBrand: "Visa",
			paymentLast4: "4242",
			trackingNumber: `OSK${String(Date.now()).slice(-10)}`,
		};

		await db.withTransactionAsync(async () => {
			await db.runAsync(
				`INSERT INTO orders (
					id, status, created_at, subtotal, shipping, tax, total,
					customer_name, street, city, zip, country,
					payment_type, payment_brand, payment_last4, tracking_number
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				order.id,
				order.status,
				order.createdAt,
				order.subtotal,
				order.shipping,
				order.tax,
				order.total,
				order.customerName,
				order.street,
				order.city,
				order.zip,
				order.country,
				order.paymentType,
				order.paymentBrand ?? null,
				order.paymentLast4 ?? null,
				order.trackingNumber ?? null,
			);

			for (const item of items) {
				await db.runAsync(
					`INSERT INTO order_items (order_id, product_id, quantity, price)
					VALUES (?, ?, ?, ?)`,
					order.id,
					item.id,
					item.quantity,
					item.price,
				);
			}

			await db.runAsync("DELETE FROM cart_items");
		});

		return { ...order, items };
	}

	async listOrders(params: { offset?: number; limit?: number } = {}) {
		const db = await this.database();
		return db.getAllAsync<OrderRecord>(
			`SELECT
				id, status, created_at as createdAt, subtotal, shipping, tax, total,
				customer_name as customerName, street, city, zip, country,
				payment_type as paymentType, payment_brand as paymentBrand,
				payment_last4 as paymentLast4, tracking_number as trackingNumber
			FROM orders
			ORDER BY created_at DESC
			LIMIT ? OFFSET ?`,
			params.limit ?? 20,
			params.offset ?? 0,
		);
	}

	async getLatestOrder() {
		const db = await this.database();
		const order = await db.getFirstAsync<OrderRecord>(
			`SELECT
				id, status, created_at as createdAt, subtotal, shipping, tax, total,
				customer_name as customerName, street, city, zip, country,
				payment_type as paymentType, payment_brand as paymentBrand,
				payment_last4 as paymentLast4, tracking_number as trackingNumber
			FROM orders
			ORDER BY created_at DESC
			LIMIT 1`,
		);

		if (!order) return null;

		const items = await db.getAllAsync<CartItemRecord>(
			`SELECT
				products.id, products.name, products.description, products.image,
				order_items.price, products.original_price as originalPrice,
				products.variant, products.stock, products.rating, products.reviews,
				products.category, order_items.quantity
			FROM order_items
			INNER JOIN products ON products.id = order_items.product_id
			WHERE order_items.order_id = ?
			ORDER BY products.name`,
			order.id,
		);

		return { ...order, items } satisfies OrderWithItems;
	}

	async setCartQuantity(productId: string, quantity: number) {
		const db = await this.database();
		const normalized = Math.max(0, Math.floor(quantity));

		if (normalized <= 0) {
			await this.removeCartItem(productId);
			return;
		}
		const product = await this.requirePurchasableProduct(productId);
		if (normalized > product.stock) throw new Error(`Only ${product.stock} items are available.`);

		await db.runAsync(
			`INSERT INTO cart_items (product_id, quantity, updated_at)
			VALUES (?, ?, ?)
			ON CONFLICT(product_id) DO UPDATE SET
				quantity = excluded.quantity,
				updated_at = excluded.updated_at`,
			productId,
			normalized,
			new Date().toISOString(),
		);
	}

	async addToCart(productId: string, quantity = 1) {
		const db = await this.database();
		const product = await this.requirePurchasableProduct(productId);
		const current = await db.getFirstAsync<{ quantity: number }>(
			"SELECT quantity FROM cart_items WHERE product_id = ?",
			productId,
		);
		const nextQuantity = (current?.quantity ?? 0) + Math.max(1, Math.floor(quantity));
		if (nextQuantity > product.stock) throw new Error(`Only ${product.stock} items are available.`);
		await db.runAsync(
			`INSERT INTO cart_items (product_id, quantity, updated_at)
			VALUES (?, ?, ?)
			ON CONFLICT(product_id) DO UPDATE SET
				quantity = cart_items.quantity + excluded.quantity,
				updated_at = excluded.updated_at`,
			productId,
			Math.max(1, Math.floor(quantity)),
			new Date().toISOString(),
		);
	}

	async removeCartItem(productId: string) {
		const db = await this.database();
		await db.runAsync("DELETE FROM cart_items WHERE product_id = ?", productId);
	}

	private async requirePurchasableProduct(productId: string) {
		const product = await this.getProduct(productId);
		if (!product) throw new Error("Product was not found.");
		if (product.stock <= 0) throw new Error("Product is unavailable.");
		return product;
	}

	async listSettings() {
		const db = await this.database();
		const rows = await db.getAllAsync<{ key: string; value: string }>(
			"SELECT key, value FROM settings ORDER BY key",
		);

		return rows.reduce<Record<string, string>>((acc, row) => {
			acc[row.key] = row.value;
			return acc;
		}, {});
	}

	async updateSetting(update: SettingUpdate) {
		const db = await this.database();
		await db.runAsync(
			`INSERT INTO settings (key, value, updated_at)
			VALUES (?, ?, ?)
			ON CONFLICT(key) DO UPDATE SET
				value = excluded.value,
				updated_at = excluded.updated_at`,
			update.key,
			settingValue(update.value),
			new Date().toISOString(),
		);
	}

	async resetSeedData() {
		const db = await this.database();
		await db.execAsync(`
			DELETE FROM cart_items;
			DELETE FROM settings;
			DELETE FROM products;
			DELETE FROM users;
			DELETE FROM order_items;
			DELETE FROM orders;
		`);
		await this.seed();
	}

	private database() {
		this.dbPromise ??= SQLite.openDatabaseAsync(databaseName);
		return this.dbPromise;
	}

	private async seed() {
		const db = await this.database();
		const now = new Date().toISOString();

		await db.withTransactionAsync(async () => {
			for (const product of seedProducts) {
				await db.runAsync(
					`INSERT OR REPLACE INTO products (
						id, name, description, image, price, original_price,
						variant, stock, rating, reviews, category
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					product.id,
					product.name,
					product.description,
					product.image,
					product.price,
					product.originalPrice ?? null,
					product.variant,
					product.stock,
					product.rating,
					product.reviews,
					product.category,
				);
			}

			for (const item of seedCart) {
				await db.runAsync(
					"INSERT OR REPLACE INTO cart_items (product_id, quantity, updated_at) VALUES (?, ?, ?)",
					item.productId,
					item.quantity,
					now,
				);
			}

			for (const order of seedOrders) {
				await db.runAsync(
					`INSERT OR REPLACE INTO orders (
						id, status, created_at, subtotal, shipping, tax, total,
						customer_name, street, city, zip, country,
						payment_type, payment_brand, payment_last4, tracking_number
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					order.id,
					order.status,
					order.createdAt,
					order.subtotal,
					order.shipping,
					order.tax,
					order.total,
					order.customerName,
					order.street,
					order.city,
					order.zip,
					order.country,
					order.paymentType,
					order.paymentBrand ?? null,
					order.paymentLast4 ?? null,
					order.trackingNumber ?? null,
				);
			}

			for (const item of seedOrderItems) {
				await db.runAsync(
					`INSERT OR REPLACE INTO order_items (order_id, product_id, quantity, price)
					VALUES (?, ?, ?, ?)`,
					item.orderId,
					item.productId,
					item.quantity,
					item.price,
				);
			}

			for (const setting of seedSettings) {
				await db.runAsync(
					"INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
					setting.key,
					setting.value,
					now,
				);
			}

			for (const user of seedUsers) {
				await db.runAsync(
					`INSERT OR REPLACE INTO users (
						id, name, email, role, status, department, location, created_at, last_login
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					user.id,
					user.name,
					user.email,
					user.role,
					user.status,
					user.department,
					user.location,
					now,
					user.status === "active" ? now : null,
				);
			}
		});
	}

	private async ensureStaticSeedData() {
		const db = await this.database();
		const now = new Date().toISOString();

		await db.withTransactionAsync(async () => {
			for (const product of seedProducts) {
				await db.runAsync(
					`INSERT OR IGNORE INTO products (
						id, name, description, image, price, original_price,
						variant, stock, rating, reviews, category
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					product.id,
					product.name,
					product.description,
					product.image,
					product.price,
					product.originalPrice ?? null,
					product.variant,
					product.stock,
					product.rating,
					product.reviews,
					product.category,
				);
			}

			for (const order of seedOrders) {
				await db.runAsync(
					`INSERT OR IGNORE INTO orders (
						id, status, created_at, subtotal, shipping, tax, total,
						customer_name, street, city, zip, country,
						payment_type, payment_brand, payment_last4, tracking_number
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					order.id,
					order.status,
					order.createdAt,
					order.subtotal,
					order.shipping,
					order.tax,
					order.total,
					order.customerName,
					order.street,
					order.city,
					order.zip,
					order.country,
					order.paymentType,
					order.paymentBrand ?? null,
					order.paymentLast4 ?? null,
					order.trackingNumber ?? null,
				);
			}

			for (const item of seedOrderItems) {
				await db.runAsync(
					`INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price)
					VALUES (?, ?, ?, ?)`,
					item.orderId,
					item.productId,
					item.quantity,
					item.price,
				);
			}

			for (const setting of seedSettings) {
				await db.runAsync(
					"INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
					setting.key,
					setting.value,
					now,
				);
			}
		});
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
