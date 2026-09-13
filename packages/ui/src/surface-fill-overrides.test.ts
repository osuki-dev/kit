import { strict as assert } from "node:assert";
import { mock, test } from "bun:test";
import type { ToastController, ToastOptions, ToastProviderProps } from "./components/toast";

/** Collapses a style prop the way `StyleSheet.flatten` does, last value winning. */
function flattenStyle(style: unknown): Record<string, unknown> {
	if (!style || typeof style === "boolean") return {};
	if (Array.isArray(style)) return Object.assign({}, ...style.map(flattenStyle));
	return style as Record<string, unknown>;
}

// `mock.module` is global to the test process, so this file runs in its own
// `bun test` invocation in package.json rather than beside
// src/inline-activity-layout.test.ts, whose stand-ins are cut differently.
//
// An app that paints its own artwork behind the UI has to be able to reach the
// fill of every surface drawn on top of it, and a fill written into an inline
// style object cannot be reached at all. Asserting that means rendering the
// tree and reading the style the host element actually receives, not grepping
// the source. React Native cannot be imported outside Metro, so the native
// modules this import graph touches are replaced with the smallest stand-ins
// that still produce a style tree; nothing animates.
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
	Pressable: "Pressable",
	StyleSheet: {
		absoluteFillObject: {},
		create: (styles: unknown) => styles,
		flatten: flattenStyle,
		hairlineWidth: 1,
	},
	Text: "Text",
	View: "View",
	useColorScheme: () => "light",
	useWindowDimensions: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}));
mock.module("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));
const entering = { duration: () => entering };
const layout = {
	springify: () => layout,
	damping: () => layout,
	stiffness: () => layout,
};
mock.module("react-native-reanimated", () => ({
	default: {
		createAnimatedComponent: (component: unknown) => component,
		Text: "Animated.Text",
		View: "Animated.View",
	},
	cancelAnimation: () => {},
	FadeInDown: entering,
	FadeOutUp: entering,
	Layout: layout,
	useAnimatedStyle: (factory: () => unknown) => factory(),
	useSharedValue: (value: unknown) => ({ value }),
	withDelay: (_delay: unknown, animation: unknown) => animation,
	withRepeat: (animation: unknown) => animation,
	withSpring: (value: unknown) => value,
	withTiming: (value: unknown) => value,
}));
mock.module("lucide-react-native", () => ({
	CircleAlert: "CircleAlert",
	CircleCheck: "CircleCheck",
	Info: "Info",
	TriangleAlert: "TriangleAlert",
	X: "X",
}));
mock.module("react-native-keyboard-controller", () => ({
	KeyboardToolbar: "RNKeyboardToolbar",
}));
mock.module("expo-router/react-navigation", () => ({
	DarkTheme: { dark: true, colors: {}, fonts: {} },
	DefaultTheme: { dark: false, colors: {}, fonts: {} },
}));

const React = (await import("react")).default;
const { ToastProvider } = await import("./components/toast");
const { Skeleton } = await import("./components/skeleton");
const { KeyboardToolbar } = await import("./components/keyboard-toolbar");
const { defaultTheme } = await import("./theme");

type HostElement = { type: string; props: Record<string, unknown> };
type ToolbarTheme = { primary: string; disabled: string; background: string; ripple: string };
type AnyElement = { type: unknown; props: Record<string, unknown> };

const internals = (
	React as unknown as {
		__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: { H: unknown };
	}
).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
assert.ok(internals, "React exposes the dispatcher slot this harness renders through");

// Calling a function component directly needs a hook dispatcher installed. Only
// the hooks these subtrees reach are implemented; `useContext` answers with the
// default theme because the only context read on the way down is the theme.
const dispatcher = {
	useCallback: (fn: unknown) => fn,
	useContext: () => defaultTheme,
	useDebugValue: () => {},
	useEffect: () => {},
	useId: () => ":r0:",
	useInsertionEffect: () => {},
	useLayoutEffect: () => {},
	useMemo: (factory: () => unknown) => factory(),
	useRef: (initial: unknown) => ({ current: initial }),
	useState: (initial: unknown) => [typeof initial === "function" ? initial() : initial, () => {}],
	useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
};

/** Calls one function component with the dispatcher installed. */
function renderOnce(node: unknown): AnyElement {
	assert.ok(React.isValidElement(node), "node is an element");
	const element = node as unknown as AnyElement;
	assert.equal(typeof element.type, "function", "node is a function component");
	const previous = internals.H;
	internals.H = dispatcher;
	try {
		return (element.type as (props: unknown) => AnyElement)(element.props);
	} finally {
		internals.H = previous;
	}
}

/** Runs a node's component functions until what is left is a host element. */
function resolveToHost(node: unknown): HostElement {
	let current = node;
	for (let depth = 0; depth < 20; depth++) {
		if (!React.isValidElement(current)) break;
		if (typeof (current as unknown as AnyElement).type !== "function") break;
		current = renderOnce(current);
	}
	assert.ok(React.isValidElement(current), "node resolves to an element");
	const element = current as unknown as HostElement;
	assert.equal(typeof element.type, "string", "node resolves to a host element");
	return element;
}

/**
 * Mounts a provider, raises the given toasts through the controller it hands
 * down, and returns the body of each one as a host element.
 */
function renderToasts(
	providerProps: Omit<ToastProviderProps, "children">,
	toasts: ToastOptions[],
): HostElement[] {
	const provider = renderOnce(
		React.createElement(ToastProvider, { ...providerProps, children: null }),
	);
	const controller = provider.props.value as ToastController;
	const viewport = React.Children.toArray(provider.props.children as never).find(
		(child) => React.isValidElement(child) && typeof child.type === "function",
	);
	assert.ok(viewport, "the provider renders a viewport next to its children");
	// durationMs 0 keeps the queue from arming a timer the test would outlive.
	for (const toast of toasts) controller.showToast({ durationMs: 0, ...toast });
	const host = resolveToHost(viewport);
	// The queue is newest-first; reverse so the order matches the calls above.
	return React.Children.toArray(host.props.children as never)
		.map(resolveToHost)
		.reverse();
}

const translucent = "rgba(20, 20, 22, 0.62)";
const variantFill = defaultTheme.colors.surface;

test("ToastProvider's toastStyle reaches the fill of every toast body", () => {
	const [plain] = renderToasts({}, [{ message: "Saved" }]);
	assert.equal(
		flattenStyle(plain?.props.style).backgroundColor,
		variantFill,
		"a toast is filled with its variant token by default",
	);

	const bodies = renderToasts({ toastStyle: { backgroundColor: translucent } }, [
		{ message: "Saved" },
		{ message: "Upload failed", variant: "danger" },
	]);
	assert.equal(bodies.length, 2, "both toasts are on screen");
	for (const body of bodies) {
		const style = flattenStyle(body.props.style);
		assert.equal(style.backgroundColor, translucent, "toastStyle wins over the variant fill");
		assert.equal(style.borderRadius, defaultTheme.radius.lg, "the body keeps its radius");
		assert.equal(style.padding, defaultTheme.spacing.md, "the body keeps its padding");
		assert.equal(style.flexDirection, "row", "the body keeps its layout");
	}
});

test("a toast's own style is merged after the provider's", () => {
	const [body] = renderToasts({ toastStyle: { backgroundColor: translucent } }, [
		{ message: "Upload failed", variant: "danger", style: { backgroundColor: "#B3261E" } },
	]);
	assert.equal(
		flattenStyle(body?.props.style).backgroundColor,
		"#B3261E",
		"the per-toast style is last, so it wins over the provider's",
	);
});

test("ToastProvider without a toastStyle changes nothing", () => {
	const [body] = renderToasts({}, [{ message: "Saved", title: "Draft" }]);
	const style = flattenStyle(body?.props.style);
	assert.equal(style.backgroundColor, variantFill, "the variant fill still applies");
	assert.equal(style.borderColor, defaultTheme.colors.border, "the border token still applies");
	assert.equal(style.width, "100%", "the body still spans the viewport");
});

test("Skeleton lets style.backgroundColor replace its fill on one line", () => {
	const plain = resolveToHost(React.createElement(Skeleton, {}));
	assert.equal(
		flattenStyle(plain.props.style).backgroundColor,
		defaultTheme.colors.border,
		"a skeleton is filled with the border token by default",
	);

	const filled = resolveToHost(
		React.createElement(Skeleton, { style: { backgroundColor: translucent } }),
	);
	const style = flattenStyle(filled.props.style);
	assert.equal(style.backgroundColor, translucent, "the consumer's fill is merged last");
	assert.equal(style.height, 64, "the rect keeps its height");
	assert.equal(style.borderRadius, defaultTheme.radius.md, "the rect keeps its radius");
});

test("Skeleton routes a fill override to the lines, not the wrapper", () => {
	const wrapper = resolveToHost(
		React.createElement(Skeleton, {
			lines: 3,
			variant: "text",
			style: { backgroundColor: translucent, marginTop: 12 },
		}),
	);
	const wrapperStyle = flattenStyle(wrapper.props.style);
	assert.equal(
		wrapperStyle.backgroundColor,
		undefined,
		"the wrapper stays unpainted so the gaps between lines do not fill in",
	);
	assert.equal(wrapperStyle.marginTop, 12, "the rest of the consumer's style still lands on it");
	assert.equal(wrapperStyle.gap, defaultTheme.spacing.sm, "the wrapper keeps its gap");

	const lines = React.Children.toArray(wrapper.props.children as never).map(
		(line) => (line as unknown as HostElement).props.style,
	);
	assert.equal(lines.length, 3, "all three lines are rendered");
	for (const line of lines) {
		const style = flattenStyle(line);
		assert.equal(style.backgroundColor, translucent, "each line carries the override");
		assert.equal(style.height, 14, "each line keeps its text height");
	}
	assert.equal(flattenStyle(lines[2]).width, "72%", "the last line keeps its short width");
});

test("Skeleton without a fill override keeps the wrapper's own style", () => {
	const wrapper = resolveToHost(React.createElement(Skeleton, { lines: 2, style: { flex: 1 } }));
	const wrapperStyle = flattenStyle(wrapper.props.style);
	assert.equal(wrapperStyle.flex, 1, "the consumer's layout style still reaches the wrapper");
	const lines = React.Children.toArray(wrapper.props.children as never).map((line) =>
		flattenStyle((line as unknown as HostElement).props.style),
	);
	for (const line of lines) {
		assert.equal(
			line.backgroundColor,
			defaultTheme.colors.border,
			"the lines keep the border token",
		);
	}
});

test("KeyboardToolbar's backgroundColor replaces the fill in both modes", () => {
	const plain = resolveToHost(React.createElement(KeyboardToolbar, {}));
	const fallback = plain.props.theme as { light: ToolbarTheme; dark: ToolbarTheme };
	assert.equal(
		fallback.light.background,
		defaultTheme.colors.surfaceRaised,
		"the toolbar is filled with the raised surface token by default",
	);

	const filled = resolveToHost(
		React.createElement(KeyboardToolbar, { backgroundColor: translucent }),
	);
	const theme = filled.props.theme as { light: ToolbarTheme; dark: ToolbarTheme };
	assert.equal(theme.light.background, translucent, "the light fill is replaced");
	assert.equal(theme.dark.background, translucent, "the dark fill is replaced");
	assert.equal(theme.light.primary, defaultTheme.colors.text, "the rest of the theme is kept");
	assert.equal(
		theme.light.disabled,
		defaultTheme.colors.textDisabled,
		"the disabled colour is kept",
	);
});

test("KeyboardToolbar's backgroundColor is merged after a supplied theme", () => {
	const supplied = {
		light: { primary: "#111", disabled: "#999", background: "#FFF", ripple: "#CCC" },
		dark: { primary: "#EEE", disabled: "#777", background: "#000", ripple: "#333" },
	};
	const host = resolveToHost(
		React.createElement(KeyboardToolbar, { theme: supplied, backgroundColor: translucent }),
	);
	const theme = host.props.theme as { light: ToolbarTheme; dark: ToolbarTheme };
	assert.equal(theme.light.background, translucent, "the override wins over the supplied theme");
	assert.equal(theme.dark.background, translucent, "in the dark entry too");
	assert.equal(theme.light.primary, "#111", "the supplied theme is otherwise untouched");
	assert.equal(supplied.light.background, "#FFF", "the supplied theme is not mutated");
});
