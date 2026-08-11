import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const appId = "dev.osuki.kit";
const appScheme = "osuki";
const featuredProductHandle = "the-inventory-not-tracked-snowboard";
const featuredProductTitle = "The Inventory Not Tracked Snowboard";
const outDir = new URL("./generated/", import.meta.url);
const metroUrl = process.env.EXPO_E2E_METRO_URL ?? "http://127.0.0.1:8081";
const useDevClientUrl = process.env.EXPO_E2E_USE_DEV_CLIENT !== "0";
const devClientUrl = `${appScheme}://expo-development-client/?url=${encodeURIComponent(metroUrl)}`;

const pages = [
	{ name: "home", route: "/", expect: "Osuki Market" },
	{ name: "categories", route: "/categories", expect: "Categories" },
	{ name: "search", route: "/search", expect: "RECENT SEARCHES" },
	{ name: "bag", route: "/bag", expect: "YOUR CART IS EMPTY" },
	{ name: "orders", route: "/orders", expect: "Orders" },
	{ name: "users", route: "/users", expect: "Avery Chen" },
	{ name: "user-detail", route: "/users/1", expect: "Avery Chen" },
	{ name: "account", route: "/account", expect: "APPEARANCE" },
	{ name: "account-profile", route: "/account-profile", expect: "Sign in to view profile" },
	{ name: "account-addresses", route: "/account-addresses", expect: "Sign in to manage addresses" },
	{ name: "account-orders", route: "/account-orders", expect: "Sign in to view orders" },
	{ name: "security", route: "/security-screen", expect: "SECURITY SCORE" },
	{ name: "forms", route: "/forms", expect: "FORMS" },
	{ name: "auth", route: "/auth-screen", expect: "Account" },
	{ name: "flows", route: "/flows", expect: "FLOWS" },
	{
		name: "product",
		route: `/product?id=${featuredProductHandle}`,
		expect: featuredProductTitle,
	},
	{ name: "cart", route: "/cart", expect: "YOUR CART IS EMPTY" },
	{ name: "checkout", route: "/checkout", expect: "Your cart is empty" },
	{ name: "order", route: "/order", expect: "TRACKING NUMBER" },
	{ name: "article", route: "/article", expect: "The Art of Minimalist Design" },
	{ name: "feed", route: "/feed", expect: "Sarah Chen" },
	{ name: "player", route: "/player", expect: "Midnight City" },
	{ name: "notifications", route: "/notifications", expect: "New message from Sarah" },
	{ name: "calendar", route: "/calendar", expect: "Team Standup" },
	{ name: "camera", route: "/camera", expect: "SCAN" },
	{ name: "files", route: "/files", expect: "Design System" },
	{ name: "error", route: "/error-state", expect: "ERROR STATE" },
	{ name: "empty", route: "/empty-state", expect: "EMPTY STATE TYPE" },
	{ name: "loading", route: "/loading", expect: "SPINNER SIZE" },
	{ name: "welcome", route: "/welcome", expect: "Osuki Market" },
	{ name: "tabbed", route: "/tabbed", expect: "OVERVIEW (2)" },
	{ name: "bottom-nav", route: "/bottom-nav", expect: "BOTTOM NAV" },
	{ name: "modal", route: "/modal", expect: "Modal" },
	{ name: "component-e2e", route: "/component-e2e", expect: "COMPONENT E2E" },
];

const componentLabels = [
	"E2E COMPONENT Text",
	"E2E COMPONENT Button",
	"E2E COMPONENT PressableCard",
	"E2E COMPONENT Toggle",
	"E2E COMPONENT Checkbox",
	"E2E COMPONENT ListItem",
	"E2E COMPONENT DataTable",
	"E2E COMPONENT SegmentedControl",
	"E2E COMPONENT Tabs",
	"E2E COMPONENT Tag",
	"E2E COMPONENT Input",
	"E2E COMPONENT Select",
	"E2E COMPONENT DateInput",
	"E2E COMPONENT Dialog",
	"E2E COMPONENT Modal",
	"E2E COMPONENT Menu",
	"E2E COMPONENT OtpInput",
	"E2E COMPONENT ActionSheet",
	"E2E COMPONENT Sheet",
	"E2E COMPONENT Tooltip",
	"E2E COMPONENT Surface",
	"E2E COMPONENT Screen",
	"E2E COMPONENT ScrollScreen",
	"E2E COMPONENT Badge",
	"E2E COMPONENT Avatar",
	"E2E COMPONENT Icon",
	"E2E COMPONENT StatRow",
	"E2E COMPONENT SegmentedProgressBar",
	"E2E COMPONENT Toast",
	"E2E COMPONENT Spinner",
	"E2E COMPONENT Divider",
	"E2E COMPONENT Timeline",
	"E2E COMPONENT ResponsiveContainer",
	"E2E COMPONENT ResponsiveGrid",
	"E2E COMPONENT KeyboardAvoidingView",
	"E2E COMPONENT KeyboardStickyView",
	"E2E COMPONENT KeyboardToolbar",
	"E2E COMPONENT PressableScale",
	"E2E COMPONENT ChoiceRow",
	"E2E COMPONENT ChoiceList",
	"E2E COMPONENT InlineActivity",
];

const componentTestIds = [
	["Text", "e2e-component-screen-title"],
	["Button", "e2e-button-primary"],
	["Card", "e2e-card"],
	["PressableCard", "e2e-pressable-card"],
	["Toggle", "e2e-toggle"],
	["Checkbox", "e2e-checkbox"],
	["ListItem", "e2e-list-item, e2e-list-item-row"],
	["DataTable", "e2e-data-table, e2e-data-table-row-order-1001"],
	["SegmentedControl", "e2e-segmented-control"],
	["Tabs", "e2e-tabs, e2e-tabs-overview, e2e-tabs-orders"],
	["Tag", "e2e-tag"],
	["Input", "e2e-input"],
	["Select", "e2e-select"],
	["DateInput", "e2e-date-input"],
	["Dialog", "e2e-dialog-trigger, e2e-dialog-action-confirm"],
	["Modal", "e2e-modal-trigger, e2e-modal, e2e-modal-close"],
	["Menu", "e2e-menu"],
	["OtpInput", "e2e-otp-input"],
	["ActionSheet", "e2e-action-sheet-trigger, e2e-action-sheet"],
	["Sheet", "e2e-sheet-trigger, e2e-sheet, e2e-sheet-close"],
	["Tooltip", "e2e-tooltip"],
	["Surface", "e2e-surface"],
	["Screen", "e2e-screen"],
	["ScrollScreen", "e2e-scroll-screen"],
	["Badge", "e2e-badge-primary, e2e-badge-success"],
	["Avatar", "e2e-avatar"],
	["Icon", "e2e-icon"],
	["StatRow", "e2e-stat-row"],
	["SegmentedProgressBar", "e2e-segmented-progress-bar"],
	["Toast", "e2e-toast-trigger"],
	["Spinner", "e2e-spinner-sm, e2e-spinner-md, e2e-spinner-lg"],
	["Divider", "e2e-divider"],
	["Timeline", "e2e-timeline"],
	["ResponsiveContainer", "e2e-responsive-container"],
	["ResponsiveGrid", "e2e-responsive-grid"],
	["KeyboardAwareScrollView", "e2e-keyboard-aware-scroll-view"],
	["KeyboardAvoidingView", "e2e-keyboard-avoiding-view"],
	["KeyboardStickyView", "e2e-keyboard-sticky-view"],
	[
		"PressableScale",
		"e2e-pressable-scale, e2e-pressable-scale-quiet, e2e-pressable-scale-disabled",
	],
	[
		"ChoiceRow",
		"e2e-choice-row-plain, e2e-choice-row-loading, e2e-choice-row-disabled, e2e-choice-row-headline",
	],
	["ChoiceList", "e2e-choice-option-allow-once, e2e-choice-command-review"],
	[
		"InlineActivity",
		"e2e-inline-activity-sm, e2e-inline-activity-inactive, e2e-inline-activity-full",
	],
];

function deepLink(route) {
	return route === "/" ? `${appScheme}://` : `${appScheme}:///${route.replace(/^\//, "")}`;
}

function yamlString(value) {
	return JSON.stringify(value);
}

function acceptIosOpenPrompt() {
	return `- tapOn:
    text: "Open"
    optional: true
`;
}

function openLinkStep(url) {
	return `- openLink: ${yamlString(url)}
${acceptIosOpenPrompt()}`;
}

function withOpenPromptFallback(flow) {
	return flow.replace(
		/(- openLink: .+\n)(?!- tapOn:\n    text: "Open"\n    optional: true\n)/g,
		`$1${acceptIosOpenPrompt()}`,
	);
}

function writeFlow(filename, flow) {
	writeFileSync(join(outDir.pathname, filename), withOpenPromptFallback(flow));
}

function pageFlow({ name, route, expect, extraExpect = [] }) {
	const extraSteps = extraExpect.map((label) => `- assertVisible: ${yamlString(label)}`).join("\n");
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: `- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`;

	return `appId: ${appId}
name: page-${name}
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink(route))}
- extendedWaitUntil:
    visible: ${yamlString(expect)}
    timeout: 10000
- assertVisible: ${yamlString(expect)}${extraSteps ? `\n${extraSteps}` : ""}
`;
}

function scrollUntilVisible(label, direction = "DOWN") {
	return `- scrollUntilVisible:
    element:
      text: ${yamlString(label)}
    direction: ${direction}
    timeout: 8000
- assertVisible: ${yamlString(label)}
`;
}

function tapOnId(id) {
	return `- tapOn:
    id: ${yamlString(id)}
`;
}

function inputTextId(id, text) {
	return `${tapOnId(id)}- inputText: ${yamlString(text)}
`;
}

function replaceTextId(id, text) {
	return `${tapOnId(id)}- inputText: ${yamlString(text)}
`;
}

function scrollUntilVisibleId(id) {
	return `- scrollUntilVisible:
    element:
      id: ${yamlString(id)}
    direction: DOWN
    timeout: 8000
- assertVisible:
    id: ${yamlString(id)}
`;
}

function componentFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: component-coverage
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- waitForAnimationToEnd:
    timeout: 5000
- openLink: ${yamlString(deepLink("/component-e2e"))}
- waitForAnimationToEnd:
    timeout: 3000
- extendedWaitUntil:
    visible: "COMPONENT E2E"
    timeout: 10000
- assertVisible: "COMPONENT E2E"
${scrollUntilVisible("E2E BUTTON PRIMARY")}
${tapOnId("e2e-button-primary")}
- assertVisible: "BUTTON PRESSED 1"
${scrollUntilVisible("E2E PRESSABLE CARD")}
- tapOn: "E2E PRESSABLE CARD"
- assertVisible: "CARD PRESSED 1"
${scrollUntilVisible("E2E TOGGLE OFF")}
- tapOn: "E2E TOGGLE OFF"
- assertVisible: "E2E TOGGLE ON"
${scrollUntilVisible("E2E CHECKBOX OFF")}
${tapOnId("e2e-checkbox-row")}
- assertVisible: "E2E CHECKBOX ON"
${scrollUntilVisible("E2E LIST ITEM")}
${tapOnId("e2e-list-item-row")}
- assertVisible: "Pressed 1"
${scrollUntilVisible("E2E COMPONENT SegmentedControl")}
- assertVisible: "SEGMENT ONE"
- tapOn: "TWO"
- assertVisible: "SEGMENT TWO"
${scrollUntilVisible("TABS VALUE OVERVIEW")}
${tapOnId("e2e-tabs-orders")}
- assertVisible: "TABS VALUE ORDERS"
${scrollUntilVisible("TAG PRESSED 0")}
${tapOnId("e2e-tag")}
- assertVisible: "TAG PRESSED 1"
${scrollUntilVisible("E2E INPUT LABEL")}${tapOnId("e2e-input")}
- assertVisible: "INPUT VALUE EMPTY"
- hideKeyboard
${scrollUntilVisible("E2E MODAL OPEN")}
${tapOnId("e2e-modal-trigger")}
- assertVisible: "E2E MODAL TITLE"
${tapOnId("e2e-modal-close")}
${scrollUntilVisible("E2E DIALOG OPEN")}
${tapOnId("e2e-dialog-trigger")}
- assertVisible: "E2E DIALOG TITLE"
${tapOnId("e2e-dialog-action-confirm")}
- assertVisible: "DIALOG VALUE CONFIRMED"
${componentLabels.map((label) => scrollUntilVisible(label)).join("")}${scrollUntilVisible("E2E INLINE ACTIVITY ACTIVE")}
${tapOnId("e2e-inline-activity-toggle")}
- assertVisible: "E2E INLINE ACTIVITY IDLE"
${scrollUntilVisible("CHOICE LIST ANSWER NONE", "UP")}
${tapOnId("e2e-choice-option-allow-once")}
- assertVisible: "CHOICE LIST ANSWER ALLOW-ONCE"
${tapOnId("e2e-choice-list-reset")}
${scrollUntilVisible("E2E PRESSABLE SCALE TILE", "UP")}
${tapOnId("e2e-pressable-scale")}
- assertVisible: "PRESSABLE SCALE PRESSED 1"
`;
}

function purchaseFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: purchase-loop
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- extendedWaitUntil:
    visible:
      id: "home-featured-banner"
    timeout: 10000
${tapOnId("home-shop-featured")}
${scrollUntilVisibleId("product-add-to-cart")}
${tapOnId("product-add-to-cart")}
${scrollUntilVisibleId("cart-checkout")}
${tapOnId("cart-checkout")}
- extendedWaitUntil:
    visible: "ORDER SUMMARY"
    timeout: 10000
${tapOnId("checkout-continue-shipping")}
- extendedWaitUntil:
    visible: "PAYMENT METHOD"
    timeout: 10000
${tapOnId("checkout-continue-payment")}
- extendedWaitUntil:
    visible: "ORDER REVIEW"
    timeout: 10000
${tapOnId("checkout-place-order")}
- extendedWaitUntil:
    visible: "TRACKING NUMBER"
    timeout: 10000
- assertVisible: "TRACKING NUMBER"
`;
}

function accountFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: account-checkout-flow
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/account"))}
- extendedWaitUntil:
    visible: "Account"
    timeout: 10000
${tapOnId("account-sign-in-button")}
- extendedWaitUntil:
    visible: "Account"
    timeout: 10000
${inputTextId("auth-email-input", "avery@example.com")}
${inputTextId("auth-password-input", "password123")}
- hideKeyboard
${tapOnId("auth-submit-button")}
- extendedWaitUntil:
    visible: "SIGNED IN"
    timeout: 10000
- assertVisible: "avery@example.com"
${tapOnId("account-profile-entry")}
- extendedWaitUntil:
    visible: "Manage the customer details used for checkout and delivery updates."
    timeout: 10000
${replaceTextId("account-profile-email-input", "invalid-email")}
- hideKeyboard
${scrollUntilVisibleId("account-profile-save-button")}
${tapOnId("account-profile-save-button")}
- extendedWaitUntil:
    visible: "Use a valid email address."
    timeout: 10000
${replaceTextId("account-profile-email-input", "avery@example.com")}
- hideKeyboard
${scrollUntilVisibleId("account-profile-save-button")}
${tapOnId("account-profile-save-button")}
- extendedWaitUntil:
    visible: "Profile updated."
    timeout: 10000
${tapOnId("account-profile-addresses-button")}
- extendedWaitUntil:
    visible: "Addresses"
    timeout: 10000
${inputTextId("account-address-name-input", "Mika Tan")}
${inputTextId("account-address-street-input", "21 Pine Street")}
- hideKeyboard
${scrollUntilVisibleId("account-address-city-input")}
${inputTextId("account-address-city-input", "San Francisco")}
- hideKeyboard
${scrollUntilVisibleId("account-address-zip-input")}
${inputTextId("account-address-zip-input", "94108")}
- hideKeyboard
${tapOnId("account-address-add-button")}
- extendedWaitUntil:
    visible: "Address saved and set for checkout."
    timeout: 10000
${scrollUntilVisible("21 Pine Street")}
- openLink: ${yamlString(deepLink(`/product?id=${featuredProductHandle}`))}
- extendedWaitUntil:
    visible: ${yamlString(featuredProductTitle)}
    timeout: 10000
${scrollUntilVisibleId("product-add-to-cart")}
${tapOnId("product-add-to-cart")}
${scrollUntilVisibleId("cart-checkout")}
${tapOnId("cart-checkout")}
- extendedWaitUntil:
    visible: "21 Pine Street"
    timeout: 10000
- assertVisible: "Using your default account address."
- assertVisible: "21 Pine Street"
${tapOnId("checkout-continue-shipping")}
- extendedWaitUntil:
    visible: "PAYMENT METHOD"
    timeout: 10000
${tapOnId("checkout-continue-payment")}
- extendedWaitUntil:
    visible: "ORDER REVIEW"
    timeout: 10000
${tapOnId("checkout-place-order")}
- extendedWaitUntil:
    visible: "TRACKING NUMBER"
    timeout: 10000
- openLink: ${yamlString(deepLink("/account-orders"))}
- extendedWaitUntil:
    visible: "Order history"
    timeout: 10000
- assertVisible: "21 Pine Street"
- assertVisible: ${yamlString(featuredProductTitle)}
`;
}

function accountSignupSignoutFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: account-signup-signout-flow
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/account"))}
- extendedWaitUntil:
    visible: "Account"
    timeout: 10000
${tapOnId("account-sign-in-button")}
- extendedWaitUntil:
    visible: "Account"
    timeout: 10000
${tapOnId("auth-mode-sign-up")}
${inputTextId("auth-name-input", "Mika Tan")}
${inputTextId("auth-email-input", "mika@example.com")}
- hideKeyboard
${scrollUntilVisibleId("auth-password-input")}
${inputTextId("auth-password-input", "password123")}
- hideKeyboard
${scrollUntilVisibleId("auth-confirm-password-input")}
${inputTextId("auth-confirm-password-input", "password123")}
- hideKeyboard
${tapOnId("auth-submit-button")}
- extendedWaitUntil:
    visible: "SIGNED IN"
    timeout: 10000
- assertVisible: "mika@example.com"
${scrollUntilVisibleId("settings-item-about-signout")}
${tapOnId("settings-item-about-signout")}
- extendedWaitUntil:
    visible: "Sign in to continue"
    timeout: 10000
- assertVisible: "Sign in to continue"
`;
}

function authValidationFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: auth-validation
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/auth-screen"))}
- extendedWaitUntil:
    visible: "Account"
    timeout: 10000
${tapOnId("auth-submit-button")}
- extendedWaitUntil:
    visible: "Check the highlighted fields and try again."
    timeout: 10000
- assertVisible: "Enter your email address."
- assertVisible: "Enter your password."
${inputTextId("auth-email-input", "avery@example.com")}
- hideKeyboard
${scrollUntilVisibleId("auth-password-input")}
${inputTextId("auth-password-input", "password123")}
- hideKeyboard
${scrollUntilVisibleId("auth-submit-button")}
${tapOnId("auth-submit-button")}
- extendedWaitUntil:
    visible: "SIGNED IN"
    timeout: 10000
- assertVisible: "avery@example.com"
`;
}

function notificationsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: notifications-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/notifications"))}
- extendedWaitUntil:
    visible: "New message from Sarah"
    timeout: 10000
${tapOnId("notification-delete-1")}
- assertNotVisible: "New message from Sarah"
${tapOnId("notifications-filter-unread")}
- assertVisible: "Order delivered"
${tapOnId("notifications-mark-all-read")}
- extendedWaitUntil:
    visible: "NO NOTIFICATIONS"
    timeout: 10000
- assertVisible: "NO NOTIFICATIONS"
`;
}

function feedInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: feed-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/feed"))}
- extendedWaitUntil:
    visible: "Sarah Chen"
    timeout: 10000
${tapOnId("feed-like-1")}
- assertVisible: "123"
${tapOnId("feed-comment-1")}
- assertVisible: "19"
${tapOnId("feed-share-1")}
- assertVisible: "6"
${tapOnId("feed-bookmark-1")}
${scrollUntilVisibleId("feed-load-more")}
${tapOnId("feed-load-more")}
- extendedWaitUntil:
    visible: "Osuki Studio"
    timeout: 10000
- assertVisible: "Osuki Studio"
`;
}

function filesInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: files-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/files"))}
- extendedWaitUntil:
    visible: "Design System"
    timeout: 10000
${tapOnId("files-sort-size")}
- assertVisible: "/Documents/Projects · SIZE ASC"
${tapOnId("files-view-toggle")}
${tapOnId("files-item-folder-design")}
- extendedWaitUntil:
    visible: "tokens.json"
    timeout: 10000
- assertVisible: "/Documents/Projects/Design System · SIZE ASC"
${tapOnId("files-item-tokens")}
- assertVisible: "Selected tokens.json"
${tapOnId("files-item-archive")}
- extendedWaitUntil:
    visible: "FOLDER IS EMPTY"
    timeout: 10000
- assertVisible: "/Documents/Projects/Design System/Archive · SIZE ASC"
${tapOnId("files-navigate-up")}
- extendedWaitUntil:
    visible: "tokens.json"
    timeout: 10000
- assertVisible: "/Documents/Projects/Design System · SIZE ASC"
`;
}

function formsInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: forms-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/forms"))}
- extendedWaitUntil:
    visible: "Forms"
    timeout: 10000
- extendedWaitUntil:
    visible: "SUBMIT"
    timeout: 10000
- tapOn: "SUBMIT"
- extendedWaitUntil:
    visible: "Review the highlighted fields before submitting."
    timeout: 10000
- openLink: ${yamlString(deepLink("/forms"))}
- extendedWaitUntil:
    visible: "Forms"
    timeout: 10000
${tapOnId("form-field-username-input")}
- inputText: "Avery Chen"
${tapOnId("form-field-email-input")}
- inputText: "avery@example.com"
- hideKeyboard
${tapOnId("form-field-phone-input")}
- inputText: "+14155550123"
- hideKeyboard
- extendedWaitUntil:
    visible: "SUBMIT"
    timeout: 10000
- tapOn: "SUBMIT"
- extendedWaitUntil:
    visible: "Profile saved for Avery Chen"
    timeout: 10000
- tapOn: "BROWSE"
- extendedWaitUntil:
    visible: "Attachment selected: osuki-profile-brief.pdf"
    timeout: 10000
- tapOn: "RESET"
- extendedWaitUntil:
    visible: "Form reset."
    timeout: 10000
`;
}

function cameraInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: camera-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/camera"))}
- extendedWaitUntil:
    visible: "Scanner ready"
    timeout: 10000
${tapOnId("camera-screen-gallery")}
- extendedWaitUntil:
    visible: "Gallery opened"
    timeout: 10000
${tapOnId("camera-screen-open-link")}
- extendedWaitUntil:
    visible: "Opened https://osuki.dev/product/hydrogen"
    timeout: 10000
${tapOnId("camera-screen-mode-photo")}
- extendedWaitUntil:
    visible: "Photo mode ready"
    timeout: 10000
${tapOnId("camera-screen-flash")}
- extendedWaitUntil:
    visible: "Flash on"
    timeout: 10000
${tapOnId("camera-screen-capture")}
- extendedWaitUntil:
    visible: "Captured photo 1"
    timeout: 10000
${tapOnId("camera-screen-switch")}
- extendedWaitUntil:
    visible: "Using front camera"
    timeout: 10000
${tapOnId("camera-screen-mode-video")}
- extendedWaitUntil:
    visible: "Video mode ready"
    timeout: 10000
${tapOnId("camera-screen-capture")}
- extendedWaitUntil:
    visible: "Recording started"
    timeout: 10000
${tapOnId("camera-screen-capture")}
- extendedWaitUntil:
    visible: "Recording saved"
    timeout: 10000
${tapOnId("camera-screen-close")}
- extendedWaitUntil:
    visible: "Camera paused"
    timeout: 10000
`;
}

function playerInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: player-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/player"))}
- extendedWaitUntil:
    visible: "Midnight City"
    timeout: 10000
${tapOnId("media-player-play-pause")}
- extendedWaitUntil:
    visible: "Playing Midnight City"
    timeout: 10000
${tapOnId("media-player-next")}
- extendedWaitUntil:
    visible: "Digital Love"
    timeout: 10000
- assertVisible: "Playing Digital Love"
${tapOnId("media-player-previous")}
- extendedWaitUntil:
    visible: "Midnight City"
    timeout: 10000
${tapOnId("media-player-shuffle")}
- extendedWaitUntil:
    visible: "Shuffle on"
    timeout: 10000
${tapOnId("media-player-repeat")}
- extendedWaitUntil:
    visible: "Repeat all"
    timeout: 10000
${tapOnId("media-player-rate")}
- extendedWaitUntil:
    visible: "Playback speed 1.25x"
    timeout: 10000
`;
}

function securityInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: security-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/security-screen"))}
- extendedWaitUntil:
    visible: "Security center ready"
    timeout: 10000
${tapOnId("security-improve-score")}
- extendedWaitUntil:
    visible: "Security score improved to 92%"
    timeout: 10000
${tapOnId("security-view-details")}
- extendedWaitUntil:
    visible: "Password, sessions, and recovery checks reviewed"
    timeout: 10000
${scrollUntilVisibleId("security-two-factor-toggle")}
${tapOnId("security-two-factor-toggle")}
- extendedWaitUntil:
    visible: "Two-factor authentication disabled"
    timeout: 10000
${tapOnId("security-biometric-toggle")}
- extendedWaitUntil:
    visible: "Biometric login enabled"
    timeout: 10000
${scrollUntilVisibleId("security-session-revoke-macbook")}
${tapOnId("security-session-revoke-macbook")}
- extendedWaitUntil:
    visible: "2 active devices"
    timeout: 10000
${scrollUntilVisibleId("security-revoke-all")}
${tapOnId("security-revoke-all")}
- extendedWaitUntil:
    visible: "1 active device"
    timeout: 10000
${scrollUntilVisibleId("security-delete-account")}
${tapOnId("security-delete-account")}
- extendedWaitUntil:
    visible: "Account deletion requires final confirmation"
    timeout: 10000
`;
}

function stateInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: state-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/empty-state"))}
- extendedWaitUntil:
    visible: "Choose a state and trigger its action."
    timeout: 10000
${tapOnId("empty-state-primary-action")}
- extendedWaitUntil:
    visible: "Handled NO MESSAGES; showing NO RESULTS"
    timeout: 10000
- assertVisible: "NO RESULTS"
- openLink: ${yamlString(deepLink("/error-state"))}
- extendedWaitUntil:
    visible: "Error state ready"
    timeout: 10000
- tapOn: "NETWORK"
- extendedWaitUntil:
    visible: "Showing NETWORK error"
    timeout: 10000
${tapOnId("error-state-try-again")}
- extendedWaitUntil:
    visible: "Retry completed"
    timeout: 10000
${tapOnId("error-state-go-home")}
- extendedWaitUntil:
    visible: "Home navigation requested"
    timeout: 10000
`;
}

function contentInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: content-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/article"))}
- extendedWaitUntil:
    visible: "The Art of Minimalist Design"
    timeout: 10000
${scrollUntilVisibleId("article-share-button")}
${tapOnId("article-share-button")}
- extendedWaitUntil:
    visible: "Share link copied"
    timeout: 10000
- openLink: ${yamlString(deepLink("/users/1"))}
- extendedWaitUntil:
    visible: "John Doe"
    timeout: 10000
${tapOnId("user-detail-action-edit")}
- extendedWaitUntil:
    visible: "Editing John Doe"
    timeout: 10000
${tapOnId("user-detail-action-deactivate")}
- extendedWaitUntil:
    visible: "John Doe deactivated"
    timeout: 10000
- assertVisible: "inactive"
${tapOnId("user-detail-action-activate")}
- extendedWaitUntil:
    visible: "John Doe activated"
    timeout: 10000
- assertVisible: "active"
${tapOnId("user-detail-action-delete")}
- extendedWaitUntil:
    visible: "John Doe scheduled for review"
    timeout: 10000
- assertVisible: "pending"
`;
}

function searchInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `${openLinkStep(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: search-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
${openLinkStep(deepLink("/search"))}
- extendedWaitUntil:
    visible: "RECENT SEARCHES"
    timeout: 10000
${tapOnId("search-screen-recent-0")}
- extendedWaitUntil:
    visible: "RESULTS"
    timeout: 15000
${tapOnId("search-header-clear")}
- extendedWaitUntil:
    visible: "RECENT SEARCHES"
    timeout: 10000
${tapOnId("search-header-input-control")}
- inputText: "zzzz-not-found"
- hideKeyboard
- extendedWaitUntil:
    visible: "No matching products found."
    timeout: 15000
`;
}

function calendarInteractionsFlow() {
	const readySteps = useDevClientUrl
		? `- openLink: ${yamlString(devClientUrl)}
- extendedWaitUntil:
    visible: "Osuki Market"
    timeout: 60000
`
		: "";

	return `appId: ${appId}
name: calendar-interactions
---
- launchApp:
    clearState: true
    stopApp: true
${readySteps}
- openLink: ${yamlString(deepLink("/calendar"))}
- extendedWaitUntil:
    visible: "Team Standup"
    timeout: 10000
- assertVisible: "Month view is ready."
${tapOnId("calendar-screen-view-week")}
- extendedWaitUntil:
    visible: "Week view is active."
    timeout: 10000
${tapOnId("calendar-screen-view-day")}
- extendedWaitUntil:
    visible: "Day view is active."
    timeout: 10000
${tapOnId("calendar-screen-next-month")}
- extendedWaitUntil:
    visible:
      id: "calendar-screen-status"
    timeout: 10000
${tapOnId("calendar-screen-previous-month")}
- extendedWaitUntil:
    visible:
      id: "calendar-screen-status"
    timeout: 10000
${tapOnId("calendar-screen-day-15")}
- extendedWaitUntil:
    visible:
      id: "calendar-screen-status-card"
    timeout: 10000
${scrollUntilVisibleId("calendar-screen-event-3")}
${tapOnId("calendar-screen-event-3")}
- extendedWaitUntil:
    visible: "Opened Client Meeting details."
    timeout: 10000
`;
}

function indexFile() {
	const pageLines = pages
		.map((page) => `- ${page.name}: ${page.route} -> ${page.expect}`)
		.join("\n");
	const componentLines = componentLabels.map((label) => `- ${label}`).join("\n");
	const testIdLines = componentTestIds
		.map(([component, ids]) => `| ${component} | \`${ids}\` |`)
		.join("\n");

	return `# Generated agent-device coverage

App ID: ${appId}
Metro URL: ${metroUrl}

## Pages

${pageLines}

## Components

${componentLines}

## Product Flows

- purchase-loop: product -> cart -> checkout -> order
- account-checkout-flow: sign in -> save profile -> choose default address -> checkout prefill
- account-signup-signout-flow: sign up -> account state -> sign out
- auth-validation: submit empty form -> field errors -> successful sign in
- notifications-interactions: filter unread -> mark all read -> empty state
- feed-interactions: like -> comment -> share -> bookmark -> load more
- files-interactions: sort -> grid -> folder navigation -> file selection
- forms-interactions: validation errors -> successful submit -> reset
- camera-interactions: scan open -> photo controls -> video recording -> close
- player-interactions: play -> next/previous -> shuffle/repeat/rate
- security-interactions: score actions -> auth toggles -> session revoke -> danger confirmation
- state-interactions: empty action -> error retry/home actions
- content-interactions: article share -> user detail actions
- search-interactions: recent query -> clear -> empty search
- calendar-interactions: view switch -> month navigation -> date select -> event details

## Component Test IDs

| Component | Test ID |
| --- | --- |
${testIdLines}
`;
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const page of pages) {
	writeFlow(`page-${page.name}.yaml`, pageFlow(page));
}

writeFlow("components.yaml", componentFlow());
writeFlow("purchase-loop.yaml", purchaseFlow());
writeFlow("account-checkout-flow.yaml", accountFlow());
writeFlow("account-signup-signout-flow.yaml", accountSignupSignoutFlow());
writeFlow("auth-validation.yaml", authValidationFlow());
writeFlow("notifications-interactions.yaml", notificationsFlow());
writeFlow("feed-interactions.yaml", feedInteractionsFlow());
writeFlow("files-interactions.yaml", filesInteractionsFlow());
writeFlow("forms-interactions.yaml", formsInteractionsFlow());
writeFlow("camera-interactions.yaml", cameraInteractionsFlow());
writeFlow("player-interactions.yaml", playerInteractionsFlow());
writeFlow("security-interactions.yaml", securityInteractionsFlow());
writeFlow("state-interactions.yaml", stateInteractionsFlow());
writeFlow("content-interactions.yaml", contentInteractionsFlow());
writeFlow("search-interactions.yaml", searchInteractionsFlow());
writeFlow("calendar-interactions.yaml", calendarInteractionsFlow());
writeFileSync(join(outDir.pathname, "COVERAGE.md"), indexFile());

console.log(`Generated ${pages.length + 16} agent-device flows in ${outDir.pathname}`);
