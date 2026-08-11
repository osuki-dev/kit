import type {
	AccountAddress,
	AccountAddressInput,
	AccountAddressUpdateInput,
	AccountDataAdapter,
	AccountProfile,
	AccountProfileUpdateInput,
	AccountSession,
	AccountSignInInput,
	AccountSignUpInput,
	OrderWithItems,
} from "./types";
import { accountBffRequest } from "./account-bff-client";

export type BffAccountAdapterConfig = {
	baseUrl: string;
	getToken?: () => string | Promise<string | null> | null;
};

type RequestOptions = {
	method?: string;
	body?: unknown;
};

export class BffAccountAdapter implements AccountDataAdapter {
	constructor(private readonly config: BffAccountAdapterConfig) {}

	getAccountSession() {
		return this.request<AccountSession>("/account/session");
	}

	signIn(_input: AccountSignInInput) {
		return Promise.reject(
			new Error("Shopify Customer Account uses OAuth. Request /account/login-url instead."),
		);
	}

	signUp(_input: AccountSignUpInput) {
		return Promise.reject(
			new Error("Shopify Customer Account uses OAuth. Request /account/login-url instead."),
		);
	}

	async signOut() {
		await this.request<void>("/account/sign-out", { method: "POST" });
	}

	getAccountProfile() {
		return this.request<AccountProfile | null>("/account/profile");
	}

	updateAccountProfile(input: AccountProfileUpdateInput) {
		return this.request<AccountProfile>("/account/profile", { method: "PATCH", body: input });
	}

	listAccountAddresses() {
		return this.request<AccountAddress[]>("/account/addresses");
	}

	addAccountAddress(input: AccountAddressInput) {
		return this.request<AccountAddress[]>("/account/addresses", {
			method: "POST",
			body: input,
		});
	}

	updateAccountAddress(addressId: string, input: AccountAddressUpdateInput) {
		return this.request<AccountAddress[]>(`/account/addresses/${addressId}`, {
			method: "PATCH",
			body: input,
		});
	}

	removeAccountAddress(addressId: string) {
		return this.request<AccountAddress[]>(`/account/addresses/${addressId}`, { method: "DELETE" });
	}

	setDefaultAccountAddress(addressId: string) {
		return this.request<AccountAddress[]>(`/account/addresses/${addressId}/default`, {
			method: "POST",
		});
	}

	listAccountOrders(params: { offset?: number; limit?: number } = {}) {
		const search = new URLSearchParams();
		if (params.offset !== undefined) search.set("offset", String(params.offset));
		if (params.limit !== undefined) search.set("limit", String(params.limit));
		const query = search.toString();
		return this.request<OrderWithItems[]>(`/account/orders${query ? `?${query}` : ""}`);
	}

	private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
		const token = await this.config.getToken?.();
		return accountBffRequest<T>(this.config.baseUrl, path, {
			method: options.method ?? "GET",
			token,
			body: options.body,
		});
	}
}
