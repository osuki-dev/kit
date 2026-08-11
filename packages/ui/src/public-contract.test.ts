import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { createBaseTheme } from "./theme/create-theme";
import { createTheme } from "./theme/create-theme";
import { createThemePreset, themePresetRegistry, themePresets } from "./theme/presets";
import { resolveFontStyle } from "./theme/typography";

const packageJson = JSON.parse(
	readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as {
	bugs: { url: string };
	exports: Record<string, { types: string; "react-native": string; import: string }>;
	files: string[];
	homepage: string;
	repository: { type: string; url: string; directory: string };
	"react-native": string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
};
const rootIndex = readFileSync(new URL("index.ts", import.meta.url), "utf8");
const componentsIndex = readFileSync(new URL("components/index.ts", import.meta.url), "utf8");
const fontsIndex = readFileSync(new URL("fonts/index.ts", import.meta.url), "utf8");
const bottomSheetSource = readFileSync(
	new URL("components/bottom-sheet.tsx", import.meta.url),
	"utf8",
);
const dialogSource = readFileSync(new URL("components/dialog.tsx", import.meta.url), "utf8");
const modalSource = readFileSync(new URL("components/modal.tsx", import.meta.url), "utf8");
const tabsSource = readFileSync(new URL("components/tabs.tsx", import.meta.url), "utf8");
const cardSource = readFileSync(new URL("components/card.tsx", import.meta.url), "utf8");
const pressableCardSource = readFileSync(
	new URL("components/pressable-card.tsx", import.meta.url),
	"utf8",
);
const surfaceSource = readFileSync(new URL("components/surface.tsx", import.meta.url), "utf8");
const timelineSource = readFileSync(new URL("components/timeline.tsx", import.meta.url), "utf8");
const emptyStateSource = readFileSync(
	new URL("components/empty-state.tsx", import.meta.url),
	"utf8",
);
const errorViewSource = readFileSync(new URL("components/error-view.tsx", import.meta.url), "utf8");
const loadingViewSource = readFileSync(
	new URL("components/loading-view.tsx", import.meta.url),
	"utf8",
);
const topBarSource = readFileSync(new URL("components/top-bar.tsx", import.meta.url), "utf8");
const textSource = readFileSync(new URL("components/text.tsx", import.meta.url), "utf8");
const badgeSource = readFileSync(new URL("components/badge.tsx", import.meta.url), "utf8");
const skeletonSource = readFileSync(new URL("components/skeleton.tsx", import.meta.url), "utf8");
const dataTableSource = readFileSync(new URL("components/data-table.tsx", import.meta.url), "utf8");
const explicitVariantSources = Object.fromEntries(
	[
		"data-row",
		"list-item",
		"progress-bar",
		"segmented-progress-bar",
		"section",
		"stack",
		"responsive-container",
		"responsive-grid",
		"pagination",
	].map((file) => [file, readFileSync(new URL(`components/${file}.tsx`, import.meta.url), "utf8")]),
) as Record<string, string>;
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const componentDocs = readFileSync(
	new URL("../../../docs/ui/components.md", import.meta.url),
	"utf8",
);

// React Native resolves source so Metro's Babel pass can compile Reanimated
// worklets; every other consumer resolves the compiled output so their type
// checker never sees this package's source.
for (const entry of [".", "./components", "./theme", "./fonts"]) {
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

assert.equal(
	packageJson["react-native"],
	"./src/index.ts",
	"package exposes its React Native entry",
);
assert.equal(
	packageJson.repository.directory,
	"packages/ui",
	"repository points at the UI package",
);
assert.ok(packageJson.homepage.includes("/packages/ui"), "homepage points at the UI package");
assert.ok(packageJson.bugs.url.endsWith("/issues"), "package exposes its issue tracker");
assert.deepEqual(
	[...packageJson.files].sort(),
	[
		"CHANGELOG.md",
		"LICENSE",
		"README.md",
		"docs",
		"lib",
		"src/components",
		"src/fonts",
		"src/index.ts",
		"src/navigation",
		"src/theme",
		"src/utils",
	].sort(),
	"package files use the reviewed runtime whitelist",
);

// A published range using one of these is unresolvable for every consumer.
// `catalog:` and `workspace:` are bun-only: `bun pm pack` resolves them, but
// this repo releases through `changeset publish`, which shells out to npm, and
// npm writes the literal string into the tarball. Trusting the `bun pm pack`
// behaviour is exactly how `@osuki-dev/kit-community@0.2.0` shipped an
// uninstallable `"zod": "catalog:"`. devDependencies are not checked because a
// consumer never installs them.
const internalProtocols = ["workspace:", "catalog:", "file:", "link:"];
for (const field of ["dependencies", "peerDependencies", "optionalDependencies"] as const) {
	for (const [name, range] of Object.entries(packageJson[field] ?? {})) {
		const protocol = internalProtocols.find((candidate) => range.startsWith(candidate));
		assert.ok(!protocol, `${field}.${name} must not publish the ${protocol} protocol`);
	}
}

for (const barrel of ["./theme", "./components", "./fonts", "./navigation"]) {
	assert.ok(rootIndex.includes(barrel), `src/index.ts re-exports ${barrel}`);
}
assert.ok(fontsIndex.includes("FontLoader"), "fonts entry exports the generic FontLoader");
assert.ok(!fontsIndex.includes("OsukiFonts"), "fonts entry does not prescribe Osuki-owned fonts");

const componentFiles = readdirSync(new URL("components", import.meta.url))
	.filter((file) => file.endsWith(".tsx"))
	.map((file) => file.replace(/\.tsx$/, ""))
	.sort();

for (const componentFile of componentFiles) {
	assert.ok(
		componentsIndex.includes(`from "./${componentFile}"`),
		`components/index.ts exports ${componentFile}`,
	);
}

for (const component of [
	"Select",
	"DateInput",
	"Menu",
	"OtpInput",
	"ActionSheet",
	"Tooltip",
	"Timeline",
	"Modal",
	"Dialog",
	"BottomSheet",
	"ToastProvider",
	"Tabs",
	"Pagination",
	"DataTable",
]) {
	assert.ok(readme.includes(component), `README documents ${component}`);
	assert.ok(componentDocs.includes(component), `docs/ui/components.md documents ${component}`);
}

const baseTheme = createBaseTheme("light");
assert.equal(baseTheme.semantic.focusRing, "primary", "theme exposes semantic focus token");
assert.equal(baseTheme.commerce.productImageAspectRatio, 1, "theme exposes commerce image ratio");
assert.ok(baseTheme.components.Sheet.scrim, "theme exposes sheet component slot tokens");
assert.equal(
	baseTheme.components.ListItem.selectedBackground,
	"primarySubtle",
	"theme exposes list item selected slot token",
);
assert.deepEqual(
	resolveFontStyle(baseTheme.fonts, baseTheme.typeStyles.body.fontFamily, "regular"),
	{ fontFamily: undefined, fontWeight: "400" },
	"base theme uses the platform system font without bundled assets",
);
const customFontTheme = createTheme("light", {
	fonts: {
		body: {
			regular: "Inter_400Regular",
			bold: "Inter_700Bold",
		},
	},
});
assert.deepEqual(
	resolveFontStyle(customFontTheme.fonts, customFontTheme.typeStyles.body.fontFamily, "bold"),
	{ fontFamily: "Inter_700Bold", fontWeight: "700" },
	"theme accepts application-owned font families",
);
assert.deepEqual(
	resolveFontStyle(customFontTheme.fonts, customFontTheme.typeStyles.body.fontFamily, "medium"),
	{ fontFamily: "Inter_400Regular", fontWeight: "400" },
	"missing custom weights use the nearest configured face and its matching native weight",
);
assert.deepEqual(
	resolveFontStyle({ body: { family: "Inter" } }, "body", "semibold"),
	{ fontFamily: "Inter", fontWeight: "600" },
	"single-family definitions support native and variable font weights",
);

const fashionTheme = createThemePreset({ tone: "fashion" });
assert.equal(
	fashionTheme.commerce?.productImageAspectRatio,
	0.76,
	"fashion preset overrides commerce image ratio",
);
assert.ok(themePresets.electronics.commerce, "industry presets expose commerce overrides");
assert.ok(
	themePresetRegistry.some((preset) => preset.id === "restaurant" && preset.label),
	"industry preset registry exposes metadata",
);
for (const prop of ["maxHeight", "bodyStyle", "bottomInset"]) {
	assert.ok(bottomSheetSource.includes(`${prop}?`), `BottomSheet exposes ${prop}`);
	assert.ok(readme.includes(prop), `README documents BottomSheet ${prop}`);
	assert.ok(componentDocs.includes(prop), `docs/ui/components.md documents BottomSheet ${prop}`);
}

for (const part of [
	"SheetRoot",
	"SheetTrigger",
	"SheetContent",
	"SheetHeader",
	"SheetBody",
	"SheetFooter",
	"SheetClose",
	"useSheet",
]) {
	assert.ok(componentsIndex.includes(part), `components/index.ts exports ${part}`);
	assert.ok(bottomSheetSource.includes(`export function ${part}`), `${part} is a public primitive`);
}
assert.ok(
	bottomSheetSource.includes("state: SheetState") &&
		bottomSheetSource.includes("actions: SheetActions") &&
		bottomSheetSource.includes("meta: SheetMeta"),
	"Sheet context exposes state/actions/meta",
);
assert.ok(readme.includes("Sheet.Root"), "README documents compound Sheet usage");
assert.ok(componentDocs.includes("Sheet.Root"), "component docs document compound Sheet usage");

for (const part of [
	"DialogRoot",
	"DialogTrigger",
	"DialogContent",
	"DialogHeader",
	"DialogBody",
	"DialogActionGroup",
	"DialogActionButton",
	"DialogClose",
	"useDialog",
]) {
	assert.ok(componentsIndex.includes(part), `components/index.ts exports ${part}`);
	assert.ok(dialogSource.includes(`export function ${part}`), `${part} is a public primitive`);
}
assert.ok(
	dialogSource.includes("state: DialogState") &&
		dialogSource.includes("actions: DialogActions") &&
		dialogSource.includes("meta: DialogMeta"),
	"Dialog context exposes state/actions/meta",
);
assert.ok(readme.includes("Dialog.Root"), "README documents compound Dialog usage");
assert.ok(componentDocs.includes("Dialog.Root"), "component docs document compound Dialog usage");

for (const [name, source, parts] of [
	[
		"Tabs",
		tabsSource,
		["TabsRoot", "TabsList", "TabsTrigger", "TabsLabel", "TabsBadge", "useTabs"],
	],
	[
		"Modal",
		modalSource,
		[
			"ModalRoot",
			"ModalTrigger",
			"ModalContent",
			"ModalHeader",
			"ModalBody",
			"ModalFooter",
			"ModalClose",
			"useModal",
		],
	],
] as const) {
	for (const part of parts) {
		assert.ok(componentsIndex.includes(part), `components/index.ts exports ${part}`);
		assert.ok(source.includes(`export function ${part}`), `${part} is a public primitive`);
	}
	assert.ok(
		source.includes(`state: ${name}State`) &&
			source.includes(`actions: ${name}Actions`) &&
			source.includes(`meta: ${name}Meta`),
		`${name} context exposes state/actions/meta`,
	);
	assert.ok(readme.includes(`${name}.Root`), `README documents compound ${name} usage`);
	assert.ok(
		componentDocs.includes(`${name}.Root`),
		`component docs document compound ${name} usage`,
	);
}

for (const component of ["Screen", "ScrollScreen"]) {
	assert.ok(componentsIndex.includes(component), `components/index.ts exports ${component}`);
	assert.ok(surfaceSource.includes(`export function ${component}`), `${component} is implemented`);
}
for (const removedProp of ["fullscreen", "scrollable", "scrollViewProps"]) {
	assert.ok(
		!surfaceSource.includes(`${removedProp}?:`),
		`Surface removes ${removedProp} ownership`,
	);
}
assert.ok(readme.includes("ScrollScreen"), "README documents ScrollScreen");
assert.ok(componentDocs.includes("ScrollScreen"), "component docs document ScrollScreen");

assert.ok(
	timelineSource.includes('"pending" | "active" | "completed"'),
	"Timeline has one status union",
);
assert.ok(!timelineSource.includes("active?: boolean"), "Timeline removes active boolean");
assert.ok(!timelineSource.includes("completed?: boolean"), "Timeline removes completed boolean");

for (const [name, source] of [
	["Card", cardSource],
	["PressableCard", pressableCardSource],
] as const) {
	assert.ok(!source.includes("bordered?: boolean"), `${name} removes bordered boolean`);
	assert.ok(source.includes("border?: CardBorder"), `${name} exposes an explicit border variant`);
}
for (const [name, source] of [
	["EmptyState", emptyStateSource],
	["ErrorView", errorViewSource],
	["LoadingView", loadingViewSource],
	["Timeline", timelineSource],
] as const) {
	assert.ok(!source.includes("compact?: boolean"), `${name} removes compact boolean`);
	assert.ok(
		source.includes('size?: "default" | "compact"'),
		`${name} exposes an explicit size variant`,
	);
}
for (const prop of ["safeArea?: boolean", "elevated?: boolean"]) {
	assert.ok(!topBarSource.includes(prop), `TopBar removes ${prop}`);
}
for (const [file, removedProps] of Object.entries({
	"data-row": ["divider", "dense"],
	"list-item": ["divider"],
	"progress-bar": ["showValue", "rounded"],
	"segmented-progress-bar": ["showValue"],
	section: ["inset", "divided"],
	stack: ["wrap", "fullWidth"],
	"responsive-container": ["center", "fullWidth"],
	"responsive-grid": ["wrap"],
	pagination: ["showEdges"],
})) {
	for (const prop of removedProps) {
		const source = explicitVariantSources[file];
		assert.ok(source, `${file} source is registered`);
		assert.ok(!source.includes(`${prop}?: boolean`), `${file} removes visual boolean ${prop}`);
	}
}

const segmentedProgressSource = explicitVariantSources["segmented-progress-bar"];
assert.ok(segmentedProgressSource, "segmented progress source is registered");
assert.ok(!segmentedProgressSource.includes("#E0E0E0"), "SegmentedProgressBar uses theme colors");
const toastSource = readFileSync(new URL("components/toast.tsx", import.meta.url), "utf8");
assert.ok(toastSource.includes("createToastStore"), "Toast queue lives in a stable store");
assert.ok(toastSource.includes("useSyncExternalStore"), "Toast viewport owns queue subscription");
assert.ok(
	!toastSource.includes("useState<ToastItem[]"),
	"ToastProvider does not subscribe to queue state",
);
for (const [name, source, removedProps] of [
	["Text", textSource, ["uppercase", "marquee", "marqueeAutoPlay"]],
	["Badge", badgeSource, ["dot"]],
	["Skeleton", skeletonSource, ["animated"]],
	["DataTable", dataTableSource, ["virtualized"]],
] as const) {
	for (const prop of removedProps) {
		assert.ok(!source.includes(`${prop}?: boolean`), `${name} removes visual boolean ${prop}`);
	}
}
for (const prop of ["transform", "overflowMode", "marqueePlayback"]) {
	assert.ok(textSource.includes(`${prop}?:`), `Text exposes explicit ${prop} mode`);
}
assert.ok(dialogSource.includes("dismissBehavior?:"), "Dialog actions expose dismissal behavior");
assert.ok(!dialogSource.includes("autoClose?: boolean"), "Dialog actions remove autoClose boolean");
// Whether a consuming app mounts ToastProvider is an application contract, not a
// package contract. Each app asserts it in its own test suite.

// These three were promoted out of a product app, where each of them reached
// straight into that app's own modules. The point of promoting them is that
// they no longer can, so the contract says so out loud.
const pressableScaleSource = readFileSync(
	new URL("components/pressable-scale.tsx", import.meta.url),
	"utf8",
);
const choiceRowSource = readFileSync(new URL("components/choice-row.tsx", import.meta.url), "utf8");
const inlineActivitySource = readFileSync(
	new URL("components/inline-activity.tsx", import.meta.url),
	"utf8",
);

for (const [name, source] of [
	["PressableScale", pressableScaleSource],
	["ChoiceRow", choiceRowSource],
	["InlineActivity", inlineActivitySource],
] as const) {
	assert.ok(componentsIndex.includes(name), `components/index.ts exports ${name}`);
	assert.ok(readme.includes(name), `README documents ${name}`);
	assert.ok(componentDocs.includes(name), `component docs document ${name}`);
	// A promoted component that still imports from "@/…" carries its old app with it.
	assert.ok(!source.includes('from "@/'), `${name} has no application-path imports`);
}

// Haptics are the host app's decision, delivered through the provider. A
// component that imports a haptics library directly takes that decision away.
assert.ok(pressableScaleSource.includes("useHaptics"), "PressableScale reads injected haptics");
assert.ok(
	!pressableScaleSource.includes("expo-haptics"),
	"PressableScale imports no haptics engine",
);
assert.ok(
	pressableScaleSource.includes('HapticFeedbackKind | "none"'),
	"PressableScale selects its haptic with an explicit union, not a boolean",
);
assert.ok(
	pressableScaleSource.includes("pressedScale?: number"),
	"PressableScale exposes its press depth",
);

assert.ok(
	choiceRowSource.includes("emphasis?: ChoiceRowEmphasis"),
	"ChoiceRow emphasis is a union",
);
assert.ok(
	choiceRowSource.includes('"plain" | "headline"'),
	"ChoiceRow emphasis names both label treatments",
);
for (const prop of ["bold", "compact", "dense", "muted"]) {
	assert.ok(
		!choiceRowSource.includes(`${prop}?: boolean`),
		`ChoiceRow removes visual boolean ${prop}`,
	);
}
assert.ok(
	choiceRowSource.includes("loadingId?: string | null"),
	"ChoiceList owns which row is in flight",
);

assert.ok(
	inlineActivitySource.includes('widthMode?: "content" | "full"'),
	"InlineActivity width is an explicit layout mode",
);
assert.ok(!inlineActivitySource.includes("fullWidth?: boolean"), "InlineActivity has no fullWidth");
assert.ok(
	inlineActivitySource.includes("label: string"),
	"InlineActivity requires a caption; a bare spinner does not say what is slow",
);

// A row whose spinner comes and goes has to reserve the spinner's box while it
// is gone, and both files have to read that box from the same place or the
// reserved width drifts away from the real one. src/inline-activity-layout.test.ts
// measures the resulting geometry; these two only pin the shared source.
const spinnerSource = readFileSync(new URL("components/spinner.tsx", import.meta.url), "utf8");
for (const [name, source] of [
	["Spinner", spinnerSource],
	["InlineActivity", inlineActivitySource],
] as const) {
	assert.ok(
		source.includes('from "./spinner-size"'),
		`${name} reads spinner dimensions from the shared map`,
	);
}
assert.ok(!spinnerSource.includes("sm: 16"), "Spinner keeps no private copy of its own dimensions");
assert.ok(
	inlineActivitySource.includes("spinnerSizes[size]"),
	"InlineActivity sizes its idle placeholder from the spinner's own map",
);
assert.ok(
	inlineActivitySource.includes("accessibilityElementsHidden") &&
		inlineActivitySource.includes('importantForAccessibility="no-hide-descendants"') &&
		inlineActivitySource.includes('pointerEvents="none"'),
	"InlineActivity's idle placeholder is invisible to assistive tech and to touches",
);

console.log("[ui-public-contract] PASS");
