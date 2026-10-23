import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { mock, test } from "bun:test";

mock.module("react-native", () => ({
	Dimensions: {
		get: () => ({ width: 390, height: 844 }),
		addEventListener: () => ({ remove() {} }),
	},
	PixelRatio: {
		get: () => 3,
		getFontScale: () => 1,
		roundToNearestPixel: (value: number) => value,
	},
	Platform: {
		OS: "ios",
		select: (options: Record<string, unknown>) => options.ios ?? options.default,
	},
	Image: "Image",
	StyleSheet: {
		absoluteFill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
		create: (styles: unknown) => styles,
		flatten: (styles: unknown) => {
			if (!styles) return {};
			if (Array.isArray(styles)) {
				return styles.reduce((acc, s) => Object.assign(acc, s), {});
			}
			return styles;
		},
	},
	Text: "Text",
	View: "View",
	useColorScheme: () => "light",
	useWindowDimensions: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}));

mock.module("expo-router/react-navigation", () => ({
	DarkTheme: { dark: true, colors: {}, fonts: {} },
	DefaultTheme: { dark: false, colors: {}, fonts: {} },
}));

mock.module("lucide-react-native", () => ({
	Home: "Home",
	Settings: "Settings",
	ChevronLeft: "ChevronLeft",
	Send: "Send",
	Scan: "Scan",
	SlidersHorizontal: "SlidersHorizontal",
}));

const React = (await import("react")).default;
const {
	Icon,
	IconCustom,
	IconGlyph,
	IconProvider,
	IconRoot,
	calculateIconRotation,
	createNanoIconSet,
	toPascalCase,
	DEFAULT_CHROME_FALLBACKS,
	ICON_DIRECTION_ANGLES,
	THEME_ICON_NAMES,
} = await import("./components/icon");

test("calculateIconRotation calculates correct degree angles", () => {
	assert.equal(calculateIconRotation("up"), 0);
	assert.equal(calculateIconRotation("up-right"), 45);
	assert.equal(calculateIconRotation("right"), 90);
	assert.equal(calculateIconRotation("down-right"), 135);
	assert.equal(calculateIconRotation("down"), 180);
	assert.equal(calculateIconRotation("down-left"), 225);
	assert.equal(calculateIconRotation("left"), 270);
	assert.equal(calculateIconRotation("up-left"), 315);
	assert.equal(calculateIconRotation(undefined), 0);

	// Relative source to target rotation
	assert.equal(calculateIconRotation("left", "left"), 0);
	assert.equal(calculateIconRotation("right", "left"), 180);
	assert.equal(calculateIconRotation("up", "left"), 90);
	assert.equal(calculateIconRotation("down", "right"), 90);
	assert.ok(ICON_DIRECTION_ANGLES);
});

test("toPascalCase normalizes kebab-case, snake_case, and standard strings", () => {
	assert.equal(toPascalCase("home"), "Home");
	assert.equal(toPascalCase("chevron-left"), "ChevronLeft");
	assert.equal(toPascalCase("arrow_up_right"), "ArrowUpRight");
	assert.equal(toPascalCase("Home"), "Home");
	assert.equal(toPascalCase("ChevronLeft"), "ChevronLeft");
});

test("Theme icon names and chrome fallbacks conform to app contract", () => {
	assert.ok(THEME_ICON_NAMES.includes("chrome.back"));
	assert.ok(THEME_ICON_NAMES.includes("chrome.send"));
	assert.ok(THEME_ICON_NAMES.includes("chrome.scan"));
	assert.ok(THEME_ICON_NAMES.includes("chrome.settings"));
	assert.ok(THEME_ICON_NAMES.includes("chrome.parameters"));

	assert.equal(DEFAULT_CHROME_FALLBACKS["chrome.back"], "ChevronLeft");
	assert.equal(DEFAULT_CHROME_FALLBACKS["chrome.send"], "Send");
	assert.equal(DEFAULT_CHROME_FALLBACKS["chrome.settings"], "Settings");
	assert.equal(DEFAULT_CHROME_FALLBACKS["chrome.parameters"], "SlidersHorizontal");
});

test("createNanoIconSet adaptor creates a typed set and resolver", () => {
	const sampleGlyphMap = {
		m: { f: "custom-nano-icons", name: "custom-nano" },
		g: {
			heart: { u: 61441 },
			search: 61442,
			flag: {
				l: [
					{ u: 61443, c: "#DB227F" },
					{ u: 61444, c: "#FDA780" },
				],
			},
		},
	};

	const CustomNanoIcons = createNanoIconSet(sampleGlyphMap);
	assert.equal(CustomNanoIcons.fontFamily, "custom-nano-icons");
	assert.ok(CustomNanoIcons.hasIcon("heart"));
	assert.ok(CustomNanoIcons.hasIcon("search"));
	assert.ok(CustomNanoIcons.hasIcon("flag"));
	assert.ok(!CustomNanoIcons.hasIcon("non_existent"));

	const resolvedHeart = CustomNanoIcons.resolve("heart", {
		size: 24,
		color: "#FF0000",
		direction: "right",
	});
	assert.ok(resolvedHeart !== null && resolvedHeart !== undefined);
	assert.equal(CustomNanoIcons.resolve("non_existent", { size: 24 }), null);
});

test("Compound icon parts and primary Icon component", () => {
	assert.equal(Icon.Root, IconRoot);
	assert.equal(Icon.Custom, IconCustom);
	assert.equal(Icon.Glyph, IconGlyph);

	const iconElement = React.createElement(Icon, {
		name: "Home",
		size: 24,
		color: "#333333",
		direction: "right",
	});
	assert.ok(iconElement);
	assert.equal(iconElement.props.name, "Home");
	assert.equal(iconElement.props.size, 24);
	assert.equal(iconElement.props.direction, "right");

	const rootElement = React.createElement(
		Icon.Root,
		{ size: 32, direction: "left" },
		React.createElement(Icon.Glyph, { name: "Settings" }),
	);
	assert.ok(rootElement);
	assert.equal(rootElement.props.size, 32);
	assert.equal(rootElement.props.direction, "left");
});

test("IconProvider injects custom resolvers and passes through", () => {
	let customResolverInvoked = false;
	const provider = React.createElement(IconProvider, {
		resolve: (name: string) => {
			if (name === "chrome.scan") {
				customResolverInvoked = true;
				return React.createElement("View", { testID: "custom-scan" });
			}
			return null;
		},
		children: React.createElement(Icon, { name: "chrome.scan" }),
	});
	assert.ok(provider);
	assert.equal(customResolverInvoked, false);
});

const { defaultTheme } = await import("./theme");
const { IconContext } = await import("./components/icon");
type IconContextValue = import("./components/icon").IconContextValue;
type AnyElement = { type: unknown; props: Record<string, unknown> };

const internals = (
	React as unknown as {
		__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: { H: unknown };
	}
).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

/**
 * Calls one function component with a hook dispatcher installed. `useContext`
 * answers with the given icon context for `IconContext` and with the default
 * theme for everything else, the only other context these components read.
 */
function renderOnce(element: AnyElement, iconContext: IconContextValue | null): unknown {
	const previous = internals.H;
	internals.H = {
		useContext: (context: unknown) => (context === IconContext ? iconContext : defaultTheme),
		useMemo: (factory: () => unknown) => factory(),
	};
	try {
		return (element.type as (props: unknown) => unknown)(element.props);
	} finally {
		internals.H = previous;
	}
}

/** Renders `IconGlyph` and unwraps the fragment it returns around a bare glyph. */
function glyph(name: string, iconContext: IconContextValue | null, props = {}): AnyElement | null {
	const rendered = renderOnce(
		React.createElement(IconGlyph, { name: name as never, ...props }) as unknown as AnyElement,
		iconContext,
	) as AnyElement | null;
	return rendered?.type === React.Fragment ? (rendered.props.children as AnyElement) : rendered;
}

const lucideModule = { Home: "LucideHome", Send: "LucideSend" };

test("the kit never requires lucide-react-native itself", () => {
	const source = readFileSync(new URL("components/icon.tsx", import.meta.url), "utf8");
	assert.doesNotMatch(source, /require\(\s*["']lucide-react-native["']\s*\)/);
	assert.doesNotMatch(source, /import\(\s*["']lucide-react-native["']\s*\)/);
	assert.doesNotMatch(source, /^import (?!type)[^;]*["']lucide-react-native["']/m);
});

test("without a lucide module, a Lucide name renders the fallback or nothing", () => {
	// lucide-react-native is mocked above and resolvable, yet it must not be used.
	const warn = console.warn;
	console.warn = () => {};
	try {
		assert.equal(glyph("Home", null), null);
		assert.equal(glyph("Home", {}), null);
	} finally {
		console.warn = warn;
	}
	const Fallback = () => null;
	const rendered = glyph("Home", {}, { fallback: Fallback });
	assert.equal(rendered?.type, Fallback);
	assert.equal(rendered?.props.name, "Home");
});

test("a lucide module given to the context resolves names and chrome fallbacks", () => {
	const home = glyph("Home", { lucide: lucideModule });
	assert.equal(home?.type, "LucideHome");
	assert.equal(home?.props.size, 24);
	assert.equal(glyph("home", { lucide: lucideModule })?.type, "LucideHome");
	assert.equal(glyph("chrome.send", { lucide: lucideModule })?.type, "LucideSend");
});

test("a resolver and the icon map still win over the lucide module", () => {
	const fromResolver = glyph("Home", {
		lucide: lucideModule,
		resolve: (name) => (name === "Home" ? React.createElement("Resolved") : null),
	});
	assert.equal(fromResolver?.type, "Resolved");
	const Mapped = () => null;
	assert.equal(glyph("Home", { lucide: lucideModule, icons: { Home: Mapped } })?.type, Mapped);
});

test("IconProvider passes its lucide module down and inherits the parent's", () => {
	const provide = (props: Record<string, unknown>, parent: IconContextValue | null) =>
		(
			renderOnce(
				React.createElement(IconProvider, { children: null, ...props }) as unknown as AnyElement,
				parent,
			) as AnyElement
		).props.value as IconContextValue;

	const outer = provide({ lucide: lucideModule }, null);
	assert.equal(outer.lucide, lucideModule);
	assert.equal(provide({ resolve: () => null }, outer).lucide, lucideModule);
	assert.equal(provide({}, null).lucide, undefined);
});
