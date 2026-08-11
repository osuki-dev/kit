import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

import {
	Screen,
	Card,
	Text,
	Icon,
	Image,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	type IconName,
} from "@osuki-dev/ui";

export type FileItemType = "file" | "folder" | "image" | "video" | "audio" | "document";

export interface FileItem {
	id: string;
	name: string;
	type: FileItemType;
	size?: number; // bytes
	modifiedAt: Date;
	thumbnail?: string;
	isSelected?: boolean;
}

export interface FileBrowserConfig {
	/** Current path */
	currentPath: string;
	/** Files and folders */
	items: FileItem[];
	/** View mode */
	viewMode?: "list" | "grid";
	/** Sort by */
	sortBy?: "name" | "size" | "date";
	/** Sort direction */
	sortDirection?: "asc" | "desc";
	/** Selection mode */
	selectionMode?: boolean;
	/** Selected items */
	selectedIds?: string[];
}

export interface FileBrowserProps {
	config: FileBrowserConfig;
	/** Optional visible status text for current selection or browser state */
	statusText?: string;
	/** Action handlers */
	onItemPress?: (item: FileItem) => void;
	onItemLongPress?: (item: FileItem) => void;
	onNavigate?: (path: string) => void;
	onNavigateUp?: () => void;
	onSortChange?: (sortBy: "name" | "size" | "date") => void;
	onViewModeChange?: (mode: "list" | "grid") => void;
	onSelectionChange?: (selectedIds: string[]) => void;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		pathBar?: ViewStyle;
		itemList?: ViewStyle;
		item?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	toolbar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
	},
	pathBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	pathSegment: {
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	viewToggle: {
		flexDirection: "row",
		gap: 8,
	},
	toggleButton: {
		width: 36,
		height: 36,
		borderRadius: 4,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
	itemList: {
		padding: 16,
	},
	listItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 12,
		borderBottomWidth: 1,
	},
	itemIcon: {
		width: 40,
		height: 40,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	itemInfo: {
		flex: 1,
	},
	itemMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	gridItem: {
		width: "31%",
		aspectRatio: 1,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		padding: 8,
	},
	gridThumbnail: {
		width: "100%",
		flex: 1,
		borderRadius: 4,
		marginBottom: 8,
	},
	selectionIndicator: {
		position: "absolute",
		top: 8,
		right: 8,
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyContainer: {
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
		minHeight: 280,
	},
});

const fileIcons: Record<FileItemType, IconName> = {
	file: "File",
	folder: "Folder",
	image: "Image",
	video: "Video",
	audio: "Music",
	document: "FileText",
};

const formatFileSize = (bytes: number) => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/**
 * File browser screen template
 *
 * Features:
 * - List and grid view modes
 * - Path navigation
 * - File type icons
 * - Selection mode
 * - Sorting options
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <FileBrowser
 *   config={{
 *     currentPath: "/documents",
 *     items: [{ id: "1", name: "report.pdf", type: "document", size: 1024, modifiedAt: new Date() }],
 *     viewMode: "list",
 *   }}
 * />
 * ```
 */
export function FileBrowser({
	config,
	onItemPress,
	onItemLongPress,
	onNavigate,
	onNavigateUp,
	onSortChange,
	onViewModeChange,
	onSelectionChange,
	styleOverrides,
	statusText,
}: FileBrowserProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const {
		currentPath,
		items,
		viewMode = "list",
		sortBy = "name",
		sortDirection = "asc",
		selectionMode = false,
		selectedIds = [],
	} = config;

	const [currentView, setCurrentView] = useState(viewMode);
	const sortOptions: Array<NonNullable<FileBrowserConfig["sortBy"]>> = ["name", "size", "date"];

	// Sort items
	const sortedItems = [...items].sort((a, b) => {
		// Folders first
		if (a.type === "folder" && b.type !== "folder") return -1;
		if (b.type === "folder" && a.type !== "folder") return 1;

		let comparison = 0;
		switch (sortBy) {
			case "name":
				comparison = a.name.localeCompare(b.name);
				break;
			case "size":
				comparison = (a.size || 0) - (b.size || 0);
				break;
			case "date":
				comparison = a.modifiedAt.getTime() - b.modifiedAt.getTime();
				break;
		}
		return sortDirection === "asc" ? comparison : -comparison;
	});

	const pathSegments = currentPath.split("/").filter(Boolean);

	const toggleSelection = (id: string) => {
		const newSelection = selectedIds.includes(id)
			? selectedIds.filter((item) => item !== id)
			: [...selectedIds, id];
		onSelectionChange?.(newSelection);
	};

	return (
		<Screen style={staticStyles.container}>
			<ScrollView style={staticStyles.scrollView} showsVerticalScrollIndicator={false}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					{/* Toolbar */}
					<View style={[staticStyles.toolbar, { borderBottomColor: colors.border }]}>
						<Text variant="label" color={colors.textMuted}>
							{statusText ?? `${items.length} items`}
							{!statusText && selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
						</Text>

						<View style={staticStyles.viewToggle}>
							{sortOptions.map((sort) => (
								<TouchableOpacity
									key={sort}
									onPress={() => onSortChange?.(sort)}
									style={[{ borderColor: sortBy === sort ? colors.text : colors.border }]}
									testID={`files-sort-${sort}`}
								>
									<Text
										variant="caption"
										color={sortBy === sort ? colors.text : colors.textMuted}
										transform="uppercase"
									>
										{sort}
									</Text>
								</TouchableOpacity>
							))}

							<TouchableOpacity
								onPress={() => {
									const newMode = currentView === "list" ? "grid" : "list";
									setCurrentView(newMode);
									onViewModeChange?.(newMode);
								}}
								testID="files-view-toggle"
							>
								<Icon
									name={currentView === "list" ? "Grid3X3" : "List"}
									size={18}
									color={colors.textMuted}
								/>
							</TouchableOpacity>
						</View>
					</View>

					{/* Path Bar */}
					<View
						style={[
							staticStyles.pathBar,
							{ borderBottomColor: colors.border },
							styleOverrides?.pathBar,
						]}
					>
						<TouchableOpacity onPress={onNavigateUp} testID="files-navigate-up">
							<Icon name="ChevronUp" size={20} color={colors.textMuted} />
						</TouchableOpacity>

						{pathSegments.map((segment, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => onNavigate?.("/" + pathSegments.slice(0, index + 1).join("/"))}
								style={staticStyles.pathSegment}
								testID={`files-path-${index}`}
							>
								<Text
									variant="caption"
									color={index === pathSegments.length - 1 ? colors.text : colors.textMuted}
								>
									{segment}
									{index < pathSegments.length - 1 && " /"}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{/* File List */}
					<View style={[staticStyles.itemList, styleOverrides?.itemList]}>
						{sortedItems.length === 0 ? (
							<Card variant="flat" border="subtle">
								<View style={staticStyles.emptyContainer} testID="files-empty-folder">
									<Icon name="FolderOpen" size={64} color={colors.textDisabled} />
									<Text variant="heading" color={colors.textMuted} style={{ marginTop: 16 }}>
										FOLDER IS EMPTY
									</Text>
								</View>
							</Card>
						) : currentView === "list" ? (
							// List View
							<Card variant="flat" border="subtle">
								{sortedItems.map((item, index) => (
									<TouchableOpacity
										key={item.id}
										onPress={() => {
											if (selectionMode) {
												toggleSelection(item.id);
											} else {
												onItemPress?.(item);
											}
										}}
										onLongPress={() => onItemLongPress?.(item)}
										testID={`files-item-${item.id}`}
										style={[
											staticStyles.listItem,
											{
												borderBottomColor: colors.border,
												borderBottomWidth: index === sortedItems.length - 1 ? 0 : 1,
												backgroundColor: selectedIds.includes(item.id)
													? colors.surfaceRaised
													: "transparent",
											},
											styleOverrides?.item,
										]}
									>
										<View
											style={[staticStyles.itemIcon, { backgroundColor: colors.surfaceRaised }]}
										>
											<Icon name={fileIcons[item.type]} size={20} color={colors.textMuted} />
										</View>

										<View style={staticStyles.itemInfo}>
											<Text variant="body" color={colors.text}>
												{item.name}
											</Text>

											<View style={staticStyles.itemMeta}>
												{item.size !== undefined && (
													<Text
														variant="caption"
														color={colors.textMuted}
														testID={`files-item-size-${item.id}`}
													>
														{formatFileSize(item.size)}
													</Text>
												)}
												<Text variant="caption" color={colors.textDisabled}>
													{item.modifiedAt.toLocaleDateString()}
												</Text>
											</View>
										</View>

										{selectionMode && (
											<View
												style={[
													staticStyles.selectionIndicator,
													{
														borderColor: selectedIds.includes(item.id)
															? colors.text
															: colors.border,
														backgroundColor: selectedIds.includes(item.id)
															? colors.text
															: "transparent",
													},
												]}
											>
												{selectedIds.includes(item.id) && (
													<Icon name="Check" size={14} color={colors.background} />
												)}
											</View>
										)}
									</TouchableOpacity>
								))}
							</Card>
						) : (
							// Grid View
							<View style={staticStyles.gridContainer}>
								{sortedItems.map((item) => (
									<TouchableOpacity
										key={item.id}
										onPress={() => {
											if (selectionMode) {
												toggleSelection(item.id);
											} else {
												onItemPress?.(item);
											}
										}}
										onLongPress={() => onItemLongPress?.(item)}
										testID={`files-item-${item.id}`}
										style={[
											staticStyles.gridItem,
											{
												borderWidth: 1,
												borderColor: selectedIds.includes(item.id) ? colors.text : colors.border,
												backgroundColor: colors.surfaceRaised,
											},
											styleOverrides?.item,
										]}
									>
										{item.thumbnail ? (
											<Image
												source={{ uri: item.thumbnail }}
												style={staticStyles.gridThumbnail}
												contentFit="cover"
												cachePolicy="memory-disk"
												testID={`files-thumbnail-${item.id}`}
											/>
										) : (
											<Icon name={fileIcons[item.type]} size={32} color={colors.textMuted} />
										)}

										<Text variant="caption" color={colors.text} style={{ textAlign: "center" }}>
											{item.name}
										</Text>

										{selectionMode && (
											<View
												style={[
													staticStyles.selectionIndicator,
													{
														borderColor: selectedIds.includes(item.id)
															? colors.text
															: colors.border,
														backgroundColor: selectedIds.includes(item.id)
															? colors.text
															: "transparent",
													},
												]}
											>
												{selectedIds.includes(item.id) && (
													<Icon name="Check" size={14} color={colors.background} />
												)}
											</View>
										)}
									</TouchableOpacity>
								))}
							</View>
						)}
					</View>

					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}
