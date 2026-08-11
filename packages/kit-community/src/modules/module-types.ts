import type { IconName } from "@osuki-dev/ui";

export type KitModuleId =
	| "account"
	| "account.auth"
	| "account.profile"
	| "commerce"
	| "commerce.product"
	| "commerce.cart"
	| "commerce.checkout"
	| "commerce.orders"
	| "settings"
	| "content"
	| "data"
	| "tools";

export type KitModuleAudience = "public" | "pro" | "internal";

export type KitScreenName =
	| "LoginScreen"
	| "RegisterScreen"
	| "ProfileScreen"
	| "ProductScreen"
	| "CartScreen"
	| "CheckoutScreen"
	| "OrderScreen"
	| "SearchScreen"
	| "SettingsScreen"
	| "ListScreen"
	| "DetailScreen"
	| "FormScreen"
	| "DashboardScreen";

export interface KitModuleRoute {
	id: string;
	path: string;
	label: string;
	screen: KitScreenName;
	icon?: IconName;
	tab?: boolean;
	required?: boolean;
}

export interface KitModuleCapability {
	id: string;
	label: string;
	description?: string;
	required?: boolean;
}

export interface KitModuleDependency {
	name: string;
	version: string;
	kind: "runtime" | "peer" | "dev";
}

export interface KitModuleDefinition {
	id: KitModuleId;
	title: string;
	description: string;
	audience: KitModuleAudience;
	screens: KitScreenName[];
	routes: KitModuleRoute[];
	capabilities: KitModuleCapability[];
	dependencies?: KitModuleDependency[];
	e2eFlows?: string[];
}

export interface KitNavigationItem {
	id: string;
	label: string;
	path: string;
	icon?: IconName;
	moduleId: KitModuleId;
}
