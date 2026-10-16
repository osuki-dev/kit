# @osuki-dev/ui 2.0.0: Composition Theming and AI Elements Architecture Specification

> **Version**: 2.0.0-draft  
> **Status**: In active execution (`feat/composition-theming-icons`)  
> **Target package**: `packages/ui` (`@osuki-dev/ui`)  
> **Date**: October 2026

---

## 1. Architecture and background

### 1.1 What 1.x left behind

In 1.x, `@osuki-dev/ui` used monolithic, closed components:

1. **Closed components.** `Button` accepted only `children: string` and `leftIcon?: IconName`. `Card` accepted a static `variant` and `children`. Layout, press motion, icons, and spinners were hardcoded inside the component.
2. **No surface decoration.** Styles bound directly to static `theme.colors[...]`. Apps could not apply a dynamic fill, artwork, or ambient layer without forking the primitive.
3. **Parallel forks.** Apps that needed theme artwork copied `themed-button`, `themed-card`, `themed-surface`, and `themed-input`, including motion, haptics, and typography, then inserted their own artwork layer. That drifted from the package on every release.
4. **Heavy icons.** Shipping all of `lucide-react-native` and `react-native-svg` built a large React tree in long lists and streaming threads.

### 1.2 2.0.0 goals

- **Composition.** Container and control components split into compound parts. Convenience facades are built from those same parts.
- **Surface decorator.** One context contract lets an app replace a fill or paint artwork. Call sites stay on the primitives.
- **Nano icons.** `react-native-nano-icons` draws layered glyphs through CoreText and Android Canvas. `IconProvider` supplies a custom resolver chain.
- **Native interaction primitives.** `Slider`, `StatusDot`, `TwoStepAction`, `GlassSurface`, `EdgeFade`, `MarqueeText`, and `TransientPill`.
- **AI elements.** React Native versions of `Trace`, `CodeBlock`, `Reasoning`, `ToolCall`, and `PromptInput`.
- **Native styles.** `StyleSheet` plus Yoga flattening (`collapsable={true}`). No CSS-in-JS runtime.

---

## 2. Architectural pillars

### Pillar 1: Compound components

Replace the closed 1.x prop API. Container and control components expose replaceable parts. The short form stays, and it composes the default parts internally.

```tsx
// 1.x closed form
<Button variant="primary" leftIcon="Search">Submit</Button>

// 2.0.0 compound form
<Button.Root variant="primary">
  <Button.Background />
  <Button.Icon name="Search" />
  <Button.Label>Submit</Button.Label>
</Button.Root>
```

#### Compound inventory

- **`Surface`**: `Surface.Root`, `Surface.Background`, `Surface.Content`
- **`Card`**: `Card.Root`, `Card.Background`, `Card.Header`, `Card.Content`, `Card.Footer`
- **`Button`**: `Button.Root`, `Button.Background`, `Button.Label`, `Button.Icon`, `Button.Spinner`
- **`CodeBlock`**: `CodeBlock.Root`, `CodeBlock.Header`, `CodeBlock.Title`, `CodeBlock.Actions`, `CodeBlock.Content`, `CodeBlock.Line`
- **`Trace`**: `Trace.Root`, `Trace.Item`, `Trace.Header`, `Trace.Title`, `Trace.Badge`, `Trace.Content`, `Trace.Action`
- **`Reasoning`**: `Reasoning.Root`, `Reasoning.Trigger`, `Reasoning.Duration`, `Reasoning.Content`
- **`ToolCall`**: `ToolCall.Root`, `ToolCall.Header`, `ToolCall.Name`, `ToolCall.Status`, `ToolCall.Payload`, `ToolCall.Result`
- **`PromptInput`**: `PromptInput.Root`, `PromptInput.Textarea`, `PromptInput.Actions`, `PromptInput.AttachmentSlot`, `PromptInput.SubmitButton`

The short forms `<Button>Submit</Button>` and `<Card variant="raised">...</Card>` remain. Each one renders the default parts.

---

### Pillar 2: Surface decorator injection (`SurfaceDecoratorContext`)

Apps and the UI package meet at one context contract.

```ts
export interface SurfaceMeta {
	slot?: string;
	variant?: string;
	baseColor: string;
	disabled?: boolean;
	selected?: boolean;
	borderRadius?: number;
}

export interface SurfaceDecoratorContextValue {
	/** Resolve a fill, for example an app opacity policy. */
	transformBackground?: (baseColor: string, meta: SurfaceMeta) => string;
	/** Paint artwork, an image, or another decoration for this slot. */
	renderDecoration?: (meta: SurfaceMeta) => React.ReactNode;
}
```

#### Usage

1. **Default.** With no provider, components paint the semantic token as a solid fill.
2. **App theme pack.**

```tsx
<SurfaceDecoratorContext
	value={{
		transformBackground: (baseColor) => surfaceBackground(baseColor),
		renderDecoration: (meta) =>
			meta.slot ? <ThemedSurfaceArtwork slot={meta.slot} baseColor={meta.baseColor} /> : null,
	}}
>
	<App />
</SurfaceDecoratorContext>
```

3. **Custom artwork on one card.**

```tsx
<Card.Root>
	<Card.Background>
		<Image source={{ uri: customBgUrl }} style={StyleSheet.absoluteFill} />
		<LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={StyleSheet.absoluteFill} />
	</Card.Background>
	<Card.Content>
		<Text>Custom Themed Card</Text>
	</Card.Content>
</Card.Root>
```

Each string fill is painted once. Unselected tabs and segments stay transparent so a translucent track is not multiplied by a second translucent chip. `transparent` is not transformed.

---

### Pillar 3: Nano icons and custom resolvers

#### Render layers

- **Layer 1, native glyph stack.** `react-native-nano-icons` compiles SVGs to a layered TTF and `.glyphmap.json` at build time. iOS CoreText and Android Canvas draw the glyph. The React tree does not parse SVG XML.
- **Layer 2, custom resolvers.** `IconProvider` injects the chain:
  - Theme manifest icons, including `chrome.send`, `chrome.back`, and `chrome.scan`
  - `iconDirections` for 8-direction rotation
  - Tint modes: `template` follows the foreground color, `original` keeps the source colors
- **Layer 3, Lucide or SVG fallback.** An unmatched name falls back to a vector component.

---

### Pillar 4: Native interaction and visual primitives

1. **`Slider`**. Cross-platform slider. Optional `@expo/ui` SwiftUI on iOS, with a gesture fallback.
2. **`StatusDot`**. Filled or hollow dot, a small scale on status change, and an online ripple.
3. **`TwoStepAction`**. Inline confirm control with a draining progress line.
4. **`EdgeFade`**. Horizontal or vertical edge fade for a scrolling region.
5. **`GlassSurface`**. iOS 26 Liquid Glass through `expo-glass-effect`, falling back to `expo-blur` or a translucent fill.
6. **`MarqueeText`**. Single-line text that scrolls on the UI thread when it overflows, instead of truncating.
7. **`TransientPill`**. Short-lived floating pill for an immediate gesture or action.
8. **Typography robustness.**
   - `Input`, `SearchInput`, `Textarea`, and `PromptInput` draw the placeholder with `Text`, so Android inherits the custom font. This stays inside those components. There is no extra public field component.
   - `HugSlack` appends a thin space (`\u2009`) on Android so italic and wide glyphs are not clipped at the line end.

---

### Pillar 5: shadcn 2026-10 AI elements (React Native)

1. **`Trace`**. Agent execution trace.
   - Status: `pending` | `running` | `success` | `error`.
   - `running` shows a pulse and supports nested items.
2. **`CodeBlock`**. Code and tool output.
   - Modes: `default`, `terminal`, `diff` (`+` / `-`), and `compact`, with a copy action.
3. **`Reasoning`**. Collapsible chain-of-thought card with a duration badge.
4. **`ToolCall`**. Tool-call card with payload and result.
5. **`PromptInput`**. Growing multiline prompt with an attachment slot and action row.

---

### Pillar 6: Native styles and performance

#### Why `StyleSheet`

- **No JS style parsing on each frame.** `StyleSheet.create` flattens styles once and maps them to Yoga through JSI.
- **No runtime style engine during streaming.** CSS-in-JS or class calculation on a hot token stream occupies the JS thread and causes dropped frames.
- **View flattening.** Background and decoration containers set `collapsable={true}` so Yoga can fold views that have no events.

#### Color cache

Move WCAG 4.5:1 / 3:1 contrast and alpha work out of render. A global LRU caches `(baseColor, alpha) => calculatedFill`. Cache keys include the transform identity so two decorators do not share a color.

---

## 3. Dependencies

```
packages/ui/package.json (2.0.0)
```

### Removed hard dependencies

- `lucide-react-native` is no longer a required dependency. Inject it only when a resolver needs it.
- `react-native-svg` is optional.

### Optional peer dependencies

- `react-native-nano-icons` (recommended glyph engine)
- `expo-glass-effect` (optional, iOS 26 Liquid Glass)
- `expo-blur` (optional blur)
- `@expo/ui` (optional SwiftUI components)
- `react-native-reanimated` (optional UI-thread motion)
- `react-native-keyboard-controller` (optional interactive keyboard scrolling)
- `expo-image` (optional image cache)

Every optional dependency fails soft and falls back when it is absent.

---

## 4. Execution roadmap

- **Branch**: `feat/composition-theming-icons` in this repository.
- **Boundary**: product apps stay outside this package. Work stays in `packages/ui` and the showcase.

### Tracks

1. **Decorator and core compounds.** `packages/ui/src/theme/decorator-context.ts`, the LRU, and compound `surface.tsx`, `card.tsx`, and `button.tsx`.
2. **Nano icons.** `icon.tsx`, `IconContext`, `IconProvider`, the nano adapter, direction, and tint.
3. **Visual primitives.** `slider.tsx`, `status-dot.tsx`, `two-step-action.tsx`, `edge-fade.tsx`, `glass-surface.tsx`, `marquee-text.tsx`, `transient-pill.tsx`.
4. **AI elements.** `trace.tsx`, `code-block.tsx`, `reasoning.tsx`, `tool-call.tsx`, `prompt-input.tsx`.
5. **Public contract.** Export new primitives from `packages/ui/src/components/index.ts`, keep `package.json` at `2.0.0`, and run `bun test` and `tsc --noEmit`.

---

## 5. Handover for later changes

1. Read this spec before changing a component.
2. Do not add appearance booleans such as `isThemed`, `showDiff`, or `hasIcon` to a core component. Extend it with a compound part or context.
3. `packages/ui` stays free of app-level `@/` imports. Use relative imports.
4. After a change, run `bun src/public-contract.test.ts` and `tsc --noEmit`. Every component file is registered in `components/index.ts` with complete types.
