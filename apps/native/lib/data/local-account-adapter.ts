import type {
	AccountDataAdapter,
	AccountAddressInput,
	AccountAddressUpdateInput,
	AccountProfileUpdateInput,
	AccountSignInInput,
	AccountSignUpInput,
} from "./types";

/**
 * Explicit local account backend used while Shopify Customer Account API is owned by a BFF.
 */
export class LocalAccountAdapter implements AccountDataAdapter {
	constructor(private readonly store: AccountDataAdapter) {}

	getAccountSession() {
		return this.store.getAccountSession();
	}

	signIn(input: AccountSignInInput) {
		return this.store.signIn(input);
	}

	signUp(input: AccountSignUpInput) {
		return this.store.signUp(input);
	}

	signOut() {
		return this.store.signOut();
	}

	getAccountProfile() {
		return this.store.getAccountProfile();
	}

	updateAccountProfile(input: AccountProfileUpdateInput) {
		return this.store.updateAccountProfile(input);
	}

	listAccountAddresses() {
		return this.store.listAccountAddresses();
	}

	addAccountAddress(input: AccountAddressInput) {
		return this.store.addAccountAddress(input);
	}

	updateAccountAddress(addressId: string, input: AccountAddressUpdateInput) {
		return this.store.updateAccountAddress(addressId, input);
	}

	removeAccountAddress(addressId: string) {
		return this.store.removeAccountAddress(addressId);
	}

	setDefaultAccountAddress(addressId: string) {
		return this.store.setDefaultAccountAddress(addressId);
	}

	listAccountOrders(params: { offset?: number; limit?: number } = {}) {
		return this.store.listAccountOrders(params);
	}
}
