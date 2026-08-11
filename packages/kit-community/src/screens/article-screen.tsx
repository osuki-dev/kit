import React from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	Image,
	TouchableOpacity,
	type ViewStyle,
	type TextStyle,
	type ImageStyle,
} from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	Tag,
	Avatar,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

export interface ArticleAuthor {
	name: string;
	avatar?: string;
	bio?: string;
}

export interface ArticleScreenConfig {
	/** Article title */
	title: string;
	/** Subtitle or summary */
	subtitle?: string;
	/** Main content (HTML or plain text) */
	content: string;
	/** Featured image */
	image?: string;
	/** Author info */
	author?: ArticleAuthor;
	/** Publication date */
	date?: Date;
	/** Read time in minutes */
	readTime?: number;
	/** Tags */
	tags?: string[];
	/** Category */
	category?: string;
	/** Related articles */
	related?: Array<{
		id: string;
		title: string;
		excerpt: string;
		image?: string;
		onPress?: () => void;
	}>;
	/** Primary action (e.g., Save, Share) */
	primaryAction?: {
		label: string;
		onPress: () => void;
		testID?: string;
	};
	/** User-facing action feedback */
	statusText?: string;
}

export interface ArticleScreenProps {
	config: ArticleScreenConfig;
	testID?: string;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		header?: ViewStyle;
		title?: TextStyle;
		content?: ViewStyle;
		image?: ImageStyle;
		authorSection?: ViewStyle;
		relatedSection?: ViewStyle;
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
	headerSection: {
		marginBottom: 16,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 16,
	},
	title: {
		marginBottom: 8,
	},
	subtitle: {
		marginBottom: 16,
	},
	image: {
		width: "100%",
		height: 240,
		borderRadius: 4,
		marginBottom: 24,
	},
	authorSection: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 24,
	},
	authorInfo: {
		flex: 1,
	},
	contentSection: {
		gap: 16,
	},
	paragraph: {
		marginBottom: 16,
	},
	tagsSection: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 24,
		marginBottom: 16,
	},
	relatedSection: {
		marginTop: 32,
	},
	relatedTitle: {
		marginBottom: 16,
	},
	relatedCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 12,
	},
	relatedImage: {
		width: 80,
		height: 80,
		borderRadius: 4,
	},
	relatedContent: {
		flex: 1,
		justifyContent: "space-between",
	},
	actionsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginTop: 24,
		marginBottom: 32,
	},
	statusPanel: {
		width: "100%",
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 999,
		alignItems: "center",
	},
});

/**
 * Article screen template
 *
 * Features:
 * - Title and subtitle
 * - Featured image
 * - Author info with avatar
 * - Rich text content
 * - Tags
 * - Related articles
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <ArticleScreen
 *   config={{
 *     title: "The Future of Design Systems",
 *     content: "In this article, we explore...",
 *     author: { name: "Jane Doe", avatar: "url" },
 *     tags: ["DESIGN", "TECHNOLOGY"],
 *   }}
 * />
 * ```
 */
export function ArticleScreen({
	config,
	testID = "article-screen",
	styleOverrides,
}: ArticleScreenProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const {
		title,
		subtitle,
		content,
		image,
		author,
		date,
		readTime,
		tags,
		category,
		related,
		primaryAction,
		statusText,
	} = config;

	return (
		<Screen style={staticStyles.container} testID={testID}>
			<ScrollView style={staticStyles.scrollView} showsVerticalScrollIndicator={false}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 800 }}
					horizontalPadding={pagePadding}
				>
					<View style={{ marginTop: spacing["lg"] }}>
						{/* Header */}
						<View style={[staticStyles.headerSection, styleOverrides?.header]}>
							{/* Meta */}
							<View style={staticStyles.metaRow}>
								{category && <Tag variant="active">{category}</Tag>}
								{date && (
									<Text variant="caption" color={colors.textDisabled}>
										{date.toLocaleDateString()}
									</Text>
								)}
								{readTime && (
									<Text variant="caption" color={colors.textDisabled}>
										{readTime} min read
									</Text>
								)}
							</View>

							{/* Title */}
							<Text
								variant="display"
								color={colors.text}
								style={[
									staticStyles.title,
									...(styleOverrides?.title ? [styleOverrides.title] : []),
								]}
							>
								{title}
							</Text>

							{/* Subtitle */}
							{subtitle && (
								<Text variant="subheading" color={colors.textMuted} style={staticStyles.subtitle}>
									{subtitle}
								</Text>
							)}
						</View>

						{/* Featured Image */}
						{image && (
							<Image
								source={{ uri: image }}
								style={[staticStyles.image, styleOverrides?.image]}
								resizeMode="cover"
							/>
						)}

						{/* Author */}
						{author && (
							<View style={[staticStyles.authorSection, styleOverrides?.authorSection]}>
								<Avatar source={author.avatar} initials={author.name} size="md" />
								<View style={staticStyles.authorInfo}>
									<Text variant="body" color={colors.text}>
										{author.name}
									</Text>
									{author.bio && (
										<Text variant="caption" color={colors.textMuted}>
											{author.bio}
										</Text>
									)}
								</View>
							</View>
						)}

						{/* Content */}
						<View style={[staticStyles.contentSection, styleOverrides?.content || {}]}>
							<Text variant="body" color={colors.text}>
								{content}
							</Text>
						</View>

						{/* Tags */}
						{tags && tags.length > 0 && (
							<View style={staticStyles.tagsSection}>
								{tags.map((tag) => (
									<Tag key={tag} variant="default">
										{tag}
									</Tag>
								))}
							</View>
						)}

						{/* Related Articles */}
						{related && related.length > 0 && (
							<View style={[staticStyles.relatedSection, styleOverrides?.relatedSection]}>
								<Text variant="label" color={colors.textMuted} style={staticStyles.relatedTitle}>
									RELATED ARTICLES
								</Text>

								{related.map((article) => (
									<TouchableOpacity key={article.id} onPress={article.onPress}>
										<Card
											variant="raised"
											border="subtle"
											padding="md"
											style={staticStyles.relatedCard}
										>
											{article.image && (
												<Image
													source={{ uri: article.image }}
													style={staticStyles.relatedImage}
													resizeMode="cover"
												/>
											)}
											<View style={staticStyles.relatedContent}>
												<Text variant="body" color={colors.text}>
													{article.title}
												</Text>
												<Text variant="caption" color={colors.textMuted}>
													{article.excerpt}
												</Text>
											</View>
										</Card>
									</TouchableOpacity>
								))}
							</View>
						)}

						{/* Actions */}
						{primaryAction && (
							<View style={staticStyles.actionsContainer}>
								<Button
									variant="primary"
									onPress={primaryAction.onPress}
									testID={primaryAction.testID ?? `${testID}-primary-action`}
								>
									{primaryAction.label}
								</Button>
							</View>
						)}
						{statusText ? (
							<View
								style={[staticStyles.statusPanel, { backgroundColor: colors.surfaceRaised }]}
								testID={`${testID}-status`}
							>
								<Text variant="caption" color={colors.textMuted}>
									{statusText}
								</Text>
							</View>
						) : null}

						<View style={{ height: spacing["4xl"] }} />
					</View>
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}
