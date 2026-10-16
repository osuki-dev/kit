import { useState, useCallback } from "react";
import { CompositionGallery } from "../../components/composition-gallery";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import {
	Screen,
	TopBar,
	Text,
	Card,
	Button,
	Badge,
	Tag,
	Icon,
	Slider,
	StatusDot,
	TwoStepAction,
	GlassSurface,
	MarqueeText,
	EdgeFade,
	TransientPill,
	Input,
	SearchInput,
	Stepper,
	RadioGroup,
	Checkbox,
	Toggle,
	OtpInput,
	FieldGroup,
	SegmentedControl,
	Alert,
	ProgressBar,
	SegmentedProgressBar,
	Spinner,
	InlineActivity,
	Skeleton,
	Avatar,
	AvatarGroup,
	MetricCard,
	StatRow,
	Timeline,
	Dialog,
	BottomSheet,
	Divider,
	PressableScale,
	useTheme,
	useToast,
} from "@osuki-dev/ui";

const PRIMITIVE_GROUPS = [
	{ key: "all", label: "All (77)" },
	{ key: "actions", label: "Buttons & Actions" },
	{ key: "forms", label: "Forms & Controls" },
	{ key: "typography", label: "Badges & Type" },
	{ key: "visual", label: "Visual & Motion" },
	{ key: "feedback", label: "Feedback & Overlays" },
	{ key: "data", label: "Data & Display" },
] as const;

export default function PrimitivesCatalogScreen() {
	const { colors, mode, toggleMode } = useTheme();
	const { showToast } = useToast();

	const [selectedGroup, setSelectedGroup] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Control states
	const [sliderVal, setSliderVal] = useState(65);
	const [stepperVal, setStepperVal] = useState(3);
	const [radioVal, setRadioVal] = useState("option-1");
	const [checkboxVal, setCheckboxVal] = useState(true);
	const [toggleVal, setToggleVal] = useState(true);
	const [otpVal, setOtpVal] = useState("2026");
	const [textVal, setTextVal] = useState("");
	const [segmentedVal, setSegmentedVal] = useState("overview");

	// Overlay states
	const [showDialog, setShowDialog] = useState(false);
	const [showSheet, setShowSheet] = useState(false);

	const isVisible = useCallback(
		(group: string, name: string) => {
			const matchesGroup = selectedGroup === "all" || selectedGroup === group;
			const matchesSearch =
				!searchQuery.trim() || name.toLowerCase().includes(searchQuery.toLowerCase().trim());
			return matchesGroup && matchesSearch;
		},
		[selectedGroup, searchQuery],
	);

	return (
		<Screen style={[styles.screen, { backgroundColor: colors.background }]}>
			<TopBar
				title="UI Primitives"
				subtitle="77 Components · Zero CSS-in-JS Overhead"
				actions={[
					{
						icon: mode === "dark" ? "Sun" : "Moon",
						onPress: toggleMode,
						label: "Toggle Theme",
					},
				]}
			/>

			{/* Search & Counter Bar */}
			<View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
				<View style={styles.searchWrapper}>
					<SearchInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						onClear={() => setSearchQuery("")}
						placeholder="Search 77 primitives (Input, Alert, Card...)"
					/>
				</View>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.groupScroll}
				>
					{PRIMITIVE_GROUPS.map((group) => {
						const active = selectedGroup === group.key;
						return (
							<Pressable
								key={group.key}
								onPress={() => setSelectedGroup(group.key)}
								style={[
									styles.groupChip,
									{
										backgroundColor: active ? colors.primary : colors.surface,
										borderColor: active ? colors.primary : colors.border,
									},
								]}
							>
								<Text
									variant="caption"
									style={{
										color: active ? colors.onPrimary : colors.text,
										fontWeight: "600",
										fontSize: 12,
									}}
								>
									{group.label}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* 0. CORE ACTIONS & BUTTONS */}
				{isVisible("actions", "Button PressableScale TwoStepAction Compound") && (
					<View style={styles.section}>
						<Text variant="heading" colorKey="text" style={styles.sectionTitle}>
							Buttons & Interactive Actions
						</Text>
						<Text variant="caption" colorKey="textMuted" style={styles.sectionDesc}>
							Primary, secondary, destructive and ghost buttons with loading states, leading icons,
							and Vercel-style compound background delegation.
						</Text>

						{/* Button Variants Card */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								BUTTON VARIANTS
							</Text>
							<View style={styles.buttonStack}>
								<Button
									variant="primary"
									leftIcon="Sparkles"
									onPress={() => showToast({ message: "Primary button pressed", variant: "info" })}
								>
									Primary Action
								</Button>

								<View style={styles.buttonRow}>
									<View style={{ flex: 1 }}>
										<Button
											variant="secondary"
											leftIcon="Layers"
											onPress={() =>
												showToast({ message: "Secondary button pressed", variant: "info" })
											}
										>
											Secondary
										</Button>
									</View>
									<View style={{ flex: 1 }}>
										<Button
											variant="destructive"
											leftIcon="Trash2"
											onPress={() =>
												showToast({ message: "Destructive button pressed", variant: "danger" })
											}
										>
											Destructive
										</Button>
									</View>
								</View>

								<Button
									variant="ghost"
									leftIcon="Compass"
									onPress={() => showToast({ message: "Ghost button pressed", variant: "info" })}
								>
									Ghost Action
								</Button>
							</View>

							<Divider style={{ marginVertical: 14 }} />

							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								STATES & ACCESSORIES
							</Text>
							<View style={styles.buttonStack}>
								<Button
									variant="primary"
									loading={true}
									loadingLabel="Engine Processing (Loading)..."
								>
									Submit
								</Button>

								<View style={styles.buttonRow}>
									<View style={{ flex: 1 }}>
										<Button variant="secondary" disabled leftIcon="Lock">
											Disabled
										</Button>
									</View>
									<View style={{ flex: 1 }}>
										<Button
											variant="secondary"
											rightIcon="ArrowRight"
											onPress={() => showToast({ message: "Next Step clicked", variant: "info" })}
										>
											Next Step
										</Button>
									</View>
								</View>
							</View>

							<Divider style={{ marginVertical: 14 }} />

							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								COMPOUND BUTTON.ROOT & HAPTIC SCALE
							</Text>
							<View style={styles.buttonStack}>
								<Button.Root
									variant="primary"
									onPress={() =>
										showToast({ message: "Compound Button.Root tapped", variant: "info" })
									}
								>
									<Button.Background />
									<Button.Icon name="Sparkles" />
									<Button.Label>Compound Button.Root</Button.Label>
								</Button.Root>

								<PressableScale
									feedback="medium"
									pressedScale={0.96}
									onPress={() =>
										showToast({
											message: "PressableScale with spring feedback",
											variant: "info",
										})
									}
									style={[
										styles.pressableScaleButton,
										{ backgroundColor: colors.surfaceRaised, borderColor: colors.border },
									]}
								>
									<Text variant="caption" colorKey="text" style={{ fontWeight: "700" }}>
										PressableScale (Native Spring & Haptic)
									</Text>
								</PressableScale>
							</View>
						</Card>
					</View>
				)}

				{/* 0.1 TYPOGRAPHY & BADGES */}
				{isVisible("typography", "Badge Tag Text Typography") && (
					<View style={styles.section}>
						<Text variant="heading" colorKey="text" style={styles.sectionTitle}>
							Typography Scale & Status Badges
						</Text>
						<Text variant="caption" colorKey="textMuted" style={styles.sectionDesc}>
							Type tokens mapped to Osuki brand fonts, plus pill tags and semantic badges.
						</Text>

						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								SEMANTIC BADGES & TAGS
							</Text>
							<View style={styles.rowGap}>
								<Badge variant="primary" display="label">
									PRIMARY
								</Badge>
								<Badge variant="default" display="label">
									DEFAULT
								</Badge>
								<Badge variant="warning" display="label">
									WARNING
								</Badge>
								<Badge variant="success" display="label">
									99+
								</Badge>
							</View>
							<View style={styles.rowGap}>
								<Tag variant="active">TAG ACTIVE</Tag>
								<Tag variant="default">TAG DEFAULT</Tag>
								<Tag variant="pill">TAG PILL</Tag>
							</View>

							<Divider style={{ marginVertical: 14 }} />

							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								TYPOGRAPHY TOKENS
							</Text>
							<View style={{ gap: 6 }}>
								<Text variant="heading" colorKey="text">
									Heading (20px / 700)
								</Text>
								<Text variant="subheading" colorKey="text">
									Subheading (15px / 600)
								</Text>
								<Text variant="body" colorKey="text">
									Body Text (15px / 400 steady reading font)
								</Text>
								<Text variant="bodySmall" colorKey="textMuted">
									Body Small (13px / 400 muted subtitle)
								</Text>
								<Text variant="label" colorKey="primary">
									LABEL TOKEN (11px / 700 UPPERCASE)
								</Text>
								<Text variant="caption" colorKey="textMuted">
									Caption Token (12px / 400 footnote)
								</Text>
							</View>
						</Card>
					</View>
				)}

				{/* 1. VISUAL & MOTION PRIMITIVES */}
				{isVisible(
					"visual",
					"Slider StatusDot TwoStepAction GlassSurface MarqueeText EdgeFade TransientPill",
				) && (
					<View style={styles.section}>
						<Text variant="heading" colorKey="text" style={styles.sectionTitle}>
							Visual & Motion Primitives
						</Text>
						<Text variant="caption" colorKey="textMuted" style={styles.sectionDesc}>
							Hardware-accelerated sliders, pulse radar dots, confirmation guards, and liquid glass
							blur.
						</Text>

						{/* Slider */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<View style={styles.rowBetween}>
								<Text variant="label" colorKey="text">
									SLIDER ({Math.round(sliderVal)}%)
								</Text>
								<Badge variant="primary" display="label">
									{`${Math.round(sliderVal)}%`}
								</Badge>
							</View>
							<View style={{ marginTop: 10 }}>
								<Slider
									value={sliderVal}
									onValueChange={setSliderVal}
									minimumValue={0}
									maximumValue={100}
								/>
							</View>
							<View style={[styles.rowBetween, { marginTop: 4 }]}>
								<Text variant="caption" colorKey="textMuted">
									0%
								</Text>
								<Text variant="caption" colorKey="textMuted">
									100%
								</Text>
							</View>
						</Card>

						{/* Status Dots */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								STATUS DOTS (RADAR PULSE & TONES)
							</Text>
							<View style={styles.statusRow}>
								<View style={styles.statusItem}>
									<StatusDot filled tone="success" pulse size={10} />
									<Text variant="caption" colorKey="text" style={styles.statusText}>
										Active Pulse
									</Text>
								</View>
								<View style={styles.statusItem}>
									<StatusDot filled tone="neutral" size={10} />
									<Text variant="caption" colorKey="text" style={styles.statusText}>
										Idle
									</Text>
								</View>
								<View style={styles.statusItem}>
									<StatusDot filled tone="warning" size={10} />
									<Text variant="caption" colorKey="text" style={styles.statusText}>
										Warning
									</Text>
								</View>
								<View style={styles.statusItem}>
									<StatusDot filled={false} tone="danger" size={10} />
									<Text variant="caption" colorKey="text" style={styles.statusText}>
										Error
									</Text>
								</View>
							</View>
						</Card>

						{/* Two Step Action */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								TWO-STEP CONFIRMATION GUARD
							</Text>
							<Text variant="caption" colorKey="textMuted" style={{ marginBottom: 10 }}>
								Prevents accidental destructive operations with an inline timed drain window.
							</Text>
							<View
								style={[
									styles.actionWrapper,
									{ borderColor: colors.border, backgroundColor: colors.surfaceRaised },
								]}
							>
								<TwoStepAction
									icon={<Icon name="Trash2" size={16} color={colors.danger} />}
									label="Purge Build Artifacts"
									confirmLabel="Confirm Immediate Purge"
									detail="Irreversibly cleans 42.8 MB temporary cache"
									onConfirm={() =>
										showToast({
											title: "Cache Cleared",
											message: "All temporary cache successfully purged.",
											variant: "success",
										})
									}
								/>
							</View>
						</Card>

						{/* Glass Surface & Marquee */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								GLASS SURFACE & EDGE FADE MARQUEE
							</Text>
							<GlassSurface face="sheet" style={styles.glassDemo}>
								<Text variant="caption" colorKey="textMuted" style={{ textAlign: "center" }}>
									Adaptive GlassSurface (iOS BlurView & Android Fallback)
								</Text>
								<View style={styles.marqueeWrapper}>
									<EdgeFade edge="left" color={colors.surface} size={24} />
									<MarqueeText speed={25}>
										✦ Realtime Design System 2.0.0 ✦ Zero CSS-in-JS Overhead ✦ Native Yoga Layout ✦
										77 Primitives
									</MarqueeText>
									<EdgeFade edge="right" color={colors.surface} size={24} />
								</View>
							</GlassSurface>
							<View style={{ alignItems: "center", marginTop: 12 }}>
								<TransientPill label="Floating Transient Pill" tone="primary" />
							</View>
						</Card>
					</View>
				)}

				{/* 2. FORMS & INPUT CONTROLS */}
				{isVisible(
					"forms",
					"Input SearchInput Stepper RadioGroup Checkbox Toggle OtpInput FieldGroup SegmentedControl",
				) && (
					<View style={styles.section}>
						<Text variant="heading" colorKey="text" style={styles.sectionTitle}>
							Forms & Controls
						</Text>
						<Text variant="caption" colorKey="textMuted" style={styles.sectionDesc}>
							Accessible inputs, segmented switches, pickers, toggles, and validation field groups.
						</Text>

						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<FieldGroup label="STANDARD TEXT INPUT" helper="Native touch-optimized input field">
								<Input
									value={textVal}
									onChangeText={setTextVal}
									placeholder="Enter sample input text..."
								/>
							</FieldGroup>

							{/* Segmented Control */}
							<View style={{ marginTop: 14 }}>
								<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
									SEGMENTED CONTROL
								</Text>
								<SegmentedControl
									value={segmentedVal}
									onChange={setSegmentedVal}
									options={[
										{ value: "overview", label: "Overview" },
										{ value: "tokens", label: "Tokens" },
										{ value: "engine", label: "Engine" },
									]}
								/>
							</View>

							{/* Stepper & Toggle Row */}
							<View style={[styles.formRow, { marginTop: 14 }]}>
								<View style={{ flex: 1 }}>
									<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
										NUMERIC STEPPER
									</Text>
									<Stepper value={stepperVal} onChange={setStepperVal} min={0} max={10} />
								</View>
								<View style={{ flex: 1, paddingLeft: 12 }}>
									<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
										TOGGLE SWITCH
									</Text>
									<View style={styles.toggleRow}>
										<Text variant="bodySmall" colorKey="text">
											{toggleVal ? "Enabled" : "Disabled"}
										</Text>
										<Toggle value={toggleVal} onValueChange={setToggleVal} />
									</View>
								</View>
							</View>

							{/* Checkbox Row */}
							<View style={{ marginTop: 16 }}>
								<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
									CHECKBOX & RADIO GROUP
								</Text>
								<Pressable onPress={() => setCheckboxVal(!checkboxVal)} style={styles.checkboxRow}>
									<Checkbox checked={checkboxVal} onToggle={setCheckboxVal} />
									<Text variant="bodySmall" colorKey="text" style={{ marginLeft: 8 }}>
										Enable GPU hardware layout acceleration
									</Text>
								</Pressable>

								<View style={{ marginTop: 12 }}>
									<RadioGroup
										value={radioVal}
										onChange={setRadioVal}
										options={[
											{ value: "option-1", label: "Fast (Edge Worker Execution)" },
											{ value: "option-2", label: "Balanced (Dual Core Threading)" },
										]}
									/>
								</View>
							</View>

							{/* OTP Input */}
							<View style={{ marginTop: 16 }}>
								<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
									OTP DIGIT VERIFICATION
								</Text>
								<View style={{ alignItems: "center", marginTop: 6 }}>
									<OtpInput value={otpVal} onChange={setOtpVal} length={4} />
								</View>
							</View>
						</Card>
					</View>
				)}

				{/* 3. FEEDBACK & OVERLAYS */}
				{isVisible(
					"feedback",
					"Alert ToastProvider Dialog BottomSheet ProgressBar SegmentedProgressBar Spinner InlineActivity Skeleton",
				) && (
					<View style={styles.section}>
						<Text variant="heading" colorKey="text" style={styles.sectionTitle}>
							Feedback & Overlays
						</Text>
						<Text variant="caption" colorKey="textMuted" style={styles.sectionDesc}>
							Alert banners, modal sheets, progress bars, and activity placeholders.
						</Text>

						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								ALERT BANNERS
							</Text>
							<View style={{ gap: 8 }}>
								<Alert
									variant="info"
									title="System Update"
									message="Kit 2.0.0 architecture active with zero runtime overhead."
								/>
								<Alert
									variant="success"
									title="Compilation Succeeded"
									message="10 Turbo tasks completed in 380ms."
								/>
							</View>

							<View style={{ marginTop: 16 }}>
								<View style={styles.rowBetween}>
									<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
										PROGRESS INDICATORS
									</Text>
									<Badge variant="primary" display="label">
										68%
									</Badge>
								</View>
								<ProgressBar value={68} />
								<View style={{ marginTop: 8 }}>
									<SegmentedProgressBar value={75} segments={4} status="success" />
								</View>
							</View>

							<View style={{ marginTop: 16 }}>
								<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
									ACTIVITY & SKELETON PLACEHOLDERS
								</Text>
								<View style={[styles.rowGap, { marginTop: 6 }]}>
									<InlineActivity active={true} label="Syncing database..." />
									<View
										style={{ flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 16 }}
									>
										<Spinner size="sm" />
										<Text variant="caption" colorKey="textMuted">
											Spinner
										</Text>
									</View>
								</View>
								<View style={[styles.rowGap, { marginTop: 10 }]}>
									<Skeleton width={140} height={16} />
									<Skeleton width={80} height={16} />
								</View>
							</View>

							<View style={{ marginTop: 16 }}>
								<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
									MODAL OVERLAYS
								</Text>
								<View style={styles.rowGap}>
									<Button variant="secondary" onPress={() => setShowDialog(true)}>
										Open Dialog
									</Button>
									<Button variant="secondary" onPress={() => setShowSheet(true)}>
										Open Bottom Sheet
									</Button>
								</View>
							</View>
						</Card>
					</View>
				)}

				{/* 4. DATA & DISPLAY */}
				{isVisible("data", "StatRow MetricCard Avatar AvatarGroup Tag Badge Timeline") && (
					<View style={styles.section}>
						<Text variant="heading" colorKey="text" style={styles.sectionTitle}>
							Data & Display
						</Text>
						<Text variant="caption" colorKey="textMuted" style={styles.sectionDesc}>
							KPI metrics, avatar clusters, data rows, and timeline feeds.
						</Text>

						{/* Metric Cards Grid */}
						<View style={styles.metricGrid}>
							<View style={{ flex: 1 }}>
								<MetricCard label="COMPONENTS" value="77" trend="+100%" tone="success" />
							</View>
							<View style={{ flex: 1 }}>
								<MetricCard label="BENCHMARK" value="60 FPS" trend="Native" tone="info" />
							</View>
						</View>

						{/* Stat Rows Card */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								SYSTEM STAT ROWS
							</Text>
							<StatRow label="Runtime Overhead" value="0.00 ms (Zero)" />
							<StatRow label="Layout Engine" value="Pure Native Yoga" />
							<StatRow label="TypeScript Coverage" value="100% Strict" />
						</Card>

						{/* Avatar & Group */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								AVATAR & AVATAR GROUP
							</Text>
							<View style={styles.rowBetween}>
								<View style={styles.avatarSpecimens}>
									<Avatar initials="JS" size="md" isOnline={true} />
									<Avatar initials="AI" size="md" isOnline={false} />
								</View>
								<AvatarGroup
									items={[
										{ id: "1", initials: "AC" },
										{ id: "2", initials: "BS" },
										{ id: "3", initials: "CR" },
										{ id: "4", initials: "DP" },
									]}
									max={4}
								/>
								<Badge variant="primary" display="label">
									ACTIVE CLUSTER
								</Badge>
							</View>
						</Card>

						{/* Timeline */}
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="label" colorKey="textMuted" style={styles.cardLabel}>
								TIMELINE PROGRESS
							</Text>
							<Timeline
								items={[
									{
										id: "1",
										title: "Design System Architecture Spec",
										timestamp: "10:00 AM",
										status: "completed",
									},
									{
										id: "2",
										title: "Agent AI Elements Implementation",
										timestamp: "11:30 AM",
										status: "completed",
									},
									{
										id: "3",
										title: "Showcase App Live Verification",
										timestamp: "1:15 PM",
										status: "active",
									},
								]}
							/>
						</Card>
					</View>
				)}

				{/* 5. TYPOGRAPHY & FOUNDATIONS */}
				{isVisible("typography", "Text Heading Subheading Hero Display Tag Badge") && (
					<View style={styles.section}>
						<Text variant="heading" colorKey="text" style={styles.sectionTitle}>
							Foundations & Typography
						</Text>
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="hero" colorKey="text">
								Hero Title 28px
							</Text>
							<Text variant="heading" colorKey="text" style={{ marginTop: 4 }}>
								Heading Variant 20px
							</Text>
							<Text variant="subheading" colorKey="textMuted" style={{ marginTop: 2 }}>
								Subheading Typography 16px
							</Text>
							<Text variant="body" colorKey="text" style={{ marginTop: 8 }}>
								Body text rendered with native typography engine and adaptive font weights.
							</Text>
							<Text variant="caption" colorKey="textMuted" style={{ marginTop: 4 }}>
								Caption 12px · Informational secondary copy
							</Text>
							<View style={[styles.rowGap, { marginTop: 14 }]}>
								<Tag variant="default">DEFAULT TAG</Tag>
								<Tag variant="active">ACTIVE TAG</Tag>
								<Badge variant="success" display="label">
									SUCCESS
								</Badge>
								<Badge variant="warning" display="label">
									WARNING
								</Badge>
							</View>
						</Card>
					</View>
				)}
				{selectedGroup === "all" ? <CompositionGallery /> : null}
			</ScrollView>

			{/* Dialog Overlay */}
			<Dialog
				visible={showDialog}
				onClose={() => setShowDialog(false)}
				title="Primitive Dialog"
				message="This dialog is rendered by @osuki-dev/ui with accessible focus management."
			/>

			{/* Sheet Overlay */}
			<BottomSheet
				visible={showSheet}
				onClose={() => setShowSheet(false)}
				title="Action Bottom Sheet"
			>
				<View style={{ padding: 16, gap: 12 }}>
					<Text variant="body" colorKey="text">
						BottomSheet modal with drag indicator, gesture panning, and smooth spring physics.
					</Text>
					<Button variant="primary" onPress={() => setShowSheet(false)}>
						Dismiss Sheet
					</Button>
				</View>
			</BottomSheet>
		</Screen>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	filterBar: {
		borderBottomWidth: 1,
		paddingBottom: 10,
	},
	searchWrapper: {
		marginHorizontal: 16,
		marginBottom: 10,
	},
	groupScroll: {
		paddingHorizontal: 16,
		gap: 8,
	},
	groupChip: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 18,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	scrollContent: {
		padding: 16,
		gap: 20,
	},
	section: {
		gap: 10,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
	},
	sectionDesc: {
		fontSize: 12,
		lineHeight: 16,
		marginBottom: 4,
	},
	card: {
		borderRadius: 16,
	},
	cardLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	rowGap: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flexWrap: "wrap",
	},
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 4,
	},
	statusItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "500",
	},
	actionWrapper: {
		borderRadius: 12,
		borderWidth: 1,
		overflow: "hidden",
	},
	glassDemo: {
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		gap: 8,
	},
	marqueeWrapper: {
		width: "100%",
		height: 36,
		position: "relative",
		justifyContent: "center",
		marginTop: 4,
	},
	formRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	toggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 38,
	},
	checkboxRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 4,
	},
	metricGrid: {
		flexDirection: "row",
		gap: 12,
	},
	avatarSpecimens: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	buttonStack: {
		gap: 10,
	},
	buttonRow: {
		flexDirection: "row",
		gap: 10,
	},
	pressableScaleButton: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
