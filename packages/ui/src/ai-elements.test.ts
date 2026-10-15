import { strict as assert } from "node:assert";
import { mock, test } from "bun:test";
import React from "react";

function flattenStyle(style: unknown): Record<string, unknown> {
	if (!style || typeof style === "boolean") return {};
	if (Array.isArray(style)) return Object.assign({}, ...style.map(flattenStyle));
	return style as Record<string, unknown>;
}

mock.module("react-native", () => ({
	ActivityIndicator: "ActivityIndicator",
	Dimensions: {
		get: () => ({ width: 390, height: 844 }),
		addEventListener: () => ({ remove() {} }),
	},
	Platform: {
		OS: "ios",
		select: (options: Record<string, unknown>) => options.ios ?? options.default,
	},
	PixelRatio: {
		get: () => 3,
		getFontScale: () => 1,
		roundToNearestPixel: (value: number) => value,
	},
	Pressable: "Pressable",
	ScrollView: "ScrollView",
	StyleSheet: {
		absoluteFill: {},
		absoluteFillObject: {},
		create: (styles: unknown) => styles,
		flatten: flattenStyle,
		hairlineWidth: 1,
	},
	Text: "Text",
	TextInput: "TextInput",
	View: "View",
	Image: "Image",
	useColorScheme: () => "light",
	useWindowDimensions: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}));

mock.module("react-native-reanimated", () => ({
	default: {
		createAnimatedComponent: (component: unknown) => component,
		View: "AnimatedView",
	},
	useSharedValue: (initial: unknown) => ({ value: initial }),
	useAnimatedStyle: (fn: () => unknown) => fn(),
	withRepeat: (anim: unknown) => anim,
	withTiming: (to: unknown) => to,
	cancelAnimation: () => {},
}));

mock.module("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

mock.module("expo-router/react-navigation", () => ({
	DarkTheme: { dark: true, colors: {}, fonts: {} },
	DefaultTheme: { dark: false, colors: {}, fonts: {} },
}));
mock.module("expo-router", () => ({
	useRouter: () => ({ push() {}, replace() {}, back() {} }),
}));

const {
	Trace,
	TraceRoot,
	TraceItem,
	TraceHeader,
	TraceTitle,
	TraceBadge,
	TraceContent,
	TraceAction,
	useTraceItem,
} = await import("./components/trace");
const {
	CodeBlock,
	CodeBlockRoot,
	CodeBlockHeader,
	CodeBlockTitle,
	CodeBlockActions,
	CodeBlockCopyButton,
	CodeBlockContent,
	CodeBlockLine,
	useCodeBlock,
} = await import("./components/code-block");
const {
	Reasoning,
	ReasoningRoot,
	ReasoningTrigger,
	ReasoningDuration,
	ReasoningContent,
	useReasoning,
} = await import("./components/reasoning");
const {
	ToolCall,
	ToolCallRoot,
	ToolCallHeader,
	ToolCallName,
	ToolCallStatus,
	ToolCallPayload,
	ToolCallResult,
	useToolCall,
} = await import("./components/tool-call");
const {
	PromptInput,
	PromptInputRoot,
	PromptInputTextarea,
	PromptInputActions,
	PromptInputAttachmentSlot,
	PromptInputSubmitButton,
	usePromptInput,
} = await import("./components/prompt-input");

const { defaultTheme } = await import("./theme");

type AnyElement = { type: unknown; props: Record<string, unknown> };

const internals = (
	React as unknown as {
		__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: { H: unknown };
	}
).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

const dispatcher = {
	useCallback: (fn: unknown) => fn,
	useContext: () => defaultTheme,
	useDebugValue: () => {},
	useEffect: () => {},
	useId: () => ":r0:",
	useInsertionEffect: () => {},
	useLayoutEffect: () => {},
	useMemo: (factory: () => unknown) => (factory as () => unknown)(),
	useRef: (initial: unknown) => ({ current: initial }),
	useState: (initial: unknown) => [typeof initial === "function" ? (initial as () => unknown)() : initial, () => {}],
	useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => (getSnapshot as () => unknown)(),
};

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

test("Trace compound export exposes all subcomponents", () => {
	assert.equal(Trace.Root, TraceRoot);
	assert.equal(Trace.Item, TraceItem);
	assert.equal(Trace.Header, TraceHeader);
	assert.equal(Trace.Title, TraceTitle);
	assert.equal(Trace.Badge, TraceBadge);
	assert.equal(Trace.Content, TraceContent);
	assert.equal(Trace.Action, TraceAction);
	assert.equal(typeof useTraceItem, "function");
});

test("Trace context exposes state, actions, and meta contract", () => {
	const rendered = renderOnce(
		React.createElement(Trace.Item, { status: "running", defaultExpanded: true }),
	);
	const providerProps = rendered.props as { value: ReturnType<typeof useTraceItem> };
	assert.ok(providerProps.value, "Trace.Item renders Context.Provider with value");
	assert.equal(providerProps.value.state.status, "running");
	assert.equal(providerProps.value.state.expanded, true);
	assert.equal(typeof providerProps.value.actions.setExpanded, "function");
	assert.equal(typeof providerProps.value.actions.toggle, "function");
	assert.equal(providerProps.value.meta.controlled, false);
});

test("CodeBlock compound export exposes all subcomponents", () => {
	assert.equal(CodeBlock.Root, CodeBlockRoot);
	assert.equal(CodeBlock.Header, CodeBlockHeader);
	assert.equal(CodeBlock.Title, CodeBlockTitle);
	assert.equal(CodeBlock.Actions, CodeBlockActions);
	assert.equal(CodeBlock.CopyButton, CodeBlockCopyButton);
	assert.equal(CodeBlock.Content, CodeBlockContent);
	assert.equal(CodeBlock.Line, CodeBlockLine);
	assert.equal(typeof useCodeBlock, "function");
});

test("CodeBlock context exposes state, actions, and meta contract", () => {
	let copiedValue: string | undefined;
	const rendered = renderOnce(
		React.createElement(CodeBlock.Root, {
			variant: "diff",
			code: "console.log('hello')",
			onCopy: (code) => {
				copiedValue = code;
			},
		}),
	);
	const providerProps = rendered.props as { value: ReturnType<typeof useCodeBlock> };
	assert.ok(providerProps.value, "CodeBlock.Root renders Context.Provider with value");
	assert.equal(providerProps.value.meta.variant, "diff");
	assert.equal(providerProps.value.meta.code, "console.log('hello')");
	assert.equal(providerProps.value.state.copied, false);
	assert.equal(typeof providerProps.value.actions.copy, "function");

	providerProps.value.actions.copy();
	assert.equal(copiedValue, "console.log('hello')");
});

test("Reasoning compound export exposes all subcomponents", () => {
	assert.equal(Reasoning.Root, ReasoningRoot);
	assert.equal(Reasoning.Trigger, ReasoningTrigger);
	assert.equal(Reasoning.Duration, ReasoningDuration);
	assert.equal(Reasoning.Content, ReasoningContent);
	assert.equal(typeof useReasoning, "function");
});

test("Reasoning context exposes state, actions, and meta contract", () => {
	const rendered = renderOnce(
		React.createElement(Reasoning.Root, {
			defaultOpen: false,
			durationSeconds: 15,
			isStreaming: true,
		}),
	);
	const providerProps = rendered.props as { value: ReturnType<typeof useReasoning> };
	assert.ok(providerProps.value, "Reasoning.Root renders Context.Provider with value");
	assert.equal(providerProps.value.state.open, false);
	assert.equal(providerProps.value.meta.durationSeconds, 15);
	assert.equal(providerProps.value.meta.isStreaming, true);
	assert.equal(typeof providerProps.value.actions.toggle, "function");
	assert.equal(typeof providerProps.value.actions.setOpen, "function");
});

test("ToolCall compound export exposes all subcomponents", () => {
	assert.equal(ToolCall.Root, ToolCallRoot);
	assert.equal(ToolCall.Header, ToolCallHeader);
	assert.equal(ToolCall.Name, ToolCallName);
	assert.equal(ToolCall.Status, ToolCallStatus);
	assert.equal(ToolCall.Payload, ToolCallPayload);
	assert.equal(ToolCall.Result, ToolCallResult);
	assert.equal(typeof useToolCall, "function");
});

test("ToolCall context exposes state, actions, and meta contract", () => {
	const rendered = renderOnce(
		React.createElement(ToolCall.Root, {
			name: "read_file",
			status: "success",
			defaultExpanded: true,
		}),
	);
	const providerProps = rendered.props as { value: ReturnType<typeof useToolCall> };
	assert.ok(providerProps.value, "ToolCall.Root renders Context.Provider with value");
	assert.equal(providerProps.value.meta.name, "read_file");
	assert.equal(providerProps.value.meta.status, "success");
	assert.equal(providerProps.value.state.expanded, true);
	assert.equal(typeof providerProps.value.actions.toggle, "function");
	assert.equal(typeof providerProps.value.actions.togglePayload, "function");
	assert.equal(typeof providerProps.value.actions.toggleResult, "function");
});

test("PromptInput compound export exposes all subcomponents", () => {
	assert.equal(PromptInput.Root, PromptInputRoot);
	assert.equal(PromptInput.Textarea, PromptInputTextarea);
	assert.equal(PromptInput.Actions, PromptInputActions);
	assert.equal(PromptInput.AttachmentSlot, PromptInputAttachmentSlot);
	assert.equal(PromptInput.SubmitButton, PromptInputSubmitButton);
	assert.equal(typeof usePromptInput, "function");
});

test("PromptInput context exposes state, actions, and meta contract", () => {
	let submittedValue: string | undefined;
	const rendered = renderOnce(
		React.createElement(PromptInput.Root, {
			defaultValue: "Initial prompt",
			onSubmit: (val) => {
				submittedValue = val;
			},
		}),
	);
	const providerProps = rendered.props as { value: ReturnType<typeof usePromptInput> };
	assert.ok(providerProps.value, "PromptInput.Root renders Context.Provider with value");
	assert.equal(providerProps.value.state.value, "Initial prompt");
	assert.equal(providerProps.value.meta.disabled, false);
	assert.equal(providerProps.value.meta.loading, false);
	assert.equal(typeof providerProps.value.actions.setValue, "function");
	assert.equal(typeof providerProps.value.actions.submit, "function");
	assert.equal(typeof providerProps.value.actions.clear, "function");

	providerProps.value.actions.submit();
	assert.equal(submittedValue, "Initial prompt");
});
