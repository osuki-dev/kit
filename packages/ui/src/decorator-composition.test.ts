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
	I18nManager: {
		isRTL: false,
	},
	PanResponder: {
		create: (config: unknown) => ({ panHandlers: {}, config }),
	},
	AppState: {
		addEventListener: () => ({ remove() {} }),
	},
	ActivityIndicator: "ActivityIndicator",
	Image: "Image",
	Pressable: "Pressable",
	ScrollView: "ScrollView",
	StyleSheet: {
		absoluteFill: {},
		absoluteFillObject: {},
		create: (styles: unknown) => styles,
		flatten: (styles: unknown) =>
			Array.isArray(styles) ? Object.assign({}, ...styles) : (styles ?? {}),
		hairlineWidth: 1,
	},
	Text: "Text",
	TextInput: "TextInput",
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
	Layout: layout,
	interpolateColor: () => "transparent",
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

mock.module("expo-router/react-navigation", () => ({
	DarkTheme: { dark: true, colors: {}, fonts: {} },
	DefaultTheme: { dark: false, colors: {}, fonts: {} },
}));

const React = (await import("react")).default;
const { defaultTheme } = await import("./theme");
const { Button, ButtonRoot, ButtonBackground, ButtonLabel, ButtonIcon, ButtonSpinner } =
	await import("./components/button");
const { Card, CardRoot, CardBackground, CardHeader, CardContent, CardFooter } =
	await import("./components/card");
const { Surface, SurfaceRoot, SurfaceBackground, SurfaceContent } =
	await import("./components/surface");
const { SurfaceDecoratorProvider, SurfaceDecoratorContext, useSurfaceDecorator, LRUCache, getCachedTransformedColor } =
	await import("./theme/decorator-context");
const { Skeleton } = await import("./components/skeleton");
const { Input, InputFrameContext } = await import("./components/input");
const { splitFieldStyle } = await import("./utils/text-field");
const { withHugSlack } = await import("./components/text");

test("LRUCache stores, retrieves, refreshes and evicts", () => {
	const cache = new LRUCache<string, number>(2);
	cache.set("a", 1);
	cache.set("b", 2);
	assert.equal(cache.get("a"), 1);
	cache.set("c", 3); // should evict 'b' since 'a' was recently accessed
	assert.equal(cache.get("b"), undefined);
	assert.equal(cache.get("a"), 1);
	assert.equal(cache.get("c"), 3);
	assert.equal(cache.size, 2);
	cache.clear();
	assert.equal(cache.size, 0);
});

test("getCachedTransformedColor caches transformations", () => {
	let callCount = 0;
	const transform = (base: string, meta: { slot?: string }) => {
		callCount++;
		return `${base}-transformed-${meta.slot}`;
	};
	const meta = { slot: "test.slot", baseColor: "#111111" };
	const res1 = getCachedTransformedColor("#111111", meta, transform);
	assert.equal(res1, "#111111-transformed-test.slot");
	assert.equal(callCount, 1);

	// Second call with same parameters should hit cache
	const res2 = getCachedTransformedColor("#111111", meta, transform);
	assert.equal(res2, "#111111-transformed-test.slot");
	assert.equal(callCount, 1);
});

test("Surface exposes compound subcomponents and functions as facade", () => {
	assert.equal(typeof Surface, "function");
	assert.equal(typeof Surface.Root, "function");
	assert.equal(typeof Surface.Background, "function");
	assert.equal(typeof Surface.Content, "function");
	assert.equal(Surface.Root, SurfaceRoot);
	assert.equal(Surface.Background, SurfaceBackground);
	assert.equal(Surface.Content, SurfaceContent);
});

test("Card exposes compound subcomponents and functions as facade", () => {
	assert.equal(typeof Card, "function");
	assert.equal(typeof Card.Root, "function");
	assert.equal(typeof Card.Background, "function");
	assert.equal(typeof Card.Header, "function");
	assert.equal(typeof Card.Content, "function");
	assert.equal(typeof Card.Footer, "function");
	assert.equal(Card.Root, CardRoot);
	assert.equal(Card.Background, CardBackground);
	assert.equal(Card.Header, CardHeader);
	assert.equal(Card.Content, CardContent);
	assert.equal(Card.Footer, CardFooter);
});

test("Button exposes compound subcomponents and functions as facade", () => {
	assert.equal(typeof Button, "function");
	assert.equal(typeof Button.Root, "function");
	assert.equal(typeof Button.Background, "function");
	assert.equal(typeof Button.Label, "function");
	assert.equal(typeof Button.Icon, "function");
	assert.equal(typeof Button.Spinner, "function");
	assert.equal(Button.Root, ButtonRoot);
	assert.equal(Button.Background, ButtonBackground);
	assert.equal(Button.Label, ButtonLabel);
	assert.equal(Button.Icon, ButtonIcon);
	assert.equal(Button.Spinner, ButtonSpinner);
});

test("SurfaceDecoratorContext provides decorator value to consumers", () => {
	const decoration = React.createElement("mock-decoration");
	let inspectedSlot = "";
	const provider = React.createElement(SurfaceDecoratorProvider, {
		children: React.createElement(Consumer),
		transformBackground: (_base: string, meta: { slot?: string }) => {
			inspectedSlot = meta.slot ?? "";
			return "#FF0000";
		},
		renderDecoration: () => decoration,
	});

	function Consumer() {
		const decorator = useSurfaceDecorator();
		assert.ok(decorator, "decorator context is accessible");
		assert.equal(typeof decorator.transformBackground, "function");
		assert.equal(typeof decorator.renderDecoration, "function");
		const transformed = decorator.transformBackground!("#000000", {
			slot: "custom.slot",
			baseColor: "#000000",
		});
		assert.equal(transformed, "#FF0000");
		assert.equal(inspectedSlot, "custom.slot");
		assert.equal(
			decorator.renderDecoration!({ slot: "custom.slot", baseColor: "#000000" }),
			decoration,
		);
		return null;
	}

	assert.ok(provider);
});

type AnyElement = { type: unknown; props: Record<string, unknown> };

const internals = (
	React as unknown as {
		__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: { H: unknown };
	}
).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

const contextStore = new Map<unknown, unknown>();

const dispatcher = {
	useCallback: (fn: unknown) => fn,
	useContext: (ctx: unknown) => contextStore.get(ctx) ?? defaultTheme,
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

function renderComponent(node: unknown): AnyElement {
	const element = node as AnyElement;
	const previous = internals.H;
	internals.H = dispatcher;
	try {
		return (element.type as (props: unknown) => AnyElement)(element.props);
	} finally {
		internals.H = previous;
	}
}

test("Surface renders backward-compatible tree with SurfaceBackground", () => {
	const element = React.createElement(Surface, { variant: "page" }, "Hello Surface");
	const rendered = renderComponent(element);
	assert.equal(rendered.type, SurfaceRoot);
	assert.equal(rendered.props.variant, "page");

	const rootRendered = renderComponent(rendered);
	const viewElement = rootRendered.props.children as AnyElement;
	assert.equal(viewElement.type, "View");
	const children = React.Children.toArray(viewElement.props.children as never) as AnyElement[];
	assert.equal(children[0]?.type, SurfaceBackground);
	assert.equal(children[1], "Hello Surface");
});

test("Card renders backward-compatible tree with CardBackground and default slot", () => {
	const element = React.createElement(Card, { variant: "raised" }, "Hello Card");
	const rendered = renderComponent(element);
	assert.equal(rendered.type, CardRoot);
	assert.equal(rendered.props.slot, "cards.decoration");
	assert.equal(rendered.props.variant, "raised");

	const rootRendered = renderComponent(rendered);
	const viewElement = rootRendered.props.children as AnyElement;
	assert.equal(viewElement.type, "View");
	const children = React.Children.toArray(viewElement.props.children as never) as AnyElement[];
	assert.equal(children[0]?.type, CardBackground);
	assert.equal(children[1], "Hello Card");
});

test("Button accepts ReactNode children and renders compound structure", () => {
	const customNode = React.createElement("CustomContent", null, "Click Me");
	const element = React.createElement(
		Button,
		{ variant: "primary", slot: "custom.button.slot" },
		customNode,
	);
	const rendered = renderComponent(element);
	assert.equal(rendered.type, ButtonRoot);
	assert.equal(rendered.props.slot, "custom.button.slot");
	assert.equal(rendered.props.variant, "primary");

	const rootRendered = renderComponent(rendered);
	const pressableElement = rootRendered.props.children as AnyElement;
	assert.equal(pressableElement.type, "Pressable");
	const children = React.Children.toArray(pressableElement.props.children as never) as AnyElement[];
	assert.equal(children[0]?.type, ButtonBackground);
	assert.equal(children[1]?.type, "View");
});

function flattenStyle(style: unknown): Record<string, unknown> {
	if (!style || typeof style === "boolean") return {};
	if (Array.isArray(style)) return Object.assign({}, ...style.map(flattenStyle));
	return style as Record<string, unknown>;
}

test("two transforms do not share a cached fill", () => {
	const meta = { slot: "cache.isolation", baseColor: "#222222" };
	const first = getCachedTransformedColor("#222222", meta, (color) => `a:${color}`);
	const second = getCachedTransformedColor("#222222", meta, (color) => `b:${color}`);
	assert.equal(first, "a:#222222");
	assert.equal(second, "b:#222222");
});

test("Button paints an override fill once through the decorator", () => {
	contextStore.set(SurfaceDecoratorContext, {
		transformBackground: (color: string) => `tint(${color})`,
	});
	try {
		const root = renderComponent(
			React.createElement(Button, { style: { backgroundColor: "#123456", borderRadius: 12 } }, "Save"),
		);
		const provider = renderComponent(root);
		const buttonValue = provider.props.value as {
			baseColor: string;
			resolvedBackgroundColor: string;
		};
		assert.equal(buttonValue.baseColor, "#123456");
		assert.equal(buttonValue.resolvedBackgroundColor, "tint(#123456)");
		const pressable = provider.props.children as AnyElement;
		const flat = flattenStyle(pressable.props.style);
		assert.equal(flat.backgroundColor, undefined);
		assert.equal(flat.borderRadius, 12);
	} finally {
		contextStore.delete(SurfaceDecoratorContext);
	}
});

test("Card keeps a caller fill on the background layer only", () => {
	contextStore.set(SurfaceDecoratorContext, {
		transformBackground: (color: string) => `tint(${color})`,
	});
	try {
		const root = renderComponent(
			React.createElement(Card, { style: { backgroundColor: "#123456" } }, "Hi"),
		);
		const provider = renderComponent(root);
		const cardValue = provider.props.value as {
			meta: { baseColor: string; resolvedBackgroundColor: string };
		};
		assert.equal(cardValue.meta.baseColor, "#123456");
		assert.equal(cardValue.meta.resolvedBackgroundColor, "tint(#123456)");
		const view = provider.props.children as AnyElement;
		assert.equal(flattenStyle(view.props.style).backgroundColor, undefined);
	} finally {
		contextStore.delete(SurfaceDecoratorContext);
	}
});

test("Skeleton fill follows the decorator, and an explicit style still wins", () => {
	contextStore.set(SurfaceDecoratorContext, {
		transformBackground: (color: string) => `tint(${color})`,
	});
	try {
		const plain = renderComponent(React.createElement(Skeleton, {}));
		assert.equal(
			flattenStyle(plain.props.style).backgroundColor,
			`tint(${defaultTheme.colors.border})`,
		);
		const filled = renderComponent(
			React.createElement(Skeleton, { style: { backgroundColor: "#abcdef" } }),
		);
		assert.equal(flattenStyle(filled.props.style).backgroundColor, "#abcdef");
	} finally {
		contextStore.delete(SurfaceDecoratorContext);
	}
});

test("Input control fill follows the decorator once", () => {
	contextStore.set(SurfaceDecoratorContext, {
		transformBackground: (color: string) => `tint(${color})`,
	});
	try {
		const provider = renderComponent(React.createElement(Input, { testID: "email" }));
		const view = provider.props.children as AnyElement;
		contextStore.set(InputFrameContext, provider.props.value);
		let slots = React.Children.toArray(view.props.children as React.ReactNode) as AnyElement[];
		const only = slots[0];
		if (slots.length === 1 && only && typeof only.type === "symbol") {
			slots = React.Children.toArray(only.props.children as React.ReactNode) as AnyElement[];
		}
		const controlPart = slots.find((child) => child && typeof child.type === "function");
		assert.ok(controlPart, "the field control is rendered");
		const control = renderComponent(controlPart);
		const token =
			defaultTheme.components.Input.background === "transparent"
				? "transparent"
				: defaultTheme.colors[defaultTheme.components.Input.background];
		assert.equal(flattenStyle(control?.props.style).backgroundColor, `tint(${token})`);
	} finally {
		contextStore.delete(SurfaceDecoratorContext);
	}
});

test("splitFieldStyle keeps placement on the wrapper and type on the field", () => {
	const parts = splitFieldStyle({
		flex: 1,
		marginTop: 4,
		fontSize: 16,
		padding: 0,
		color: "#111111",
	});
	assert.equal(parts.wrapper.flex, 1);
	assert.equal(parts.wrapper.marginTop, 4);
	assert.equal(parts.input.flexGrow, 1);
	assert.equal(parts.input.fontSize, 16);
	assert.equal(parts.input.color, "#111111");
	assert.equal("flex" in parts.input, false);
	assert.equal(parts.placeholder.fontSize, 16);
	assert.equal(parts.placeholder.padding, 0);
});

test("withHugSlack adds a trailing thin space on Android only", () => {
	const wide = "\u5e7f";
	assert.equal(withHugSlack(wide, "android"), `${wide}\u2009`);
	assert.equal(withHugSlack(`${wide}\u2009`, "android"), `${wide}\u2009`);
	assert.equal(withHugSlack("", "android"), "");
	assert.equal(withHugSlack(wide, "ios"), wide);
	assert.equal(withHugSlack(12, "android"), "12\u2009");
});
