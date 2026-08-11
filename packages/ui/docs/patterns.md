# Patterns

This file answers one question: what does a whole screen look like when it is
built out of this kit. Each example is complete enough to paste into a file and
run — the only things not defined inline are your own data hooks.

Seven screens follow: a list, a form, a detail screen with a sheet, the
loading/empty/error switch, a destructive confirmation, a dashboard, and a
paginated table.

---

## 1. A list screen

`TopBar` for the title, `SearchInput` for the filter, `FlatList` for the rows,
and a single state switch in front of the data. The list itself is plain React
Native — the kit does not wrap `FlatList`, because a list needs to be tuned per
screen.

```tsx
import {
	EmptyState,
	ErrorView,
	ListItem,
	LoadingView,
	Screen,
	SearchInput,
	Tag,
	TopBar,
	useThemeTokens,
} from "@osuki-dev/ui";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

type Order = { id: string; customer: string; total: string; status: string };

export default function OrdersScreen() {
	const { spacing } = useThemeTokens();
	const [query, setQuery] = useState("");
	const { data, isLoading, error, refetch } = useOrders();

	const rows = useMemo(() => {
		if (!data) return [];
		const q = query.trim().toLowerCase();
		if (!q) return data;
		return data.filter((order) => order.customer.toLowerCase().includes(q));
	}, [data, query]);

	return (
		<Screen variant="page" safeArea="top">
			<TopBar title="Orders" />

			<View style={{ padding: spacing.md }}>
				<SearchInput
					value={query}
					onChangeText={setQuery}
					onClear={() => setQuery("")}
					placeholder="Search by customer"
				/>
			</View>

			{isLoading ? (
				<LoadingView label="Loading orders" />
			) : error ? (
				<ErrorView message="Orders could not be loaded." retryLabel="Try again" onRetry={refetch} />
			) : rows.length === 0 ? (
				<EmptyState
					icon="Inbox"
					title={query ? "No matches" : "No orders yet"}
					message={
						query
							? "Nothing matches that search."
							: "Orders will appear here once a customer checks out."
					}
					actionLabel={query ? "Clear search" : undefined}
					onAction={query ? () => setQuery("") : undefined}
				/>
			) : (
				<FlatList
					data={rows}
					keyExtractor={(order: Order) => order.id}
					contentContainerStyle={{ paddingBottom: spacing.xl }}
					renderItem={({ item }) => (
						<ListItem
							icon="Package"
							title={item.customer}
							subtitle={item.total}
							separator="bottom"
							trailing={<Tag variant="technical">{item.status}</Tag>}
							onPress={() => router.push(`/orders/${item.id}`)}
						/>
					)}
				/>
			)}
		</Screen>
	);
}
```

Two decisions worth copying: the search field lives outside the list so it does
not scroll away, and the empty state changes its own copy depending on whether
the list is empty because there is no data or because the filter matched
nothing. Those are different situations and a user can tell.

---

## 2. A form screen

`FieldGroup` owns the label, helper and error for every control, including
`Input`, which can also render its own. Pick one and stay with it —
`FieldGroup` when the form has a consistent label style, the control's own
`label` prop when a field stands alone.

`KeyboardAwareScrollView` scrolls the focused field into view; `KeyboardToolbar`
gives the user a way out of the last field on iOS.

```tsx
import {
	Button,
	FieldGroup,
	Input,
	KeyboardAwareScrollView,
	KeyboardToolbar,
	Screen,
	Select,
	Stack,
	Textarea,
	Toggle,
	useThemeTokens,
	useToast,
} from "@osuki-dev/ui";
import { useState } from "react";
import { View } from "react-native";

const COUNTRIES = [
	{ label: "Japan", value: "jp" },
	{ label: "Singapore", value: "sg" },
	{ label: "United Kingdom", value: "gb" },
];

export default function AddressForm() {
	const { spacing } = useThemeTokens();
	const { showToast } = useToast();

	const [name, setName] = useState("");
	const [country, setCountry] = useState<string>();
	const [notes, setNotes] = useState("");
	const [isDefault, setIsDefault] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const nameError = name.trim().length === 0 ? "Required." : undefined;

	async function submit() {
		setSubmitting(true);
		try {
			await saveAddress({ name, country, notes, isDefault });
			showToast({ variant: "success", message: "Address saved." });
		} catch {
			showToast({ variant: "danger", message: "Could not save the address." });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Screen variant="page" safeArea="bottom">
			<KeyboardAwareScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
				<Stack direction="vertical" gap="md">
					<Input
						label="Full name"
						value={name}
						onChangeText={setName}
						error={name.length > 0 ? nameError : undefined}
						autoCapitalize="words"
						textContentType="name"
					/>

					<Select
						label="Country"
						options={COUNTRIES}
						value={country}
						onChange={setCountry}
						placeholder="Choose a country"
						required
						sheetTitle="Country"
					/>

					<Textarea
						label="Delivery notes"
						value={notes}
						onChangeText={setNotes}
						minRows={3}
						maxRows={6}
						helper="Gate codes, floor, anything the courier needs."
					/>

					<FieldGroup
						label="Default address"
						helper="Used unless you pick another one at checkout."
					>
						<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
							<Toggle value={isDefault} onValueChange={setIsDefault} />
						</View>
					</FieldGroup>
				</Stack>

				<Button
					variant="primary"
					onPress={submit}
					disabled={Boolean(nameError) || !country}
					loading={submitting}
					loadingLabel="Saving"
				>
					Save address
				</Button>
			</KeyboardAwareScrollView>

			<KeyboardToolbar doneText="Done" />
		</Screen>
	);
}
```

The submit button is disabled by the same expression that produces the error
text, not by a separate `isValid` flag that can drift out of sync with it.

---

## 3. A detail screen with a bottom sheet

The convenience form covers most sheets:

```tsx
<BottomSheet
	visible={open}
	onClose={() => setOpen(false)}
	title="Shipping"
	description="Choose how this order is delivered."
	footer={
		<Button variant="primary" onPress={confirm}>
			Confirm
		</Button>
	}
>
	{options}
</BottomSheet>
```

Drop to `Sheet.Root` when the content stops being a title, a body and a footer —
here, because the header carries a status tag next to the title.

```tsx
import {
	Button,
	Card,
	DataRow,
	Screen,
	Sheet,
	SheetListItem,
	Stack,
	Tag,
	TopBar,
	useThemeTokens,
} from "@osuki-dev/ui";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";

const METHODS = [
	{ id: "standard", label: "Standard", description: "3–5 business days" },
	{ id: "express", label: "Express", description: "Next business day" },
	{ id: "pickup", label: "Collect in store", description: "Ready in 2 hours" },
];

export default function OrderDetailScreen({ order }: { order: Order }) {
	const { spacing } = useThemeTokens();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [method, setMethod] = useState("standard");

	return (
		<Screen variant="page" safeArea="top">
			<TopBar
				title={`Order ${order.reference}`}
				subtitle={order.placedAt}
				onBack={() => router.back()}
				actions={[{ icon: "Share2", label: "Share", onPress: () => share(order) }]}
			/>

			<ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
				<Card variant="raised" border="subtle" padding="md">
					<DataRow label="Status" value={order.status} separator="bottom" />
					<DataRow label="Total" value={order.total} separator="bottom" />
					<DataRow
						label="Shipping"
						value={METHODS.find((m) => m.id === method)?.label}
						description="Tap to change"
						leadingIcon="Truck"
						onPress={() => setSheetOpen(true)}
					/>
				</Card>
			</ScrollView>

			<Sheet.Root open={sheetOpen} onOpenChange={setSheetOpen}>
				<Sheet.Content maxHeight="70%">
					<Sheet.Handle />
					<Sheet.Header>
						<Sheet.HeaderText>
							<Stack direction="horizontal" gap="sm" align="center">
								<Sheet.Title>Shipping</Sheet.Title>
								<Tag variant="active">{order.region}</Tag>
							</Stack>
							<Sheet.Description>Rates are calculated for {order.region}.</Sheet.Description>
						</Sheet.HeaderText>
						<Sheet.Close />
					</Sheet.Header>

					<Sheet.Body>
						<Stack direction="vertical" gap="xs">
							{METHODS.map((option) => (
								<SheetListItem
									key={option.id}
									label={option.label}
									description={option.description}
									selected={option.id === method}
									onPress={() => setMethod(option.id)}
								/>
							))}
						</Stack>
					</Sheet.Body>

					<Sheet.Footer>
						<Button variant="primary" onPress={() => setSheetOpen(false)}>
							Confirm
						</Button>
					</Sheet.Footer>
				</Sheet.Content>
			</Sheet.Root>
		</Screen>
	);
}
```

`Sheet.Root` owns open state, the scrim, the close gesture and the accessibility
wiring. You own the arrangement. There is no `<Sheet />` on its own; the root is
always `Sheet.Root`.

---

## 4. The loading / empty / error switch

Four states, one order, every screen. Put it in a helper the first time you
write it twice.

```tsx
import { EmptyState, ErrorView, Skeleton, Stack } from "@osuki-dev/ui";
import type { ReactNode } from "react";

type AsyncSectionProps<T> = {
	data: T[] | undefined;
	isLoading: boolean;
	error: unknown;
	onRetry: () => void;
	emptyTitle: string;
	emptyMessage?: string;
	children: (data: T[]) => ReactNode;
};

export function AsyncSection<T>({
	data,
	isLoading,
	error,
	onRetry,
	emptyTitle,
	emptyMessage,
	children,
}: AsyncSectionProps<T>) {
	if (isLoading && !data) {
		return (
			<Stack direction="vertical" gap="md">
				<Skeleton variant="text" lines={2} />
				<Skeleton variant="rect" height={96} />
				<Skeleton variant="rect" height={96} />
			</Stack>
		);
	}
	if (error) {
		return (
			<ErrorView
				message="Something went wrong loading this section."
				retryLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}
	if (!data || data.length === 0) {
		return <EmptyState icon="Inbox" title={emptyTitle} message={emptyMessage} />;
	}
	return <>{children(data)}</>;
}
```

Which loading component to use is a layout question, not a taste question:

- `Skeleton` when you know the shape the content will take. It stops the layout
  from jumping when the data lands.
- `LoadingView` when you do not, or when the section is small.
- `InlineActivity` when a row has to report both busy and idle without changing
  size — it holds the spinner's slot open after the spinner stops.

```tsx
<InlineActivity label="Syncing" active={isSyncing} size="sm" widthMode="full" />
```

---

## 5. A destructive confirmation

The `Dialog` facade covers the ordinary case: a title, a message, and two
actions.

```tsx
import { Button, Dialog, useToast } from "@osuki-dev/ui";
import { useState } from "react";

export function DeleteAddressButton({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [busy, setBusy] = useState(false);
	const { showToast } = useToast();

	async function remove() {
		setBusy(true);
		try {
			await deleteAddress(id);
			showToast({ variant: "success", message: "Address removed." });
			setOpen(false);
		} catch {
			showToast({ variant: "danger", message: "Could not remove the address." });
		} finally {
			setBusy(false);
		}
	}

	return (
		<>
			<Button variant="destructive" onPress={() => setOpen(true)}>
				Remove address
			</Button>

			<Dialog
				visible={open}
				onClose={() => setOpen(false)}
				tone="danger"
				title="Remove this address?"
				message="This cannot be undone. Orders already placed keep their address."
				actions={[
					{ id: "cancel", label: "Cancel" },
					{
						id: "remove",
						label: "Remove",
						tone: "destructive",
						disabled: busy,
						dismissBehavior: "keep-open",
						onPress: remove,
					},
				]}
			/>
		</>
	);
}
```

`dismissBehavior: "keep-open"` is the important part. The default is `"close"`,
which dismisses as soon as the button is pressed — correct for a synchronous
action, wrong for one that can fail, because the user watches the dialog vanish
and then a failure toast appear from nowhere.

Same thing composed, when the dialog body needs more than a message:

```tsx
<Dialog.Root open={open} onOpenChange={setOpen} tone="danger">
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Icon />
			<Dialog.HeaderText>
				<Dialog.Title>Remove this address?</Dialog.Title>
				<Dialog.Description>This cannot be undone.</Dialog.Description>
			</Dialog.HeaderText>
		</Dialog.Header>
		<Dialog.Body>
			<Text variant="bodySmall" colorKey="textMuted">
				{address.line1}
			</Text>
		</Dialog.Body>
		<Dialog.Actions>
			<Dialog.Close>Cancel</Dialog.Close>
			<Dialog.Action variant="destructive" onPress={remove}>
				Remove
			</Dialog.Action>
		</Dialog.Actions>
	</Dialog.Content>
</Dialog.Root>
```

`Dialog.Close` closes on press. `Dialog.Action` does not — use it for the branch
you want to control yourself.

---

## 6. A dashboard

`ResponsiveGrid` for the metric cards, `Section` for the grouping, `Timeline`
for the activity feed.

```tsx
import {
	MetricCard,
	ResponsiveContainer,
	ResponsiveGrid,
	ScrollScreen,
	Section,
	Timeline,
	useThemeTokens,
} from "@osuki-dev/ui";

export default function DashboardScreen() {
	const { spacing } = useThemeTokens();

	return (
		<ScrollScreen variant="page" safeArea="both">
			<ResponsiveContainer
				maxWidth={{ xs: "100%", md: 720, lg: 960 }}
				horizontalPadding={{ xs: 16, md: 24 }}
				verticalPadding={spacing.lg}
			>
				<Section title="This week" gap="md">
					<ResponsiveGrid columns={{ xs: 2, md: 4 }} gap={spacing.sm}>
						<MetricCard
							label="Revenue"
							value="48,210"
							unit="JPY"
							icon="CreditCard"
							tone="success"
							trend="+12%"
						/>
						<MetricCard label="Orders" value={312} icon="Package" trend="+4%" />
						<MetricCard label="Refunds" value={7} icon="RefreshCw" tone="warning" trend="-2%" />
						<MetricCard label="Failed payments" value={2} icon="CircleAlert" tone="danger" />
					</ResponsiveGrid>
				</Section>

				<Section title="Recent activity" description="Last 24 hours" separator="top" gap="md">
					<Timeline
						items={[
							{
								id: "1",
								title: "Order #4821 shipped",
								timestamp: "09:12",
								icon: "Truck",
								status: "completed",
								tone: "success",
							},
							{
								id: "2",
								title: "Payment retry scheduled",
								description: "Card declined once.",
								timestamp: "08:40",
								status: "active",
								tone: "warning",
							},
							{
								id: "3",
								title: "Weekly report",
								timestamp: "Tomorrow",
								status: "pending",
							},
						]}
					/>
				</Section>
			</ResponsiveContainer>
		</ScrollScreen>
	);
}
```

Note `ScrollScreen` rather than `Screen` plus a `ScrollView`. It owns the
scroller, applies the safe-area insets to the content container rather than to
the frame, and defaults `keyboardShouldPersistTaps` to `"handled"`.

---

## 7. Tabs over a table

`Tabs` for the segment, `DataTable` for the rows, `Pagination` underneath.
`DataTable` handles its own loading and empty states, so there is no state
switch here.

```tsx
import {
	DataTable,
	Pagination,
	ScrollScreen,
	Tabs,
	Tag,
	Text,
	useThemeTokens,
} from "@osuki-dev/ui";
import type { DataTableColumn, DataTableSortState } from "@osuki-dev/ui";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

type Invoice = {
	id: string;
	number: string;
	customer: string;
	amount: number;
	status: "paid" | "open" | "overdue";
};

const columns: DataTableColumn<Invoice>[] = [
	{ id: "number", header: "Invoice", accessor: (row) => row.number, width: 110 },
	{ id: "customer", header: "Customer", accessor: (row) => row.customer, minWidth: 140 },
	{
		id: "amount",
		header: "Amount",
		accessor: (row) => row.amount,
		align: "right",
		sortable: true,
		render: (value) => <Text variant="data">{String(value)}</Text>,
	},
	{
		id: "status",
		header: "Status",
		accessor: (row) => row.status,
		render: (value) => (
			<Tag variant={value === "overdue" ? "active" : "default"}>{String(value)}</Tag>
		),
	},
];

export default function InvoicesScreen() {
	const { spacing } = useThemeTokens();
	const [tab, setTab] = useState("all");
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState<DataTableSortState>({
		columnId: "amount",
		direction: "desc",
	});

	const { data, pageCount, isLoading } = useInvoices({ tab, page, sort });

	return (
		<ScrollScreen variant="page" safeArea="both">
			<View style={{ padding: spacing.md, gap: spacing.md }}>
				<Tabs
					variant="pill"
					value={tab}
					onChange={(next) => {
						setTab(next);
						setPage(1);
					}}
					options={[
						{ label: "All", value: "all" },
						{ label: "Open", value: "open", badge: 12 },
						{ label: "Overdue", value: "overdue", badge: 3 },
					]}
				/>

				<DataTable
					columns={columns}
					data={data ?? []}
					getRowId={(row) => row.id}
					sort={sort}
					onSortChange={setSort}
					onRowPress={(row) => router.push(`/invoices/${row.id}`)}
					density="compact"
					renderMode="static"
					loading={isLoading}
					emptyTitle="No invoices"
					emptyMessage="Nothing in this view yet."
				/>

				<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
			</View>
		</ScrollScreen>
	);
}
```

`getRowId` is required. `renderMode="static"` renders every row and is right for
a page of twenty; `renderMode="virtualized"` switches to a `FlatList` and is
right for an infinite feed, where you will also want `onEndReached`.

---

## Where to go next

- [conventions.md](./conventions.md) — the rules these examples follow, stated
  explicitly.
- [components.md](./components.md) — anything used above, with its full prop
  list.
