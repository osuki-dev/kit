import { strict as assert } from "node:assert";
import { mock, test } from "bun:test";

// Slots an app registers for its own surfaces.
declare module "./theme/decorator-context" {
	interface SurfaceSlotRegistry {
		"custom.slot": true;
		"custom.button.slot": true;
	}
}

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
	TouchableOpacity: "TouchableOpacity",
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
	useReducedMotion: () => false,
	default: {
		createAnimatedComponent: (component: unknown) => component,
		Text: "Animated.Text",
		View: "Animated.View",
	},
	cancelAnimation: () => {},
	Easing: { bezier: () => ({ factory: () => (t: number) => t }) },
	FadeInDown: entering,
	Layout: layout,
	interpolateColor: () => "transparent",
	useAnimatedStyle: (factory: () => unknown) => factory(),
	useSharedValue: (value: unknown) => {
		const shared = {
			value,
			get: () => shared.value,
			set: (next: unknown) => {
				shared.value = next;
			},
		};
		return shared;
	},
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

mock.module("@expo/ui/community/segmented-control", () => ({ default: "SystemSegmentedControl" }));

const React = (await import("react")).default;
const { defaultTheme, createTheme } = await import("./theme");
let fallbackTheme = defaultTheme;
const { SegmentedControl } = await import("./components/segmented-control");
const { SurfaceDecoration } = await import("./components/surface-decoration");
const { Button, ButtonRoot, ButtonBackground, ButtonLabel, ButtonIcon, ButtonSpinner } =
	await import("./components/button");
const { Card, CardRoot, CardBackground, CardHeader, CardContent, CardFooter } =
	await import("./components/card");
const { Surface, SurfaceRoot, SurfaceBackground, SurfaceContent } =
	await import("./components/surface");
const { SurfaceDecoratorProvider, SurfaceDecoratorContext, useSurfaceDecorator } =
	await import("./theme/decorator-context");
const { Skeleton } = await import("./components/skeleton");
const { Input, InputFrameContext } = await import("./components/input");
const { splitFieldStyle, TextField } = await import("./utils/text-field");
const { withHugSlack } = await import("./components/text");
const { TabsList, TabsRoot, TabsTrigger } = await import("./components/tabs");

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
	useContext: (ctx: unknown) => contextStore.get(ctx) ?? fallbackTheme,
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

test("Button.Root keeps its background a layer and lays the other parts out in one row", () => {
	const root = renderComponent(
		React.createElement(
			ButtonRoot,
			{ variant: "primary" },
			React.createElement(ButtonIcon, { name: "Sparkles" }),
			React.createElement(ButtonBackground),
			React.createElement(ButtonLabel, null, "Go"),
		),
	);
	const pressable = root.props.children as AnyElement;
	assert.equal(flattenStyle(pressable.props.style).flexDirection, "column");
	const children = React.Children.toArray(pressable.props.children as never) as AnyElement[];
	assert.equal(children.length, 2);
	assert.equal(children[0]?.type, ButtonBackground);
	const row = children[1]!;
	assert.equal(flattenStyle(row.props.style).flexDirection, "row");
	const parts = React.Children.toArray(row.props.children as never) as AnyElement[];
	assert.deepEqual(
		parts.map((part) => part.type),
		[ButtonIcon, ButtonLabel],
	);
});

function flattenStyle(style: unknown): Record<string, unknown> {
	if (!style || typeof style === "boolean") return {};
	if (Array.isArray(style)) return Object.assign({}, ...style.map(flattenStyle));
	return style as Record<string, unknown>;
}

test("Button paints an override fill once through the decorator", () => {
	contextStore.set(SurfaceDecoratorContext, {
		transformBackground: (color: string) => `tint(${color})`,
	});
	try {
		const root = renderComponent(
			React.createElement(
				Button,
				{ style: { backgroundColor: "#123456", borderRadius: 12 } },
				"Save",
			),
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

test("Skeleton fill follows the decorator, including an explicit style fill", () => {
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
		assert.equal(flattenStyle(filled.props.style).backgroundColor, "tint(#abcdef)");
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

test("TextField drops value beside span children and falls back to the short placeholder", () => {
	const render = (props: Record<string, unknown>) => {
		const previous = internals.H;
		internals.H = dispatcher;
		try {
			const field = TextField as unknown as {
				render: (props: unknown, ref: unknown) => AnyElement;
			};
			return field.render(props, null);
		} finally {
			internals.H = previous;
		}
	};
	const partsOf = (wrapper: AnyElement) =>
		React.Children.toArray(wrapper.props.children as React.ReactNode) as AnyElement[];
	const props = {
		value: "",
		placeholder: "Ask an agent, or mention one with @",
		shortPlaceholder: "Ask an agent",
		style: { fontSize: 14 },
		children: "",
	};

	const first = render(props);
	const [input, , probe] = partsOf(first);
	assert.equal("value" in input!.props, false, "a value beside span children is not passed on");
	assert.equal(flattenStyle(input!.props.style).fontFamily, undefined, "no family is imposed");
	assert.equal(flattenStyle(first.props.style).minHeight, Math.ceil(14 * 1.35));
	assert.equal(input!.props.placeholder, props.placeholder);

	const measured = probe!.props.children as AnyElement;
	const onTextLayout = measured.props.onTextLayout as (event: unknown) => void;
	onTextLayout({ nativeEvent: { lines: [{}, {}] } });
	const [wrapped] = partsOf(render(props));
	assert.equal(wrapped!.props.placeholder, "Ask an agent", "a wrapping placeholder is shortened");

	const [plain] = partsOf(render({ value: "draft", style: { fontSize: 14 } }));
	assert.equal(plain!.props.value, "draft", "a field without spans stays controlled");
});

test("withHugSlack adds a trailing thin space on Android only", () => {
	const wide = "\u5e7f";
	assert.equal(withHugSlack(wide, "android"), `${wide}\u2009`);
	assert.equal(withHugSlack(`${wide}\u2009`, "android"), `${wide}\u2009`);
	assert.equal(withHugSlack("", "android"), "");
	assert.equal(withHugSlack(wide, "ios"), wide);
	assert.equal(withHugSlack(12, "android"), "12\u2009");
});

test("Tabs segments layering leaves the track clear and paints each trigger once", () => {
	const metas: Array<{ slot?: string; role?: string; over?: string; baseColor: string }> = [];
	contextStore.set(SurfaceDecoratorContext, {
		transformBackground: (color: string, meta: (typeof metas)[number]) => {
			metas.push(meta);
			return `tint(${color})`;
		},
	});
	try {
		const root = renderComponent(
			React.createElement(TabsRoot, {
				value: "a",
				variant: "pill",
				layering: "segments",
				children: null,
			}),
		);
		contextStore.set(root.type, root.props.value);
		const listProvider = renderComponent(React.createElement(TabsList, { children: null }));
		const listValue = listProvider.props.value as { trackFill: string };
		assert.equal(listValue.trackFill, "transparent");
		const list = listProvider.props.children as AnyElement;
		assert.equal(flattenStyle(list.props.style).backgroundColor, "transparent");
		contextStore.set(listProvider.type, listValue);

		const { colors, components } = defaultTheme;
		const fillOf = (value: string) => {
			const trigger = renderComponent(React.createElement(TabsTrigger, { value, children: null }));
			const style = trigger.props.style as (state: { pressed: boolean }) => unknown;
			return flattenStyle(style({ pressed: false })).backgroundColor;
		};
		assert.equal(fillOf("a"), `tint(${colors[components.Tabs.activeBackground]})`);
		assert.equal(fillOf("b"), `tint(${colors[components.Tabs.background]})`);
		const selected = metas.find((meta) => meta.slot === "tabs.selected");
		assert.equal(selected?.role, "surface");
		assert.equal(selected?.over, undefined);
	} finally {
		contextStore.clear();
	}
});

test("Tabs paints selected artwork exactly once on its actual static or sliding surface", () => {
	for (const layering of ["overlay", "segments"] as const) {
		for (const indicator of ["static", "slide"] as const) {
			const calls: Array<{ slot?: string; role?: string; over?: string }> = [];
			contextStore.set(SurfaceDecoratorContext, {
				renderDecoration: (meta: (typeof calls)[number]) => {
					calls.push(meta);
					return meta.slot === "tabs.selected" ? React.createElement("Artwork") : null;
				},
			});
			try {
				const root = renderComponent(
					React.createElement(TabsRoot, {
						value: "a",
						variant: "pill",
						layering,
						indicator,
						children: null,
					}),
				);
				contextStore.set(root.type, root.props.value);
				const list = renderComponent(React.createElement(TabsList, { children: null }));
				contextStore.set(list.type, list.props.value);
				const visit = (node: unknown): void => {
					for (const child of React.Children.toArray(node as React.ReactNode)) {
						if (!React.isValidElement(child)) continue;
						const element = child as AnyElement;
						if (element.type === SurfaceDecoration) renderComponent(element);
						else visit(element.props.children);
					}
				};
				visit(list.props.children);
				for (const value of ["a", "b"]) {
					visit(renderComponent(React.createElement(TabsTrigger, { value, children: null })));
				}
				const selected = calls.filter((meta) => meta.slot === "tabs.selected");
				assert.equal(selected.length, 1, `${layering}/${indicator}`);
				assert.equal(selected[0]?.role, layering === "segments" ? "surface" : "overlay");
				assert.equal(
					selected[0]?.over,
					layering === "segments" ? undefined : defaultTheme.colors.surfaceRaised,
				);
			} finally {
				contextStore.clear();
			}
		}
	}
});

test("iOS segmented control preserves the system default but honors custom selection appearance", () => {
	const props = {
		options: [
			{ label: "A", value: "a" },
			{ label: "B", value: "b" },
		],
		value: "a",
		onChange: () => {},
	};
	const render = (extra = {}) =>
		renderComponent(React.createElement(SegmentedControl, { ...props, ...extra }));
	try {
		const system = render().props.children as AnyElement;
		assert.equal(system.type, "SystemSegmentedControl");
		const segments = (root: AnyElement) =>
			React.Children.toArray(root.props.children as React.ReactNode) as AnyElement[];
		const custom = segments(render({ optionRadius: "none" }));
		assert.equal(custom[0]?.props.radius, 0);
		assert.equal(custom[0]?.props.selected, true);
		assert.equal(custom[0]?.props.fill, defaultTheme.colors.surface);
		fallbackTheme = createTheme("light", {
			components: { SegmentedControl: { optionRadius: "sm", activeBackground: "primary" } },
		});
		const themed = segments(render());
		assert.equal(themed[0]?.props.radius, fallbackTheme.radius.sm);
		assert.equal(themed[0]?.props.fill, fallbackTheme.colors.primary);
		fallbackTheme = createTheme("light", { colors: { text: "#123456" } });
		assert.notEqual(segments(render())[0]?.type, "SystemSegmentedControl");
	} finally {
		fallbackTheme = defaultTheme;
		contextStore.clear();
	}
});

test("press feedback waits for native recognition and preserves cancellation", async () => {
	const { HapticsProvider } = await import("./components/haptics");
	const { PressableScale } = await import("./components/pressable-scale");
	const { PressableCard } = await import("./components/pressable-card");
	const { ListItemRoot } = await import("./components/list-item");
	const { TagRoot } = await import("./components/tag");
	const calls: string[] = [];
	const provider = renderComponent(
		React.createElement(HapticsProvider, {
			enabled: true,
			children: null,
			feedback: () => {
				calls.push("haptic");
			},
		}),
	);
	contextStore.set(provider.type, provider.props.value);
	try {
		for (const Component of [PressableScale, PressableCard, ButtonRoot, ListItemRoot, TagRoot]) {
			const render = (extra: Record<string, unknown> = {}) => {
				const element = renderComponent(
					React.createElement(Component as React.ComponentType<any>, {
						title: "Row",
						children: "Content",
						onPress: () => calls.push("press"),
						...extra,
					}),
				);
				return Component === ButtonRoot ? (element.props.children as AnyElement) : element;
			};
			const control = render();
			calls.length = 0;
			(control.props.onPressIn as Function)({});
			(control.props.onPressOut as Function)({});
			assert.equal(calls.length, 0, "cancelled press/scroll has no haptic or action");
			assert.equal(control.props.onLongPress, undefined, "no artificial long-press handler");
			(control.props.onPress as Function)({});
			assert.deepEqual(calls, ["haptic", "press"]);
			calls.length = 0;
			const long = render({ onLongPress: () => calls.push("long") });
			(long.props.onPressIn as Function)({});
			(long.props.onLongPress as Function)({});
			(long.props.onPressOut as Function)({});
			assert.deepEqual(calls, ["haptic", "long"], "recognized long press has one feedback");
			calls.length = 0;
			const disabled = render({ disabled: true, onLongPress: () => calls.push("long") });
			(disabled.props.onPress as Function)({});
			(disabled.props.onLongPress as Function)({});
			assert.equal(calls.length, 0);
		}
		calls.length = 0;
		const silent = renderComponent(
			React.createElement(PressableScale, {
				feedback: "none",
				onPress: () => calls.push("press"),
				onPressIn: () => calls.push("in"),
				onPressOut: () => calls.push("out"),
			}),
		);
		(silent.props.onPressIn as Function)({});
		(silent.props.onPressOut as Function)({});
		(silent.props.onPress as Function)({});
		assert.deepEqual(calls, ["in", "out", "press"]);
	} finally {
		contextStore.clear();
	}
});
