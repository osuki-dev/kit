import {
	createAppTemplateManifest,
	type AppTemplateKind,
	type AppTemplateManifest,
	type AppTemplateManifestOptions,
	type AppTemplateModuleSelection,
} from "./app-template-manifest";
import type { AccountAuthProvider, AccountModuleOptions } from "./account-module";
import type { CommerceFeature, CommerceModuleOptions } from "./commerce-module";
import {
	createSettingsPresetOptions,
	settingsPresets,
	settingsTemplateModules,
	type SettingsPresetKind,
	type SettingsModuleKind,
	type SettingsModuleOptions,
	type SettingsTemplateKind,
} from "./settings-module";

export type ScaffoldCapability =
	| "account"
	| "registration"
	| "profile"
	| "socialAuth"
	| "team"
	| "commerce"
	| "productDisplay"
	| "productSearch"
	| "cart"
	| "checkout"
	| "orders"
	| "settings"
	| "billing"
	| "integrations"
	| "notifications"
	| "appearance"
	| "privacy"
	| "support"
	| "developer"
	| "danger";

export interface ScaffoldComposerInput {
	appType?: AppTemplateKind;
	title?: string;
	description?: string;
	capabilities?: ScaffoldCapability[];
	disabledCapabilities?: ScaffoldCapability[];
	authProviders?: AccountAuthProvider[];
	commerceFeatures?: CommerceFeature[];
	settingsModules?: SettingsModuleKind[];
	settingsPreset?: SettingsPresetKind;
	settings?: SettingsModuleOptions;
	enableCommerceTabs?: boolean;
	manifestOverrides?: Omit<AppTemplateManifestOptions, "title" | "description" | "modules">;
}

export interface ScaffoldCompositionSummary {
	appTemplate: AppTemplateKind;
	capabilities: ScaffoldCapability[];
	authProviders: AccountAuthProvider[];
	commerceFeatures: CommerceFeature[];
	settingsModules: SettingsModuleKind[];
	settingsPreset: SettingsPresetKind;
}

export interface ScaffoldComposition {
	appTemplate: AppTemplateKind;
	moduleSelection: AppTemplateModuleSelection;
	manifestOptions: AppTemplateManifestOptions;
	summary: ScaffoldCompositionSummary;
	rationale: string[];
}

export interface ScaffoldTemplateOption {
	id: AppTemplateKind;
	title: string;
	description: string;
	appTemplate: AppTemplateKind;
	settingsPreset: SettingsPresetKind;
	capabilities: ScaffoldCapability[];
	recommendedFor: string[];
}

export interface ScaffoldSelectionInput extends Omit<
	ScaffoldComposerInput,
	"appType" | "settingsPreset"
> {
	template: AppTemplateKind;
	settingsPreset?: SettingsPresetKind;
}

export interface ScaffoldSelection extends ScaffoldComposition {
	template: ScaffoldTemplateOption;
	requirements: ScaffoldComposerInput;
}

const defaultCapabilitiesByTemplate: Record<AppTemplateKind, ScaffoldCapability[]> = {
	blank: ["settings", "appearance", "privacy", "support"],
	shopify: [
		"account",
		"registration",
		"profile",
		"socialAuth",
		"commerce",
		"productDisplay",
		"productSearch",
		"cart",
		"checkout",
		"orders",
		"settings",
		"billing",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"support",
	],
	content: [
		"account",
		"registration",
		"profile",
		"settings",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"support",
	],
	internal: [
		"account",
		"profile",
		"team",
		"settings",
		"developer",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"danger",
	],
	saas: [
		"account",
		"registration",
		"profile",
		"team",
		"settings",
		"billing",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"support",
	],
};

export const scaffoldTemplateOptions: Record<AppTemplateKind, ScaffoldTemplateOption> = {
	blank: {
		id: "blank",
		title: "Blank app",
		description: "Minimal app shell with account-optional settings and app preferences.",
		appTemplate: "blank",
		settingsPreset: "basic",
		capabilities: ["settings", "appearance", "privacy", "support"],
		recommendedFor: ["prototypes", "single-purpose tools", "content-light utilities"],
	},
	shopify: {
		id: "shopify",
		title: "Commerce app",
		description:
			"Storefront, product discovery, cart, checkout, orders, account, and commerce settings.",
		appTemplate: "shopify",
		settingsPreset: "commerce",
		capabilities: defaultCapabilitiesByTemplate.shopify,
		recommendedFor: ["Shopify-style apps", "marketplaces", "paid catalog apps"],
	},
	content: {
		id: "content",
		title: "Content app",
		description: "Account-backed publishing, integrations, notifications, and app preferences.",
		appTemplate: "content",
		settingsPreset: "basic",
		capabilities: defaultCapabilitiesByTemplate.content,
		recommendedFor: ["AI companions", "content feeds", "community apps"],
	},
	internal: {
		id: "internal",
		title: "Internal tool",
		description: "Team workspace, diagnostics, integrations, privacy, and danger-zone controls.",
		appTemplate: "internal",
		settingsPreset: "developer",
		capabilities: defaultCapabilitiesByTemplate.internal,
		recommendedFor: ["admin panels", "operator tools", "internal dashboards"],
	},
	saas: {
		id: "saas",
		title: "SaaS app",
		description: "Account, team workspace, billing, integrations, notifications, and support.",
		appTemplate: "saas",
		settingsPreset: "team",
		capabilities: defaultCapabilitiesByTemplate.saas,
		recommendedFor: ["subscription apps", "team workspaces", "B2B tools"],
	},
};

function unique<T>(items: readonly T[]): T[] {
	return [...new Set(items)];
}

function hasAny<T>(items: readonly T[], candidates: readonly T[]) {
	return candidates.some((candidate) => items.includes(candidate));
}

function inferAppTemplate(capabilities: ScaffoldCapability[]): AppTemplateKind {
	if (
		hasAny(capabilities, [
			"commerce",
			"productDisplay",
			"productSearch",
			"cart",
			"checkout",
			"orders",
		])
	) {
		return "shopify";
	}
	if (hasAny(capabilities, ["developer", "danger"])) return "internal";
	if (hasAny(capabilities, ["team"])) return "saas";
	if (hasAny(capabilities, ["billing", "integrations"])) return "saas";
	if (hasAny(capabilities, ["account", "profile", "registration"])) return "content";
	return "blank";
}

function expandCapabilities(capabilities: ScaffoldCapability[]): ScaffoldCapability[] {
	const expanded = new Set(capabilities);
	if (expanded.has("checkout")) {
		expanded.add("cart");
		expanded.add("productDisplay");
		expanded.add("commerce");
	}
	if (expanded.has("cart") || expanded.has("orders") || expanded.has("productSearch")) {
		expanded.add("productDisplay");
		expanded.add("commerce");
	}
	if (expanded.has("registration") || expanded.has("profile") || expanded.has("socialAuth")) {
		expanded.add("account");
	}
	if (
		hasAny(
			[...expanded],
			[
				"team",
				"billing",
				"integrations",
				"notifications",
				"appearance",
				"privacy",
				"support",
				"developer",
				"danger",
			],
		)
	) {
		expanded.add("settings");
	}
	return [...expanded];
}

function resolveCapabilities(input: ScaffoldComposerInput) {
	const appTemplate =
		input.appType ??
		inferAppTemplate(expandCapabilities(input.capabilities ?? ["settings", "appearance"]));
	const defaults = defaultCapabilitiesByTemplate[appTemplate];
	const disabled = new Set(input.disabledCapabilities ?? []);
	const capabilities = expandCapabilities(
		unique([...defaults, ...(input.capabilities ?? [])]),
	).filter((capability) => !disabled.has(capability));

	return { appTemplate, capabilities };
}

function resolveCommerceFeatures(
	capabilities: ScaffoldCapability[],
	explicitFeatures: CommerceFeature[] | undefined,
): CommerceFeature[] {
	if (explicitFeatures) return unique(explicitFeatures);
	if (!capabilities.includes("commerce")) return [];

	const features: CommerceFeature[] = [];
	if (capabilities.includes("productDisplay")) features.push("product");
	if (capabilities.includes("productSearch")) features.push("search");
	if (capabilities.includes("cart")) features.push("cart");
	if (capabilities.includes("checkout")) features.push("checkout");
	if (capabilities.includes("orders")) features.push("orders");
	return unique(
		features.length > 0 ? features : ["product", "search", "cart", "checkout", "orders"],
	);
}

function settingsModuleForCapability(
	capability: ScaffoldCapability,
): SettingsModuleKind | undefined {
	if (capability === "account" || capability === "profile" || capability === "registration") {
		return "account";
	}
	if (capability === "team") return "team";
	if (
		capability === "commerce" ||
		capability === "productDisplay" ||
		capability === "cart" ||
		capability === "checkout" ||
		capability === "orders"
	) {
		return "commerce";
	}
	if (
		capability === "billing" ||
		capability === "integrations" ||
		capability === "notifications" ||
		capability === "appearance" ||
		capability === "privacy" ||
		capability === "support" ||
		capability === "developer" ||
		capability === "danger"
	) {
		return capability;
	}
	return undefined;
}

function defaultSettingsTemplate(appTemplate: AppTemplateKind): SettingsTemplateKind {
	if (appTemplate === "shopify") return "shopify";
	if (appTemplate === "content") return "content";
	if (appTemplate === "internal") return "internal";
	if (appTemplate === "saas") return "saas";
	return "default";
}

function defaultSettingsPreset(appTemplate: AppTemplateKind): SettingsPresetKind {
	return scaffoldTemplateOptions[appTemplate].settingsPreset;
}

function resolveSettingsModules(
	appTemplate: AppTemplateKind,
	capabilities: ScaffoldCapability[],
	explicitModules: SettingsModuleKind[] | undefined,
): SettingsModuleKind[] {
	if (explicitModules) return unique(explicitModules);
	const inferred = unique(
		capabilities
			.map((capability) => settingsModuleForCapability(capability))
			.filter((module): module is SettingsModuleKind => Boolean(module)),
	);
	if (inferred.length > 0) return inferred;
	return settingsTemplateModules[defaultSettingsTemplate(appTemplate)];
}

function resolveAccountOptions(
	capabilities: ScaffoldCapability[],
	authProviders: AccountAuthProvider[],
): AccountModuleOptions | false {
	if (!capabilities.includes("account")) return false;
	return {
		providers: authProviders,
		enableRegistration: capabilities.includes("registration"),
		enableProfile: capabilities.includes("profile"),
	};
}

function resolveCommerceOptions(
	capabilities: ScaffoldCapability[],
	features: CommerceFeature[],
	enableTabs: boolean | undefined,
): CommerceModuleOptions | false {
	if (!capabilities.includes("commerce") || features.length === 0) return false;
	return {
		features,
		enableTabs,
	};
}

export function composeAppScaffold(input: ScaffoldComposerInput = {}): ScaffoldComposition {
	const { appTemplate, capabilities } = resolveCapabilities(input);
	const authProviders: AccountAuthProvider[] = unique(
		input.authProviders ??
			(capabilities.includes("socialAuth")
				? (["email", "apple", "google"] as AccountAuthProvider[])
				: (["email"] as AccountAuthProvider[])),
	);
	const commerceFeatures = resolveCommerceFeatures(capabilities, input.commerceFeatures);
	const settingsPreset =
		input.settingsPreset ?? input.settings?.preset ?? defaultSettingsPreset(appTemplate);
	const presetSettings = createSettingsPresetOptions(settingsPreset, input.settings);
	const settingsModules = resolveSettingsModules(
		appTemplate,
		capabilities,
		input.settingsModules ?? presetSettings.modules,
	);
	const settingsTemplate = presetSettings.template ?? defaultSettingsTemplate(appTemplate);
	const moduleSelection: AppTemplateModuleSelection = {
		account: resolveAccountOptions(capabilities, authProviders),
		commerce: resolveCommerceOptions(capabilities, commerceFeatures, input.enableCommerceTabs),
		settings: capabilities.includes("settings")
			? {
					...presetSettings,
					template: settingsTemplate,
					modules: settingsModules,
				}
			: false,
	};
	const manifestOptions: AppTemplateManifestOptions = {
		...input.manifestOverrides,
		title: input.title,
		description: input.description,
		modules: moduleSelection,
	};

	return {
		appTemplate,
		moduleSelection,
		manifestOptions,
		summary: {
			appTemplate,
			capabilities,
			authProviders,
			commerceFeatures,
			settingsModules,
			settingsPreset,
		},
		rationale: [
			`appTemplate:${appTemplate}`,
			`settingsPreset:${settingsPreset}`,
			`modules:${Object.entries(moduleSelection)
				.filter(([, value]) => value !== false)
				.map(([key]) => key)
				.join(",")}`,
			`settings:${settingsModules.join(",") || "none"}`,
		],
	};
}

export function createComposedAppTemplateManifest(
	input: ScaffoldComposerInput = {},
): AppTemplateManifest {
	const composition = composeAppScaffold(input);
	return createAppTemplateManifest(composition.appTemplate, composition.manifestOptions);
}

export function selectAppScaffold(
	input: AppTemplateKind | ScaffoldSelectionInput = "blank",
): ScaffoldSelection {
	const selectionInput: ScaffoldSelectionInput =
		typeof input === "string" ? { template: input } : input;
	const template = scaffoldTemplateOptions[selectionInput.template];
	const settingsPreset =
		selectionInput.settingsPreset ?? selectionInput.settings?.preset ?? template.settingsPreset;
	const requirements: ScaffoldComposerInput = {
		appType: template.appTemplate,
		title: selectionInput.title,
		description: selectionInput.description,
		capabilities: unique([...template.capabilities, ...(selectionInput.capabilities ?? [])]),
		disabledCapabilities: selectionInput.disabledCapabilities,
		authProviders: selectionInput.authProviders,
		commerceFeatures: selectionInput.commerceFeatures,
		settingsModules: selectionInput.settingsModules,
		settingsPreset,
		settings: createSettingsPresetOptions(settingsPreset, selectionInput.settings),
		enableCommerceTabs: selectionInput.enableCommerceTabs,
		manifestOverrides: selectionInput.manifestOverrides,
	};
	const composition = composeAppScaffold(requirements);

	return {
		...composition,
		template,
		requirements,
		rationale: [
			`selection:${template.id}`,
			`preset:${settingsPresets[settingsPreset].id}`,
			...composition.rationale,
		],
	};
}
