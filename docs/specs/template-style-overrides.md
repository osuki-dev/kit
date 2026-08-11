# Spec: template-style-overrides

Scope: feature

# Template Style Override Specification

## 概述

为所有模板提供统一的样式覆盖能力，支持容器、头部、内容区域样式以及特定组件样式覆盖。

## 核心接口

### BaseStyleOverrides

所有模板共享的基础样式覆盖接口：

```typescript
interface BaseStyleOverrides {
	// 最外层容器样式
	container?: ViewStyle;
	// 头部区域样式（包含标题、副标题、操作按钮）
	header?: ViewStyle;
	// 内容区域样式
	content?: ViewStyle;
	// 底部区域样式（通常包含操作按钮）
	footer?: ViewStyle;
	// 滚动视图样式
	scrollView?: ScrollViewProps["style"];
	// 内容容器内边距
	contentPadding?: ResponsiveValue<number>;
}
```

### ComponentStyleOverrides

可覆盖的组件样式映射：

```typescript
interface ComponentStyleOverrides {
	// 按钮样式覆盖
	button?: {
		variant?: ButtonVariant;
		size?: ButtonSize;
		style?: ViewStyle;
	};
	// 卡片样式覆盖
	card?: {
		variant?: CardVariant;
		padding?: SpacingToken;
		style?: ViewStyle;
	};
	// 输入框样式覆盖
	input?: {
		variant?: InputVariant;
		size?: InputSize;
		style?: ViewStyle;
	};
	// 文本样式覆盖
	text?: {
		variant?: TextVariant;
		style?: TextStyle;
	};
	// 列表项样式覆盖
	listItem?: {
		style?: ViewStyle;
		iconSize?: number;
	};
}
```

### TemplateProps 基类

所有模板 Props 继承此基类：

```typescript
interface TemplateProps {
	// 样式覆盖配置
	styleOverrides?: BaseStyleOverrides & {
		components?: ComponentStyleOverrides;
	};
	// 主题覆盖（局部主题）
	themeOverride?: Partial<Theme>;
	// 是否禁用默认样式
	disableDefaultStyles?: boolean;
}
```

## 模板特定覆盖

### ProductScreen 额外覆盖

```typescript
interface ProductScreenStyleOverrides extends BaseStyleOverrides {
	// 产品图片区域
	imageSection?: ViewStyle;
	// 产品信息区域（标题、价格、描述）
	infoSection?: ViewStyle;
	// 规格选择区域
	specsSection?: ViewStyle;
	// 购买按钮区域
	purchaseSection?: ViewStyle;
	// 推荐产品区域
	recommendationsSection?: ViewStyle;
}
```

### CartScreen 额外覆盖

```typescript
interface CartScreenStyleOverrides extends BaseStyleOverrides {
	// 商品项样式
	item?: ViewStyle;
	// 商品图片样式
	itemImage?: ViewStyle;
	// 商品信息样式
	itemInfo?: ViewStyle;
	// 数量调整器样式
	quantityControls?: ViewStyle;
	// 结算摘要区域
	summarySection?: ViewStyle;
}
```

### ArticleScreen 额外覆盖

```typescript
interface ArticleScreenStyleOverrides extends BaseStyleOverrides {
	// 文章标题样式
	title?: TextStyle;
	// 作者信息区域
	authorSection?: ViewStyle;
	// 文章内容样式
	body?: TextStyle;
	// 图片样式
	image?: ImageStyle;
	// 标签区域样式
	tagsSection?: ViewStyle;
}
```

### CalendarScreen 额外覆盖

```typescript
interface CalendarScreenStyleOverrides extends BaseStyleOverrides {
	// 日历头部（年月、切换按钮）
	calendarHeader?: ViewStyle;
	// 星期标题行
	weekDaysHeader?: ViewStyle;
	// 日期格子样式
	dayCell?: ViewStyle;
	// 选中日期样式
	selectedDay?: ViewStyle;
	// 今天日期样式
	todayCell?: ViewStyle;
	// 事件指示器样式
	eventIndicator?: ViewStyle;
}
```

## 样式应用优先级

样式应用遵循以下优先级（从高到低）：

1. **内联动态样式** - 组件运行时计算的最具体样式
2. **styleOverrides** - 用户传入的自定义样式
3. **themeOverride** - 用户传入的局部主题
4. **默认模板样式** - 模板自带的默认样式
5. **全局主题** - 应用级别的主题配置

## 使用示例

### 基础样式覆盖

```tsx
<ProductScreen
	config={productConfig}
	styleOverrides={{
		container: { backgroundColor: "#f5f5f5" },
		header: { paddingTop: 20 },
		content: { gap: 16 },
	}}
/>
```

### 组件样式覆盖

```tsx
<CartScreen
	config={cartConfig}
	styleOverrides={{
		container: { padding: 16 },
		components: {
			button: {
				variant: "primary",
				style: { borderRadius: 8 },
			},
			card: {
				variant: "flat",
				padding: "md",
			},
		},
	}}
/>
```

### 主题覆盖

```tsx
<ArticleScreen
	config={articleConfig}
	themeOverride={{
		colors: {
			textPrimary: "#333333",
			textSecondary: "#666666",
		},
		typography: {
			body: {
				fontSize: 16,
				lineHeight: 1.6,
			},
		},
	}}
/>
```

### 完全自定义（禁用默认样式）

```tsx
<ErrorScreen
	config={errorConfig}
	disableDefaultStyles
	styleOverrides={{
		container: customContainerStyle,
		content: customContentStyle,
	}}
/>
```

## 响应式样式

样式覆盖支持响应式值：

```typescript
type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

interface ResponsiveStyleOverrides extends BaseStyleOverrides {
	container?: ResponsiveValue<ViewStyle>;
	contentPadding?: ResponsiveValue<number>;
}
```

使用示例：

```tsx
<ProductScreen
	styleOverrides={{
		container: {
			xs: { padding: 12 },
			md: { padding: 24 },
			lg: { padding: 32 },
		},
	}}
/>
```

## 实现要求

1. 每个模板必须接受 `styleOverrides` prop
2. 样式合并使用 `StyleSheet.flatten()` 或数组形式
3. 组件样式通过 Context 传递给子组件
4. 支持 TypeScript 类型推断
5. 样式覆盖不应破坏模板的响应式行为

## 样式合并工具函数

```typescript
// 合并默认样式和用户覆盖样式
function mergeStyles<T>(defaultStyle: T, override?: T, disableDefault?: boolean): T {
	if (disableDefault) return override || ({} as T);
	if (!override) return defaultStyle;

	return {
		...defaultStyle,
		...override,
	};
}

// 处理响应式样式
function resolveResponsiveStyle<T>(style: ResponsiveValue<T>, breakpoint: Breakpoint): T {
	if (typeof style !== "object" || !("xs" in style)) {
		return style as T;
	}

	const { xs, sm, md, lg, xl, ...base } = style as Record<string, T>;
	const breakpointValue = { xs, sm, md, lg, xl }[breakpoint];

	return breakpointValue || base || xs || ({} as T);
}
```

## 测试要求

1. 每个模板的样式覆盖必须通过视觉回归测试
2. 验证样式优先级正确应用
3. 测试响应式样式在不同屏幕尺寸下的表现
4. 测试 `disableDefaultStyles` 行为
5. 验证主题覆盖不影响其他页面
