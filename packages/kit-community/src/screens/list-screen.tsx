import React, { useState, useMemo } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";

import {
	Screen,
	Surface,
	Card,
	Text,
	Input,
	Icon,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

import { useI18n } from "../i18n";
import type { EntityBase, EntityConfig, ColumnConfig } from "../types";

export interface ListScreenProps<T extends EntityBase> {
	entity: EntityConfig<T>;
	data: T[];
	onItemPress?: (item: T) => void;
	onActionPress?: (action: string, item: T) => void;
	headerRight?: React.ReactNode;
}

/**
 * Generic list screen component with Osuki design system
 *
 * Features:
 * - Hero section with count/total
 * - Search/filter
 * - Sortable columns
 * - Row actions
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <ListScreen
 *   entity={UserEntity}
 *   data={users}
 *   onItemPress={(user) => navigate('detail', { id: user.id })}
 * />
 * ```
 */
export function ListScreen<T extends EntityBase>({
	entity,
	data,
	onItemPress,
	onActionPress,
	headerRight,
}: ListScreenProps<T>) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const { t } = useI18n();
	const config = entity.list;

	if (!config) {
		throw new Error(`Entity ${entity.name} does not have list configuration`);
	}

	const [searchQuery, setSearchQuery] = useState("");
	const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	// Filter and sort data
	const filteredData = useMemo(() => {
		let result = [...data];

		// Search filter
		if (searchQuery && config.searchFields) {
			const query = searchQuery.toLowerCase();
			result = result.filter((item) =>
				config.searchFields!.some((field) => {
					const value = String(item[field]).toLowerCase();
					return value.includes(query);
				}),
			);
		}

		// Sort
		if (sortColumn) {
			result.sort((a, b) => {
				const aVal = a[sortColumn];
				const bVal = b[sortColumn];
				if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
				if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
				return 0;
			});
		}

		return result;
	}, [data, searchQuery, sortColumn, sortDirection, config]);

	// Calculate hero value
	const heroValue = config.hero ? config.hero.value(filteredData) : filteredData.length;

	const handleSort = (column: ColumnConfig<T>) => {
		if (!column.sortable) return;

		if (sortColumn === column.key) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(column.key);
			setSortDirection("asc");
		}
	};

	const renderCell = (item: T, column: ColumnConfig<T>) => {
		const value = item[column.key];
		const displayValue = column.format ? column.format(value, item) : String(value);

		// Determine color based on colorMap
		let colorKey: keyof typeof colors = "text";
		if (column.colorMap && typeof value === "string") {
			const mappedColor = column.colorMap[value];
			if (mappedColor) {
				switch (mappedColor) {
					case "primary":
						colorKey = "primary";
						break;
					case "success":
						colorKey = "success";
						break;
					case "warning":
						colorKey = "warning";
						break;
					case "error":
						colorKey = "primary";
						break;
					case "muted":
						colorKey = "textMuted";
						break;
				}
			}
		}

		// Render based on type
		if (column.type === "tag") {
			return (
				<Text variant="caption" color={colors[colorKey]}>
					{displayValue}
				</Text>
			);
		}

		if (column.type === "boolean") {
			return (
				<Text variant="caption" color={value ? colors.success : colors.textDisabled}>
					{value ? t("list.yes") : t("list.no")}
				</Text>
			);
		}

		const textVariant = column.variant === "primary" ? "body" : "caption";

		return (
			<Text variant={textVariant} color={colors[colorKey === "text" ? "text" : colorKey]}>
				{displayValue}
			</Text>
		);
	};

	const renderListHeader = () => (
		<View>
			<Surface variant="page" style={styles.headerContainer}>
				<View style={styles.headerRow}>
					<View>
						<Text variant="hero" color={colors.text}>
							{typeof heroValue === "number" ? heroValue.toLocaleString() : heroValue}
						</Text>
						<View style={styles.heroMeta}>
							<Text variant="label" color={colors.textMuted}>
								{config.hero?.label || config.title}
							</Text>
							{entity.icon && <Icon name={entity.icon} size={16} color={colors.textMuted} />}
						</View>
					</View>
					{headerRight}
				</View>

				{config.searchFields && config.searchFields.length > 0 && (
					<View style={styles.searchContainer}>
						<Input
							variant="outline"
							placeholder={t("list.searchPlaceholder")}
							value={searchQuery}
							onChangeText={setSearchQuery}
							style={styles.searchInput}
						/>
					</View>
				)}
			</Surface>

			<View style={[styles.row, styles.headerRowBase]}>
				{config.columns.map((column) => (
					<TouchableOpacity
						key={String(column.key)}
						style={[
							styles.cell,
							{
								flex: column.width === "flex" ? 1 : undefined,
								width: typeof column.width === "number" ? column.width : undefined,
							},
						]}
						onPress={() => handleSort(column)}
						disabled={!column.sortable}
					>
						<Text variant="label" color={column.sortable ? colors.text : colors.textMuted}>
							{column.label}
							{sortColumn === column.key && (sortDirection === "asc" ? " ↑" : " ↓")}
						</Text>
					</TouchableOpacity>
				))}
				{config.actions && config.actions.length > 0 && (
					<View style={[styles.cell, styles.actionsCell]}>
						<Text variant="label" color={colors.textMuted}>
							{t("list.actions")}
						</Text>
					</View>
				)}
			</View>
		</View>
	);

	const renderListEmpty = () => (
		<Card variant="raised" border="subtle" padding="lg" style={styles.emptyState}>
			<Text variant="body" color={colors.textMuted} style={styles.center}>
				{t("list.noData")}
			</Text>
			{searchQuery && (
				<Text variant="caption" color={colors.textDisabled} style={styles.center}>
					{t("list.adjustSearch")}
				</Text>
			)}
		</Card>
	);

	const renderListItem = ({ item, index }: { item: T; index: number }) => (
		<TouchableOpacity onPress={() => onItemPress?.(item)} activeOpacity={0.7}>
			<Card
				variant="raised"
				border="subtle"
				padding="md"
				style={[styles.dataRow, index % 2 === 0 ? styles.evenRow : undefined]}
			>
				<View style={styles.row}>
					{config.columns.map((column) => (
						<View
							key={String(column.key)}
							style={[
								styles.cell,
								{
									flex: column.width === "flex" ? 1 : undefined,
									width: typeof column.width === "number" ? column.width : undefined,
								},
							]}
						>
							{renderCell(item, column)}
						</View>
					))}

					{config.actions && config.actions.length > 0 && (
						<View style={[styles.cell, styles.actionsCell]}>
							<View style={styles.actionsRow}>
								{config.actions.map((action) =>
									action.visible && !action.visible(item) ? null : (
										<TouchableOpacity
											key={action.id}
											onPress={(e) => {
												e.stopPropagation();
												onActionPress?.(action.id, item);
												action.onPress?.(item);
											}}
											style={styles.actionButton}
										>
											{action.icon && (
												<Icon name={action.icon} size={18} color={colors.textMuted} />
											)}
										</TouchableOpacity>
									),
								)}
							</View>
						</View>
					)}
				</View>
			</Card>
		</TouchableOpacity>
	);

	return (
		<Screen>
			<ResponsiveContainer maxWidth="100%" horizontalPadding={pagePadding} style={styles.listFrame}>
				<FlatList
					data={filteredData}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderListItem}
					ListHeaderComponent={renderListHeader}
					ListEmptyComponent={renderListEmpty}
					ListFooterComponent={<View style={{ height: spacing["4xl"] }} />}
					contentContainerStyle={styles.content}
					initialNumToRender={12}
					maxToRenderPerBatch={12}
					removeClippedSubviews={filteredData.length > 24}
					showsVerticalScrollIndicator={false}
					windowSize={8}
				/>
			</ResponsiveContainer>
		</Screen>
	);
}

const styles = StyleSheet.create({
	listFrame: {
		flex: 1,
	},
	content: {
		padding: 0,
	},
	headerContainer: {
		paddingTop: 16,
		paddingBottom: 16,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	heroMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginTop: 8,
	},
	searchContainer: {
		marginTop: 8,
	},
	searchInput: {
		// Additional search input styles
	},
	listContainer: {
		gap: 8,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	headerRowBase: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	cell: {
		minWidth: 60,
	},
	actionsCell: {
		width: 100,
		alignItems: "flex-end",
	},
	dataRow: {
		marginBottom: 8,
	},
	evenRow: {
		// Optional: alternate row styling (but Osuki design prefers no zebra striping)
	},
	actionsRow: {
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		padding: 4,
	},
	emptyState: {
		marginTop: 32,
		alignItems: "center",
	},
	center: {
		textAlign: "center",
	},
});
