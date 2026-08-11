import * as BunTest from "bun:test";

import type { Product } from "./types";

const { describe, expect, test } = BunTest;
const mock = (
	BunTest as unknown as { mock: { module: (path: string, factory: () => unknown) => void } }
).mock;

mock.module("@/lib/catalog-assets", () => ({
	catalogAssets: {
		headphones: "fixture://headphones",
		speaker: "fixture://speaker",
		chargingDock: "fixture://dock",
		workspace: "fixture://workspace",
		cafe: "fixture://cafe",
	},
}));

const { SQLiteOsukiAdapter } = await import("./sqlite-adapter.web");

const availableProduct: Product = {
	id: "community-speaker",
	name: "Community Speaker",
	description: "Redistributable local fixture.",
	image: "fixture://speaker",
	price: 80,
	variant: "Graphite",
	stock: 2,
	rating: 4.8,
	reviews: 12,
	category: "Audio",
};

const unavailableProduct: Product = {
	...availableProduct,
	id: "sold-out-speaker",
	name: "Sold-out Speaker",
	stock: 0,
};

async function adapterWithCatalog() {
	const adapter = new SQLiteOsukiAdapter();
	await adapter.init();
	await adapter.cacheProducts([availableProduct, unavailableProduct]);
	return adapter;
}

describe("Community local commerce adapter", () => {
	test("supports catalog search and rejects unavailable cart lines", async () => {
		const adapter = await adapterWithCatalog();

		expect(await adapter.listProducts({ query: "audio" })).toHaveLength(2);
		await expect(adapter.addToCart("missing-product")).rejects.toThrow("not found");
		await expect(adapter.addToCart(unavailableProduct.id)).rejects.toThrow("unavailable");
	});

	test("edits quantities within stock and removes zero-quantity lines", async () => {
		const adapter = await adapterWithCatalog();

		await adapter.addToCart(availableProduct.id);
		await adapter.setCartQuantity(availableProduct.id, 2);
		expect((await adapter.listCartItems())[0]?.quantity).toBe(2);
		await expect(adapter.setCartQuantity(availableProduct.id, 3)).rejects.toThrow("Only 2");
		await adapter.setCartQuantity(availableProduct.id, 0);
		expect(await adapter.listCartItems()).toEqual([]);
	});

	test("creates a visible local order and clears the completed cart", async () => {
		const adapter = await adapterWithCatalog();
		await adapter.resetSeedData();
		await adapter.cacheProducts([availableProduct]);
		await adapter.addToCart(availableProduct.id, 2);

		const order = await adapter.createOrderFromCart();

		expect(order.status).toBe("confirmed");
		expect(order.items).toHaveLength(1);
		expect(order.total).toBe(182.8);
		expect((await adapter.getLatestOrder())?.id).toBe(order.id);
		expect(await adapter.listCartItems()).toEqual([]);
		await expect(adapter.createOrderFromCart()).rejects.toThrow("empty cart");
	});

	test("persists local address create, edit, default, and delete behavior", async () => {
		const adapter = await adapterWithCatalog();
		await adapter.signIn({ email: "shopper@example.com", password: "local-password" });
		const created = await adapter.addAccountAddress({
			name: "Shopper",
			street: "1 Community Way",
			city: "Portland",
			zip: "97201",
			country: "USA",
		});
		const addressId = created.at(-1)!.id;

		expect(
			(await adapter.updateAccountAddress(addressId, { street: "2 Community Way" })).at(-1)?.street,
		).toBe("2 Community Way");
		expect(
			(await adapter.setDefaultAccountAddress(addressId)).find(
				(address) => address.id === addressId,
			)?.isDefault,
		).toBe(true);
		expect(
			(await adapter.removeAccountAddress(addressId)).some((address) => address.id === addressId),
		).toBe(false);
	});
});
