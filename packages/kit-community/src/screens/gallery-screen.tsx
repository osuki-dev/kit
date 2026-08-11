import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";

import {
	Screen,
	Text,
	Tag,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

const { width } = Dimensions.get("window");

export interface GalleryItem {
	id: string;
	image: string;
	title?: string;
	subtitle?: string;
	tag?: string;
	aspectRatio?: number;
	onPress?: () => void;
}

export interface GalleryCategory {
	id: string;
	label: string;
}

export interface GalleryScreenConfig {
	/** Gallery title */
	title: string;
	/** Gallery subtitle/description */
	subtitle?: string;
	/** Gallery items */
	items: GalleryItem[];
	/** Categories/filters */
	categories?: GalleryCategory[];
	/** Selected category */
	selectedCategory?: string;
	/** Number of columns */
	columns?: 1 | 2 | 3 | 4;
	/** Loading state */
	isLoading?: boolean;
	/** Empty state message */
	emptyMessage?: string;
	/** Show title section */
	showHeader?: boolean;
}

export interface GalleryScreenProps {
	config: GalleryScreenConfig;
	/** On category change */
	onCategoryChange?: (categoryId: string) => void;
	/** On item press */
	onItemPress?: (item: GalleryItem) => void;
	/** On load more (pagination) */
	onLoadMore?: () => void;
	/** Back handler */
	onBack?: () => void;
}

/**
 * Gallery screen template
 *
 * Features:
 * - Grid/masonry layout
 * - Category filtering
 * - Image optimization
 * - Loading states
 * - Empty state
 *
 * @example
 * ```tsx
 * <GalleryScreen
 *   config={{
 *     title: 'GALLERY',
 *     items: [
 *       { id: '1', image: 'https://...', title: 'Item 1' },
 *       { id: '2', image: 'https://...', title: 'Item 2' },
 *     ],
 *     categories: [
 *       { id: 'all', label: 'ALL' },
 *       { id: 'photos', label: 'PHOTOS' },
 *       { id: 'videos', label: 'VIDEOS' },
 *     ],
 *     columns: 2,
 *   }}
 *   onItemPress={(item) => navigate('detail', { id: item.id })}
 * />
 * ```
 */
export const GalleryScreen: React.FC<GalleryScreenProps> = ({
	config,
	onCategoryChange,
	onItemPress,
	onLoadMore,
	onBack,
}) => {
	const { colors, spacing } = useTheme();
	const { pagePadding, isMobile } = useResponsiveTheme();

	const columns = isMobile ? config.columns || 2 : 3;
	const itemWidth = (width - pagePadding * 2 - (columns - 1) * spacing["sm"]) / columns;
	const hasItems = config.items.length > 0;

	if (config.isLoading) {
		return (
			<Screen>
				<View style={[styles.loadingContainer, { paddingTop: spacing["4xl"] }]}>
					<Text variant="caption" color={colors.textMuted}>
						[LOADING...]
					</Text>
				</View>
			</Screen>
		);
	}

	return (
		<Screen>
			{/* Header */}
			{config.showHeader !== false && (
				<View
					style={[
						styles.header,
						{
							paddingHorizontal: pagePadding,
							paddingVertical: spacing["md"],
							borderBottomColor: colors.border,
						},
					]}
				>
					<View style={styles.headerTop}>
						{onBack && (
							<TouchableOpacity onPress={onBack} style={styles.backButton}>
								<Text variant="caption" color={colors.textMuted}>
									[BACK]
								</Text>
							</TouchableOpacity>
						)}

						<Text variant="heading" color={colors.text}>
							{config.title}
						</Text>

						{config.subtitle && (
							<Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
								{config.subtitle}
							</Text>
						)}
					</View>

					{/* Categories */}
					{config.categories && config.categories.length > 0 && (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={[styles.categoriesContainer, { marginTop: spacing["md"] }]}
							contentContainerStyle={{ gap: spacing["sm"] }}
						>
							{config.categories.map((category) => (
								<TouchableOpacity key={category.id} onPress={() => onCategoryChange?.(category.id)}>
									<Tag variant={config.selectedCategory === category.id ? "active" : "default"}>
										{category.label}
									</Tag>
								</TouchableOpacity>
							))}
						</ScrollView>
					)}
				</View>
			)}

			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ padding: pagePadding, flexGrow: 1 }}
				onScroll={({ nativeEvent }) => {
					const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
					const paddingToBottom = 20;
					if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
						onLoadMore?.();
					}
				}}
				scrollEventThrottle={400}
			>
				<ResponsiveContainer maxWidth={{ xs: "100%", md: 800, lg: 960 }} alignment="center">
					{/* Empty State */}
					{!hasItems && (
						<View style={[styles.emptyState, { marginTop: spacing["4xl"] }]}>
							<Text variant="body" color={colors.textMuted}>
								{config.emptyMessage || "NO ITEMS"}
							</Text>
						</View>
					)}

					{/* Grid Layout */}
					{hasItems && (
						<View style={styles.grid}>
							{config.items.map((item, index) => {
								const aspectRatio = item.aspectRatio || 1;
								const itemHeight = itemWidth / aspectRatio;

								return (
									<TouchableOpacity
										key={item.id}
										onPress={() => item.onPress?.() || onItemPress?.(item)}
										style={[
											styles.gridItem,
											{
												width: itemWidth,
												marginBottom: spacing["md"],
												marginRight: (index + 1) % columns === 0 ? 0 : spacing["sm"],
											},
										]}
									>
										{/* Image */}
										<View
											style={[
												styles.imageContainer,
												{
													height: itemHeight,
													backgroundColor: colors.surfaceRaised,
													borderRadius: 8,
													overflow: "hidden",
												},
											]}
										>
											<Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

											{/* Tag overlay */}
											{item.tag && (
												<View style={styles.tagOverlay}>
													<Tag variant="pill" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
														{item.tag}
													</Tag>
												</View>
											)}
										</View>

										{/* Info */}
										{(item.title || item.subtitle) && (
											<View style={{ marginTop: spacing["xs"] }}>
												{item.title && (
													<Text variant="caption" color={colors.text} numberOfLines={1}>
														{item.title}
													</Text>
												)}
												{item.subtitle && (
													<Text variant="caption" color={colors.textDisabled} numberOfLines={1}>
														{item.subtitle}
													</Text>
												)}
											</View>
										)}
									</TouchableOpacity>
								);
							})}
						</View>
					)}

					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		alignItems: "center",
	},
	header: {
		borderBottomWidth: 1,
	},
	headerTop: {
		alignItems: "center",
	},
	backButton: {
		position: "absolute",
		left: 0,
		top: 0,
	},
	categoriesContainer: {
		flexDirection: "row",
	},
	content: {
		flex: 1,
	},
	emptyState: {
		alignItems: "center",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	gridItem: {
		// Width is calculated dynamically
	},
	imageContainer: {
		position: "relative",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	tagOverlay: {
		position: "absolute",
		top: 8,
		right: 8,
	},
});
