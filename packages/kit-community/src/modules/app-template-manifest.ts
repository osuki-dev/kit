import type { IconName } from "@osuki-dev/ui";
import { createAccountModule, type AccountModuleOptions } from "./account-module";
import { createCommerceModule, type CommerceModuleOptions } from "./commerce-module";
import {
	createSettingsModule,
	describeSettingsModule,
	type SettingsModuleDescriptor,
	type SettingsModuleDefinition,
	type SettingsModuleOptions,
} from "./settings-module";
import type { KitModuleDefinition, KitNavigationItem } from "./module-types";

export type AppTemplateKind = "blank" | "shopify" | "content" | "internal" | "saas";

export interface AppTemplateModuleSelection {
	account?: AccountModuleOptions | false;
	commerce?: CommerceModuleOptions | false;
	settings?: SettingsModuleOptions | false;
}

export interface AppTemplateManifestOptions {
	title?: string;
	description?: string;
	modules?: AppTemplateModuleSelection;
	extraModules?: KitModuleDefinition[];
	navigationOverrides?: Record<string, Partial<KitNavigationItem>>;
}

export interface AppTemplateManifest {
	id: AppTemplateKind;
	title: string;
	description: string;
	modules: KitModuleDefinition[];
	settings?: SettingsModuleDefinition;
	settingsDescriptor?: SettingsModuleDescriptor;
	navigation: KitNavigationItem[];
	e2eFlows: string[];
}

const templateDefaults: Record<
	AppTemplateKind,
	{
		title: string;
		description: string;
		modules: AppTemplateModuleSelection;
	}
> = {
	blank: {
		title: "Blank app",
		description: "A minimal app shell with configurable settings.",
		modules: {
			settings: { template: "default" },
			account: false,
			commerce: false,
		},
	},
	shopify: {
		title: "Shopify app",
		description:
			"Commerce app with account, product, cart, checkout, orders, and settings modules.",
		modules: {
			account: {
				providers: ["email", "apple", "google"],
				enableRegistration: true,
				enableProfile: true,
			},
			commerce: {
				features: ["product", "search", "cart", "checkout", "orders"],
				enableTabs: true,
			},
			settings: { template: "shopify" },
		},
	},
	content: {
		title: "Content app",
		description: "Content-oriented app with account and configurable settings modules.",
		modules: {
			account: {
				providers: ["email", "apple"],
				enableRegistration: true,
				enableProfile: true,
			},
			commerce: false,
			settings: { template: "content" },
		},
	},
	internal: {
		title: "Internal tool",
		description: "Internal app shell with account, diagnostics, and administrative settings.",
		modules: {
			account: {
				providers: ["email", "github"],
				enableRegistration: false,
				enableProfile: true,
			},
			commerce: false,
			settings: { template: "internal" },
		},
	},
	saas: {
		title: "SaaS app",
		description: "Subscription app with account, billing, integrations, and settings modules.",
		modules: {
			account: {
				providers: ["email", "apple", "google"],
				enableRegistration: true,
				enableProfile: true,
			},
			commerce: false,
			settings: { template: "saas" },
		},
	},
};

function unique<T>(items: T[]): T[] {
	return [...new Set(items)];
}

function navigationIcon(routeIcon: IconName | undefined, fallback: IconName): IconName {
	return routeIcon ?? fallback;
}

function createNavigation(
	modules: KitModuleDefinition[],
	overrides: Record<string, Partial<KitNavigationItem>> = {},
): KitNavigationItem[] {
	return modules.flatMap((module) =>
		module.routes
			.filter((route) => route.tab)
			.map((route) => {
				const base: KitNavigationItem = {
					id: route.id,
					label: route.label,
					path: route.path,
					icon: navigationIcon(route.icon, "Circle"),
					moduleId: module.id,
				};
				return { ...base, ...overrides[route.id] };
			}),
	);
}

export function createAppTemplateManifest(
	template: AppTemplateKind,
	options: AppTemplateManifestOptions = {},
): AppTemplateManifest {
	const defaults = templateDefaults[template];
	const moduleSelection = {
		...defaults.modules,
		...options.modules,
	};

	const modules: KitModuleDefinition[] = [];

	if (moduleSelection.account !== false) {
		modules.push(createAccountModule(moduleSelection.account));
	}

	if (moduleSelection.commerce !== false) {
		modules.push(createCommerceModule(moduleSelection.commerce));
	}

	const settingsOptions = moduleSelection.settings === false ? undefined : moduleSelection.settings;
	const settings = settingsOptions ? createSettingsModule(settingsOptions) : undefined;
	const settingsDescriptor = settingsOptions ? describeSettingsModule(settingsOptions) : undefined;

	if (settings) {
		modules.push({
			id: "settings",
			title: settings.title,
			description: "Configurable settings module generated from app template context.",
			audience: "public",
			screens: ["SettingsScreen"],
			routes: [
				{
					id: "settings",
					path: "/settings",
					label: settings.title,
					screen: "SettingsScreen",
					icon: "Settings",
					tab: true,
				},
			],
			capabilities: settings.modules.map((module) => ({
				id: `settings.${module}`,
				label: module,
				required: true,
			})),
			e2eFlows: ["page-settings"],
		});
	}

	modules.push(...(options.extraModules ?? []));

	return {
		id: template,
		title: options.title ?? defaults.title,
		description: options.description ?? defaults.description,
		modules,
		settings,
		settingsDescriptor,
		navigation: createNavigation(modules, options.navigationOverrides),
		e2eFlows: unique(modules.flatMap((module) => module.e2eFlows ?? [])),
	};
}
