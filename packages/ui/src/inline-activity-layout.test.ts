import { strict as assert } from "node:assert";
import { mock, test } from "bun:test";

// InlineActivity's promise is a layout promise -- the caption does not move when
// the work ends -- so asserting it means measuring the tree, not reading the
// source. React Native itself cannot be imported outside Metro, so the handful
// of native modules this component's import graph touches are replaced with the
// smallest stand-ins that still produce a style tree: host components become
// their own names, and nothing animates.
mock.module("react-native", () => ({
	ActivityIndicator: "ActivityIndicator",
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
		flatten: (styles: unknown) => styles,
		hairlineWidth: 1,
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
	useAnimatedStyle: () => ({}),
	useSharedValue: (value: unknown) => ({ value }),
	withDelay: (_delay: unknown, animation: unknown) => animation,
	withTiming: (value: unknown) => value,
}));
mock.module("expo-router/react-navigation", () => ({
	DarkTheme: { dark: true, colors: {}, fonts: {} },
	DefaultTheme: { dark: false, colors: {}, fonts: {} },
}));

const React = (await import("react")).default;
const { InlineActivity } = await import("./components/inline-activity");
const { spinnerSizes } = await import("./components/spinner-size");
const { defaultTheme } = await import("./theme");

type HostElement = { type: string; props: Record<string, unknown> };

const internals = (
	React as unknown as {
		__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: { H: unknown };
	}
).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
assert.ok(internals, "React exposes the dispatcher slot this harness renders through");

// Calling a function component directly needs a hook dispatcher installed. Only
// the hooks this subtree reaches are implemented, and `useContext` answers with
// the default theme because the only context in play is the theme.
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
};

/** Runs a node's component functions until what is left is a host element. */
function resolveToHost(node: unknown): HostElement {
	let current = node;
	for (let depth = 0; depth < 20; depth++) {
		if (!React.isValidElement(current)) break;
		const element = current as { type: unknown; props: unknown };
		if (typeof element.type !== "function") break;
		const previous = internals.H;
		internals.H = dispatcher;
		try {
			current = (element.type as (props: unknown) => unknown)(element.props);
		} finally {
			internals.H = previous;
		}
	}
	assert.ok(React.isValidElement(current), "node resolves to an element");
	const element = current as unknown as HostElement;
	assert.equal(typeof element.type, "string", "node resolves to a host element");
	return element;
}

function flattenStyle(style: unknown): Record<string, unknown> {
	if (!style) return {};
	if (Array.isArray(style)) return Object.assign({}, ...style.map(flattenStyle));
	return style as Record<string, unknown>;
}

/**
 * Walks the row the way flexbox would: every child before the caption
 * contributes its own width plus one gap, and the total is where the caption
 * starts.
 */
function measureRow(props: { active: boolean; size: "sm" | "md" | "lg" }) {
	const row = resolveToHost(React.createElement(InlineActivity, { label: "Working", ...props }));
	const gap = Number(flattenStyle(row.props.style).gap ?? 0);
	const children = React.Children.toArray(row.props.children as never).filter(Boolean);
	const slots = children.slice(0, -1).map(resolveToHost);
	const captionX = slots.reduce(
		(offset, slot) => offset + Number(flattenStyle(slot.props.style).width ?? 0) + gap,
		0,
	);
	return { captionX, gap, leadingSlot: slots[0], slotCount: children.length };
}

test("InlineActivity holds the spinner's width open when the work ends", () => {
	for (const size of ["sm", "md", "lg"] as const) {
		const active = measureRow({ active: true, size });
		const inactive = measureRow({ active: false, size });
		assert.equal(
			Number(flattenStyle(active.leadingSlot?.props.style).width),
			spinnerSizes[size],
			`${size} spinner occupies its documented box`,
		);
		assert.equal(
			Number(flattenStyle(inactive.leadingSlot?.props.style).width),
			spinnerSizes[size],
			`${size} placeholder occupies the same box as the spinner`,
		);
		assert.equal(
			Number(flattenStyle(inactive.leadingSlot?.props.style).height),
			spinnerSizes[size],
			`${size} placeholder is as tall as the spinner`,
		);
	}
});

test("InlineActivity starts its caption at the same x in both states", () => {
	for (const size of ["sm", "md", "lg"] as const) {
		const active = measureRow({ active: true, size });
		const inactive = measureRow({ active: false, size });
		assert.equal(
			inactive.captionX,
			active.captionX,
			`${size} caption does not move when active flips`,
		);
		assert.equal(
			active.captionX,
			spinnerSizes[size] + active.gap,
			`${size} caption sits one spinner and one gap in`,
		);
		assert.equal(inactive.slotCount, active.slotCount, `${size} row keeps its slot count`);
	}
});

test("InlineActivity's inactive slot is inert, not a spinner in disguise", () => {
	const { leadingSlot } = measureRow({ active: false, size: "md" });
	assert.ok(leadingSlot, "the inactive row still has a leading slot");
	assert.equal(leadingSlot.type, "View", "the placeholder is a plain view");
	assert.equal(leadingSlot.props.children, undefined, "the placeholder draws nothing");
	assert.equal(
		leadingSlot.props.accessibilityElementsHidden,
		true,
		"the placeholder is hidden from VoiceOver",
	);
	assert.equal(
		leadingSlot.props.importantForAccessibility,
		"no-hide-descendants",
		"the placeholder is hidden from TalkBack",
	);
	assert.equal(leadingSlot.props.pointerEvents, "none", "the placeholder swallows no touches");
	assert.notEqual(
		flattenStyle(leadingSlot.props.style).opacity,
		0,
		"the placeholder is empty rather than a spinner faded out, so nothing keeps animating",
	);
});
