import React, { useMemo } from "react";
import {
	FlatList,
	Pressable,
	ScrollView,
	View,
	type FlatListProps,
	type PressableProps,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export type DataTableSortDirection = "asc" | "desc";
export type DataTableDensity = "default" | "compact";
export type DataTableAlign = "left" | "center" | "right";

export interface DataTableSortState {
	columnId: string;
	direction: DataTableSortDirection;
}

export interface DataTableColumn<TData, TValue = unknown> {
	id: string;
	header: string;
	accessor: (row: TData) => TValue;
	render?: (value: TValue, row: TData) => React.ReactNode;
	width?: number;
	minWidth?: number;
	align?: DataTableAlign;
	sortable?: boolean;
}

export interface DataTableProps<TData>
	extends
		Omit<ViewProps, "children">,
		Pick<FlatListProps<TData>, "ListFooterComponent" | "onEndReached" | "onEndReachedThreshold"> {
	columns: Array<DataTableColumn<TData>>;
	data: TData[];
	getRowId: (row: TData, index: number) => string;
	sort?: DataTableSortState;
	onSortChange?: (sort: DataTableSortState) => void;
	onRowPress?: (row: TData, index: number) => void;
	selectedRowIds?: string[];
	emptyTitle?: string;
	emptyMessage?: string;
	loading?: boolean;
	loadingRowCount?: number;
	density?: DataTableDensity;
	renderMode?: "static" | "virtualized";
}

const defaultColumnWidth = 144;

export function DataTable<TData>({
	columns,
	data,
	getRowId,
	sort,
	onSortChange,
	onRowPress,
	selectedRowIds = [],
	emptyTitle = "No rows",
	emptyMessage = "There is no data to show yet.",
	loading = false,
	loadingRowCount = 4,
	density = "default",
	renderMode = "static",
	ListFooterComponent,
	onEndReached,
	onEndReachedThreshold,
	style,
	testID,
	...props
}: DataTableProps<TData>) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const selectedRows = useMemo(() => new Set(selectedRowIds), [selectedRowIds]);
	const rowHeight = density === "compact" ? 44 : 56;
	const tableWidth = columns.reduce(
		(total, column) => total + (column.width ?? column.minWidth ?? defaultColumnWidth),
		0,
	);
	const isEmpty = !loading && data.length === 0;
	const loadingRows = useMemo(
		() => Array.from({ length: Math.max(loadingRowCount, 1) }, (_, index) => index),
		[loadingRowCount],
	);

	const handleSort = (column: DataTableColumn<TData>) => {
		if (!column.sortable || !onSortChange) return;
		haptics.feedback("selection");
		const direction = sort?.columnId === column.id && sort.direction === "asc" ? "desc" : "asc";
		onSortChange({ columnId: column.id, direction });
	};

	const renderRow = (row: TData, index: number) => {
		const rowId = getRowId(row, index);
		const selected = selectedRows.has(rowId);
		const rowContent = (
			<View
				style={[
					rowStyle(theme.colors.border, rowHeight),
					selected && { backgroundColor: theme.colors.primarySubtle },
				]}
				testID={testID ? `${testID}-row-${rowId}` : undefined}
			>
				{columns.map((column) => (
					<Cell key={column.id} column={column} row={row} />
				))}
			</View>
		);

		if (!onRowPress) return rowContent;

		return (
			<Pressable
				accessibilityRole="button"
				accessibilityState={{ selected }}
				onPress={() => {
					haptics.feedback("selection");
					onRowPress(row, index);
				}}
				testID={testID ? `${testID}-pressable-row-${rowId}` : undefined}
			>
				{rowContent}
			</Pressable>
		);
	};

	return (
		<View style={[{ width: "100%", minWidth: 0 }, style]} testID={testID} {...props}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<View style={{ width: tableWidth, minWidth: "100%" }}>
					<View
						style={[
							rowStyle(theme.colors.borderStrong, rowHeight),
							{ backgroundColor: theme.colors.surfaceRaised },
						]}
						testID={testID ? `${testID}-header` : undefined}
					>
						{columns.map((column) => (
							<HeaderCell
								key={column.id}
								column={column}
								sort={sort}
								onPress={() => handleSort(column)}
							/>
						))}
					</View>
					{loading ? (
						<View testID={testID ? `${testID}-loading` : undefined}>
							{loadingRows.map((row) => (
								<View key={row} style={rowStyle(theme.colors.border, rowHeight)}>
									{columns.map((column) => (
										<View key={column.id} style={columnStyle(column)}>
											<View
												style={{
													width: "72%",
													height: 12,
													borderRadius: theme.radius.pill,
													backgroundColor: theme.colors.border,
												}}
											/>
										</View>
									))}
								</View>
							))}
						</View>
					) : isEmpty ? (
						<View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs }}>
							<Text variant="body" colorKey="text" selectable>
								{emptyTitle}
							</Text>
							<Text variant="caption" colorKey="textMuted" selectable>
								{emptyMessage}
							</Text>
						</View>
					) : renderMode === "virtualized" ? (
						<FlatList
							data={data}
							keyExtractor={getRowId}
							renderItem={({ item, index }) => renderRow(item, index)}
							scrollEnabled={false}
							ListFooterComponent={ListFooterComponent}
							onEndReached={onEndReached}
							onEndReachedThreshold={onEndReachedThreshold}
						/>
					) : (
						<View>
							{data.map((row, index) => (
								<React.Fragment key={getRowId(row, index)}>{renderRow(row, index)}</React.Fragment>
							))}
							{typeof ListFooterComponent === "function" ? (
								<ListFooterComponent />
							) : (
								ListFooterComponent
							)}
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

function HeaderCell<TData>({
	column,
	sort,
	onPress,
}: {
	column: DataTableColumn<TData>;
	sort?: DataTableSortState;
	onPress: PressableProps["onPress"];
}) {
	const theme = useThemeTokens();
	const active = sort?.columnId === column.id;
	const content = (
		<View style={[columnStyle(column), { flexDirection: "row", alignItems: "center", gap: 6 }]}>
			<Text variant="label" colorKey={active ? "primary" : "textMuted"} numberOfLines={1}>
				{column.header}
			</Text>
			{column.sortable && (
				<Icon
					name={active && sort?.direction === "desc" ? "ArrowDown" : "ArrowUp"}
					size={14}
					color={active ? theme.colors.primary : theme.colors.textSubtle}
				/>
			)}
		</View>
	);

	if (!column.sortable) return content;

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`Sort by ${column.header}`}
			onPress={onPress}
		>
			{content}
		</Pressable>
	);
}

function Cell<TData, TValue>({
	column,
	row,
}: {
	column: DataTableColumn<TData, TValue>;
	row: TData;
}) {
	const value = column.accessor(row);
	const rendered = column.render?.(value, row);
	const content = rendered ?? String(value ?? "");

	return (
		<View style={columnStyle(column)}>
			{typeof content === "string" || typeof content === "number" ? (
				<Text
					variant="bodySmall"
					colorKey="text"
					numberOfLines={2}
					selectable
					style={{ textAlign: column.align ?? "left" }}
				>
					{content}
				</Text>
			) : (
				content
			)}
		</View>
	);
}

function rowStyle(borderColor: string, minHeight: number): ViewStyle {
	return {
		minHeight,
		flexDirection: "row",
		alignItems: "stretch",
		borderBottomWidth: 1,
		borderBottomColor: borderColor,
	};
}

function columnStyle<TData, TValue>(column: DataTableColumn<TData, TValue>): ViewStyle {
	const width = column.width ?? column.minWidth ?? defaultColumnWidth;
	return {
		width,
		minWidth: column.minWidth ?? Math.min(width, defaultColumnWidth),
		justifyContent: "center",
		alignItems:
			column.align === "right" ? "flex-end" : column.align === "center" ? "center" : "flex-start",
		paddingHorizontal: 12,
		paddingVertical: 8,
	};
}
