import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
	Alert,
	Avatar,
	AvatarGroup,
	Badge,
	Button,
	Card,
	Checkbox,
	CodeBlock,
	Dialog,
	Divider,
	EdgeFade,
	FieldGroup,
	GlassSurface,
	Icon,
	IconProvider,
	InlineActivity,
	Input,
	KeyboardAwareScrollView,
	MarqueeText,
	MetricCard,
	Modal,
	OtpInput,
	ProgressBar,
	PromptInput,
	RadioGroup,
	Reasoning,
	ResponsiveContainer,
	Screen,
	SearchInput,
	Section,
	SegmentedControl,
	Sheet,
	Skeleton,
	Slider,
	StatusDot,
	Stepper,
	Surface,
	SurfaceDecoratorProvider,
	Tag,
	Text,
	Timeline,
	Toggle,
	ToolCall,
	TopBar,
	Trace,
	TransientPill,
	TwoStepAction,
	createNanoIconSet,
	useTheme,
	useToast,
	type IconDirection,
	type IconName,
} from "@osuki-dev/ui";

// Custom Nano Icon Set registration demo
const demoNanoIcons = createNanoIconSet({
	CustomSparkle: {
		render: ({ size, color }: { size: number; color: string }) => (
			<View
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: color,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<View
					style={{
						width: size / 3,
						height: size / 3,
						backgroundColor: "#fff",
						transform: [{ rotate: "45deg" }],
					}}
				/>
			</View>
		),
	},
	CustomBot: {
		render: ({ size, color }: { size: number; color: string }) => (
			<View
				style={{
					width: size,
					height: size,
					borderRadius: 4,
					borderWidth: 2,
					borderColor: color,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<View
					style={{
						width: size / 2,
						height: 2,
						backgroundColor: color,
					}}
				/>
			</View>
		),
	},
});

type CategoryKey =
	| "all"
	| "ai"
	| "composition"
	| "nano-icons"
	| "visual"
	| "forms"
	| "feedback"
	| "data"
	| "templates";

const CATEGORIES: { key: CategoryKey; label: string; icon: IconName }[] = [
	{ key: "all", label: "All (77)", icon: "Layers" },
	{ key: "ai", label: "AI Elements", icon: "Sparkles" },
	{ key: "composition", label: "2.0.0 Theming", icon: "Palette" },
	{ key: "nano-icons", label: "Nano Icons", icon: "Compass" },
	{ key: "visual", label: "Visual & Motion", icon: "Activity" },
	{ key: "forms", label: "Forms & Controls", icon: "Sliders" },
	{ key: "feedback", label: "Feedback & Overlays", icon: "Bell" },
	{ key: "data", label: "Data Display", icon: "LayoutGrid" },
	{ key: "templates", label: "Kit Templates", icon: "Smartphone" },
];

const TEMPLATE_CARDS = [
	{
		title: "Feed & Social",
		route: "/feed",
		icon: "LayoutList",
		desc: "Infinite stream & post cards",
	},
	{ title: "File Browser", route: "/files", icon: "Folder", desc: "Storage, breadcrumbs & items" },
	{
		title: "Media Player",
		route: "/player",
		icon: "PlayCircle",
		desc: "Audio track scrubber & playback",
	},
	{
		title: "Forms & Validation",
		route: "/forms",
		icon: "FileText",
		desc: "Zod + TanStack form validation",
	},
	{
		title: "Operations Hub",
		route: "/operations",
		icon: "Activity",
		desc: "Deployment & infrastructure logs",
	},
	{
		title: "Calendar & Events",
		route: "/calendar",
		icon: "Calendar",
		desc: "Date scheduling & agenda cards",
	},
	{
		title: "Security & Keys",
		route: "/security-screen",
		icon: "Shield",
		desc: "2FA, biometric & session control",
	},
	{
		title: "Notifications",
		route: "/notifications",
		icon: "Bell",
		desc: "System, user & inbox center",
	},
	{
		title: "Orders History",
		route: "/orders",
		icon: "Package",
		desc: "Order tracking & status timeline",
	},
	{
		title: "Checkout Flow",
		route: "/checkout",
		icon: "CreditCard",
		desc: "Payment, address & bag summary",
	},
	{
		title: "Product Detail",
		route: "/product",
		icon: "ShoppingBag",
		desc: "Gallery, variant pills & specs",
	},
	{
		title: "Article & Reader",
		route: "/article",
		icon: "BookOpen",
		desc: "CJK typography & article layout",
	},
];

export default function KitShowcaseScreen() {
	const { colors, mode, toggleMode } = useTheme();
	const { showToast } = useToast();
	const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");

	// Decorator playground theme state
	const [activeDecoratorTheme, setActiveDecoratorTheme] = useState<
		"none" | "blueprint" | "cyber" | "mesh"
	>("none");

	// AI Elements interactive state
	const [promptValue, setPromptValue] = useState(
		"Refactor the authentication flow to use WebAuthn credentials",
	);
	const [promptLoading, setPromptLoading] = useState(false);
	const [codeBlockMode, setCodeBlockMode] = useState<"diff" | "terminal" | "compact">("diff");

	// Nano icon rotation state
	const [iconDirection, setIconDirection] = useState<IconDirection>("up");
	const directions: IconDirection[] = [
		"up",
		"up-right",
		"right",
		"down-right",
		"down",
		"down-left",
		"left",
		"up-left",
	];

	// Visual primitives state
	const [sliderValue, setSliderValue] = useState(72);

	// Forms & inputs state
	const [textInput, setTextInput] = useState("");
	const [searchValue, setSearchValue] = useState("");
	const [stepperValue, setStepperValue] = useState(3);
	const [radioValue, setRadioValue] = useState("pro");
	const [checkboxChecked, setCheckboxChecked] = useState(true);
	const [toggleActive, setToggleActive] = useState(true);
	const [otpValue, setOtpValue] = useState("7294");

	// Overlay states
	const [modalVisible, setModalVisible] = useState(false);
	const [dialogVisible, setDialogVisible] = useState(false);
	const [sheetVisible, setSheetVisible] = useState(false);

	const handlePromptSubmit = useCallback(
		(text: string) => {
			setPromptLoading(true);
			showToast({
				title: "Prompt Submitted",
				message: `Agent dispatched: "${text.slice(0, 32)}..."`,
				variant: "info",
			});
			setTimeout(() => {
				setPromptLoading(false);
				setPromptValue("");
			}, 1200);
		},
		[showToast],
	);

	const decoratorContextValue = useMemo(() => {
		switch (activeDecoratorTheme) {
			case "blueprint":
				return {
					transformBackground: () => "#0b2545",
				};
			case "cyber":
				return {
					transformBackground: () => "#1e1b4b",
				};
			case "mesh":
				return {
					transformBackground: () => "#2e1065",
				};
			default:
				return {};
		}
	}, [activeDecoratorTheme]);

	return (
		<SurfaceDecoratorProvider {...decoratorContextValue}>
			<IconProvider resolve={demoNanoIcons.resolve}>
				<Screen style={[styles.screen, { backgroundColor: colors.background }]}>
					<TopBar
						title="Kit 2.0.0 Showcase"
						onBack={() => router.back()}
						actions={[
							{
								icon: mode === "dark" ? "Sun" : "Moon",
								onPress: toggleMode,
								label: "Toggle Theme",
							},
						]}
					/>

					{/* Header summary banner */}
					<Surface variant="raised" style={styles.bannerSurface}>
						<Surface.Root style={styles.bannerRow}>
							<Surface.Background />
							<Surface.Content style={styles.bannerContent}>
								<View style={styles.bannerHeader}>
									<Badge variant="primary" display="label">
										SDK 2.0.0
									</Badge>
									<Text variant="caption" colorKey="textMuted">
										77 Primitives & Templates
									</Text>
								</View>
								<Text variant="heading" colorKey="text">
									Osuki Kit Showcase & Design System
								</Text>
								<Text variant="bodySmall" colorKey="textMuted">
									Zero-runtime CSS-in-JS overhead, pure native styles, Vercel composition patterns,
									Nano Icons, and 2026-10 AI Elements.
								</Text>
							</Surface.Content>
						</Surface.Root>
					</Surface>

					{/* Category navigation horizontal strip */}
					<View style={styles.categoryBar}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoryScroll}
						>
							{CATEGORIES.map((cat) => {
								const active = activeCategory === cat.key;
								return (
									<Pressable
										key={cat.key}
										onPress={() => setActiveCategory(cat.key)}
										style={[
											styles.categoryChip,
											{
												backgroundColor: active ? colors.primary : colors.surface,
												borderColor: active ? colors.primary : colors.border,
											},
										]}
									>
										<Icon
											name={cat.icon}
											size={16}
											color={active ? colors.onPrimary : colors.textMuted}
										/>
										<Text
											variant="label"
											style={{
												color: active ? colors.onPrimary : colors.text,
												marginLeft: 6,
												fontSize: 13,
											}}
										>
											{cat.label}
										</Text>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>

					<KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
						<ResponsiveContainer maxWidth="lg">
							{/* ========================================================================= */}
							{/* SECTION 1: AI ELEMENTS                                                    */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "ai") && (
								<Section
									title="2026-10 shadcn AI Elements"
									description="Agent-native interaction primitives: streaming thought reasoning, execution traces, code diff blocks, tool call cards, and multiline composer."
									style={styles.section}
								>
									{/* PromptInput */}
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											PROMPT INPUT (MULTI-LINE COMPOSER)
										</Text>
										<PromptInput.Root
											value={promptValue}
											onValueChange={setPromptValue}
											onSubmit={handlePromptSubmit}
											loading={promptLoading}
										>
											<PromptInput.Textarea placeholder="Ask AI anything or instruct an agent..." />
											<PromptInput.Actions>
												<PromptInput.AttachmentSlot>
													<Badge variant="default" display="label">
														📎 package.json
													</Badge>
												</PromptInput.AttachmentSlot>
												<PromptInput.SubmitButton onPress={() => handlePromptSubmit(promptValue)} />
											</PromptInput.Actions>
										</PromptInput.Root>
									</Card>

									{/* CodeBlock */}
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<View style={styles.rowBetween}>
											<Text variant="label" colorKey="textMuted">
												CODE BLOCK (DIFF & SYNTAX VIEWER)
											</Text>
											<SegmentedControl
												options={[
													{ label: "Diff", value: "diff" },
													{ label: "Terminal", value: "terminal" },
													{ label: "Compact", value: "compact" },
												]}
												value={codeBlockMode}
												onChange={(v) => setCodeBlockMode(v as any)}
											/>
										</View>

										<CodeBlock.Root
											variant={codeBlockMode}
											code={`// Compound Button with Surface Decorator\nexport const Button = Object.assign(ButtonRoot, {\n  Background: ButtonBackground,\n  Label: ButtonLabel,\n  Icon: ButtonIcon,\n});`}
											style={{ marginTop: 12 }}
										>
											<CodeBlock.Header>
												<CodeBlock.Title>packages/ui/src/components/button.tsx</CodeBlock.Title>
												<CodeBlock.Actions>
													<CodeBlock.CopyButton
														onCopy={() => {
															showToast({
																title: "Code Copied",
																message: "Button snippet copied to clipboard",
																variant: "success",
															});
														}}
													/>
												</CodeBlock.Actions>
											</CodeBlock.Header>
											<CodeBlock.Content>
												{codeBlockMode === "diff" ? (
													<>
														<CodeBlock.Line type="delete" lineNumber={1}>
															- export function Button(props: ButtonProps)
														</CodeBlock.Line>
														<CodeBlock.Line type="add" lineNumber={1}>
															+ export const Button = Object.assign(ButtonRoot, {"{"}
														</CodeBlock.Line>
														<CodeBlock.Line type="add" lineNumber={2}>
															+ Background: ButtonBackground,
														</CodeBlock.Line>
														<CodeBlock.Line type="add" lineNumber={3}>
															+ Label: ButtonLabel,
														</CodeBlock.Line>
														<CodeBlock.Line type="add" lineNumber={4}>
															+ Icon: ButtonIcon,
														</CodeBlock.Line>
														<CodeBlock.Line type="add" lineNumber={5}>
															+ {"}"});
														</CodeBlock.Line>
													</>
												) : (
													<>
														<CodeBlock.Line type="normal" lineNumber={1}>
															$ bun run check:ci
														</CodeBlock.Line>
														<CodeBlock.Line type="normal" lineNumber={2}>
															✓ 77 primitives verified [0 errors]
														</CodeBlock.Line>
														<CodeBlock.Line type="normal" lineNumber={3}>
															✓ Full turbo test PASS
														</CodeBlock.Line>
													</>
												)}
											</CodeBlock.Content>
										</CodeBlock.Root>
									</Card>

									{/* Reasoning & ToolCall */}
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											REASONING ACCORDION & TOOL CALL
										</Text>
										<Reasoning.Root durationSeconds={3.4} isStreaming={false}>
											<Reasoning.Trigger>
												<Text variant="label">Chain-of-thought analysis (3.4s)</Text>
											</Reasoning.Trigger>
											<Reasoning.Content>
												<Text variant="bodySmall" colorKey="textMuted">
													1. Inspected peer dependencies and isolated monolithic icon tree. 2.
													Replaced static imports with dynamic safeRequire pattern. 3. Re-verified
													Yoga collapsable layout bounds on Android emulator.
												</Text>
											</Reasoning.Content>
										</Reasoning.Root>

										<ToolCall.Root status="success" style={{ marginTop: 12 }}>
											<ToolCall.Header>
												<ToolCall.Name>run_command</ToolCall.Name>
												<ToolCall.Status />
											</ToolCall.Header>
											<ToolCall.Payload>
												<Text variant="caption" colorKey="textMuted">
													CommandLine: "bun run check:ci"
												</Text>
											</ToolCall.Payload>
											<ToolCall.Result>
												<Text variant="caption" colorKey="text">
													0 errors, 8 tasks successful (FULL TURBO)
												</Text>
											</ToolCall.Result>
										</ToolCall.Root>
									</Card>

									{/* Trace Workflow */}
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											TRACE EXECUTION TREE
										</Text>
										<Trace.Root>
											<Trace.Item status="success">
												<Trace.Header>
													<Trace.Title>read_file: /kit/packages/ui/package.json</Trace.Title>
													<Trace.Badge>12ms</Trace.Badge>
												</Trace.Header>
												<Trace.Content>
													<Text variant="caption" colorKey="textMuted">
														Validated version 2.0.0 and exports mapping
													</Text>
												</Trace.Content>
											</Trace.Item>
											<Trace.Item status="success">
												<Trace.Header>
													<Trace.Title>compile_yoga_layout</Trace.Title>
													<Trace.Badge>45ms</Trace.Badge>
												</Trace.Header>
												<Trace.Content>
													<Text variant="caption" colorKey="textMuted">
														collapsable=true applied to Surface.Background
													</Text>
												</Trace.Content>
											</Trace.Item>
											<Trace.Item status="running">
												<Trace.Header>
													<Trace.Title>agent_execution_loop</Trace.Title>
													<Trace.Badge>IN FLIGHT</Trace.Badge>
												</Trace.Header>
												<Trace.Content>
													<Text variant="caption" colorKey="textMuted">
														Evaluating user prompt on port 5562 emulator
													</Text>
												</Trace.Content>
											</Trace.Item>
										</Trace.Root>
									</Card>
								</Section>
							)}

							{/* ========================================================================= */}
							{/* SECTION 2: 2.0.0 COMPOSITION & THEMING DECORATORS                          */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "composition") && (
								<Section
									title="Vercel Composition Patterns & Theming"
									description="SurfaceDecoratorContext allows apps to inject custom background patterns and color contrast transformations without touching UI primitive source code."
									style={styles.section}
								>
									<Card variant="raised" border="subtle" padding="md">
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											SURFACE DECORATOR PLAYGROUND
										</Text>
										<SegmentedControl
											options={[
												{ label: "Default", value: "none" },
												{ label: "Blueprint", value: "blueprint" },
												{ label: "Cyber Dots", value: "cyber" },
												{ label: "Warm Mesh", value: "mesh" },
											]}
											value={activeDecoratorTheme}
											onChange={(v) => setActiveDecoratorTheme(v as any)}
										/>

										{/* Live decorated card showcasing compound primitives */}
										<View style={{ marginTop: 16 }}>
											<Card.Root style={styles.compoundCard}>
												<Card.Background />
												<Card.Header>
													<View style={styles.rowBetween}>
														<Text variant="subheading">Compound Card.Root</Text>
														<Tag variant="active">Active Decorator</Tag>
													</View>
													<Text variant="caption" colorKey="textMuted">
														Active Pattern: {activeDecoratorTheme.toUpperCase()}
													</Text>
												</Card.Header>
												<Card.Content>
													<Text variant="bodySmall">
														Background rendering is cleanly delegated to `Card.Background` with Yoga
														`collapsable={true}`. The contents read contrast and accent tint from
														`SurfaceDecoratorContext`.
													</Text>
												</Card.Content>
												<Card.Footer>
													<Button.Root variant="primary">
														<Button.Background />
														<Button.Icon name="Sparkles" />
														<Button.Label>Compound Button</Button.Label>
													</Button.Root>
													<Button.Root
														variant="secondary"
														onPress={() =>
															showToast({
																title: "Secondary Action",
																message: "Compound secondary button tapped",
															})
														}
													>
														<Button.Background />
														<Button.Label>Action</Button.Label>
													</Button.Root>
												</Card.Footer>
											</Card.Root>
										</View>
									</Card>
								</Section>
							)}

							{/* ========================================================================= */}
							{/* SECTION 3: NANO ICONS & 8-DIRECTION ROTATION                             */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "nano-icons") && (
								<Section
									title="Nano Icons & 8-Direction Rotation"
									description="Lightweight icon architecture referencing react-native-nano-icons with 8-direction geometric angle math and custom icon set injection."
									style={styles.section}
								>
									<Card variant="raised" border="subtle" padding="md">
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											INTERACTIVE ROTATION WHEEL (DIRECTION: {iconDirection})
										</Text>
										<View style={styles.directionGrid}>
											{directions.map((dir) => (
												<Pressable
													key={dir}
													onPress={() => setIconDirection(dir)}
													style={[
														styles.directionButton,
														{
															backgroundColor:
																iconDirection === dir ? colors.primary : colors.surface,
															borderColor: iconDirection === dir ? colors.primary : colors.border,
														},
													]}
												>
													<Text
														variant="caption"
														style={{
															color: iconDirection === dir ? colors.onPrimary : colors.text,
															fontWeight: "700",
														}}
													>
														{dir}
													</Text>
												</Pressable>
											))}
										</View>

										<View style={styles.iconShowcaseRow}>
											<View style={styles.iconShowcaseBox}>
												<Icon
													name="Navigation"
													size={36}
													direction={iconDirection}
													color={colors.primary}
												/>
												<Text variant="caption" colorKey="textMuted">
													Navigation
												</Text>
											</View>
											<View style={styles.iconShowcaseBox}>
												<Icon
													name="ArrowUp"
													size={36}
													direction={iconDirection}
													color={colors.primary}
												/>
												<Text variant="caption" colorKey="textMuted">
													ArrowUp
												</Text>
											</View>
											<View style={styles.iconShowcaseBox}>
												<Icon
													name="Compass"
													size={36}
													direction={iconDirection}
													color={colors.primary}
												/>
												<Text variant="caption" colorKey="textMuted">
													Compass
												</Text>
											</View>
											<View style={styles.iconShowcaseBox}>
												<Icon
													name="CustomSparkle"
													size={36}
													direction={iconDirection}
													color={colors.primary}
												/>
												<Text variant="caption" colorKey="textMuted">
													Custom Nano
												</Text>
											</View>
										</View>
									</Card>
								</Section>
							)}

							{/* ========================================================================= */}
							{/* SECTION 4: VISUAL & MOTION PRIMITIVES                                     */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "visual") && (
								<Section
									title="Visual & Motion Primitives"
									description="High-performance feedback and animation primitives: hardware-accelerated slider, pulse radar dots, two-step confirmation, and glass surfaces."
									style={styles.section}
								>
									{/* Slider */}
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<View style={styles.rowBetween}>
											<Text variant="label" colorKey="textMuted">
												SLIDER (VALUE: {Math.round(sliderValue)}%)
											</Text>
											<Badge variant="primary" display="label">
												{`${Math.round(sliderValue)}%`}
											</Badge>
										</View>
										<View style={{ marginTop: 8 }}>
											<Slider
												value={sliderValue}
												onValueChange={setSliderValue}
												minimumValue={0}
												maximumValue={100}
											/>
										</View>
									</Card>

									{/* StatusDot & TwoStepAction */}
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											STATUS DOTS (PULSE RIPPLE & TONES)
										</Text>
										<View style={styles.statusDotRow}>
											<View style={styles.dotItem}>
												<StatusDot filled tone="success" pulse size={10} />
												<Text variant="caption" style={{ marginLeft: 8 }}>
													Online (Radar Pulse)
												</Text>
											</View>
											<View style={styles.dotItem}>
												<StatusDot filled={false} tone="warning" size={10} />
												<Text variant="caption" style={{ marginLeft: 8 }}>
													Connecting (Hollow)
												</Text>
											</View>
											<View style={styles.dotItem}>
												<StatusDot filled tone="danger" size={10} />
												<Text variant="caption" style={{ marginLeft: 8 }}>
													Offline
												</Text>
											</View>
										</View>

										<Divider style={{ marginVertical: 14 }} />

										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											TWO-STEP DESTRUCTIVE ACTION
										</Text>
										<TwoStepAction
											label="RESET ALL APP CACHE"
											confirmLabel="TAP AGAIN TO CONFIRM DRAIN"
											detail="Clears local temporary stores and token caches."
											onConfirm={() => {
												showToast({
													title: "Cache Cleared",
													message: "TwoStepAction completed successfully.",
													variant: "success",
												});
											}}
										/>
									</Card>

									{/* GlassSurface & MarqueeText & EdgeFade */}
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											GLASS SURFACE & MARQUEE TEXT & EDGE FADE
										</Text>
										<GlassSurface
											face="floating"
											style={{ padding: 14, borderRadius: 12, marginBottom: 12 }}
										>
											<Text variant="bodySmall" style={{ fontWeight: "600" }}>
												GlassSurface: Adaptive Apple Liquid Glass / Blur / Translucent View
											</Text>
											<Text variant="caption" colorKey="textMuted">
												Seamlessly adapts between iOS BlurView and Android high-contrast fill.
											</Text>
										</GlassSurface>

										<View
											style={{
												position: "relative",
												borderWidth: 1,
												borderColor: colors.border,
												borderRadius: 8,
												padding: 10,
												overflow: "hidden",
											}}
										>
											<MarqueeText speed={35}>
												Continuous UI-thread hardware-accelerated ticker marquee that scrolls long
												headers and alerts smoothly.
											</MarqueeText>
											<EdgeFade edge="left" size={24} color={colors.surface} />
											<EdgeFade edge="right" size={24} color={colors.surface} />
										</View>

										<View style={{ marginTop: 12, alignItems: "flex-start" }}>
											<TransientPill label="Floating TransientPill Anchor" tone="primary" />
										</View>
									</Card>
								</Section>
							)}

							{/* ========================================================================= */}
							{/* SECTION 5: FORMS & INPUTS CATALOG                                         */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "forms") && (
								<Section
									title="Forms & Input Controls"
									description="Touch-friendly, accessible form controls supporting validation states, numeric inputs, and pickers."
									style={styles.section}
								>
									<Card variant="raised" border="subtle" padding="md">
										<FieldGroup
											label="Standard Input & Clear"
											helper="Supports instant clear action"
										>
											<Input
												placeholder="Enter text..."
												value={textInput}
												onChangeText={setTextInput}
											/>
										</FieldGroup>

										<View style={{ marginTop: 12 }}>
											<SearchInput
												placeholder="Search items, specs, or models..."
												value={searchValue}
												onChangeText={setSearchValue}
												onClear={() => setSearchValue("")}
											/>
										</View>

										<View style={styles.formRow}>
											<View style={{ flex: 1, marginRight: 8 }}>
												<FieldGroup label="Numeric Stepper">
													<Stepper
														value={stepperValue}
														min={1}
														max={10}
														onChange={setStepperValue}
													/>
												</FieldGroup>
											</View>
											<View style={{ flex: 1, marginLeft: 8 }}>
												<FieldGroup label="OTP Input (PIN)">
													<OtpInput length={4} value={otpValue} onChange={setOtpValue} />
												</FieldGroup>
											</View>
										</View>

										<Divider style={{ marginVertical: 14 }} />

										<View style={styles.rowBetween}>
											<Text variant="label">Toggle Switch</Text>
											<Toggle value={toggleActive} onValueChange={setToggleActive} />
										</View>

										<View style={[styles.rowBetween, { marginTop: 12 }]}>
											<Text variant="label">Checkbox Option</Text>
											<Checkbox
												checked={checkboxChecked}
												onToggle={() => setCheckboxChecked(!checkboxChecked)}
											/>
										</View>

										<View style={{ marginTop: 14 }}>
											<FieldGroup label="Radio Group (Plan Selection)">
												<RadioGroup
													value={radioValue}
													onChange={setRadioValue}
													options={[
														{ label: "Starter (Free)", value: "free" },
														{
															label: "Pro Model ($19/mo)",
															value: "pro",
															description: "Includes Agent Cloud & Nano Icons",
														},
													]}
												/>
											</FieldGroup>
										</View>
									</Card>
								</Section>
							)}

							{/* ========================================================================= */}
							{/* SECTION 6: FEEDBACK & OVERLAYS                                            */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "feedback") && (
								<Section
									title="Feedback & Overlays"
									description="App-level toast queue, dialogs, bottom sheets, alerts, and inline busy indicators."
									style={styles.section}
								>
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											ALERTS (INFO, SUCCESS, WARNING, DANGER)
										</Text>
										<Alert
											variant="info"
											title="SDK 2.0.0 Notice"
											message="All 77 components now conform to zero-overhead StyleSheet standards."
											style={{ marginBottom: 8 }}
										/>
										<Alert
											variant="success"
											title="Verification Passed"
											message="45/45 test suites pass cleanly with full turbo caching."
										/>
									</Card>

									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											SKELETON & INLINE ACTIVITY
										</Text>
										<Skeleton variant="rect" lines={2} motion="pulse" />
										<View style={{ marginTop: 14 }}>
											<InlineActivity
												label="Syncing agents on port 5562..."
												active={true}
												size="md"
											/>
										</View>
										<View style={{ marginTop: 14 }}>
											<ProgressBar value={84} tone="neutral" />
										</View>
									</Card>

									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											MODAL, DIALOG & SHEET OVERLAYS
										</Text>
										<View style={styles.buttonWrapRow}>
											<Button
												variant="secondary"
												onPress={() => setModalVisible(true)}
												style={styles.flexBtn}
											>
												Open Modal
											</Button>
											<Button
												variant="secondary"
												onPress={() => setDialogVisible(true)}
												style={styles.flexBtn}
											>
												Open Dialog
											</Button>
											<Button
												variant="secondary"
												onPress={() => setSheetVisible(true)}
												style={styles.flexBtn}
											>
												Open Sheet
											</Button>
										</View>

										<Modal.Root open={modalVisible} onOpenChange={setModalVisible}>
											<Modal.Content>
												<Modal.Header>
													<Modal.HeaderText>
														<Modal.Title>Modal.Root Example</Modal.Title>
														<Modal.Description>
															Centered modal overlay with backdrop dismissal.
														</Modal.Description>
													</Modal.HeaderText>
													<Modal.Close />
												</Modal.Header>
												<Modal.Body>
													<Text variant="bodySmall">
														Centered modal overlay with backdrop tap dismissal and focus trap.
													</Text>
												</Modal.Body>
											</Modal.Content>
										</Modal.Root>

										<Dialog.Root open={dialogVisible} onOpenChange={setDialogVisible}>
											<Dialog.Content>
												<Dialog.Header>
													<Dialog.HeaderText>
														<Dialog.Title>Confirm Action</Dialog.Title>
														<Dialog.Description>
															Are you sure you want to proceed with this operation?
														</Dialog.Description>
													</Dialog.HeaderText>
												</Dialog.Header>
												<Dialog.Actions>
													<Dialog.Close>Cancel</Dialog.Close>
												</Dialog.Actions>
											</Dialog.Content>
										</Dialog.Root>

										<Sheet.Root open={sheetVisible} onOpenChange={setSheetVisible}>
											<Sheet.Content maxHeight="60%">
												<Sheet.Header>
													<Sheet.Title>Sheet.Root Bottom Drawer</Sheet.Title>
												</Sheet.Header>
												<Sheet.Body>
													<Text variant="bodySmall">
														Bottom-anchored responsive sheet container.
													</Text>
												</Sheet.Body>
												<Sheet.Footer>
													<Button onPress={() => setSheetVisible(false)}>Close</Button>
												</Sheet.Footer>
											</Sheet.Content>
										</Sheet.Root>
									</Card>
								</Section>
							)}

							{/* ========================================================================= */}
							{/* SECTION 7: DATA DISPLAY                                                   */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "data") && (
								<Section
									title="Data Display & Grids"
									description="Data tables, metrics, timeline, and avatar groups."
									style={styles.section}
								>
									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											METRIC CARDS & AVATARS
										</Text>
										<View style={styles.formRow}>
											<View style={{ flex: 1, marginRight: 8 }}>
												<MetricCard label="Active Agents" value="1,429" tone="info" />
											</View>
											<View style={{ flex: 1, marginLeft: 8 }}>
												<MetricCard label="Test Pass Rate" value="100%" tone="success" />
											</View>
										</View>

										<View style={[styles.rowBetween, { marginTop: 14 }]}>
											<View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
												<Avatar initials="AG" size="md" isOnline />
												<Text variant="label">Avatar & Group</Text>
											</View>
											<AvatarGroup
												max={4}
												size="md"
												items={[
													{ id: "1", initials: "AP", label: "Agent Prime" },
													{ id: "2", initials: "UI", label: "UI Builder" },
													{ id: "3", initials: "QA", label: "QA Bot" },
													{ id: "4", initials: "RN", label: "React Native" },
												]}
											/>
										</View>
									</Card>

									<Card variant="raised" border="subtle" padding="md" style={styles.cardSpacing}>
										<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
											TIMELINE & DATA TABLE
										</Text>
										<Timeline
											items={[
												{
													id: "step-1",
													title: "Requirement Analysis",
													description: "Compared themed shadow components with kit UI",
													status: "completed",
												},
												{
													id: "step-2",
													title: "V2.0.0 Architecture & Icons",
													description: "Implemented Vercel Composition Patterns & Nano Icons",
													status: "completed",
												},
												{
													id: "step-3",
													title: "Android Emulator QA",
													description: "Verified on emulator-5562 with real screenshots",
													status: "active",
												},
											]}
										/>
									</Card>
								</Section>
							)}

							{/* ========================================================================= */}
							{/* SECTION 8: KIT COMMUNITY SCREEN TEMPLATES HUB                             */}
							{/* ========================================================================= */}
							{(activeCategory === "all" || activeCategory === "templates") && (
								<Section
									title="Kit Community Screen Templates (12 Screens)"
									description="Full-screen production templates from @osuki-dev/kit-community with routing, state management, and localized commerce."
									style={styles.section}
								>
									<View style={styles.templateGrid}>
										{TEMPLATE_CARDS.map((tpl) => (
											<Pressable
												key={tpl.route}
												onPress={() => router.push(tpl.route as any)}
												style={({ pressed }) => [
													styles.templateCard,
													{
														backgroundColor: colors.surface,
														borderColor: colors.border,
														opacity: pressed ? 0.75 : 1,
													},
												]}
											>
												<View style={styles.templateHeader}>
													<View
														style={[styles.templateIconWrap, { backgroundColor: colors.surface }]}
													>
														<Icon name={tpl.icon as IconName} size={20} color={colors.primary} />
													</View>
													<Icon name="ChevronRight" size={16} color={colors.textDisabled} />
												</View>
												<Text variant="subheading" style={{ marginTop: 8 }}>
													{tpl.title}
												</Text>
												<Text variant="caption" colorKey="textMuted" numberOfLines={2}>
													{tpl.desc}
												</Text>
											</Pressable>
										))}
									</View>
								</Section>
							)}
						</ResponsiveContainer>
					</KeyboardAwareScrollView>
				</Screen>
			</IconProvider>
		</SurfaceDecoratorProvider>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	bannerSurface: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#e5e7eb",
	},
	bannerRow: {
		borderRadius: 12,
	},
	bannerContent: {
		padding: 12,
	},
	bannerHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 6,
	},
	categoryBar: {
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#e5e7eb",
	},
	categoryScroll: {
		paddingHorizontal: 16,
		gap: 8,
	},
	categoryChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 64,
	},
	section: {
		marginBottom: 20,
	},
	cardSpacing: {
		marginBottom: 14,
	},
	cardLabel: {
		marginBottom: 8,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	compoundCard: {
		padding: 16,
		borderRadius: 12,
	},
	directionGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 16,
	},
	directionButton: {
		width: 42,
		height: 36,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	iconShowcaseRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		paddingVertical: 8,
	},
	iconShowcaseBox: {
		alignItems: "center",
		gap: 6,
	},
	statusDotRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 16,
		alignItems: "center",
	},
	dotItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	formRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	buttonWrapRow: {
		flexDirection: "row",
		gap: 8,
	},
	flexBtn: {
		flex: 1,
	},
	templateGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	templateCard: {
		width: "48%",
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
	},
	templateHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	templateIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
});
