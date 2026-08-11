import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import {
	createAccountModule,
	createAppTemplateManifest,
	composeAppScaffold,
	createComposedAppTemplateManifest,
	createCommerceModule,
	createSettingsModule,
	createSettingsPresetOptions,
	describeSettingsModule,
	scaffoldTemplateOptions,
	selectAppScaffold,
	settingsPresets,
	settingsTemplateGroups,
	settingsTemplateModules,
	validateTemplateEditionMetadata,
	type KitScreenName,
} from "./modules";

const packageJson = JSON.parse(
	readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as {
	exports: Record<string, { types: string; "react-native": string; import: string }>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
};
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const cartScreen = readFileSync(new URL("screens/cart-screen.tsx", import.meta.url), "utf8");
const checkoutScreen = readFileSync(
	new URL("screens/checkout-screen.tsx", import.meta.url),
	"utf8",
);
const detailScreen = readFileSync(new URL("screens/detail-screen.tsx", import.meta.url), "utf8");
const formField = readFileSync(new URL("components/form-field.tsx", import.meta.url), "utf8");
const formScreen = readFileSync(new URL("screens/form-screen.tsx", import.meta.url), "utf8");
const listScreen = readFileSync(new URL("screens/list-screen.tsx", import.meta.url), "utf8");
const loginScreen = readFileSync(new URL("screens/login-screen.tsx", import.meta.url), "utf8");
const orderScreen = readFileSync(new URL("screens/order-screen.tsx", import.meta.url), "utf8");
const productScreen = readFileSync(new URL("screens/product-screen.tsx", import.meta.url), "utf8");
const registerScreen = readFileSync(
	new URL("screens/register-screen.tsx", import.meta.url),
	"utf8",
);
const searchScreen = readFileSync(new URL("screens/search-screen.tsx", import.meta.url), "utf8");

const withoutComments = (source: string) =>
	source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

// React Native resolves source so Metro's Babel pass can compile Reanimated
// worklets; every other consumer resolves the compiled output so their type
// checker never sees this package's source.
for (const entry of [".", "./screens", "./entities", "./modules", "./types"]) {
	assert.ok(packageJson.exports[entry], `package.json exports ${entry}`);
	assert.ok(
		packageJson.exports[entry]["react-native"].startsWith("./src/"),
		`${entry} React Native entry points at src`,
	);
	assert.ok(
		packageJson.exports[entry].import.startsWith("./lib/"),
		`${entry} import points at the build output`,
	);
	assert.ok(
		packageJson.exports[entry].types.startsWith("./lib/"),
		`${entry} types point at the build output`,
	);
}

// A published range using one of these is unresolvable for every consumer.
// `catalog:` is not listed: `bun pm pack` substitutes the catalog value into the
// archive manifest, and `smoke:public-packages` asserts that on the real archive
// rather than on this source manifest. devDependencies are not checked because
// a consumer never installs them.
const internalProtocols = ["workspace:", "file:", "link:"];
for (const field of ["dependencies", "peerDependencies", "optionalDependencies"] as const) {
	for (const [name, range] of Object.entries(packageJson[field] ?? {})) {
		const protocol = internalProtocols.find((candidate) => range.startsWith(candidate));
		assert.ok(!protocol, `${field}.${name} must not publish the ${protocol} protocol`);
	}
}

assert.deepEqual(
	settingsTemplateModules.shopify,
	[
		"account",
		"commerce",
		"billing",
		"integrations",
		"notifications",
		"appearance",
		"privacy",
		"support",
	],
	"Shopify template selects the expected app modules",
);
assert.ok(
	settingsTemplateGroups.shopify.some(
		(group) => group.id === "commerce" && group.sections.includes("billing"),
	),
	"Shopify settings template groups commerce and billing settings",
);
assert.ok(
	settingsPresets.commerce.modules.includes("billing"),
	"commerce settings preset includes billing",
);
assert.ok(settingsPresets.team.modules.includes("team"), "team settings preset includes team");
assert.equal(
	scaffoldTemplateOptions.shopify.settingsPreset,
	"commerce",
	"Shopify scaffold option selects commerce settings preset",
);
assert.equal(
	scaffoldTemplateOptions.saas.settingsPreset,
	"team",
	"SaaS scaffold option selects team settings preset",
);

const teamSettingsOptions = createSettingsPresetOptions("team", {
	context: {
		teamName: "Northstar Studio",
		teamMemberCount: 8,
		teamRoleLabel: "Owner",
	},
});
assert.deepEqual(
	teamSettingsOptions.modules,
	settingsPresets.team.modules,
	"settings preset options carry module selection",
);
const teamSettings = createSettingsModule(teamSettingsOptions);
assert.ok(
	teamSettings.sections.some((section) => section.id === "team"),
	"team settings preset renders team section",
);
assert.ok(
	teamSettings.sections.some((section) =>
		section.items.some((item) => item.id === "team.members" && item.value === "8 members"),
	),
	"team settings preset renders member count item",
);

const shopifySettings = createSettingsModule({
	template: "shopify",
	context: {
		appName: "Demo Shop",
		signedIn: true,
		userName: "Ada",
		userEmail: "ada@example.com",
		defaultAddressLabel: "Home",
		paymentMethodLabel: "Visa 4242",
		planName: "Launch",
		billingStatus: "Active",
		invoiceEmail: "billing@example.com",
		integrationCount: 3,
		connectedStoreLabel: "Demo Shopify",
		apiKeyLabel: "2 active",
		webhookEndpointLabel: "/webhooks/shopify",
	},
	hiddenItems: ["notifications.marketing", "integrations.webhooks"],
	itemOverrides: {
		"commerce.orders": {
			label: "Purchases",
		},
		"billing.plan": {
			label: "Subscription",
		},
	},
	extraSections: [
		{
			id: "custom",
			title: "Custom",
			items: [{ id: "custom.item", type: "value", label: "Custom item", value: "Ready" }],
		},
	],
});
assert.equal(shopifySettings.title, "Settings", "settings module has a stable default title");
assert.deepEqual(
	shopifySettings.modules,
	settingsTemplateModules.shopify,
	"settings module records selected template modules",
);
assert.ok(
	shopifySettings.sections.some((section) => section.id === "commerce"),
	"Shopify settings include commerce section",
);
assert.ok(
	shopifySettings.sections.some((section) => section.id === "billing"),
	"Shopify settings include billing section",
);
assert.ok(
	shopifySettings.sections.some((section) => section.id === "integrations"),
	"Shopify settings include integrations section",
);
assert.ok(
	shopifySettings.sections.some((section) => section.id === "custom"),
	"settings module accepts extra sections",
);
assert.ok(
	!shopifySettings.sections.some((section) =>
		section.items.some((item) => item.id === "notifications.marketing"),
	),
	"settings module can hide items",
);
assert.equal(
	shopifySettings.sections
		.find((section) => section.id === "commerce")
		?.items.find((item) => item.id === "commerce.orders")?.label,
	"Purchases",
	"settings module can override individual items",
);
assert.equal(
	shopifySettings.sections
		.find((section) => section.id === "billing")
		?.items.find((item) => item.id === "billing.plan")?.label,
	"Subscription",
	"settings module can override billing items",
);
assert.ok(
	!shopifySettings.sections.some((section) =>
		section.items.some((item) => item.id === "integrations.webhooks"),
	),
	"settings module can hide integration items",
);

const tailoredSettings = createSettingsModule({
	template: "shopify",
	visibleSections: ["billing", "integrations", "privacy"],
	visibleItems: ["billing.invoices", "billing.plan", "integrations.apiKeys", "privacy.policy"],
	sectionOrder: ["integrations", "billing", "privacy"],
	itemOrder: {
		billing: ["billing.invoices", "billing.plan"],
	},
	groups: [
		{ id: "ops", title: "Operations", sections: ["integrations", "billing"] },
		{ id: "trust", title: "Trust", sections: ["privacy"] },
	],
	groupOverrides: {
		ops: { title: "Store operations" },
	},
});
assert.deepEqual(
	tailoredSettings.sections.map((section) => section.id),
	["integrations", "billing", "privacy"],
	"settings module supports section visibility and ordering",
);
assert.deepEqual(
	tailoredSettings.sections
		.find((section) => section.id === "billing")
		?.items.map((item) => item.id),
	["billing.invoices", "billing.plan"],
	"settings module supports item visibility and ordering",
);
assert.equal(
	tailoredSettings.layout.groups.find((group) => group.id === "ops")?.title,
	"Store operations",
	"settings module supports group overrides",
);
assert.deepEqual(
	tailoredSettings.layout.groups.map((group) => group.sections),
	[["integrations", "billing"], ["privacy"]],
	"settings module resolves groups to visible sections",
);
assert.ok(
	tailoredSettings.layout.visibleItems.includes("integrations.apiKeys"),
	"settings module records visible item ids for generators",
);
const tailoredSettingsDescriptor = describeSettingsModule({
	template: "shopify",
	visibleSections: ["billing", "integrations"],
	groups: [{ id: "ops", title: "Operations", sections: ["billing", "integrations"] }],
});
assert.equal(
	tailoredSettingsDescriptor.configurable.supportsGroups,
	true,
	"settings descriptor reports group support",
);
assert.deepEqual(
	tailoredSettingsDescriptor.groups.map((group) => group.id),
	["ops"],
	"settings descriptor records resolved groups",
);
assert.ok(
	tailoredSettingsDescriptor.sections.some(
		(section) => section.id === "billing" && section.groupId === "ops",
	),
	"settings descriptor maps sections to groups",
);
assert.ok(
	tailoredSettingsDescriptor.items.some(
		(item) => item.id === "billing.plan" && item.sectionId === "billing",
	),
	"settings descriptor records item metadata",
);

const accountModule = createAccountModule({
	providers: ["email", "apple"],
	enableRegistration: true,
	enableProfile: true,
});
assert.equal(accountModule.id, "account", "account module has stable id");
assert.ok(accountModule.screens.includes("LoginScreen"), "account module includes login screen");
assert.ok(
	accountModule.screens.includes("RegisterScreen"),
	"account module includes register screen",
);
assert.ok(
	accountModule.screens.includes("ProfileScreen"),
	"account module includes profile screen",
);
assert.ok(
	accountModule.capabilities.some((capability) => capability.id === "account.appleAuth"),
	"account module records selected auth providers",
);

const commerceModule = createCommerceModule({
	features: ["product", "search", "cart", "checkout", "orders"],
});
assert.equal(commerceModule.id, "commerce", "commerce module has stable id");
const expectedCommerceScreens: KitScreenName[] = [
	"ProductScreen",
	"SearchScreen",
	"CartScreen",
	"CheckoutScreen",
	"OrderScreen",
];
for (const screen of expectedCommerceScreens) {
	assert.ok(commerceModule.screens.includes(screen), `commerce module includes ${screen}`);
}
assert.ok(
	commerceModule.routes.some((route) => route.id === "commerce.cart" && route.tab),
	"commerce module marks cart as a tab route",
);

const shopifyManifest = createAppTemplateManifest("shopify");
assert.equal(shopifyManifest.id, "shopify", "Shopify app manifest has stable id");
assert.deepEqual(
	shopifyManifest.modules.map((module) => module.id),
	["account", "commerce", "settings"],
	"Shopify app manifest selects account, commerce, and settings modules",
);
assert.ok(
	shopifyManifest.settings?.modules.includes("commerce"),
	"Shopify app manifest settings include commerce settings",
);
assert.ok(
	shopifyManifest.settingsDescriptor?.items.some((item) => item.id === "billing.plan"),
	"Shopify app manifest exposes settings descriptor",
);
assert.ok(
	shopifyManifest.navigation.some((item) => item.id === "commerce.cart"),
	"Shopify app manifest exposes cart navigation",
);
assert.ok(
	shopifyManifest.e2eFlows.includes("purchase-loop"),
	"Shopify app manifest includes commerce E2E flow",
);

const communityEditionErrors = validateTemplateEditionMetadata({
	identity: {
		familyId: "shopify-app-kit",
		templateId: "shopify-app-kit-community",
		edition: "community",
		version: "0.1.0",
		docsEntryId: "templates/shopify-app-kit",
	},
	integrations: [{ id: "commerce-data", mode: "local", required: true }],
	distribution: { kind: "source-archive", access: "public" },
	artifact: {
		id: "shopify-app-kit-community",
		format: "tgz",
		manifestPath: "osuki.template-manifest.json",
	},
});
assert.deepEqual(communityEditionErrors, [], "Community edition metadata is valid");

const invalidProEditionErrors = validateTemplateEditionMetadata({
	identity: {
		familyId: "shopify-app-kit",
		templateId: "shopify-app-kit",
		edition: "pro",
		version: "0.1.0",
		docsEntryId: "templates/shopify-app-kit",
	},
	integrations: [{ id: "shopify-storefront", mode: "production", required: true }],
	distribution: { kind: "source-archive", access: "public" },
	artifact: {
		id: "shopify-app-kit",
		format: "tgz",
		manifestPath: "osuki.template-manifest.json",
	},
});
assert.ok(
	invalidProEditionErrors.includes("pro edition must use commerce-artifact distribution"),
	"Pro edition metadata rejects public source distribution",
);
assert.ok(
	invalidProEditionErrors.includes("pro edition must use entitled access"),
	"Pro edition metadata requires entitlement",
);

const composedShopify = composeAppScaffold({
	appType: "shopify",
	capabilities: ["checkout", "billing", "integrations"],
	authProviders: ["email", "apple", "google"],
});
assert.equal(composedShopify.appTemplate, "shopify", "composer preserves explicit app type");
assert.deepEqual(
	composedShopify.summary.commerceFeatures,
	["product", "search", "cart", "checkout", "orders"],
	"Shopify composer keeps full commerce feature set by default",
);
assert.ok(
	composedShopify.summary.settingsModules.includes("billing"),
	"composer includes billing settings from requirements",
);
assert.ok(
	composedShopify.summary.settingsModules.includes("integrations"),
	"composer includes integrations settings from requirements",
);
assert.ok(
	composedShopify.moduleSelection.account !== false,
	"composer selects account module for Shopify requirements",
);
assert.ok(
	composedShopify.moduleSelection.commerce !== false,
	"composer selects commerce module for Shopify requirements",
);
assert.equal(
	composedShopify.summary.settingsPreset,
	"commerce",
	"composer records resolved settings preset",
);

const selectedShopify = selectAppScaffold("shopify");
assert.equal(selectedShopify.template.id, "shopify", "selector records selected template");
assert.equal(
	selectedShopify.summary.settingsPreset,
	"commerce",
	"selector applies the template settings preset",
);
assert.ok(
	selectedShopify.requirements.settings?.preset === "commerce",
	"selector writes settings preset into composer requirements",
);
assert.ok(
	selectedShopify.summary.commerceFeatures.includes("checkout"),
	"selector resolves Shopify checkout capability",
);

const selectedSaas = selectAppScaffold({
	template: "saas",
	capabilities: ["integrations"],
});
assert.equal(selectedSaas.summary.settingsPreset, "team", "SaaS selector uses team preset");
assert.ok(
	selectedSaas.summary.settingsModules.includes("team"),
	"SaaS selector includes team settings module",
);

const checkoutOnly = composeAppScaffold({
	capabilities: ["checkout"],
	disabledCapabilities: ["orders", "productSearch"],
});
assert.equal(checkoutOnly.appTemplate, "shopify", "checkout requirement infers commerce app");
assert.deepEqual(
	checkoutOnly.summary.commerceFeatures,
	["product", "cart", "checkout"],
	"checkout requirement expands into product, cart, and checkout features",
);

const composedSaasManifest = createComposedAppTemplateManifest({
	appType: "saas",
	capabilities: ["account", "billing", "integrations", "settings"],
});
assert.equal(composedSaasManifest.id, "saas", "composer can create SaaS manifests");
assert.deepEqual(
	composedSaasManifest.modules.map((module) => module.id),
	["account", "settings"],
	"SaaS composer keeps commerce out unless requested",
);
assert.ok(
	composedSaasManifest.settings?.modules.includes("billing"),
	"SaaS composer includes billing settings",
);
assert.ok(
	composedSaasManifest.settings?.modules.includes("integrations"),
	"SaaS composer includes integrations settings",
);

assert.ok(readme.includes("bun add @osuki-dev/kit-community"), "README uses Bun install command");
assert.ok(!readme.includes("npm install"), "README does not recommend npm install");
assert.ok(!readme.includes("yarn add"), "README does not recommend yarn add");

assert.ok(formField.includes("\tSelect,"), "FormField imports Select from @osuki-dev/ui");
assert.ok(formField.includes("<Select"), "FormField renders Select for select fields");
assert.ok(!formField.includes("selectOpen"), "FormField does not keep custom select open state");
assert.ok(formField.includes("\tDateInput,"), "FormField imports DateInput from @osuki-dev/ui");
assert.ok(formField.includes("<DateInput"), "FormField renders DateInput for date fields");

assert.ok(listScreen.includes("FlatList"), "ListScreen uses FlatList virtualization");
assert.ok(!listScreen.includes("filteredData.map"), "ListScreen does not render rows with map");
assert.ok(listScreen.includes("useI18n"), "ListScreen uses kit i18n translations");
for (const hardcodedListCopy of [
	"SEARCH...",
	"ACTIONS",
	"NO DATA FOUND",
	"Try adjusting your search",
	"YES",
	"NO",
]) {
	assert.ok(
		!listScreen.includes(`"${hardcodedListCopy}"`),
		`ListScreen does not hardcode ${hardcodedListCopy}`,
	);
}

assert.ok(detailScreen.includes("useI18n"), "DetailScreen uses kit i18n translations");
for (const hardcodedDetailCopy of ["YES", "NO", "Created", "Updated"]) {
	assert.ok(
		!detailScreen.includes(`"${hardcodedDetailCopy}"`),
		`DetailScreen does not hardcode ${hardcodedDetailCopy}`,
	);
}

assert.ok(loginScreen.includes("useI18n"), "LoginScreen uses kit i18n translations");
for (const hardcodedLoginCopy of [
	"DONE",
	"SIGN IN",
	"SIGNING IN...",
	"EMAIL",
	"PASSWORD",
	"FORGOT PASSWORD?",
	"OR CONTINUE WITH",
	"DON'T HAVE AN ACCOUNT?",
]) {
	assert.ok(
		!loginScreen.includes(`"${hardcodedLoginCopy}"`),
		`LoginScreen does not hardcode ${hardcodedLoginCopy}`,
	);
}

assert.ok(registerScreen.includes("useI18n"), "RegisterScreen uses kit i18n translations");
for (const hardcodedRegisterCopy of [
	"DONE",
	"CREATE ACCOUNT",
	"CREATING ACCOUNT...",
	"FULL NAME",
	"EMAIL",
	"PASSWORD",
	"CONFIRM PASSWORD",
	"ALREADY HAVE AN ACCOUNT?",
]) {
	assert.ok(
		!registerScreen.includes(`"${hardcodedRegisterCopy}"`),
		`RegisterScreen does not hardcode ${hardcodedRegisterCopy}`,
	);
}

assert.ok(formScreen.includes("useI18n"), "FormScreen uses kit i18n translations");
for (const hardcodedFormCopy of ["DONE", "SAVE", "CANCEL", "SAVING..."]) {
	assert.ok(
		!formScreen.includes(`"${hardcodedFormCopy}"`),
		`FormScreen does not hardcode ${hardcodedFormCopy}`,
	);
}

assert.ok(checkoutScreen.includes("useI18n"), "CheckoutScreen uses kit i18n translations");
const checkoutRuntime = withoutComments(checkoutScreen);
for (const hardcodedCheckoutCopy of [
	"SHIPPING",
	"PAYMENT",
	"REVIEW",
	"SHIPPING ADDRESS",
	"PAYMENT METHOD",
	"ORDER REVIEW",
	"ORDER SUMMARY",
	"Subtotal",
	"Shipping",
	"Tax",
	"TOTAL",
	"BACK",
	"CONTINUE",
	"PLACE ORDER",
	"PLACING ORDER",
	"Full Name",
	"Street Address",
	"ZIP Code",
	"Add the recipient name.",
]) {
	assert.ok(
		!checkoutRuntime.includes(`"${hardcodedCheckoutCopy}"`),
		`CheckoutScreen does not hardcode ${hardcodedCheckoutCopy}`,
	);
}

assert.ok(cartScreen.includes("useI18n"), "CartScreen uses kit i18n translations");
const cartRuntime = withoutComments(cartScreen);
for (const hardcodedCartCopy of [
	"Cart",
	"Review items, apply a code, and continue to checkout.",
	"YOUR CART IS EMPTY",
	"Find a favorite, then checkout with saved cart, shipping, and secure payment.",
	"Promo code",
	"APPLY",
	"DISCOUNT",
	"SUBTOTAL",
	"SHIPPING",
	"FREE",
	"TAX",
	"TOTAL",
]) {
	assert.ok(
		!cartRuntime.includes(`"${hardcodedCartCopy}"`),
		`CartScreen does not hardcode ${hardcodedCartCopy}`,
	);
}

assert.ok(productScreen.includes("useI18n"), "ProductScreen uses kit i18n translations");
const productRuntime = withoutComments(productScreen);
for (const hardcodedProductCopy of [
	"IN STOCK",
	"OUT OF STOCK",
	"SPECIFICATIONS",
	"SELECT OPTION",
	"YOU MAY ALSO LIKE",
	"TOTAL",
]) {
	assert.ok(
		!productRuntime.includes(`"${hardcodedProductCopy}"`),
		`ProductScreen does not hardcode ${hardcodedProductCopy}`,
	);
}

assert.ok(searchScreen.includes("useI18n"), "SearchScreen uses kit i18n translations");
const searchRuntime = withoutComments(searchScreen);
for (const hardcodedSearchCopy of [
	"Search...",
	"NO RESULTS FOUND",
	"Try a different search term",
	"RECENT SEARCHES",
	"TRENDING",
]) {
	assert.ok(
		!searchRuntime.includes(`"${hardcodedSearchCopy}"`),
		`SearchScreen does not hardcode ${hardcodedSearchCopy}`,
	);
}

assert.ok(orderScreen.includes("useI18n"), "OrderScreen uses kit i18n translations");
const orderRuntime = withoutComments(orderScreen);
for (const hardcodedOrderCopy of [
	"PENDING",
	"CONFIRMED",
	"PROCESSING",
	"SHIPPED",
	"DELIVERED",
	"CANCELLED",
	"TRACKING NUMBER",
	"ESTIMATED DELIVERY",
	"ORDER TIMELINE",
	"ORDER SUMMARY",
	"SHIPPING ADDRESS",
	"PAYMENT METHOD",
	"Subtotal",
	"Shipping",
	"Tax",
	"TOTAL",
]) {
	assert.ok(
		!orderRuntime.includes(`"${hardcodedOrderCopy}"`),
		`OrderScreen does not hardcode ${hardcodedOrderCopy}`,
	);
}

assert.ok(orderScreen.includes("\tTimeline,"), "OrderScreen imports Timeline from @osuki-dev/ui");
assert.ok(orderScreen.includes("<Timeline"), "OrderScreen renders the shared Timeline primitive");
assert.ok(
	!orderScreen.includes("timelineIndicator"),
	"OrderScreen does not keep custom timeline chrome",
);

console.log("[kit-community-public-contract] PASS");
