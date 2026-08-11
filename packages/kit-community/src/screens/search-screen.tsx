import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Card,
	Text,
	Icon,
	Tag,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	resolveFontStyle,
} from "@osuki-dev/ui";
import { useI18n } from "../i18n";

export interface SearchResult {
	id: string;
	title: string;
	subtitle?: string;
	description?: string;
	tag?: string;
	icon?: string;
	onPress?: () => void;
	testID?: string;
	accessibilityLabel?: string;
}

export interface SearchFilter {
	id: string;
	label: string;
	active?: boolean;
}

export interface SearchScreenConfig {
	/** Search query */
	query: string;
	/** Search results */
	results: SearchResult[];
	/** Recent searches (for suggestions) */
	recentSearches?: string[];
	/** Trending searches */
	trendingSearches?: string[];
	/** Filters */
	filters?: SearchFilter[];
	/** Total results count */
	totalCount?: number;
	/** Loading state */
	isLoading?: boolean;
	/** Empty state message */
	emptyMessage?: string;
}

export interface SearchScreenProps {
	config: SearchScreenConfig;
	/** On search query change */
	onQueryChange: (query: string) => void;
	/** On search submit */
	onSearch: () => void;
	/** On clear search */
	onClear?: () => void;
	/** On filter select */
	onFilterSelect?: (filterId: string) => void;
	/** On recent search select */
	onRecentSearchSelect?: (query: string) => void;
	/** Back handler */
	onBack?: () => void;
	/** Result item press handler */
	onResultPress?: (result: SearchResult) => void;
	/** Hide the built-in search header when the host navigation renders the input */
	hideHeader?: boolean;
	testID?: string;
}

/**
 * Search screen template
 *
 * Features:
 * - Search input with clear button
 * - Recent searches suggestions
 * - Trending searches
 * - Filter chips
 * - Search results list
 * - Empty state
 *
 * @example
 * ```tsx
 * <SearchScreen
 *   config={{
 *     query: searchQuery,
 *     results: searchResults,
 *     recentSearches: ['react native', 'ui kit'],
 *     filters: [
 *       { id: 'all', label: 'ALL', active: true },
 *       { id: 'users', label: 'USERS' },
 *       { id: 'posts', label: 'POSTS' },
 *     ],
 *   }}
 *   onQueryChange={setSearchQuery}
 *   onSearch={handleSearch}
 * />
 * ```
 */
export const SearchScreen: React.FC<SearchScreenProps> = ({
	config,
	onQueryChange,
	onSearch,
	onClear,
	onFilterSelect,
	onRecentSearchSelect,
	onBack,
	onResultPress,
	hideHeader = false,
	testID = "search-screen",
}) => {
	const { colors, fonts, spacing, mode, shadow, typeStyles } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const insets = useSafeAreaInsets();
	const { t } = useI18n();

	const hasQuery = config.query.trim().length > 0;
	const hasResults = config.results.length > 0;
	const showSuggestions = !hasQuery && (config.recentSearches || config.trendingSearches);
	const showEmpty = hasQuery && !hasResults && !config.isLoading;
	const hasFilters = Boolean(config.filters?.length);
	const renderFilters = () =>
		hasFilters ? (
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.filtersContainer}
				contentContainerStyle={{ gap: spacing["sm"] }}
			>
				{config.filters!.map((filter) => (
					<TouchableOpacity
						key={filter.id}
						onPress={() => onFilterSelect?.(filter.id)}
						testID={`${testID}-filter-${filter.id}`}
						accessibilityRole="button"
						accessibilityState={{ selected: Boolean(filter.active) }}
					>
						<Tag variant={filter.active ? "active" : "default"}>{filter.label}</Tag>
					</TouchableOpacity>
				))}
			</ScrollView>
		) : null;

	return (
		<Screen testID={testID}>
			{/* Header with Search */}
			{hideHeader ? null : (
				<View
					style={[
						styles.header,
						{
							paddingHorizontal: pagePadding,
							paddingTop: insets.top + spacing["sm"],
							paddingBottom: spacing["sm"],
						},
					]}
				>
					<View style={styles.searchRow}>
						{onBack && (
							<TouchableOpacity onPress={onBack} style={styles.backButton}>
								<Icon name="ChevronLeft" size={24} color={colors.text} />
							</TouchableOpacity>
						)}

						<View
							style={[
								styles.searchInputWrapper,
								{
									backgroundColor: colors.surfaceRaised,
									...(mode === "light" ? shadow.soft : {}),
								},
							]}
						>
							<Icon name="Search" size={18} color={colors.textDisabled} style={styles.searchIcon} />
							<TextInput
								testID={`${testID}-input`}
								style={[
									styles.searchInput,
									{
										color: colors.text,
										...resolveFontStyle(fonts, typeStyles.body.fontFamily, "regular"),
									},
								]}
								value={config.query}
								onChangeText={onQueryChange}
								onSubmitEditing={onSearch}
								placeholder={t("list.searchPlaceholder")}
								placeholderTextColor={colors.textDisabled}
								autoFocus
								returnKeyType="search"
							/>
							{hasQuery && (
								<TouchableOpacity onPress={onClear} style={styles.clearButton}>
									<Icon name="X" size={18} color={colors.textDisabled} />
								</TouchableOpacity>
							)}
						</View>
					</View>

					{/* Filters */}
					{renderFilters()}
				</View>
			)}

			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentInsetAdjustmentBehavior="never"
				contentContainerStyle={{ flexGrow: 1, paddingTop: hideHeader ? spacing["xs"] : 0 }}
			>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 600, lg: 720 }}
					horizontalPadding={pagePadding}
					alignment="center"
				>
					{hideHeader && hasFilters ? renderFilters() : null}

					{/* Results Count */}
					{hasQuery && config.totalCount !== undefined && hasResults && (
						<Text
							variant="caption"
							color={colors.textMuted}
							style={{ marginTop: spacing["md"], marginBottom: spacing["sm"] }}
						>
							{t("search.resultsCount", { count: config.totalCount })}
						</Text>
					)}

					{/* Results List */}
					{hasResults && (
						<View style={{ marginTop: spacing["sm"] }}>
							{config.results.map((result, index) => (
								<TouchableOpacity
									key={result.id}
									onPress={() => result.onPress?.() || onResultPress?.(result)}
									testID={result.testID ?? `${testID}-result-${result.id}`}
									accessibilityRole="button"
									accessibilityLabel={result.accessibilityLabel ?? result.title}
									accessibilityHint="Opens result details"
									style={[
										styles.resultItem,
										{
											borderBottomColor: colors.border,
											borderBottomWidth: index < config.results.length - 1 ? 1 : 0,
										},
									]}
								>
									<View style={styles.resultLeft}>
										{result.icon && (
											<Icon
												name={result.icon as any}
												size={20}
												color={colors.textMuted}
												style={{ marginRight: spacing["sm"] }}
											/>
										)}
										<View style={styles.resultText}>
											<Text variant="body" color={colors.text}>
												{result.title}
											</Text>
											{result.subtitle && (
												<Text variant="caption" color={colors.textMuted}>
													{result.subtitle}
												</Text>
											)}
											{result.description && (
												<Text
													variant="caption"
													color={colors.textDisabled}
													style={{ marginTop: 2 }}
													numberOfLines={2}
												>
													{result.description}
												</Text>
											)}
										</View>
									</View>

									<View style={styles.resultRight}>
										{result.tag && (
											<Tag variant="default" style={{ marginRight: spacing["sm"] }}>
												{result.tag}
											</Tag>
										)}
										<Icon name="ChevronRight" size={20} color={colors.textDisabled} />
									</View>
								</TouchableOpacity>
							))}
						</View>
					)}

					{/* Empty State */}
					{showEmpty && (
						<View style={[styles.emptyState, { marginTop: spacing["4xl"] }]}>
							<Icon name="SearchX" size={48} color={colors.textDisabled} />
							<Text
								variant="body"
								color={colors.textMuted}
								style={{ marginTop: spacing["lg"], textAlign: "center" }}
							>
								{config.emptyMessage || t("search.noResults")}
							</Text>
							<Text
								variant="caption"
								color={colors.textDisabled}
								style={{ marginTop: spacing["sm"], textAlign: "center" }}
							>
								{t("search.tryDifferentTerm")}
							</Text>
						</View>
					)}

					{/* Suggestions */}
					{showSuggestions && (
						<View style={{ marginTop: hideHeader ? spacing["sm"] : spacing["lg"] }}>
							{/* Recent Searches */}
							{config.recentSearches && config.recentSearches.length > 0 && (
								<Card
									variant="raised"
									border="subtle"
									padding="lg"
									style={{ marginBottom: spacing["md"] }}
								>
									<Text
										variant="label"
										color={colors.textMuted}
										style={{ marginBottom: spacing["md"] }}
									>
										{t("search.recentSearches")}
									</Text>
									<View style={styles.suggestionsContainer}>
										{config.recentSearches.map((search, index) => (
											<TouchableOpacity
												key={index}
												onPress={() => onRecentSearchSelect?.(search)}
												testID={`${testID}-recent-${index}`}
												style={[
													styles.suggestionItem,
													index < config.recentSearches!.length - 1 && {
														borderBottomWidth: 1,
														borderBottomColor: colors.border,
														paddingBottom: spacing["sm"],
														marginBottom: spacing["sm"],
													},
												]}
											>
												<Icon name="History" size={16} color={colors.textDisabled} />
												<Text
													variant="body"
													color={colors.text}
													style={{ marginLeft: spacing["sm"] }}
												>
													{search}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</Card>
							)}

							{/* Trending Searches */}
							{config.trendingSearches && config.trendingSearches.length > 0 && (
								<Card variant="raised" border="subtle" padding="lg">
									<Text
										variant="label"
										color={colors.textMuted}
										style={{ marginBottom: spacing["md"] }}
									>
										{t("search.trending")}
									</Text>
									<View style={styles.trendingContainer}>
										{config.trendingSearches.map((search, index) => (
											<TouchableOpacity
												key={index}
												onPress={() => onRecentSearchSelect?.(search)}
												testID={`${testID}-trending-${index}`}
											>
												<Tag variant="pill">{search}</Tag>
											</TouchableOpacity>
										))}
									</View>
								</Card>
							)}
						</View>
					)}

					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
};

const styles = StyleSheet.create({
	header: {},
	searchRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		marginRight: 12,
		width: 38,
		height: 38,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	searchInputWrapper: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 24,
		paddingHorizontal: 16,
		height: 44,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		padding: 0,
	},
	clearButton: {
		padding: 4,
	},
	filtersContainer: {
		marginTop: 12,
	},
	content: {
		flex: 1,
	},
	resultItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
	},
	resultLeft: {
		flexDirection: "row",
		alignItems: "flex-start",
		flex: 1,
	},
	resultText: {
		flex: 1,
	},
	resultRight: {
		flexDirection: "row",
		alignItems: "center",
	},
	emptyState: {
		alignItems: "center",
	},
	suggestionsContainer: {
		gap: 8,
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	trendingContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
});
