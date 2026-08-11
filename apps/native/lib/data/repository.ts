import type { CreateOrderInput, OsukiDataAdapter, SettingUpdate } from "./types";

export class OsukiRepository {
	private initPromise: Promise<void> | null = null;

	constructor(private readonly adapter: OsukiDataAdapter) {}

	init() {
		this.initPromise ??= this.adapter.init();
		return this.initPromise;
	}

	private async ready() {
		await this.init();
	}

	async listProducts(params?: Parameters<OsukiDataAdapter["listProducts"]>[0]) {
		await this.ready();
		return this.adapter.listProducts(params);
	}

	async getProduct(id: string) {
		await this.ready();
		return this.adapter.getProduct(id);
	}

	async listCartItems() {
		await this.ready();
		return this.adapter.listCartItems();
	}

	async setCartQuantity(productId: string, quantity: number) {
		await this.ready();
		return this.adapter.setCartQuantity(productId, quantity);
	}

	async removeCartItem(productId: string) {
		await this.ready();
		return this.adapter.removeCartItem(productId);
	}

	async addToCart(productId: string, quantity?: number) {
		await this.ready();
		return this.adapter.addToCart(productId, quantity);
	}

	async listUsers(params?: Parameters<OsukiDataAdapter["listUsers"]>[0]) {
		await this.ready();
		return this.adapter.listUsers(params);
	}

	async getAccountSession() {
		await this.ready();
		return this.adapter.getAccountSession();
	}

	async signIn(input: Parameters<OsukiDataAdapter["signIn"]>[0]) {
		await this.ready();
		return this.adapter.signIn(input);
	}

	async signUp(input: Parameters<OsukiDataAdapter["signUp"]>[0]) {
		await this.ready();
		return this.adapter.signUp(input);
	}

	async signOut() {
		await this.ready();
		return this.adapter.signOut();
	}

	async getAccountProfile() {
		await this.ready();
		return this.adapter.getAccountProfile();
	}

	async updateAccountProfile(input: Parameters<OsukiDataAdapter["updateAccountProfile"]>[0]) {
		await this.ready();
		return this.adapter.updateAccountProfile(input);
	}

	async listAccountAddresses() {
		await this.ready();
		return this.adapter.listAccountAddresses();
	}

	async addAccountAddress(input: Parameters<OsukiDataAdapter["addAccountAddress"]>[0]) {
		await this.ready();
		return this.adapter.addAccountAddress(input);
	}

	async updateAccountAddress(
		addressId: string,
		input: Parameters<OsukiDataAdapter["updateAccountAddress"]>[1],
	) {
		await this.ready();
		return this.adapter.updateAccountAddress(addressId, input);
	}

	async removeAccountAddress(addressId: string) {
		await this.ready();
		return this.adapter.removeAccountAddress(addressId);
	}

	async setDefaultAccountAddress(
		addressId: Parameters<OsukiDataAdapter["setDefaultAccountAddress"]>[0],
	) {
		await this.ready();
		return this.adapter.setDefaultAccountAddress(addressId);
	}

	async listAccountOrders(params?: Parameters<OsukiDataAdapter["listAccountOrders"]>[0]) {
		await this.ready();
		return this.adapter.listAccountOrders(params);
	}

	async createOrderFromCart(input?: CreateOrderInput) {
		await this.ready();
		return this.adapter.createOrderFromCart(input);
	}

	async listOrders(params?: Parameters<OsukiDataAdapter["listOrders"]>[0]) {
		await this.ready();
		return this.adapter.listOrders(params);
	}

	async getLatestOrder() {
		await this.ready();
		return this.adapter.getLatestOrder();
	}

	async listSettings() {
		await this.ready();
		return this.adapter.listSettings();
	}

	async updateSetting(update: SettingUpdate) {
		await this.ready();
		return this.adapter.updateSetting(update);
	}
}
