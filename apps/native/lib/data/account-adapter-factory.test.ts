import { describe, expect, test } from "bun:test";

import { BffAccountAdapter } from "./bff-account-adapter";
import { createDefaultAccountAdapter } from "./account-adapter-factory";
import { LocalAccountAdapter } from "./local-account-adapter";
import type {
	AccountAddress,
	AccountDataAdapter,
	AccountProfile,
	AccountSession,
	OrderWithItems,
} from "./types";

describe("createDefaultAccountAdapter", () => {
	test("uses the local account mock when no BFF URL is configured", () => {
		const result = createDefaultAccountAdapter(new MemoryAccountStore());

		expect(result.kind).toBe("local");
		expect(result.adapter instanceof LocalAccountAdapter).toBe(true);
	});

	test("uses the account BFF only when explicitly configured", () => {
		const result = createDefaultAccountAdapter(new MemoryAccountStore(), {
			accountBffUrl: "https://api.osuki.test",
		});

		expect(result.kind).toBe("bff");
		expect(result.adapter instanceof BffAccountAdapter).toBe(true);
	});
});

class MemoryAccountStore implements AccountDataAdapter {
	async getAccountSession(): Promise<AccountSession> {
		return { status: "guest" };
	}

	async signIn(): Promise<AccountSession> {
		return { status: "authenticated", customerId: "local-customer", email: "mika@example.com" };
	}

	async signUp(): Promise<AccountSession> {
		return this.signIn();
	}

	async signOut(): Promise<void> {}

	async getAccountProfile(): Promise<AccountProfile | null> {
		return null;
	}

	async updateAccountProfile(): Promise<AccountProfile> {
		return {
			id: "local-customer",
			name: "Mika Tan",
			email: "mika@example.com",
			createdAt: "2026-01-01T00:00:00.000Z",
		};
	}

	async listAccountAddresses(): Promise<AccountAddress[]> {
		return [];
	}

	async addAccountAddress(): Promise<AccountAddress[]> {
		return [];
	}
	async updateAccountAddress(): Promise<AccountAddress[]> {
		return [];
	}
	async removeAccountAddress(): Promise<AccountAddress[]> {
		return [];
	}

	async setDefaultAccountAddress(): Promise<AccountAddress[]> {
		return [];
	}

	async listAccountOrders(): Promise<OrderWithItems[]> {
		return [];
	}
}
