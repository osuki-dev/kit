import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import {
	Screen,
	ScrollScreen,
	ActionSheet,
	Avatar,
	Badge,
	Button,
	Card,
	Checkbox,
	ChoiceList,
	ChoiceRow,
	DateInput,
	DataTable,
	Dialog,
	Divider,
	Icon,
	InlineActivity,
	Input,
	KeyboardAvoidingView,
	KeyboardAwareScrollView,
	KeyboardStickyView,
	KeyboardToolbar,
	ListItem,
	Menu,
	Modal,
	OtpInput,
	PressableCard,
	PressableScale,
	ResponsiveContainer,
	ResponsiveGrid,
	SegmentedControl,
	SegmentedProgressBar,
	Select,
	Sheet,
	Spinner,
	StatRow,
	Surface,
	Tag,
	Tabs,
	Text,
	Timeline,
	Toggle,
	Tooltip,
	type ChoiceItem,
	type DataTableSortState,
	useThemeTokens,
	useToast,
} from "@osuki-dev/ui";
import { Container } from "@/components/container";

const segmentOptions = [
	{ label: "ONE", value: "one" },
	{ label: "TWO", value: "two" },
	{ label: "THREE", value: "three" },
];

const choiceOptions: ChoiceItem[] = [
	{
		id: "allow-once",
		label: "Yes, allow this once",
		description: "Runs only this request",
		icon: "Check",
		tag: "DEFAULT",
	},
	{
		id: "allow-always",
		label: "Yes, and remember the answer",
		description: "Stops asking for this tool",
		icon: "ShieldCheck",
	},
	{
		id: "deny",
		label: "No, and tell the agent what to do instead",
		icon: "X",
	},
];

const commandChoices: ChoiceItem[] = [
	{
		id: "review",
		label: "/review",
		hint: "[instructions]",
		description: "Review the working tree",
		icon: "Terminal",
		tag: "workspace",
	},
	{
		id: "commit",
		label: "/commit",
		hint: "[message]",
		description: "Write a commit from staged changes",
		icon: "GitCommitHorizontal",
		tag: "user",
	},
];

const dataTableRows = [
	{ id: "order-1001", order: "E2E TABLE ORDER", customer: "Ada", total: "$128", status: "Paid" },
	{ id: "order-1002", order: "Draft invoice", customer: "Mika", total: "$76", status: "Draft" },
];

function ComponentLabel({ children }: { children: string }) {
	return (
		<Text variant="label" colorKey="textMuted" style={styles.componentLabel}>
			{children}
		</Text>
	);
}

export default function ComponentE2EScreen() {
	const { spacing, colors } = useThemeTokens();
	const toast = useToast();
	const [buttonCount, setButtonCount] = useState(0);
	const [cardCount, setCardCount] = useState(0);
	const [listCount, setListCount] = useState(0);
	const [tagCount, setTagCount] = useState(0);
	const [checked, setChecked] = useState(false);
	const [toggle, setToggle] = useState(false);
	const [segment, setSegment] = useState("one");
	const [tabs, setTabs] = useState("overview");
	const [input, setInput] = useState("");
	const [select, setSelect] = useState("design");
	const [otp, setOtp] = useState("");
	const [date, setDate] = useState("2026-07-07");
	const [menu, setMenu] = useState("sort");
	const [tableSort, setTableSort] = useState<DataTableSortState>({
		columnId: "order",
		direction: "asc",
	});
	const [selectedTableRow, setSelectedTableRow] = useState("order-1001");
	const [actionSheetOpen, setActionSheetOpen] = useState(false);
	const [actionSheetValue, setActionSheetValue] = useState("NONE");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogValue, setDialogValue] = useState("NONE");
	const [modalOpen, setModalOpen] = useState(false);
	const [scaleCount, setScaleCount] = useState(0);
	const [scaleQuietCount, setScaleQuietCount] = useState(0);
	const [scaleDisabledCount, setScaleDisabledCount] = useState(0);
	const [choice, setChoice] = useState("NONE");
	const [choiceAnswer, setChoiceAnswer] = useState("NONE");
	const [choiceLoadingId, setChoiceLoadingId] = useState<string | null>(null);
	const [activityActive, setActivityActive] = useState(true);

	return (
		<Container>
			<Screen>
				<KeyboardAwareScrollView
					contentContainerStyle={[styles.content, { paddingBottom: spacing["4xl"] }]}
					keyboardShouldPersistTaps="handled"
					testID="e2e-keyboard-aware-scroll-view"
				>
					<ResponsiveContainer maxWidth={720} alignment="center">
						<Text variant="heading" colorKey="text" testID="e2e-component-screen-title">
							COMPONENT E2E
						</Text>
						<Text variant="body" colorKey="textMuted" style={styles.subtitle}>
							Every exported Osuki UI primitive is rendered here for agent-device coverage.
						</Text>

						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={styles.section}
							testID="e2e-card"
						>
							<ComponentLabel>E2E COMPONENT Text</ComponentLabel>
							<Text variant="body" colorKey="text">
								E2E TEXT BODY
							</Text>

							<ComponentLabel>E2E COMPONENT Button</ComponentLabel>
							<Button
								variant="primary"
								onPress={() => setButtonCount((count) => count + 1)}
								testID="e2e-button-primary"
								accessibilityLabel="E2E BUTTON PRIMARY"
							>
								E2E BUTTON PRIMARY
							</Button>
							<Text variant="caption" colorKey="textMuted">
								BUTTON PRESSED {buttonCount}
							</Text>

							<ComponentLabel>E2E COMPONENT PressableCard</ComponentLabel>
							<PressableCard
								variant="raised"
								border="subtle"
								onPress={() => setCardCount((count) => count + 1)}
								testID="e2e-pressable-card"
								accessibilityLabel="E2E PRESSABLE CARD"
							>
								<Text variant="body" colorKey="text">
									E2E PRESSABLE CARD
								</Text>
								<Text variant="caption" colorKey="textMuted">
									Tap the card to update the external counter.
								</Text>
							</PressableCard>
							<Text variant="caption" colorKey="textMuted">
								CARD PRESSED {cardCount}
							</Text>

							<ComponentLabel>E2E COMPONENT Toggle</ComponentLabel>
							<TouchableOpacity
								style={styles.row}
								onPress={() => setToggle((value) => !value)}
								testID="e2e-toggle-row"
								accessibilityRole="switch"
								accessibilityLabel={`E2E TOGGLE ${toggle ? "ON" : "OFF"}`}
								accessibilityState={{ checked: toggle }}
								activeOpacity={1}
							>
								<Toggle
									value={toggle}
									onValueChange={setToggle}
									testID="e2e-toggle"
									accessibilityLabel="E2E TOGGLE"
								/>
								<Text variant="body" colorKey="text">
									TOGGLE {toggle ? "ON" : "OFF"}
								</Text>
							</TouchableOpacity>

							<ComponentLabel>E2E COMPONENT Checkbox</ComponentLabel>
							<TouchableOpacity
								style={styles.row}
								onPress={() => setChecked((value) => !value)}
								testID="e2e-checkbox-row"
								accessibilityRole="checkbox"
								accessibilityLabel={`E2E CHECKBOX ${checked ? "ON" : "OFF"}`}
								accessibilityState={{ checked }}
								activeOpacity={1}
							>
								<Checkbox
									checked={checked}
									onToggle={setChecked}
									testID="e2e-checkbox"
									accessibilityLabel="E2E CHECKBOX"
								/>
								<Text variant="body" colorKey="text">
									CHECKBOX {checked ? "ON" : "OFF"}
								</Text>
							</TouchableOpacity>

							<ComponentLabel>E2E COMPONENT ListItem</ComponentLabel>
							<TouchableOpacity
								testID="e2e-list-item-row"
								accessibilityRole="button"
								accessibilityLabel="E2E LIST ITEM ACTION"
								onPress={() => setListCount((count) => count + 1)}
								activeOpacity={1}
							>
								<ListItem
									icon="List"
									title="E2E LIST ITEM"
									subtitle={`Pressed ${listCount}`}
									trailing="→"
									testID="e2e-list-item"
									accessibilityLabel="E2E LIST ITEM"
								/>
							</TouchableOpacity>
							<Text variant="caption" colorKey="textMuted">
								LIST ITEM PRESSED {listCount}
							</Text>

							<ComponentLabel>E2E COMPONENT DataTable</ComponentLabel>
							<DataTable
								testID="e2e-data-table"
								columns={[
									{
										id: "order",
										header: "Order",
										accessor: (row) => row.order,
										minWidth: 160,
										sortable: true,
									},
									{
										id: "customer",
										header: "Customer",
										accessor: (row) => row.customer,
										minWidth: 112,
									},
									{
										id: "total",
										header: "Total",
										accessor: (row) => row.total,
										align: "right",
										minWidth: 96,
									},
									{
										id: "status",
										header: "Status",
										accessor: (row) => row.status,
										minWidth: 104,
									},
								]}
								data={dataTableRows}
								getRowId={(row) => row.id}
								sort={tableSort}
								onSortChange={setTableSort}
								selectedRowIds={[selectedTableRow]}
								onRowPress={(row) => setSelectedTableRow(row.id)}
							/>
							<Text variant="caption" colorKey="textMuted">
								DATA TABLE SELECTED {selectedTableRow}
							</Text>

							<ComponentLabel>E2E COMPONENT SegmentedControl</ComponentLabel>
							<SegmentedControl
								options={segmentOptions}
								value={segment}
								onChange={setSegment}
								testID="e2e-segmented-control"
							/>
							<Text variant="caption" colorKey="textMuted">
								SEGMENT {segment.toUpperCase()}
							</Text>

							<ComponentLabel>E2E COMPONENT Tabs</ComponentLabel>
							<Tabs.Root value={tabs} onValueChange={setTabs} variant="pill">
								<Tabs.List testID="e2e-tabs">
									<Tabs.Trigger value="overview" testID="e2e-tabs-overview">
										<Tabs.Label>Overview</Tabs.Label>
									</Tabs.Trigger>
									<Tabs.Trigger value="orders" testID="e2e-tabs-orders">
										<Tabs.Label>Orders</Tabs.Label>
										<Tabs.Badge>2</Tabs.Badge>
									</Tabs.Trigger>
								</Tabs.List>
							</Tabs.Root>
							<Text variant="caption" colorKey="textMuted">
								TABS VALUE {tabs.toUpperCase()}
							</Text>

							<ComponentLabel>E2E COMPONENT Tag</ComponentLabel>
							<Tag
								variant="pill"
								onPress={() => setTagCount((count) => count + 1)}
								testID="e2e-tag"
								accessibilityLabel="E2E TAG"
							>
								E2E TAG
							</Tag>
							<Text variant="caption" colorKey="textMuted">
								TAG PRESSED {tagCount}
							</Text>

							<ComponentLabel>E2E COMPONENT Input</ComponentLabel>
							<Input
								label="E2E INPUT LABEL"
								value={input}
								onChangeText={setInput}
								placeholder="Type here"
								testID="e2e-input"
								accessibilityLabel="E2E INPUT"
							/>
							<Text variant="caption" colorKey="textMuted">
								INPUT VALUE {input || "EMPTY"}
							</Text>

							<ComponentLabel>E2E COMPONENT Select</ComponentLabel>
							<Select
								label="E2E SELECT"
								options={[
									{ label: "Design", value: "design", description: "UI components" },
									{ label: "Data", value: "data", description: "Adapters and state" },
									{ label: "Disabled", value: "disabled", disabled: true },
								]}
								value={select}
								onChange={setSelect}
								testID="e2e-select"
							/>
							<Text variant="caption" colorKey="textMuted">
								SELECT VALUE {select.toUpperCase()}
							</Text>

							<ComponentLabel>E2E COMPONENT DateInput</ComponentLabel>
							<DateInput
								label="E2E DATE INPUT"
								value={date}
								onChange={setDate}
								testID="e2e-date-input"
							/>
							<Text variant="caption" colorKey="textMuted">
								DATE VALUE {date || "EMPTY"}
							</Text>

							<ComponentLabel>E2E COMPONENT Modal</ComponentLabel>
							<Modal.Root open={modalOpen} onOpenChange={setModalOpen}>
								<Modal.Trigger
									testID="e2e-modal-trigger"
									style={[styles.sheetTrigger, { borderColor: colors.border }]}
								>
									<Text variant="button">E2E MODAL OPEN</Text>
								</Modal.Trigger>
								<Modal.Content testID="e2e-modal">
									<Modal.Header>
										<Modal.HeaderText>
											<Modal.Title>E2E MODAL TITLE</Modal.Title>
											<Modal.Description>Composable centered overlay.</Modal.Description>
										</Modal.HeaderText>
										<Modal.Close testID="e2e-modal-close" />
									</Modal.Header>
									<Modal.Body>
										<Text variant="body">E2E MODAL BODY</Text>
									</Modal.Body>
								</Modal.Content>
							</Modal.Root>

							<ComponentLabel>E2E COMPONENT Dialog</ComponentLabel>
							<Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen} tone="danger">
								<Dialog.Trigger
									testID="e2e-dialog-trigger"
									accessibilityLabel="E2E DIALOG OPEN"
									style={[styles.sheetTrigger, { borderColor: colors.border }]}
								>
									<Text variant="button">E2E DIALOG OPEN</Text>
								</Dialog.Trigger>
								<Dialog.Content testID="e2e-dialog">
									<Dialog.Header>
										<Dialog.Icon />
										<Dialog.HeaderText>
											<Dialog.Title>E2E DIALOG TITLE</Dialog.Title>
											<Dialog.Description>
												Confirm a high-impact action from reusable Dialog primitives.
											</Dialog.Description>
										</Dialog.HeaderText>
									</Dialog.Header>
									<Dialog.Actions>
										<Dialog.Close>Cancel</Dialog.Close>
										<Dialog.Close
											variant="destructive"
											onPress={() => setDialogValue("CONFIRMED")}
											testID="e2e-dialog-action-confirm"
										>
											Confirm
										</Dialog.Close>
									</Dialog.Actions>
								</Dialog.Content>
							</Dialog.Root>
							<Text variant="caption" colorKey="textMuted">
								DIALOG VALUE {dialogValue}
							</Text>

							<ComponentLabel>E2E COMPONENT Menu</ComponentLabel>
							<Menu
								label="E2E MENU"
								selectedId={menu}
								items={[
									{
										id: "sort",
										label: "Sort newest",
										description: "Use the newest item first",
										icon: "ArrowDownWideNarrow",
									},
									{
										id: "filter",
										label: "Filter active",
										description: "Show active records only",
										icon: "ListFilter",
									},
								]}
								onSelect={(item) => setMenu(item.id)}
								testID="e2e-menu"
							/>
							<Text variant="caption" colorKey="textMuted">
								MENU VALUE {menu.toUpperCase()}
							</Text>

							<ComponentLabel>E2E COMPONENT OtpInput</ComponentLabel>
							<OtpInput
								label="E2E OTP"
								length={4}
								value={otp}
								onChange={setOtp}
								testID="e2e-otp-input"
							/>
							<Text variant="caption" colorKey="textMuted">
								OTP VALUE {otp || "EMPTY"}
							</Text>

							<ComponentLabel>E2E COMPONENT ActionSheet</ComponentLabel>
							<Button
								variant="secondary"
								onPress={() => setActionSheetOpen(true)}
								testID="e2e-action-sheet-trigger"
							>
								OPEN ACTION SHEET
							</Button>
							<ActionSheet
								visible={actionSheetOpen}
								onClose={() => setActionSheetOpen(false)}
								title="E2E ACTION SHEET"
								actions={[
									{
										id: "archive",
										label: "Archive item",
										description: "Move this record out of the active list",
										icon: "Archive",
									},
									{
										id: "delete",
										label: "Delete item",
										description: "Remove this record",
										icon: "Trash2",
										tone: "destructive",
									},
								]}
								onAction={(action) => setActionSheetValue(action.id)}
								testID="e2e-action-sheet"
							/>
							<Text variant="caption" colorKey="textMuted">
								ACTION SHEET VALUE {actionSheetValue.toUpperCase()}
							</Text>

							<ComponentLabel>E2E COMPONENT Sheet</ComponentLabel>
							<Sheet.Root open={sheetOpen} onOpenChange={setSheetOpen}>
								<Sheet.Trigger
									testID="e2e-sheet-trigger"
									accessibilityLabel="E2E SHEET OPEN"
									style={[styles.sheetTrigger, { borderColor: colors.border }]}
								>
									<Text variant="button">E2E SHEET OPEN</Text>
								</Sheet.Trigger>
								<Sheet.Content testID="e2e-sheet" maxHeight="72%">
									<Sheet.Handle />
									<Sheet.Header>
										<Sheet.HeaderText>
											<Sheet.Title>E2E SHEET TITLE</Sheet.Title>
											<Sheet.Description>
												Composable state, accessibility, and safe-area behavior.
											</Sheet.Description>
										</Sheet.HeaderText>
										<Sheet.Close testID="e2e-sheet-close" />
									</Sheet.Header>
									<Sheet.Body>
										<Text variant="body">E2E SHEET BODY</Text>
									</Sheet.Body>
								</Sheet.Content>
							</Sheet.Root>

							<ComponentLabel>E2E COMPONENT Tooltip</ComponentLabel>
							<Tooltip
								title="E2E TOOLTIP"
								content="Tooltip content for compact controls"
								defaultVisible
								testID="e2e-tooltip"
							>
								<View style={styles.tooltipTarget}>
									<Icon name="Info" size={18} color={colors.primary} />
									<Text variant="body" colorKey="text">
										E2E TOOLTIP TARGET
									</Text>
								</View>
							</Tooltip>
						</Card>

						<Card variant="raised" border="subtle" padding="lg" style={styles.section}>
							<ComponentLabel>E2E COMPONENT Surface</ComponentLabel>
							<Surface variant="raised" style={styles.inlineSurface} testID="e2e-surface">
								<Text variant="body" colorKey="text">
									E2E SURFACE
								</Text>
							</Surface>

							<ComponentLabel>E2E COMPONENT Screen</ComponentLabel>
							<Screen style={styles.inlineScreen} testID="e2e-screen">
								<Text variant="body">E2E SCREEN</Text>
							</Screen>

							<ComponentLabel>E2E COMPONENT ScrollScreen</ComponentLabel>
							<ScrollScreen
								style={styles.inlineScrollScreen}
								contentContainerStyle={styles.inlineSurface}
								testID="e2e-scroll-screen"
							>
								<Text variant="body">E2E SCROLL SCREEN</Text>
							</ScrollScreen>

							<ComponentLabel>E2E COMPONENT Badge</ComponentLabel>
							<View style={styles.row}>
								<Badge testID="e2e-badge-primary" variant="primary">
									7
								</Badge>
								<Badge testID="e2e-badge-success" variant="success">
									128
								</Badge>
								<Text variant="body" colorKey="text">
									E2E BADGE
								</Text>
							</View>

							<ComponentLabel>E2E COMPONENT Avatar</ComponentLabel>
							<View style={styles.row}>
								<Avatar testID="e2e-avatar" initials="OK" size="md" isOnline />
								<Text variant="body" colorKey="text">
									E2E AVATAR
								</Text>
							</View>

							<ComponentLabel>E2E COMPONENT Icon</ComponentLabel>
							<View style={styles.row}>
								<Icon testID="e2e-icon" name="Sparkles" size={24} color={colors.primary} />
								<Text variant="body" colorKey="text">
									E2E ICON
								</Text>
							</View>

							<ComponentLabel>E2E COMPONENT StatRow</ComponentLabel>
							<StatRow
								testID="e2e-stat-row"
								label="E2E STAT ROW"
								value="99"
								unit="%"
								status="success"
								trend="up"
							/>

							<ComponentLabel>E2E COMPONENT SegmentedProgressBar</ComponentLabel>
							<SegmentedProgressBar
								testID="e2e-segmented-progress-bar"
								value={72}
								max={100}
								label="E2E PROGRESS"
								status="success"
								valueDisplay="value"
							/>

							<ComponentLabel>E2E COMPONENT Toast</ComponentLabel>
							<Button
								testID="e2e-toast-trigger"
								variant="secondary"
								onPress={() =>
									toast.showToast({
										variant: "success",
										title: "E2E TOAST TITLE",
										message: "Toast viewport subscription is active.",
										durationMs: 0,
									})
								}
							>
								E2E TOAST OPEN
							</Button>

							<ComponentLabel>E2E COMPONENT Spinner</ComponentLabel>
							<View style={styles.row}>
								<Spinner testID="e2e-spinner-sm" size="sm" />
								<Spinner testID="e2e-spinner-md" size="md" />
								<Spinner testID="e2e-spinner-lg" size="lg" />
								<Text variant="body" colorKey="text">
									E2E SPINNER
								</Text>
							</View>

							<ComponentLabel>E2E COMPONENT Divider</ComponentLabel>
							<Divider testID="e2e-divider" />
							<Text variant="body" colorKey="text">
								E2E DIVIDER
							</Text>

							<ComponentLabel>E2E COMPONENT Timeline</ComponentLabel>
							<Timeline
								testID="e2e-timeline"
								items={[
									{
										id: "received",
										title: "E2E TIMELINE RECEIVED",
										description: "Request accepted",
										timestamp: "09:00",
										tone: "success",
										status: "completed",
										icon: "Check",
									},
									{
										id: "review",
										title: "E2E TIMELINE REVIEW",
										description: "Currently in review",
										timestamp: "09:30",
										tone: "primary",
										status: "active",
										icon: "Clock",
									},
								]}
							/>
						</Card>

						<Card variant="raised" border="subtle" padding="lg" style={styles.section}>
							<ComponentLabel>E2E COMPONENT ResponsiveContainer</ComponentLabel>
							<ResponsiveContainer
								testID="e2e-responsive-container"
								widthMode="full"
								style={styles.responsiveBox}
							>
								<Text variant="body" colorKey="text">
									E2E RESPONSIVE CONTAINER
								</Text>
							</ResponsiveContainer>

							<ComponentLabel>E2E COMPONENT ResponsiveGrid</ComponentLabel>
							<ResponsiveGrid testID="e2e-responsive-grid" columns={{ xs: 2 }} gap={spacing["sm"]}>
								<Card
									testID="e2e-responsive-grid-card-one"
									variant="flat"
									border="subtle"
									padding="sm"
								>
									<Text variant="caption" colorKey="text">
										E2E GRID ONE
									</Text>
								</Card>
								<Card
									testID="e2e-responsive-grid-card-two"
									variant="flat"
									border="subtle"
									padding="sm"
								>
									<Text variant="caption" colorKey="text">
										E2E GRID TWO
									</Text>
								</Card>
							</ResponsiveGrid>

							<ComponentLabel>E2E COMPONENT KeyboardAvoidingView</ComponentLabel>
							<KeyboardAvoidingView behavior="padding" testID="e2e-keyboard-avoiding-view">
								<Text variant="body" colorKey="text">
									E2E KEYBOARD AVOIDING VIEW
								</Text>
							</KeyboardAvoidingView>

							<ComponentLabel>E2E COMPONENT KeyboardStickyView</ComponentLabel>
							<KeyboardStickyView testID="e2e-keyboard-sticky-view">
								<Text variant="body" colorKey="text">
									E2E KEYBOARD STICKY VIEW
								</Text>
							</KeyboardStickyView>

							<ComponentLabel>E2E COMPONENT KeyboardToolbar</ComponentLabel>
							<KeyboardToolbar doneText="DONE" />
							<Text variant="body" colorKey="text">
								E2E KEYBOARD TOOLBAR
							</Text>
						</Card>

						<Card variant="raised" border="subtle" padding="lg" style={styles.section}>
							<ComponentLabel>E2E COMPONENT PressableScale</ComponentLabel>
							<PressableScale
								onPress={() => setScaleCount((count) => count + 1)}
								testID="e2e-pressable-scale"
								accessibilityRole="button"
								accessibilityLabel="E2E PRESSABLE SCALE"
								style={[
									styles.scaleTile,
									{ borderColor: colors.border, backgroundColor: colors.surface },
								]}
							>
								<Text variant="body" colorKey="text">
									E2E PRESSABLE SCALE TILE
								</Text>
								<Text variant="caption" colorKey="textMuted">
									Default dip 0.985, selection haptic
								</Text>
							</PressableScale>
							<Text variant="caption" colorKey="textMuted">
								PRESSABLE SCALE PRESSED {scaleCount}
							</Text>

							<View style={styles.row}>
								<PressableScale
									pressedScale={0.9}
									feedback="none"
									onPress={() => setScaleQuietCount((count) => count + 1)}
									testID="e2e-pressable-scale-quiet"
									accessibilityRole="button"
									accessibilityLabel="E2E PRESSABLE SCALE QUIET"
									style={[styles.scaleIcon, { borderColor: colors.border }]}
								>
									<Icon name="X" size={16} color={colors.textMuted} />
								</PressableScale>
								<Text variant="caption" colorKey="textMuted">
									QUIET SCALE 0.9 PRESSED {scaleQuietCount}
								</Text>
							</View>

							<PressableScale
								disabled
								onPress={() => setScaleDisabledCount((count) => count + 1)}
								testID="e2e-pressable-scale-disabled"
								accessibilityRole="button"
								accessibilityLabel="E2E PRESSABLE SCALE DISABLED"
								style={[styles.scaleTile, { borderColor: colors.border }]}
							>
								<Text variant="body" colorKey="textDisabled">
									E2E PRESSABLE SCALE DISABLED
								</Text>
							</PressableScale>
							<Text variant="caption" colorKey="textMuted">
								DISABLED SCALE PRESSED {scaleDisabledCount}
							</Text>

							<ComponentLabel>E2E COMPONENT ChoiceRow</ComponentLabel>
							<ChoiceRow
								icon="Check"
								label="E2E CHOICE ROW PLAIN, whose label wraps onto a second line instead of truncating"
								description="Idle row, plain emphasis"
								tag="DEFAULT"
								onPress={() => setChoice("PLAIN")}
								testID="e2e-choice-row-plain"
							/>
							<ChoiceRow
								icon="Check"
								label="E2E CHOICE ROW LOADING"
								description="This row's answer is in flight"
								loading
								onPress={() => setChoice("LOADING")}
								testID="e2e-choice-row-loading"
							/>
							<ChoiceRow
								icon="X"
								label="E2E CHOICE ROW DISABLED"
								description="Locked while another row answers"
								disabled
								onPress={() => setChoice("DISABLED")}
								testID="e2e-choice-row-disabled"
							/>
							<ChoiceRow
								emphasis="headline"
								border="none"
								icon="Terminal"
								label="/explain"
								hint="[file]"
								description="Headline emphasis, borderless"
								tag="workspace"
								onPress={() => setChoice("HEADLINE")}
								testID="e2e-choice-row-headline"
							/>
							<Text variant="caption" colorKey="textMuted">
								CHOICE ROW VALUE {choice}
							</Text>

							<ComponentLabel>E2E COMPONENT ChoiceList</ComponentLabel>
							<ChoiceList
								items={choiceOptions}
								loadingId={choiceLoadingId}
								onSelect={(item) => {
									setChoiceAnswer(item.id.toUpperCase());
									setChoiceLoadingId(item.id);
								}}
								testIDPrefix="e2e-choice-option"
							/>
							<Text variant="caption" colorKey="textMuted">
								CHOICE LIST ANSWER {choiceAnswer}
							</Text>
							<Button
								variant="secondary"
								onPress={() => setChoiceLoadingId(null)}
								testID="e2e-choice-list-reset"
							>
								E2E CHOICE LIST RESET
							</Button>

							<ChoiceList
								items={commandChoices}
								emphasis="headline"
								border="none"
								disabled
								onSelect={() => undefined}
								testIDPrefix="e2e-choice-command"
							/>
							<Text variant="caption" colorKey="textMuted">
								CHOICE LIST HEADLINE DISABLED
							</Text>

							<ComponentLabel>E2E COMPONENT InlineActivity</ComponentLabel>
							<InlineActivity
								label="E2E INLINE ACTIVITY SM"
								size="sm"
								testID="e2e-inline-activity-sm"
							/>
							<InlineActivity
								label="E2E INLINE ACTIVITY MD"
								size="md"
								testID="e2e-inline-activity-md"
							/>
							<InlineActivity
								label="E2E INLINE ACTIVITY LG"
								size="lg"
								testID="e2e-inline-activity-lg"
							/>
							<InlineActivity
								active={false}
								label="E2E INLINE ACTIVITY INACTIVE"
								testID="e2e-inline-activity-inactive"
							/>
							<Text variant="caption" colorKey="textMuted">
								INLINE ACTIVITY ALIGNMENT PAIR
							</Text>
							<InlineActivity
								label="E2E INLINE ACTIVITY ALIGNED ACTIVE"
								size="md"
								testID="e2e-inline-activity-aligned-active"
							/>
							<InlineActivity
								active={false}
								label="E2E INLINE ACTIVITY ALIGNED IDLE"
								size="md"
								testID="e2e-inline-activity-aligned-idle"
							/>
							<InlineActivity
								widthMode="full"
								lines={2}
								label="E2E INLINE ACTIVITY FULL WIDTH, whose caption takes the remaining width and wraps onto a second line before it clamps."
								testID="e2e-inline-activity-full"
							/>
							<Button
								variant="secondary"
								onPress={() => setActivityActive((value) => !value)}
								testID="e2e-inline-activity-toggle"
							>
								E2E INLINE ACTIVITY TOGGLE
							</Button>
							<InlineActivity
								active={activityActive}
								label={`E2E INLINE ACTIVITY ${activityActive ? "ACTIVE" : "IDLE"}`}
								testID="e2e-inline-activity-toggled"
							/>
						</Card>
					</ResponsiveContainer>
				</KeyboardAwareScrollView>
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	content: {
		paddingTop: 24,
	},
	subtitle: {
		marginTop: 8,
		marginBottom: 24,
	},
	section: {
		width: "100%",
		gap: 12,
		marginBottom: 16,
	},
	componentLabel: {
		marginTop: 8,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		width: "100%",
		minHeight: 56,
		paddingVertical: 6,
	},
	sheetTrigger: {
		minHeight: 44,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
	},
	inlineSurface: {
		padding: 16,
		borderRadius: 8,
	},
	inlineScreen: {
		flex: 0,
		height: 72,
		padding: 16,
		borderRadius: 8,
	},
	inlineScrollScreen: {
		flex: 0,
		height: 72,
		borderRadius: 8,
	},
	responsiveBox: {
		padding: 12,
		borderWidth: 1,
		borderStyle: "dashed",
	},
	scaleTile: {
		gap: 4,
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
	},
	scaleIcon: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 12,
		borderWidth: 1,
	},
	tooltipTarget: {
		minHeight: 44,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderStyle: "dashed",
	},
});
