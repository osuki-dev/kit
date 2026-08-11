import { describe, expect, test } from "bun:test";

import { LocalAccountAdapter } from "./local-account-adapter";
import type {
	AccountAddress,
	AccountDataAdapter,
	AccountProfile,
	AccountSession,
	OrderWithItems,
} from "./types";

describe("LocalAccountAdapter", () => {
	test("delegates account methods to the local mock store", async () => {
		const store = new MemoryAccountStore();
		const adapter = new LocalAccountAdapter(store);

		expect(await adapter.getAccountSession()).toEqual({ status: "guest" });

		await adapter.signUp({
			name: "Mika Tan",
			email: "Mika@Example.com",
			password: "password123",
		});
		await adapter.updateAccountProfile({ phone: "+1 555 0100" });
		await adapter.addAccountAddress({
			name: "Mika Tan",
			street: "21 Pine Street",
			city: "San Francisco",
			zip: "94108",
			country: "USA",
			isDefault: true,
		});
		await adapter.setDefaultAccountAddress("addr-home");
		await adapter.updateAccountAddress("addr-2", { street: "22 Pine Street" });

		expect(await adapter.getAccountSession()).toEqual({
			status: "authenticated",
			customerId: "local-customer",
			email: "mika@example.com",
		});
		const profile = await adapter.getAccountProfile();
		expect(profile?.name).toBe("Mika Tan");
		expect(profile?.email).toBe("mika@example.com");
		expect(profile?.phone).toBe("+1 555 0100");
		expect(profile?.defaultAddressId).toBe("addr-home");
		expect(profile).toEqual({
			id: "local-customer",
			name: "Mika Tan",
			email: "mika@example.com",
			phone: "+1 555 0100",
			createdAt: "2026-01-01T00:00:00.000Z",
			defaultAddressId: "addr-home",
		});
		const addresses = await adapter.listAccountAddresses();
		expect(addresses[0]?.id).toBe("addr-home");
		expect(addresses[0]?.isDefault).toBe(true);
		expect(addresses[1]?.street).toBe("22 Pine Street");
		expect(await adapter.removeAccountAddress("addr-2")).toHaveLength(1);

		await adapter.signOut();
		expect(await adapter.getAccountProfile()).toBe(null);
		expect(await adapter.listAccountOrders()).toEqual([]);
	});
});

class MemoryAccountStore implements AccountDataAdapter {
	private session: AccountSession = { status: "guest" };
	private profile: AccountProfile = {
		id: "local-customer",
		name: "Avery Chen",
		email: "avery@example.com",
		createdAt: "2026-01-01T00:00:00.000Z",
		defaultAddressId: "addr-studio",
	};
	private addresses: AccountAddress[] = [
		{
			id: "addr-home",
			name: "Mika Tan",
			street: "8 Osuki Lane",
			city: "San Francisco",
			zip: "94107",
			country: "USA",
		},
	];

	async getAccountSession() {
		return this.session;
	}

	async signIn(input: { email: string; password: string }) {
		if (!input.email || !input.password) throw new Error("Email and password are required.");
		this.session = {
			status: "authenticated",
			customerId: this.profile.id,
			email: input.email.trim().toLowerCase(),
		};
		this.profile.email = this.session.email ?? this.profile.email;
		return this.session;
	}

	async signUp(input: { name: string; email: string; password: string }) {
		if (!input.name || !input.email || !input.password) {
			throw new Error("Name, email, and password are required.");
		}
		this.profile.name = input.name.trim();
		return this.signIn(input);
	}

	async signOut() {
		this.session = { status: "guest" };
	}

	async getAccountProfile() {
		return this.session.status === "authenticated" ? this.profile : null;
	}

	async updateAccountProfile(input: Partial<Pick<AccountProfile, "name" | "email" | "phone">>) {
		if (this.session.status !== "authenticated") {
			throw new Error("Sign in before updating your profile.");
		}
		this.profile = { ...this.profile, ...input };
		return this.profile;
	}

	async listAccountAddresses() {
		if (this.session.status !== "authenticated") return [];
		return this.addresses.map((address) => ({
			...address,
			isDefault: address.id === this.profile.defaultAddressId,
		}));
	}

	async addAccountAddress(input: Omit<AccountAddress, "id" | "isDefault">) {
		const address = { ...input, id: `addr-${this.addresses.length + 1}` };
		this.addresses.push(address);
		return this.listAccountAddresses();
	}

	async updateAccountAddress(addressId: string, input: Partial<Omit<AccountAddress, "id">>) {
		this.addresses = this.addresses.map((address) =>
			address.id === addressId ? { ...address, ...input, id: addressId } : address,
		);
		return this.listAccountAddresses();
	}

	async removeAccountAddress(addressId: string) {
		this.addresses = this.addresses.filter((address) => address.id !== addressId);
		return this.listAccountAddresses();
	}

	async setDefaultAccountAddress(addressId: string) {
		this.profile.defaultAddressId = addressId;
		return this.listAccountAddresses();
	}

	async listAccountOrders(): Promise<OrderWithItems[]> {
		return this.session.status === "authenticated" ? [] : [];
	}
}
