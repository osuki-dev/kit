import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	Icon,
	Avatar,
	Image,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

export type FeedItemType = "text" | "image" | "video" | "link";

export interface FeedItem {
	id: string;
	author: {
		name: string;
		avatar?: string;
		handle?: string;
	};
	content: string;
	type?: FeedItemType;
	media?: string[];
	link?: {
		title: string;
		url: string;
		image?: string;
	};
	timestamp: Date;
	likes: number;
	comments: number;
	shares: number;
	isLiked?: boolean;
	isBookmarked?: boolean;
}

export interface FeedScreenConfig {
	/** Feed items */
	items: FeedItem[];
	/** Has more items to load */
	hasMore?: boolean;
	/** Is loading more */
	isLoadingMore?: boolean;
}

export interface FeedScreenProps {
	config: FeedScreenConfig;
	/** Action handlers */
	onLike?: (itemId: string) => void;
	onComment?: (itemId: string) => void;
	onShare?: (itemId: string) => void;
	onBookmark?: (itemId: string) => void;
	onLoadMore?: () => void;
	onItemPress?: (item: FeedItem) => void;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		item?: ViewStyle;
		mediaGrid?: ViewStyle;
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
	feedContainer: {
		gap: 16,
	},
	itemCard: {
		marginBottom: 8,
	},
	itemHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 12,
	},
	authorInfo: {
		flex: 1,
	},
	content: {
		marginBottom: 12,
	},
	mediaGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 4,
		marginBottom: 12,
	},
	mediaImage: {
		flex: 1,
		minWidth: "48%",
		aspectRatio: 1,
		borderRadius: 4,
	},
	linkCard: {
		flexDirection: "row",
		gap: 12,
		padding: 12,
		borderWidth: 1,
		borderRadius: 4,
		marginBottom: 12,
	},
	linkImage: {
		width: 80,
		height: 80,
		borderRadius: 4,
	},
	linkContent: {
		flex: 1,
		justifyContent: "center",
	},
	actionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingTop: 12,
		borderTopWidth: 1,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		padding: 4,
	},
	loadMoreButton: {
		marginTop: 16,
		marginBottom: 32,
	},
});

/**
 * Feed screen template (social media style)
 *
 * Features:
 * - Vertical scroll of feed items
 * - Author info with avatar
 * - Text content with optional media
 * - Link preview cards
 * - Action buttons (like, comment, share, bookmark)
 * - Load more functionality
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <FeedScreen
 *   config={{
 *     items: [
 *       {
 *         id: "1",
 *         author: { name: "John", handle: "@john" },
 *         content: "Check this out!",
 *         likes: 42,
 *         comments: 5,
 *         shares: 3,
 *       },
 *     ],
 *     hasMore: true,
 *   }}
 *   onLike={(id) => toggleLike(id)}
 * />
 * ```
 */
export function FeedScreen({
	config,
	onLike,
	onComment,
	onShare,
	onBookmark,
	onLoadMore,
	onItemPress,
	styleOverrides,
}: FeedScreenProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { items, hasMore, isLoadingMore } = config;

	const formatCount = (count: number) => {
		if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
		if (count >= 1000) return (count / 1000).toFixed(1) + "K";
		return count.toString();
	};

	const formatTime = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "now";
		if (minutes < 60) return `${minutes}m`;
		if (hours < 24) return `${hours}h`;
		if (days < 7) return `${days}d`;
		return date.toLocaleDateString();
	};

	return (
		<Screen style={staticStyles.container}>
			<ScrollView style={staticStyles.scrollView} showsVerticalScrollIndicator={false}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 600, lg: 680 }}
					horizontalPadding={pagePadding}
				>
					<View style={[staticStyles.feedContainer, { marginTop: spacing["md"] }]}>
						{items.map((item) => (
							<TouchableOpacity
								key={item.id}
								onPress={() => onItemPress?.(item)}
								testID={`feed-item-${item.id}`}
							>
								<Card
									variant="raised"
									border="subtle"
									padding="lg"
									style={[staticStyles.itemCard, styleOverrides?.item || {}]}
								>
									{/* Header */}
									<View style={staticStyles.itemHeader}>
										<Avatar source={item.author.avatar} initials={item.author.name} size="sm" />
										<View style={staticStyles.authorInfo}>
											<Text variant="body" color={colors.text}>
												{item.author.name}
											</Text>
											{item.author.handle && (
												<Text variant="caption" color={colors.textMuted}>
													{item.author.handle} · {formatTime(item.timestamp)}
												</Text>
											)}
										</View>
									</View>

									{/* Content */}
									<Text variant="body" color={colors.text} style={staticStyles.content}>
										{item.content}
									</Text>

									{/* Media */}
									{item.media && item.media.length > 0 && (
										<View style={[staticStyles.mediaGrid, styleOverrides?.mediaGrid]}>
											{item.media.map((url, index) => (
												<Image
													key={index}
													source={{ uri: url }}
													style={staticStyles.mediaImage}
													contentFit="cover"
													cachePolicy="memory-disk"
													testID={`feed-media-${item.id}-${index}`}
												/>
											))}
										</View>
									)}

									{/* Link Preview */}
									{item.link && (
										<View style={[staticStyles.linkCard, { borderColor: colors.border }]}>
											{item.link.image && (
												<Image
													source={{ uri: item.link.image }}
													style={staticStyles.linkImage}
													contentFit="cover"
													cachePolicy="memory-disk"
													testID={`feed-link-image-${item.id}`}
												/>
											)}
											<View style={staticStyles.linkContent}>
												<Text variant="body" color={colors.text}>
													{item.link.title}
												</Text>
												<Text variant="caption" color={colors.textMuted}>
													{item.link.url}
												</Text>
											</View>
										</View>
									)}

									{/* Actions */}
									<View style={[staticStyles.actionsRow, { borderTopColor: colors.border }]}>
										<TouchableOpacity
											onPress={() => onLike?.(item.id)}
											style={staticStyles.actionButton}
											testID={`feed-like-${item.id}`}
										>
											<Icon
												name={item.isLiked ? "Heart" : "Heart"}
												size={20}
												color={item.isLiked ? colors.primary : colors.textMuted}
											/>
											<Text
												variant="caption"
												color={item.isLiked ? colors.primary : colors.textMuted}
												testID={`feed-like-count-${item.id}`}
											>
												{formatCount(item.likes)}
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											onPress={() => onComment?.(item.id)}
											style={staticStyles.actionButton}
											testID={`feed-comment-${item.id}`}
										>
											<Icon name="MessageCircle" size={20} color={colors.textMuted} />
											<Text
												variant="caption"
												color={colors.textMuted}
												testID={`feed-comment-count-${item.id}`}
											>
												{formatCount(item.comments)}
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											onPress={() => onShare?.(item.id)}
											style={staticStyles.actionButton}
											testID={`feed-share-${item.id}`}
										>
											<Icon name="Share2" size={20} color={colors.textMuted} />
											<Text
												variant="caption"
												color={colors.textMuted}
												testID={`feed-share-count-${item.id}`}
											>
												{formatCount(item.shares)}
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											onPress={() => onBookmark?.(item.id)}
											style={staticStyles.actionButton}
											testID={`feed-bookmark-${item.id}`}
										>
											<Icon
												name={item.isBookmarked ? "Bookmark" : "Bookmark"}
												size={20}
												color={item.isBookmarked ? colors.text : colors.textMuted}
											/>
										</TouchableOpacity>
									</View>
								</Card>
							</TouchableOpacity>
						))}

						{/* Load More */}
						{hasMore && (
							<Button
								variant="secondary"
								onPress={onLoadMore}
								style={staticStyles.loadMoreButton}
								disabled={isLoadingMore}
								testID="feed-load-more"
							>
								{isLoadingMore ? "LOADING..." : "LOAD MORE"}
							</Button>
						)}
					</View>
					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}
