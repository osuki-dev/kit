export type Product = {
	id: string;
	name: string;
	description: string;
	image: string;
	price: number;
	originalPrice?: number;
	variant: string;
	stock: number;
	rating: number;
	reviews: number;
	category: string;
};

export type CartItemRecord = Product & {
	quantity: number;
};

export type UserRecord = {
	id: string;
	name: string;
	email: string;
	role: "admin" | "user" | "guest";
	status: "active" | "inactive" | "pending";
	department?: string;
	location?: string;
	createdAt: string;
	lastLogin?: string;
};

export type OrderRecord = {
	id: string;
	status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
	createdAt: string;
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
	customerName: string;
	street: string;
	city: string;
	zip: string;
	country: string;
	paymentType: "card" | "paypal" | "apple_pay";
	paymentBrand?: string;
	paymentLast4?: string;
	trackingNumber?: string;
};

export type OrderItemRecord = CartItemRecord;

export type OrderWithItems = OrderRecord & {
	items: OrderItemRecord[];
};

export type OrderShippingAddress = Pick<
	OrderRecord,
	"customerName" | "street" | "city" | "zip" | "country"
>;

export type CreateOrderInput = {
	shippingAddress?: OrderShippingAddress;
};

export type AccountSession = {
	status: "guest" | "authenticated";
	customerId?: string;
	email?: string;
};

export type AccountProfile = {
	id: string;
	name: string;
	email: string;
	phone?: string;
	defaultAddressId?: string;
	createdAt: string;
};

export type AccountAddress = {
	id: string;
	name: string;
	street: string;
	city: string;
	zip: string;
	country: string;
	phone?: string;
	isDefault?: boolean;
};

export type AccountAddressInput = Omit<AccountAddress, "id" | "isDefault"> & {
	isDefault?: boolean;
};

export type AccountAddressUpdateInput = Partial<AccountAddressInput>;

export type AccountSignInInput = {
	email: string;
	password: string;
};

export type AccountSignUpInput = AccountSignInInput & {
	name: string;
};

export type AccountProfileUpdateInput = Partial<Pick<AccountProfile, "name" | "email" | "phone">>;

export type SettingValue = {
	key: string;
	value: string;
	updatedAt: string;
};

export type SettingUpdate = {
	key: string;
	value: string | boolean | number;
};

export interface AccountDataAdapter {
	getAccountSession(): Promise<AccountSession>;
	signIn(input: AccountSignInInput): Promise<AccountSession>;
	signUp(input: AccountSignUpInput): Promise<AccountSession>;
	signOut(): Promise<void>;
	getAccountProfile(): Promise<AccountProfile | null>;
	updateAccountProfile(input: AccountProfileUpdateInput): Promise<AccountProfile>;
	listAccountAddresses(): Promise<AccountAddress[]>;
	addAccountAddress(input: AccountAddressInput): Promise<AccountAddress[]>;
	updateAccountAddress(
		addressId: string,
		input: AccountAddressUpdateInput,
	): Promise<AccountAddress[]>;
	removeAccountAddress(addressId: string): Promise<AccountAddress[]>;
	setDefaultAccountAddress(addressId: string): Promise<AccountAddress[]>;
	listAccountOrders(params?: { offset?: number; limit?: number }): Promise<OrderWithItems[]>;
}

export interface OsukiDataAdapter extends AccountDataAdapter {
	init(): Promise<void>;
	listProducts(params?: { offset?: number; limit?: number; query?: string }): Promise<Product[]>;
	getProduct(id: string): Promise<Product | null>;
	listCartItems(): Promise<CartItemRecord[]>;
	setCartQuantity(productId: string, quantity: number): Promise<void>;
	removeCartItem(productId: string): Promise<void>;
	addToCart(productId: string, quantity?: number): Promise<void>;
	listUsers(params?: { offset?: number; limit?: number; query?: string }): Promise<UserRecord[]>;
	createOrderFromCart(input?: CreateOrderInput): Promise<OrderWithItems>;
	listOrders(params?: { offset?: number; limit?: number }): Promise<OrderRecord[]>;
	getLatestOrder(): Promise<OrderWithItems | null>;
	listSettings(): Promise<Record<string, string>>;
	updateSetting(update: SettingUpdate): Promise<void>;
	resetSeedData(): Promise<void>;
}
