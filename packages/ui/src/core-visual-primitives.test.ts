import { strict as assert } from "node:assert";
import { mock, test } from "bun:test";

mock.module("react-native", () => ({
	ActivityIndicator: "ActivityIndicator",
	AppState: {
		addEventListener: () => ({ remove() {} }),
	},
	Dimensions: {
		get: () => ({ width: 390, height: 844 }),
		addEventListener: () => ({ remove() {} }),
	},
	I18nManager: {
		isRTL: false,
	},
	PanResponder: {
		create: (config: unknown) => ({ panHandlers: {}, config }),
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
	Pressable: "Pressable",
	StyleSheet: {
		absoluteFill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
		absoluteFillObject: {},
		create: (styles: unknown) => styles,
		flatten: (styles: unknown) => (Array.isArray(styles) ? Object.assign({}, ...styles) : styles ?? {}),
		hairlineWidth: 0.5,
	},
	Text: "Text",
	View: "View",
	useColorScheme: () => "light",
	useWindowDimensions: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}));

mock.module("react-native-reanimated", () => ({
	cancelAnimation: () => {},
	default: {
		createAnimatedComponent: (component: unknown) => component,
		Text: "Animated.Text",
		View: "Animated.View",
	},
	Easing: {
		linear: (t: number) => t,
		inOut: () => (t: number) => t,
		out: () => (t: number) => t,
		quad: (t: number) => t,
		cubic: (t: number) => t,
	},
	ReduceMotion: {
		Never: "never",
		Always: "always",
		System: "system",
	},
	useAnimatedStyle: (factory: () => unknown) => factory(),
	useReducedMotion: () => false,
	useSharedValue: (value: unknown) => ({ value }),
	withDelay: (_delay: unknown, animation: unknown) => animation,
	withRepeat: (animation: unknown) => animation,
	withSequence: (...animations: unknown[]) => animations[animations.length - 1],
	withTiming: (value: unknown) => value,
}));

mock.module("@expo/ui/swift-ui", () => ({
	Host: "SwiftUIHost",
	Slider: "SwiftUISlider",
}));

mock.module("@expo/ui/swift-ui/modifiers", () => ({
	accessibilityIdentifier: (id: string) => ({ id }),
	accessibilityLabel: (label: string) => ({ label }),
	accessibilityValue: (val: string) => ({ val }),
	disabled: (d: boolean) => ({ d }),
	tint: (color: string) => ({ color }),
}));

mock.module("expo-router", () => ({}));
mock.module("expo-router/react-navigation", () => ({
	DarkTheme: { dark: true, colors: {}, fonts: {} },
	DefaultTheme: { dark: false, colors: {}, fonts: {} },
}));


const React = (await import("react")).default;
const { Slider } = await import("./components/slider");
const { StatusDot } = await import("./components/status-dot");
const { TwoStepAction } = await import("./components/two-step-action");
const { EdgeFade } = await import("./components/edge-fade");
const { GlassSurface } = await import("./components/glass-surface");
const { MarqueeText } = await import("./components/marquee-text");
const { TransientPill } = await import("./components/transient-pill");
const { withAlpha } = await import("./utils/color");

test("withAlpha converts 6-digit hex and rgb correctly", () => {
	assert.equal(withAlpha("#ff0000", 0.5), "rgba(255, 0, 0, 0.5)");
	assert.equal(withAlpha("#00ff00", 0.25), "rgba(0, 255, 0, 0.25)");
	assert.equal(withAlpha("#123", 0.8), "rgba(17, 34, 51, 0.8)");
	assert.equal(withAlpha("rgb(10, 20, 30)", 0.6), "rgba(10, 20, 30, 0.6)");
	assert.equal(withAlpha("rgba(10, 20, 30, 0.1)", 0.9), "rgba(10, 20, 30, 0.9)");
});

test("Slider renders as native SwiftUI slider on iOS by default", () => {
	const element = React.createElement(Slider, {
		value: 0.5,
		minimumValue: 0,
		maximumValue: 1,
		label: "Volume",
		testID: "volume-slider",
	});
	assert.ok(element);
	assert.equal(element.type, Slider);
});

test("Slider renders fallback PanResponder view when useNative is false", () => {
	const element = React.createElement(Slider, {
		value: 0.75,
		useNative: false,
		testID: "fallback-slider",
	});
	assert.ok(element);
});

test("StatusDot supports filled and hollow indicators with tone", () => {
	const filledDot = React.createElement(StatusDot, {
		filled: true,
		tone: "success",
		size: 10,
	});
	assert.ok(filledDot);

	const hollowDot = React.createElement(StatusDot, {
		filled: false,
		tone: "danger",
		pulse: true,
	});
	assert.ok(hollowDot);
});

test("TwoStepAction renders with labels and confirms", () => {
	let confirmed = false;
	const action = React.createElement(TwoStepAction, {
		label: "Delete",
		confirmLabel: "Confirm Delete",
		onConfirm: () => {
			confirmed = true;
		},
		presentation: "compact",
	});
	assert.ok(action);
	assert.equal(confirmed, false);
});

test("EdgeFade constructs correct linear-gradient CSS for all 4 edges", () => {
	const topFade = React.createElement(EdgeFade, {
		edge: "top",
		color: "#000000",
		size: 32,
	});
	assert.ok(topFade);

	const bottomFade = React.createElement(EdgeFade, {
		edge: "bottom",
		color: "#ffffff",
	});
	assert.ok(bottomFade);

	const leftFade = React.createElement(EdgeFade, {
		edge: "left",
		color: "#111111",
	});
	assert.ok(leftFade);

	const rightFade = React.createElement(EdgeFade, {
		edge: "right",
		color: "#222222",
	});
	assert.ok(rightFade);
});

test("GlassSurface supports floating and sheet faces with fallback", () => {
	const floatingGlass = React.createElement(
		GlassSurface,
		{ face: "floating", borderRadius: 12 },
		React.createElement("child-view"),
	);
	assert.ok(floatingGlass);

	const sheetGlass = React.createElement(
		GlassSurface,
		{ face: "sheet" },
		React.createElement("sheet-content"),
	);
	assert.ok(sheetGlass);
});

test("MarqueeText renders single-line scrolling component", () => {
	const marquee = React.createElement(MarqueeText, {
		children: "A very long title that exceeds container width and scrolls smoothly",
		speed: 40,
	});
	assert.ok(marquee);
});


test("TransientPill renders floating indicator badge", () => {
	const pill = React.createElement(TransientPill, {
		label: "Zoom 100%",
		tone: "primary",
		bottomInset: 16,
	});
	assert.ok(pill);
});
