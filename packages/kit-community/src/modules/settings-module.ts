import type { IconName } from "@osuki-dev/ui";
import type { SettingsItemConfig, SettingsItemType, SettingsSectionConfig } from "../components";

export type SettingsModuleKind =
	| "account"
	| "team"
	| "commerce"
	| "billing"
	| "integrations"
	| "notifications"
	| "appearance"
	| "privacy"
	| "support"
	| "developer"
	| "danger";

export type SettingsTemplateKind = "default" | "shopify" | "content" | "internal" | "saas";

export type SettingsPresetKind = "basic" | "commerce" | "team" | "developer";

export interface SettingsSectionGroupConfig {
	id: string;
	title: string;
	description?: string;
	sections: string[];
	collapsed?: boolean;
}

export interface SettingsModuleLayout {
	sectionOrder: string[];
	itemOrder: Record<string, string[]>;
	groups: SettingsSectionGroupConfig[];
	visibleSections: string[];
	visibleItems: string[];
}

export interface SettingsModuleContext {
	appName?: string;
	appVersion?: string;
	signedIn?: boolean;
	userName?: string;
	userEmail?: string;
	teamName?: string;
	teamMemberCount?: number;
	teamRoleLabel?: string;
	language?: string;
	region?: string;
	currency?: string;
	theme?: string;
	notificationsEnabled?: boolean;
	marketingEnabled?: boolean;
	hapticFeedbackEnabled?: boolean;
	analyticsEnabled?: boolean;
	shoppingModeEnabled?: boolean;
	defaultAddressLabel?: string;
	paymentMethodLabel?: string;
	planName?: string;
	billingStatus?: string;
	invoiceEmail?: string;
	integrationCount?: number;
	connectedStoreLabel?: string;
	apiKeyLabel?: string;
	webhookEndpointLabel?: string;
}

export interface SettingsModuleHandlers {
	onSignIn?: () => void;
	onSignOut?: () => void;
	onEditProfile?: () => void;
	onManageTeam?: () => void;
	onInviteMembers?: () => void;
	onManageAddresses?: () => void;
	onManageOrders?: () => void;
	onManagePayments?: () => void;
	onManagePlan?: () => void;
	onManageBilling?: () => void;
	onManageInvoices?: () => void;
	onManageIntegrations?: () => void;
	onManageConnectedStore?: () => void;
	onManageApiKeys?: () => void;
	onManageWebhooks?: () => void;
	onChangeLanguage?: () => void;
	onChangeRegion?: () => void;
	onChangeCurrency?: () => void;
	onChangeTheme?: () => void;
	onToggleNotifications?: (enabled: boolean) => void;
	onToggleMarketing?: (enabled: boolean) => void;
	onToggleHaptics?: (enabled: boolean) => void;
	onToggleAnalytics?: (enabled: boolean) => void;
	onToggleShoppingMode?: (enabled: boolean) => void;
	onOpenPrivacy?: () => void;
	onOpenTerms?: () => void;
	onOpenSupport?: () => void;
	onSendFeedback?: () => void;
	onRateApp?: () => void;
	onOpenDiagnostics?: () => void;
	onDeleteAccount?: () => void;
}

export interface SettingsModuleOptions {
	title?: string;
	template?: SettingsTemplateKind;
	preset?: SettingsPresetKind;
	modules?: SettingsModuleKind[];
	context?: SettingsModuleContext;
	handlers?: SettingsModuleHandlers;
	visibleSections?: string[];
	visibleItems?: string[];
	hiddenItems?: string[];
	disabledItems?: string[];
	sectionOrder?: string[];
	itemOrder?: Record<string, string[]>;
	groups?: SettingsSectionGroupConfig[];
	groupOverrides?: Record<string, Partial<Omit<SettingsSectionGroupConfig, "id">>>;
	itemOverrides?: Record<string, Partial<SettingsItemConfig>>;
	sectionOverrides?: Record<string, Partial<Omit<SettingsSectionConfig, "id" | "items">>>;
	extraSections?: SettingsSectionConfig[];
}

export interface SettingsModuleDefinition {
	title: string;
	template: SettingsTemplateKind;
	modules: SettingsModuleKind[];
	layout: SettingsModuleLayout;
	sections: SettingsSectionConfig[];
}

export interface SettingsItemDescriptor {
	id: string;
	sectionId: string;
	groupId?: string;
	label: string;
	description?: string;
	type: SettingsItemType;
	valueKind: "boolean" | "string" | "none";
	disabled: boolean;
	configurable: {
		canHide: boolean;
		canDisable: boolean;
		canOverride: boolean;
	};
}

export interface SettingsSectionDescriptor {
	id: string;
	groupId?: string;
	title: string;
	description?: string;
	items: string[];
}

export interface SettingsModuleDescriptor {
	title: string;
	template: SettingsTemplateKind;
	modules: SettingsModuleKind[];
	layout: SettingsModuleLayout;
	groups: SettingsSectionGroupConfig[];
	sections: SettingsSectionDescriptor[];
	items: SettingsItemDescriptor[];
	configurable: {
		supportsVisibility: boolean;
		supportsOrdering: boolean;
		supportsGroups: boolean;
		supportsOverrides: boolean;
	};
}

export interface SettingsPresetDefinition {
	id: SettingsPresetKind;
	title: string;
	description: string;
	template: SettingsTemplateKind;
	modules: SettingsModuleKind[];
	groups: SettingsSectionGroupConfig[];
	visibleSections: string[];
	sectionOrder: string[];
	itemOrder: Record<string, string[]>;
}

export const settingsTemplateModules: Record<SettingsTemplateKind, SettingsModuleKind[]> = {
	default: ["account", "notifications", "appearance", "privacy", "support"],
	shopify: [
		"account",
		"commerce",
		"billing",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"support",
	],
	content: ["account", "integrations", "notifications", "appearance", "privacy", "support"],
	internal: [
		"account",
		"team",
		"developer",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"danger",
	],
	saas: [
		"account",
		"team",
		"billing",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"support",
	],
};

export const settingsTemplateGroups: Record<SettingsTemplateKind, SettingsSectionGroupConfig[]> = {
	default: [
		{ id: "identity", title: "Identity", sections: ["account"] },
		{ id: "preferences", title: "Preferences", sections: ["notifications", "appearance"] },
		{ id: "trust", title: "Trust and help", sections: ["privacy", "support"] },
	],
	shopify: [
		{ id: "identity", title: "Identity", sections: ["account"] },
		{ id: "commerce", title: "Commerce operations", sections: ["commerce", "billing"] },
		{ id: "platform", title: "Platform connections", sections: ["integrations"] },
		{ id: "preferences", title: "Preferences", sections: ["notifications", "appearance"] },
		{ id: "trust", title: "Trust and help", sections: ["privacy", "support"] },
	],
	content: [
		{ id: "identity", title: "Identity", sections: ["account"] },
		{ id: "platform", title: "Publishing connections", sections: ["integrations"] },
		{ id: "preferences", title: "Preferences", sections: ["notifications", "appearance"] },
		{ id: "trust", title: "Trust and help", sections: ["privacy", "support"] },
	],
	internal: [
		{ id: "identity", title: "Identity", sections: ["account"] },
		{ id: "operations", title: "Operations", sections: ["team", "developer", "integrations"] },
		{ id: "preferences", title: "Preferences", sections: ["notifications", "appearance"] },
		{ id: "trust", title: "Trust", sections: ["privacy"] },
		{ id: "danger", title: "Danger zone", sections: ["danger"] },
	],
	saas: [
		{ id: "identity", title: "Identity", sections: ["account", "team"] },
		{ id: "business", title: "Business", sections: ["billing", "integrations"] },
		{ id: "preferences", title: "Preferences", sections: ["notifications", "appearance"] },
		{ id: "trust", title: "Trust and help", sections: ["privacy", "support"] },
	],
};

export const settingsPresets: Record<SettingsPresetKind, SettingsPresetDefinition> = {
	basic: {
		id: "basic",
		title: "Basic settings",
		description: "Account, app preferences, privacy, and support for simple apps.",
		template: "default",
		modules: ["account", "notifications", "appearance", "privacy", "support"],
		groups: settingsTemplateGroups.default,
		visibleSections: ["account", "notifications", "appearance", "privacy", "support"],
		sectionOrder: ["account", "notifications", "appearance", "privacy", "support"],
		itemOrder: {
			account: ["account.profile", "account.signIn", "account.signOut"],
			notifications: ["notifications.push", "notifications.marketing"],
			appearance: [
				"appearance.theme",
				"appearance.language",
				"appearance.region",
				"appearance.currency",
				"appearance.haptics",
			],
			privacy: ["privacy.analytics", "privacy.policy", "privacy.terms"],
			support: ["support.help", "support.feedback", "support.rate", "support.version"],
		},
	},
	commerce: {
		id: "commerce",
		title: "Commerce settings",
		description: "Customer account, checkout, billing, integrations, preferences, and trust.",
		template: "shopify",
		modules: settingsTemplateModules.shopify,
		groups: settingsTemplateGroups.shopify,
		visibleSections: [
			"account",
			"commerce",
			"billing",
			"integrations",
			"notifications",
			"appearance",
			"privacy",
			"support",
		],
		sectionOrder: [
			"account",
			"commerce",
			"billing",
			"integrations",
			"notifications",
			"appearance",
			"privacy",
			"support",
		],
		itemOrder: {
			commerce: [
				"commerce.orders",
				"commerce.addresses",
				"commerce.payments",
				"commerce.shoppingMode",
			],
			billing: ["billing.plan", "billing.status", "billing.invoices"],
			integrations: [
				"integrations.store",
				"integrations.connected",
				"integrations.apiKeys",
				"integrations.webhooks",
			],
		},
	},
	team: {
		id: "team",
		title: "Team settings",
		description: "Team profile, member access, billing ownership, integrations, and support.",
		template: "saas",
		modules: settingsTemplateModules.saas,
		groups: settingsTemplateGroups.saas,
		visibleSections: [
			"account",
			"team",
			"billing",
			"integrations",
			"notifications",
			"appearance",
			"privacy",
			"support",
		],
		sectionOrder: [
			"account",
			"team",
			"billing",
			"integrations",
			"notifications",
			"appearance",
			"privacy",
			"support",
		],
		itemOrder: {
			team: ["team.profile", "team.members", "team.role"],
			billing: ["billing.plan", "billing.status", "billing.invoices"],
		},
	},
	developer: {
		id: "developer",
		title: "Developer settings",
		description: "Internal diagnostics, integrations, privacy controls, and destructive actions.",
		template: "internal",
		modules: settingsTemplateModules.internal,
		groups: settingsTemplateGroups.internal,
		visibleSections: [
			"account",
			"team",
			"developer",
			"integrations",
			"notifications",
			"appearance",
			"privacy",
			"danger",
		],
		sectionOrder: [
			"account",
			"team",
			"developer",
			"integrations",
			"notifications",
			"appearance",
			"privacy",
			"danger",
		],
		itemOrder: {
			team: ["team.profile", "team.members", "team.role"],
			developer: ["developer.diagnostics"],
			integrations: ["integrations.connected", "integrations.apiKeys", "integrations.webhooks"],
			danger: ["danger.deleteAccount"],
		},
	},
};

function unique<T>(items: T[]): T[] {
	return [...new Set(items)];
}

function mergeSettingsOptions(
	base: SettingsModuleOptions,
	overrides: SettingsModuleOptions,
): SettingsModuleOptions {
	return {
		...base,
		...overrides,
		context: {
			...base.context,
			...overrides.context,
		},
		handlers: {
			...base.handlers,
			...overrides.handlers,
		},
		modules: overrides.modules ?? base.modules,
		groups: overrides.groups ?? base.groups,
		visibleSections: overrides.visibleSections ?? base.visibleSections,
		visibleItems: overrides.visibleItems ?? base.visibleItems,
		hiddenItems: overrides.hiddenItems ?? base.hiddenItems,
		disabledItems: overrides.disabledItems ?? base.disabledItems,
		sectionOrder: overrides.sectionOrder ?? base.sectionOrder,
		itemOrder: {
			...base.itemOrder,
			...overrides.itemOrder,
		},
		groupOverrides: {
			...base.groupOverrides,
			...overrides.groupOverrides,
		},
		itemOverrides: {
			...base.itemOverrides,
			...overrides.itemOverrides,
		},
		sectionOverrides: {
			...base.sectionOverrides,
			...overrides.sectionOverrides,
		},
		extraSections: overrides.extraSections
			? [...(base.extraSections ?? []), ...overrides.extraSections]
			: base.extraSections,
	};
}

export function createSettingsPresetOptions(
	preset: SettingsPresetKind,
	overrides: SettingsModuleOptions = {},
): SettingsModuleOptions {
	const definition = settingsPresets[preset];
	return mergeSettingsOptions(
		{
			preset,
			template: definition.template,
			modules: definition.modules,
			groups: definition.groups,
			visibleSections: definition.visibleSections,
			sectionOrder: definition.sectionOrder,
			itemOrder: definition.itemOrder,
		},
		overrides,
	);
}

const hasHandler = (handler?: () => void) => (handler ? "link" : "value");

function item(
	config: Omit<SettingsItemConfig, "testID"> & {
		icon?: IconName;
	},
	options: SettingsModuleOptions,
): SettingsItemConfig | null {
	if (options.hiddenItems?.includes(config.id)) return null;

	const override = options.itemOverrides?.[config.id] ?? {};
	return {
		...config,
		disabled: options.disabledItems?.includes(config.id) || config.disabled,
		...override,
	};
}

function compact<T>(items: Array<T | null | undefined>): T[] {
	return items.filter(Boolean) as T[];
}

function orderByIds<T>(
	items: T[],
	orderedIds: string[] | undefined,
	getId: (item: T) => string,
): T[] {
	if (!orderedIds?.length) return items;
	const order = new Map(orderedIds.map((id, index) => [id, index]));
	return [...items].sort((a, b) => {
		const aIndex = order.get(getId(a));
		const bIndex = order.get(getId(b));
		if (aIndex === undefined && bIndex === undefined) return 0;
		if (aIndex === undefined) return 1;
		if (bIndex === undefined) return -1;
		return aIndex - bIndex;
	});
}

function applySectionVisibility(
	sections: SettingsSectionConfig[],
	options: SettingsModuleOptions,
): SettingsSectionConfig[] {
	const visibleSections = options.visibleSections ? new Set(options.visibleSections) : undefined;
	const visibleItems = options.visibleItems ? new Set(options.visibleItems) : undefined;

	return sections
		.filter((section) => !visibleSections || visibleSections.has(section.id))
		.map((section) => ({
			...section,
			items: visibleItems
				? section.items.filter((item) => visibleItems.has(item.id))
				: section.items,
		}))
		.filter((section) => section.items.length > 0);
}

function applyItemOrder(
	sections: SettingsSectionConfig[],
	itemOrder: Record<string, string[]> | undefined,
): SettingsSectionConfig[] {
	if (!itemOrder) return sections;
	return sections.map((section) => ({
		...section,
		items: orderByIds(section.items, itemOrder[section.id], (item) => item.id),
	}));
}

function resolveGroups(
	template: SettingsTemplateKind,
	sections: SettingsSectionConfig[],
	options: SettingsModuleOptions,
): SettingsSectionGroupConfig[] {
	const sectionIds = new Set(sections.map((section) => section.id));
	const sourceGroups = options.groups ?? settingsTemplateGroups[template];
	const groups = sourceGroups
		.map((group) => {
			const override = options.groupOverrides?.[group.id] ?? {};
			const sections = (override.sections ?? group.sections).filter((sectionId) =>
				sectionIds.has(sectionId),
			);
			return {
				...group,
				...override,
				id: group.id,
				sections,
			};
		})
		.filter((group) => group.sections.length > 0);

	const groupedSectionIds = new Set(groups.flatMap((group) => group.sections));
	const ungroupedSections = sections
		.map((section) => section.id)
		.filter((sectionId) => !groupedSectionIds.has(sectionId));

	if (ungroupedSections.length === 0) return groups;
	return [
		...groups,
		{
			id: "custom",
			title: "Custom",
			sections: ungroupedSections,
		},
	];
}

function resolveLayout(
	template: SettingsTemplateKind,
	sections: SettingsSectionConfig[],
	options: SettingsModuleOptions,
): SettingsModuleLayout {
	return {
		sectionOrder: sections.map((section) => section.id),
		itemOrder: Object.fromEntries(
			sections.map((section) => [section.id, section.items.map((item) => item.id)]),
		),
		groups: resolveGroups(template, sections, options),
		visibleSections: sections.map((section) => section.id),
		visibleItems: unique(sections.flatMap((section) => section.items.map((item) => item.id))),
	};
}

function section(
	config: SettingsSectionConfig,
	options: SettingsModuleOptions,
): SettingsSectionConfig | null {
	const items = compact(config.items);
	if (items.length === 0) return null;

	const override = options.sectionOverrides?.[config.id] ?? {};
	return {
		...config,
		...override,
		items,
	};
}

function buildAccountSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};
	const signedIn = context.signedIn ?? false;

	return section(
		{
			id: "account",
			title: "Account",
			description: signedIn
				? "Profile, identity, and saved preferences."
				: "Sign in to sync app data.",
			items: compact([
				item(
					{
						id: "account.profile",
						type: hasHandler(handlers.onEditProfile),
						label: signedIn ? (context.userName ?? "Profile") : "Guest profile",
						description: signedIn ? context.userEmail : "No account connected",
						icon: "User",
						value: signedIn && !handlers.onEditProfile ? context.userEmail : undefined,
						onPress: signedIn ? handlers.onEditProfile : handlers.onSignIn,
					},
					options,
				),
				item(
					{
						id: "account.signIn",
						type: "link",
						label: "Sign in",
						description: "Connect profile, orders, and preferences.",
						icon: "LogIn",
						onPress: handlers.onSignIn,
					},
					{
						...options,
						hiddenItems: signedIn
							? [...(options.hiddenItems ?? []), "account.signIn"]
							: options.hiddenItems,
					},
				),
				item(
					{
						id: "account.signOut",
						type: "action",
						label: "Sign out",
						icon: "LogOut",
						onPress: handlers.onSignOut,
					},
					{
						...options,
						hiddenItems: signedIn
							? options.hiddenItems
							: [...(options.hiddenItems ?? []), "account.signOut"],
					},
				),
			]),
		},
		options,
	);
}

function buildTeamSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};
	const memberValue =
		typeof context.teamMemberCount === "number" ? `${context.teamMemberCount} members` : undefined;

	return section(
		{
			id: "team",
			title: "Team",
			description: "Workspace identity, members, roles, and access ownership.",
			items: compact([
				item(
					{
						id: "team.profile",
						type: hasHandler(handlers.onManageTeam),
						label: "Workspace",
						description: "Team name, workspace profile, and ownership.",
						icon: "UsersRound",
						value: context.teamName,
						onPress: handlers.onManageTeam,
					},
					options,
				),
				item(
					{
						id: "team.members",
						type: hasHandler(handlers.onInviteMembers),
						label: "Members",
						description: "Invite teammates and review active access.",
						icon: "UserPlus",
						value: memberValue,
						onPress: handlers.onInviteMembers,
					},
					options,
				),
				item(
					{
						id: "team.role",
						type: "value",
						label: "Your role",
						description: "Current access level in this workspace.",
						icon: "ShieldUser",
						value: context.teamRoleLabel,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildCommerceSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "commerce",
			title: "Commerce",
			description: "Orders, checkout defaults, and purchase preferences.",
			items: compact([
				item(
					{
						id: "commerce.orders",
						type: hasHandler(handlers.onManageOrders),
						label: "Orders",
						description: "Receipts, shipment tracking, and returns.",
						icon: "Package",
						onPress: handlers.onManageOrders,
					},
					options,
				),
				item(
					{
						id: "commerce.addresses",
						type: hasHandler(handlers.onManageAddresses),
						label: "Addresses",
						description: "Saved delivery addresses and checkout defaults.",
						icon: "MapPin",
						value: context.defaultAddressLabel,
						onPress: handlers.onManageAddresses,
					},
					options,
				),
				item(
					{
						id: "commerce.payments",
						type: hasHandler(handlers.onManagePayments),
						label: "Payment methods",
						description: "Cards, wallets, and accelerated checkout.",
						icon: "CreditCard",
						value: context.paymentMethodLabel,
						onPress: handlers.onManagePayments,
					},
					options,
				),
				item(
					{
						id: "commerce.shoppingMode",
						type: "toggle",
						label: "Shopping mode",
						description: "Prioritize availability, delivery, and purchase actions.",
						icon: "ShoppingBag",
						value: !!context.shoppingModeEnabled,
						onToggle: handlers.onToggleShoppingMode,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildBillingSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "billing",
			title: "Billing",
			description: "Plan, invoices, payment ownership, and entitlement status.",
			items: compact([
				item(
					{
						id: "billing.plan",
						type: hasHandler(handlers.onManagePlan),
						label: "Plan",
						description: "Current subscription tier and feature access.",
						icon: "BadgeDollarSign",
						value: context.planName,
						onPress: handlers.onManagePlan,
					},
					options,
				),
				item(
					{
						id: "billing.status",
						type: hasHandler(handlers.onManageBilling),
						label: "Billing status",
						description: "Payment state, renewal, and account standing.",
						icon: "Receipt",
						value: context.billingStatus,
						onPress: handlers.onManageBilling,
					},
					options,
				),
				item(
					{
						id: "billing.invoices",
						type: hasHandler(handlers.onManageInvoices),
						label: "Invoices",
						description: "Receipts, billing contacts, and tax details.",
						icon: "FileText",
						value: context.invoiceEmail,
						onPress: handlers.onManageInvoices,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildIntegrationsSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};
	const integrationValue =
		typeof context.integrationCount === "number"
			? `${context.integrationCount} connected`
			: undefined;

	return section(
		{
			id: "integrations",
			title: "Integrations",
			description: "External services, API access, webhooks, and platform connections.",
			items: compact([
				item(
					{
						id: "integrations.connected",
						type: hasHandler(handlers.onManageIntegrations),
						label: "Connected apps",
						description: "Review active integrations and connected services.",
						icon: "Plug",
						value: integrationValue,
						onPress: handlers.onManageIntegrations,
					},
					options,
				),
				item(
					{
						id: "integrations.store",
						type: hasHandler(handlers.onManageConnectedStore),
						label: "Store connection",
						description: "Commerce platform, sync state, and storefront identity.",
						icon: "Store",
						value: context.connectedStoreLabel,
						onPress: handlers.onManageConnectedStore,
					},
					options,
				),
				item(
					{
						id: "integrations.apiKeys",
						type: hasHandler(handlers.onManageApiKeys),
						label: "API keys",
						description: "Client keys, server keys, rotation, and access scopes.",
						icon: "KeyRound",
						value: context.apiKeyLabel,
						onPress: handlers.onManageApiKeys,
					},
					options,
				),
				item(
					{
						id: "integrations.webhooks",
						type: hasHandler(handlers.onManageWebhooks),
						label: "Webhooks",
						description: "Delivery endpoints, signing secrets, and retry status.",
						icon: "Webhook",
						value: context.webhookEndpointLabel,
						onPress: handlers.onManageWebhooks,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildNotificationsSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "notifications",
			title: "Notifications",
			description: "Control updates, reminders, and promotional messages.",
			items: compact([
				item(
					{
						id: "notifications.push",
						type: "toggle",
						label: "Push notifications",
						description: "Important updates and time-sensitive alerts.",
						icon: "Bell",
						value: !!context.notificationsEnabled,
						onToggle: handlers.onToggleNotifications,
					},
					options,
				),
				item(
					{
						id: "notifications.marketing",
						type: "toggle",
						label: "Marketing updates",
						description: "Launches, offers, and product news.",
						icon: "Megaphone",
						value: !!context.marketingEnabled,
						onToggle: handlers.onToggleMarketing,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildAppearanceSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "appearance",
			title: "Appearance and region",
			description: "Theme, language, regional defaults, and device feedback.",
			items: compact([
				item(
					{
						id: "appearance.theme",
						type: hasHandler(handlers.onChangeTheme),
						label: "Theme",
						description: "Visual style used across the app.",
						icon: "Palette",
						value: context.theme,
						onPress: handlers.onChangeTheme,
					},
					options,
				),
				item(
					{
						id: "appearance.language",
						type: hasHandler(handlers.onChangeLanguage),
						label: "Language",
						description: "Text and formatting language.",
						icon: "Languages",
						value: context.language,
						onPress: handlers.onChangeLanguage,
					},
					options,
				),
				item(
					{
						id: "appearance.region",
						type: hasHandler(handlers.onChangeRegion),
						label: "Region",
						description: "Country, tax, and delivery defaults.",
						icon: "Globe2",
						value: context.region,
						onPress: handlers.onChangeRegion,
					},
					options,
				),
				item(
					{
						id: "appearance.currency",
						type: hasHandler(handlers.onChangeCurrency),
						label: "Currency",
						description: "Prices and totals.",
						icon: "CircleDollarSign",
						value: context.currency,
						onPress: handlers.onChangeCurrency,
					},
					options,
				),
				item(
					{
						id: "appearance.haptics",
						type: "toggle",
						label: "Haptic feedback",
						description: "Subtle tactile response for controls.",
						icon: "Vibrate",
						value: !!context.hapticFeedbackEnabled,
						onToggle: handlers.onToggleHaptics,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildPrivacySection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "privacy",
			title: "Privacy and security",
			description: "Data controls, legal documents, and account protection.",
			items: compact([
				item(
					{
						id: "privacy.analytics",
						type: "toggle",
						label: "Analytics",
						description: "Help improve reliability and product decisions.",
						icon: "ChartNoAxesColumn",
						value: !!context.analyticsEnabled,
						onToggle: handlers.onToggleAnalytics,
					},
					options,
				),
				item(
					{
						id: "privacy.policy",
						type: hasHandler(handlers.onOpenPrivacy),
						label: "Privacy policy",
						icon: "ShieldCheck",
						onPress: handlers.onOpenPrivacy,
					},
					options,
				),
				item(
					{
						id: "privacy.terms",
						type: hasHandler(handlers.onOpenTerms),
						label: "Terms of service",
						icon: "FileText",
						onPress: handlers.onOpenTerms,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildSupportSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const context = options.context ?? {};
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "support",
			title: "Support",
			description: context.appName
				? `${context.appName} help, feedback, and version details.`
				: "Help, feedback, and version details.",
			items: compact([
				item(
					{
						id: "support.help",
						type: hasHandler(handlers.onOpenSupport),
						label: "Help center",
						icon: "CircleHelp",
						onPress: handlers.onOpenSupport,
					},
					options,
				),
				item(
					{
						id: "support.feedback",
						type: hasHandler(handlers.onSendFeedback),
						label: "Send feedback",
						icon: "MessageSquareText",
						onPress: handlers.onSendFeedback,
					},
					options,
				),
				item(
					{
						id: "support.rate",
						type: hasHandler(handlers.onRateApp),
						label: "Rate app",
						icon: "Star",
						onPress: handlers.onRateApp,
					},
					options,
				),
				item(
					{
						id: "support.version",
						type: "value",
						label: "Version",
						icon: "Info",
						value: context.appVersion,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildDeveloperSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "developer",
			title: "Developer",
			description: "Diagnostics and implementation tools for internal builds.",
			items: compact([
				item(
					{
						id: "developer.diagnostics",
						type: hasHandler(handlers.onOpenDiagnostics),
						label: "Diagnostics",
						description: "Inspect runtime state, build info, and logs.",
						icon: "Bug",
						onPress: handlers.onOpenDiagnostics,
					},
					options,
				),
			]),
		},
		options,
	);
}

function buildDangerSection(options: SettingsModuleOptions): SettingsSectionConfig | null {
	const handlers = options.handlers ?? {};

	return section(
		{
			id: "danger",
			title: "Danger zone",
			description: "Destructive account actions.",
			items: compact([
				item(
					{
						id: "danger.deleteAccount",
						type: "danger",
						label: "Delete account",
						description: "Permanently remove account data.",
						icon: "Trash2",
						onPress: handlers.onDeleteAccount,
					},
					options,
				),
			]),
		},
		options,
	);
}

const sectionBuilders: Record<
	SettingsModuleKind,
	(options: SettingsModuleOptions) => SettingsSectionConfig | null
> = {
	account: buildAccountSection,
	team: buildTeamSection,
	commerce: buildCommerceSection,
	billing: buildBillingSection,
	integrations: buildIntegrationsSection,
	notifications: buildNotificationsSection,
	appearance: buildAppearanceSection,
	privacy: buildPrivacySection,
	support: buildSupportSection,
	developer: buildDeveloperSection,
	danger: buildDangerSection,
};

export function createSettingsModule(
	options: SettingsModuleOptions = {},
): SettingsModuleDefinition {
	const resolvedOptions = options.preset
		? createSettingsPresetOptions(options.preset, options)
		: options;
	const template = resolvedOptions.template ?? "default";
	const modules = resolvedOptions.modules ?? settingsTemplateModules[template];
	const baseSections = compact(modules.map((module) => sectionBuilders[module](resolvedOptions)));
	const extraSections = resolvedOptions.extraSections ?? [];
	const visibleSections = applySectionVisibility(
		[...baseSections, ...extraSections],
		resolvedOptions,
	);
	const orderedSections = orderByIds(
		applyItemOrder(visibleSections, resolvedOptions.itemOrder),
		resolvedOptions.sectionOrder,
		(section) => section.id,
	);

	return {
		title: resolvedOptions.title ?? "Settings",
		template,
		modules,
		layout: resolveLayout(template, orderedSections, resolvedOptions),
		sections: orderedSections,
	};
}

function valueKind(value: SettingsItemConfig["value"]): SettingsItemDescriptor["valueKind"] {
	if (typeof value === "boolean") return "boolean";
	if (typeof value === "string") return "string";
	return "none";
}

function createSectionToGroupMap(groups: SettingsSectionGroupConfig[]) {
	const map = new Map<string, string>();
	for (const group of groups) {
		for (const sectionId of group.sections) {
			map.set(sectionId, group.id);
		}
	}
	return map;
}

export function describeSettingsModule(
	options: SettingsModuleOptions = {},
): SettingsModuleDescriptor {
	const module = createSettingsModule(options);
	const sectionToGroup = createSectionToGroupMap(module.layout.groups);

	return {
		title: module.title,
		template: module.template,
		modules: module.modules,
		layout: module.layout,
		groups: module.layout.groups,
		sections: module.sections.map((section) => ({
			id: section.id,
			groupId: sectionToGroup.get(section.id),
			title: section.title,
			description: section.description,
			items: section.items.map((item) => item.id),
		})),
		items: module.sections.flatMap((section) =>
			section.items.map((item) => ({
				id: item.id,
				sectionId: section.id,
				groupId: sectionToGroup.get(section.id),
				label: item.label,
				description: item.description,
				type: item.type,
				valueKind: valueKind(item.value),
				disabled: !!item.disabled,
				configurable: {
					canHide: true,
					canDisable: true,
					canOverride: true,
				},
			})),
		),
		configurable: {
			supportsVisibility: true,
			supportsOrdering: true,
			supportsGroups: true,
			supportsOverrides: true,
		},
	};
}
