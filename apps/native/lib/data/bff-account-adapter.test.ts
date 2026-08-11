import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { completeAccountOAuth } from "./account-bff-client";
import { BffAccountAdapter } from "./bff-account-adapter";

type FetchCall = {
	url: string;
	init?: RequestInit;
};

const originalFetch = globalThis.fetch;
let fetchCalls: FetchCall[] = [];

beforeEach(() => {
	fetchCalls = [];
});

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("BffAccountAdapter", () => {
	test("does not post customer passwords to the BFF", async () => {
		const adapter = new BffAccountAdapter({
			baseUrl: "https://api.osuki.test",
			getToken: () => "session-token",
		});

		await expect(
			adapter.signIn({
				email: "mika@example.com",
				password: "password123",
			}),
		).rejects.toThrow("Shopify Customer Account uses OAuth");
		expect(fetchCalls).toHaveLength(0);
	});

	test("exchanges OAuth callback codes through the BFF", async () => {
		mockJsonResponse({ status: "authenticated", customerId: "gid://shopify/Customer/1" });

		await completeAccountOAuth("https://api.osuki.test", {
			code: "callback-code",
			state: "stored-state",
		});

		expect(fetchCalls[0]?.url).toBe("https://api.osuki.test/account/callback");
		expect(fetchCalls[0]?.init?.method).toBe("POST");
		expect(fetchCalls[0]?.init?.body).toBe(
			JSON.stringify({
				code: "callback-code",
				state: "stored-state",
			}),
		);
	});

	test("adds order pagination query parameters", async () => {
		mockJsonResponse([]);
		const adapter = new BffAccountAdapter({ baseUrl: "https://api.osuki.test" });

		await adapter.listAccountOrders({ offset: 20, limit: 10 });

		expect(fetchCalls[0]?.url).toBe("https://api.osuki.test/account/orders?offset=20&limit=10");
		expect(fetchCalls[0]?.init?.headers).toEqual({ "Content-Type": "application/json" });
	});

	test("posts account addresses through the BFF boundary", async () => {
		mockJsonResponse([]);
		const adapter = new BffAccountAdapter({ baseUrl: "https://api.osuki.test" });

		await adapter.addAccountAddress({
			name: "Mika Tan",
			street: "21 Pine Street",
			city: "San Francisco",
			zip: "94108",
			country: "USA",
			isDefault: true,
		});

		expect(fetchCalls[0]?.url).toBe("https://api.osuki.test/account/addresses");
		expect(fetchCalls[0]?.init?.method).toBe("POST");
		expect(fetchCalls[0]?.init?.body).toBe(
			JSON.stringify({
				name: "Mika Tan",
				street: "21 Pine Street",
				city: "San Francisco",
				zip: "94108",
				country: "USA",
				isDefault: true,
			}),
		);
	});

	test("updates and removes addresses through customer-scoped endpoints", async () => {
		mockJsonResponse([]);
		const adapter = new BffAccountAdapter({ baseUrl: "https://api.osuki.test" });

		await adapter.updateAccountAddress("addr-1", { city: "Kyoto" });
		expect(fetchCalls[0]?.url).toBe("https://api.osuki.test/account/addresses/addr-1");
		expect(fetchCalls[0]?.init?.method).toBe("PATCH");
		await adapter.removeAccountAddress("addr-1");
		expect(fetchCalls[1]?.init?.method).toBe("DELETE");
	});

	test("accepts empty successful sign-out responses", async () => {
		mockEmptyResponse(204);
		const adapter = new BffAccountAdapter({ baseUrl: "https://api.osuki.test" });

		await expect(adapter.signOut()).resolves.toBeUndefined();
		expect(fetchCalls[0]?.url).toBe("https://api.osuki.test/account/sign-out");
		expect(fetchCalls[0]?.init?.method).toBe("POST");
	});

	test("throws on backend errors", async () => {
		mockEmptyResponse(401);
		const adapter = new BffAccountAdapter({ baseUrl: "https://api.osuki.test" });

		await expect(adapter.getAccountSession()).rejects.toThrow("Account request failed: 401");
	});
});

function mockJsonResponse(body: unknown) {
	globalThis.fetch = mockFetch(() => new Response(JSON.stringify(body), { status: 200 }));
}

function mockEmptyResponse(status: number) {
	globalThis.fetch = mockFetch(() => new Response(null, { status }));
}

function mockFetch(response: () => Response) {
	return ((url: RequestInfo | URL, init?: RequestInit) => {
		fetchCalls.push({ url: String(url), init });
		return Promise.resolve(response());
	}) as typeof fetch;
}
