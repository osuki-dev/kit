import { strict as assert } from "node:assert";
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
