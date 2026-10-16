# @osuki-dev/ui 2.0.0: Composition Theming & AI Elements Architecture Specification

> **Version**: 2.0.0-draft  
> **Status**: In Active Execution (`feat/composition-theming-icons`)  
> **Target Package**: `packages/ui` (`@osuki-dev/ui`)  
> **Author**: Antigravity Core Architecture Team  
> **Date**: October 2026

---

## 1. 架构愿景与重构背景 (Executive Summary)

### 1.1 现状与技术债复盘

在 1.x 架构中，`@osuki-dev/ui` 采用了单体封闭式组件（Monolithic & Closed Components）设计：

1. **组件高度封闭**：如 `Button` 仅接受 `children: string`、`leftIcon?: IconName`，`Card` 仅接受静态 `variant` 与 `children`。内部视图层级、按下动效、Icon 与 Spinner 均硬编码在组件内部。
2. **主题装饰能力缺失**：组件样式直接绑定静态 `theme.colors[...]`，无法接入动态背景透明度策略（`useSurfaceBackground`）、主题插画图层（`ThemeArtworkLayer`）、环境动画（Skia Ambient Effects）。
3. **业务端被迫复制平行组件**：`muqun/app` 为了实现主题包与插画背景，不得不维护大量 `themed-*` 影子组件（`themed-button.tsx`, `themed-card.tsx`, `themed-surface.tsx`, `themed-input.tsx` 等），把内部动效、Haptics、排版代码整体复制并强行插入 `<ThemeArtworkLayer>`，导致极高维护成本和版本漂移。
4. **图标引擎笨重**：强制全量打包 `lucide-react-native` 与 `react-native-svg`，在长列表和会话流中造成巨大的 React 虚拟 DOM 树开销与主线程 Microhangs。

### 1.2 2.0.0 核心目标

- **完全解耦与可组合性 (Zero-Prop Composition)**：全面践行 [Vercel Composition Patterns](file:///home/ryu/.agents/skills/vercel-composition-patterns/AGENTS.md)，采用复合组件（Compound Components）与依赖注入模式。
- **开放自定义表面与背景装饰体系 (Surface Decorator Injection)**：UI 库提供通用契约，用户、AI 会话界面、API 客户端想加背景图片、装饰物、渐变层、主题包插画，均无需修改底层组件代码。
- **极速图标引擎 (NanoIcons First)**：集成 [`react-native-nano-icons`](https://github.com/software-mansion-labs/react-native-nano-icons)，直接利用原生文本引擎（CoreText / Canvas）绘制分层字形，性能提升数倍；提供全开放的 Custom Icon Resolver 链条。
- **补齐核心原生交互组件**：引入 `Slider`、`StatusDot`、`TwoStepAction`、`GlassSurface`、`EdgeFade`、`MarqueeText`、`TransientPill`。
- **引入 Agent 时代的 AI Elements**：吸收 shadcn 2026-10 AI Elements，原生实现 `Trace`、`CodeBlock`、`Reasoning`、`ToolCall`、`PromptInput`。
- **坚持零运行时开销的原生样式 (Pure Native StyleSheet)**：杜绝 CSS-in-JS 运行时计算，使用 Yoga 原生扁平化（`collapsable={true}`）保障极限帧率。

---

## 2. 核心架构设计 (Architectural Pillars)

### 支柱一：Vercel 复合组件模式 (Compound Components)

全面替换 1.x 的单体 props 设计，所有容器与控制组件均分解为复合部件：

```tsx
// 1.x 封闭模式 (Antipattern)
<Button variant="primary" leftIcon="Search">Submit</Button>

// 2.0.0 复合模式 (Compound Pattern)
<Button.Root variant="primary">
  <Button.Background />
  <Button.Icon name="Search" />
  <Button.Label>Submit</Button.Label>
</Button.Root>
```

#### 复合组件清单：

- **`Surface`**：`Surface.Root`, `Surface.Background`, `Surface.Content`
- **`Card`**：`Card.Root`, `Card.Background`, `Card.Header`, `Card.Content`, `Card.Footer`
- **`Button`**：`Button.Root`, `Button.Background`, `Button.Label`, `Button.Icon`, `Button.Spinner`
- **`CodeBlock`**：`CodeBlock.Root`, `CodeBlock.Header`, `CodeBlock.Title`, `CodeBlock.Actions`, `CodeBlock.Content`, `CodeBlock.Line`
- **`Trace`**：`Trace.Root`, `Trace.Item`, `Trace.Header`, `Trace.Title`, `Trace.Badge`, `Trace.Content`, `Trace.Action`
- **`Reasoning`**：`Reasoning.Root`, `Reasoning.Trigger`, `Reasoning.Duration`, `Reasoning.Content`
- **`ToolCall`**：`ToolCall.Root`, `ToolCall.Header`, `ToolCall.Name`, `ToolCall.Status`, `ToolCall.Payload`, `ToolCall.Result`
- **`PromptInput`**：`PromptInput.Root`, `PromptInput.Textarea`, `PromptInput.Actions`, `PromptInput.AttachmentSlot`, `PromptInput.SubmitButton`

> **向后兼容性**：保留简写形式（如 `<Button>Submit</Button>`、`<Card variant="raised">...</Card>`），其内部直接组合默认部件。

---

### 支柱二：表面装饰层依赖注入 (`SurfaceDecoratorContext`)

业务端（如 `muqun/app`）与 UI 库通过通用 Context 契约解耦：

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
	/** 动态背景色换算（如业务透明度策略计算） */
	transformBackground?: (baseColor: string, meta: SurfaceMeta) => string;
	/** 装饰层/插画/背景图插槽渲染 */
	renderDecoration?: (meta: SurfaceMeta) => React.ReactNode;
}
```

#### 消费示例：

1. **默认环境**：不挂 Provider 时，组件直接展示标准 Token 纯色。
2. **App 端接入主题包**：

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

3. **AI / API 定制背景图**：

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

---

### 支柱三：高性能 NanoIcons 与可定制图标解析系统

#### 1. 渲染性能分层

- **Layer 1（Native Glyph Stack）**：通过 `react-native-nano-icons` 在构建期将 SVG 编译为分层 TTF 字体与 `.glyphmap.json`，运行时由 iOS CoreText / Android Canvas 直接绘制字形，绕过 React Native 虚拟 DOM 和 SVG XML 解析。
- **Layer 2（Custom Theme Resolvers）**：通过 `IconProvider` 注入解析链：
  - `Theme Manifest Icons`（支持 `chrome.send`, `chrome.back`, `chrome.scan` 等动态资产覆盖）
  - 方向旋转变换：`iconDirections`（支持 8 方向角度自适应计算）
  - 染色模式：`template`（跟随前景色染色）与 `original`（保持原始多色）
- **Layer 3（Lucide / SVG Fallback）**：未匹配到字形时，平滑降级至矢量组件。

---

### 支柱四：补齐原生交互与视觉质感组件

1. **`Slider`**：跨平台原生滑块（支持可选 `@expo/ui/swift-ui` 与 RN 手势引擎降级）。
2. **`StatusDot`**：实心/空心状态点、状态突变微缩放动画、在线活跃波纹脉冲（Ripple）。
3. **`TwoStepAction`**：防误触二次确认内联组件，带倒计时排空线（`drain` 进度条）。
4. **`EdgeFade`**：滚动区域（水平/垂直）边缘羽化线性渐变遮罩。
5. **`GlassSurface`**：iOS 26+ Liquid Glass (`expo-glass-effect`) 原生透视玻璃，自动降级为 `expo-blur` 或半透明着色。
6. **`MarqueeText`**：单行文本超出容器时在 UI 线程平滑往返滚动，消除 `…` 截断。
7. **`TransientPill`**：手势/操作即时反馈的浮动胶囊气泡。
8. **排版系统健壮性修复**：
   - 输入框占位符由现有 `Input`、`SearchInput`、`Textarea`、`PromptInput` 用 `Text` 绘制，修复 Android 上原生 `placeholder` 无法继承自定义字体的问题。不另增公开组件。
   - `HugSlack`：修复 Android 上斜体/宽字符在行末被裁切削边的问题（末尾追加 `\u2009` 薄空格）。

---

### 支柱五：shadcn 2026-10 AI Elements (React Native 版)

1. **`Trace`**：Agent 执行追踪链组件。
   - 包含状态：`pending` | `running` | `success` | `error`。
   - `running` 状态具备脉冲/微光指示器，支持多级折叠嵌套。
2. **`CodeBlock`**：代码与工具输出块。
   - 支持 `default`、`terminal`、`diff`（`+`/`-` 高亮）、`compact` 模式，内置代码复制触发器。
3. **`Reasoning`**：思维链（Chain of Thought）折叠卡片，包含思考耗时徽标与流式展开动效。
4. **`ToolCall`**：工具调用标准化卡片，展示入参与结果。
5. **`PromptInput`**：多行自动伸缩提示词输入台，支持附件槽与操作按钮组。

---

### 支柱六：原生样式与极致性能原则 (Native Styles & Performance)

#### 1. 为什么坚决使用原生 `StyleSheet`？

- **零 JS 解析负担**：RN `StyleSheet.create` 在初始化时完成样式扁平化和 ID 分配，通过 JSI 映射到底层 C++ Yoga 节点。
- **杜绝运行时 Microhang**：在 AI 流式输出（高频 Token 触发每秒几十次重绘）场景下，CSS-in-JS 或类名计算会占用 JS 单线程并引发高频垃圾回收（GC），造成掉帧和微卡顿。
- **原生视图扁平化 (View Flattening)**：复合组件的 Background 与装饰层容器必须显式配置 `collapsable={true}`，让原生渲染树自动折叠无事件容器，保持 Native 视图层级极浅。

#### 2. 全局颜色与对比度高速缓存 (LRU Cache)

- 将 WCAG 4.5:1 / 3:1 对比度与透明度算力移出组件 render 循环，使用全局 LRU Cache 缓存 `(baseColor, alpha) => calculatedFill`。

---

## 3. 依赖治理策略 (Dependencies Strategy)

```
packages/ui/package.json (2.0.0)
```

### 1. 彻底移除的强依赖

- 移除 `lucide-react-native` 全量依赖（改为解耦并按需注入）。
- `react-native-svg` 降级为可选。

### 2. 可选 Peer Dependencies 矩阵

- `react-native-nano-icons` (推荐，高性能字形引擎)
- `expo-glass-effect` (可选，iOS 26 Liquid Glass)
- `expo-blur` (可选，毛玻璃)
- `@expo/ui` (可选，SwiftUI 原生组件)
- `react-native-reanimated` (可选，UI 线程微交互动效)
- `react-native-keyboard-controller` (可选，交互式键盘滚动)
- `expo-image` (可选，高性能媒体缓存)

所有可选依赖均具备**无抛错自省与平滑降级（Graceful Fallback）机制**。

---

## 4. 分支规划与多代理分工 (Execution Roadmap)

- **Git 分支**: `feat/composition-theming-icons` (在 `/home/ryu/Work/kit` 检出)
- **绝对边界**: 严禁修改 `/home/ryu/Work/muqun/app` 代码，所有工作集中在 `kit/packages/ui`。

### 阶段与任务拆分：

1. **Track 1: 装饰器系统与核心复合组件**
   - 实现 `packages/ui/src/theme/decorator-context.ts` 与 LRU 缓存。
   - 重构 `surface.tsx`, `card.tsx`, `button.tsx` 为复合组件。
2. **Track 2: 高性能 NanoIcons 图标架构**
   - 重构 `icon.tsx`，创建 `IconContext`、`IconProvider`、NanoIcons 适配器、方向角度旋转与染色管道。
3. **Track 3: 原生交互与视觉质感原语**
   - 实现 `slider.tsx`, `status-dot.tsx`, `two-step-action.tsx`, `edge-fade.tsx`, `glass-surface.tsx`, `marquee-text.tsx`, `transient-pill.tsx`。
4. **Track 4: AI Elements 体系 (shadcn 2026-10)**
   - 实现 `trace.tsx`, `code-block.tsx`, `reasoning.tsx`, `tool-call.tsx`, `prompt-input.tsx`。
5. **Track 5: 公共契约与版本升级**
   - 在 `packages/ui/src/components/index.ts` 集中导出所有新原语。
   - 更新 `package.json` 版本至 `2.0.0`。
   - 验证 `bun test` 与 `tsc --noEmit`。

---

## 5. 后续接手 AI 指南 (Handover Guide for AI Agents)

任何后续接手此仓库的 AI 代理，应遵循以下规则：

1. **阅读规范**：在修改或扩展任何组件前，查阅本文件与 `/home/ryu/.agents/skills/vercel-composition-patterns/AGENTS.md`。
2. **坚持复合模式**：严禁往核心组件中增加布尔模式开关（如 `isThemed`, `showDiff`, `hasIcon`），必须通过复合子部件或 Context 接口进行扩展。
3. **保持零路径污染**：`packages/ui` 内严禁出现任何 `@/` 应用层路径，必须使用相对路径保持完全独立。
4. **验证契约**：每次更改后，运行 `bun src/public-contract.test.ts` 与 `tsc --noEmit`，确保所有 `.tsx` 文件均已在 `components/index.ts` 登记且类型完备。
