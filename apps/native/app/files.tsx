import { useMemo, useState } from "react";

import { FileBrowser } from "@osuki-dev/kit-community";
import type { FileBrowserConfig, FileItem } from "@osuki-dev/kit-community";
import { catalogAssets } from "@/lib/catalog-assets";

type SortBy = NonNullable<FileBrowserConfig["sortBy"]>;
type SortDirection = NonNullable<FileBrowserConfig["sortDirection"]>;

const filesByPath: Record<string, FileItem[]> = {
	"/Documents/Projects": [
		{
			id: "folder-design",
			name: "Design System",
			type: "folder",
			modifiedAt: new Date("2024-03-15"),
			size: 0,
		},
		{
			id: "folder-components",
			name: "Components",
			type: "folder",
			modifiedAt: new Date("2024-03-14"),
			size: 0,
		},
		{
			id: "specs",
			name: "specs.pdf",
			type: "document",
			modifiedAt: new Date("2024-03-13"),
			size: 2450000,
		},
		{
			id: "logo",
			name: "logo.png",
			type: "image",
			modifiedAt: new Date("2024-03-12"),
			size: 125000,
			thumbnail: catalogAssets.workspace,
		},
		{
			id: "readme",
			name: "README.md",
			type: "file",
			modifiedAt: new Date("2024-03-11"),
			size: 4500,
		},
		{
			id: "video",
			name: "video-product.mp4",
			type: "video",
			modifiedAt: new Date("2024-03-10"),
			size: 15400000,
		},
	],
	"/Documents/Projects/Design System": [
		{
			id: "tokens",
			name: "tokens.json",
			type: "file",
			modifiedAt: new Date("2024-03-18"),
			size: 18400,
		},
		{
			id: "brand",
			name: "brand-preview.png",
			type: "image",
			modifiedAt: new Date("2024-03-17"),
			size: 438000,
			thumbnail: catalogAssets.workspace,
		},
		{
			id: "handoff",
			name: "handoff-notes.pdf",
			type: "document",
			modifiedAt: new Date("2024-03-16"),
			size: 920000,
		},
		{
			id: "archive",
			name: "Archive",
			type: "folder",
			modifiedAt: new Date("2024-03-15"),
			size: 0,
		},
	],
	"/Documents/Projects/Design System/Archive": [],
	"/Documents/Projects/Components": [
		{
			id: "button-spec",
			name: "button-spec.md",
			type: "file",
			modifiedAt: new Date("2024-03-16"),
			size: 6400,
		},
		{
			id: "inputs",
			name: "input-states.pdf",
			type: "document",
			modifiedAt: new Date("2024-03-15"),
			size: 721000,
		},
	],
};

export default function FilesPage() {
	const [currentPath, setCurrentPath] = useState("/Documents/Projects");
	const [viewMode, setViewMode] = useState<FileBrowserConfig["viewMode"]>("list");
	const [sortBy, setSortBy] = useState<SortBy>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const items = filesByPath[currentPath] ?? [];
	const selectedItem = useMemo(
		() => items.find((item) => selectedIds.includes(item.id)) ?? null,
		[items, selectedIds],
	);

	const config: FileBrowserConfig = {
		currentPath,
		items,
		viewMode,
		sortBy,
		sortDirection,
		selectionMode: false,
		selectedIds,
	};

	const handleSortChange = (nextSortBy: SortBy) => {
		setSortDirection((current) => (sortBy === nextSortBy && current === "asc" ? "desc" : "asc"));
		setSortBy(nextSortBy);
	};

	const handleItemPress = (item: FileItem) => {
		if (item.type === "folder") {
			setCurrentPath(`${currentPath}/${item.name}`);
			setSelectedIds([]);
			return;
		}

		setSelectedIds((current) =>
			current.includes(item.id) ? current.filter((id) => id !== item.id) : [item.id],
		);
	};

	const handleNavigate = (path: string) => {
		setCurrentPath(path);
		setSelectedIds([]);
	};

	const handleNavigateUp = () => {
		const parentPath = currentPath.split("/").filter(Boolean).slice(0, -1).join("/");
		setCurrentPath(parentPath ? `/${parentPath}` : "/Documents/Projects");
		setSelectedIds([]);
	};

	return (
		<FileBrowser
			config={config}
			onItemPress={handleItemPress}
			onNavigate={handleNavigate}
			onNavigateUp={handleNavigateUp}
			onSortChange={handleSortChange}
			onViewModeChange={setViewMode}
			statusText={
				selectedItem
					? `Selected ${selectedItem.name}`
					: `${currentPath} · ${sortBy.toUpperCase()} ${sortDirection.toUpperCase()}`
			}
		/>
	);
}
