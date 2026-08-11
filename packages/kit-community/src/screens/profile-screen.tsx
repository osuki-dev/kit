import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	Icon,
	Tag,
	SegmentedProgressBar,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

export interface ProfileStats {
	label: string;
	value: string | number;
}

export interface ProfileInfoItem {
	label: string;
	value: string;
	icon?: string;
}

export interface ProfileAction {
	label: string;
	icon: string;
	onPress: () => void;
	variant?: "default" | "danger";
}

export interface ProfileScreenConfig {
	/** User avatar URL */
	avatar?: string;
	/** User name */
	name: string;
	/** User title/role */
	title?: string;
	/** User bio/description */
	bio?: string;
	/** User tags/chips */
	tags?: string[];
	/** Stats to display */
	stats?: ProfileStats[];
	/** Info items (email, location, etc.) */
	info?: ProfileInfoItem[];
	/** Progress bars for skills/completion */
	progress?: Array<{
		label: string;
		value: number;
		max?: number;
	}>;
	/** Action buttons */
	actions?: ProfileAction[];
	/** Primary CTA button */
	primaryAction?: {
		label: string;
		onPress: () => void;
	};
}

export interface ProfileScreenProps {
	config: ProfileScreenConfig;
	/** Loading state */
	isLoading?: boolean;
	/** Edit mode handler */
	onEdit?: () => void;
}

/**
 * Profile screen template
 *
 * Features:
 * - Avatar with name/title
 * - Bio section
 * - Stats grid
 * - Info items with icons
 * - Progress bars for skills
 * - Action buttons
 *
 * @example
 * ```tsx
 * <ProfileScreen
 *   config={{
 *     name: 'John Doe',
 *     title: 'Senior Developer',
 *     bio: 'Building things with React Native',
 *     avatar: 'https://example.com/avatar.jpg',
 *     stats: [
 *       { label: 'PROJECTS', value: 42 },
 *       { label: 'FOLLOWERS', value: 128 },
 *     ],
 *     info: [
 *       { label: 'EMAIL', value: 'john@example.com', icon: 'Mail' },
 *       { label: 'LOCATION', value: 'San Francisco', icon: 'MapPin' },
 *     ],
 *   }}
 * />
 * ```
 */
export const ProfileScreen: React.FC<ProfileScreenProps> = ({ config, isLoading, onEdit }) => {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	if (isLoading) {
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
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 480, lg: 560 }}
					horizontalPadding={pagePadding}
					alignment="center"
				>
					{/* Header Section */}
					<View style={[styles.header, { paddingTop: spacing["xl"] }]}>
						{/* Avatar */}
						{config.avatar ? (
							<Image
								source={{ uri: config.avatar }}
								style={[styles.avatar, { borderColor: colors.border }]}
							/>
						) : (
							<View
								style={[
									styles.avatarPlaceholder,
									{
										backgroundColor: colors.surfaceRaised,
										borderColor: colors.border,
									},
								]}
							>
								<Icon name="User" size={40} color={colors.textDisabled} />
							</View>
						)}

						{/* Name & Title */}
						<Text variant="heading" color={colors.text} style={{ marginTop: spacing["md"] }}>
							{config.name}
						</Text>
						{config.title && (
							<Text variant="body" color={colors.textMuted}>
								{config.title}
							</Text>
						)}

						{/* Edit Button */}
						{onEdit && (
							<TouchableOpacity
								onPress={onEdit}
								style={[styles.editButton, { marginTop: spacing["sm"] }]}
							>
								<Text variant="caption" color={colors.textMuted}>
									[EDIT]
								</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Bio Section */}
					{config.bio && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={[styles.card, { marginTop: spacing["lg"] }]}
						>
							<Text variant="label" color={colors.textMuted}>
								BIO
							</Text>
							<Text variant="body" color={colors.text} style={{ marginTop: spacing["sm"] }}>
								{config.bio}
							</Text>
						</Card>
					)}

					{/* Tags Section */}
					{config.tags && config.tags.length > 0 && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={[styles.card, { marginTop: spacing["md"] }]}
						>
							<View style={styles.tagsContainer}>
								{config.tags.map((tag, index) => (
									<Tag key={index} variant="default">
										{tag}
									</Tag>
								))}
							</View>
						</Card>
					)}

					{/* Stats Section */}
					{config.stats && config.stats.length > 0 && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={[styles.card, { marginTop: spacing["md"] }]}
						>
							<View style={styles.statsGrid}>
								{config.stats.map((stat, index) => (
									<View key={index} style={styles.statItem}>
										<Text variant="hero" color={colors.text}>
											{stat.value}
										</Text>
										<Text variant="caption" color={colors.textMuted}>
											{stat.label}
										</Text>
									</View>
								))}
							</View>
						</Card>
					)}

					{/* Info Section */}
					{config.info && config.info.length > 0 && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={[styles.card, { marginTop: spacing["md"] }]}
						>
							{config.info.map((item, index) => (
								<View
									key={index}
									style={[
										styles.infoRow,
										index < config.info!.length - 1 && {
											borderBottomWidth: 1,
											borderBottomColor: colors.border,
											paddingBottom: spacing["sm"],
											marginBottom: spacing["sm"],
										},
									]}
								>
									<View style={styles.infoLeft}>
										{item.icon && (
											<Icon
												name={item.icon as any}
												size={18}
												color={colors.textMuted}
												style={{ marginRight: spacing["sm"] }}
											/>
										)}
										<Text variant="caption" color={colors.textMuted}>
											{item.label}
										</Text>
									</View>
									<Text variant="body" color={colors.text}>
										{item.value}
									</Text>
								</View>
							))}
						</Card>
					)}

					{/* Progress Section */}
					{config.progress && config.progress.length > 0 && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={[styles.card, { marginTop: spacing["md"] }]}
						>
							<Text
								variant="label"
								color={colors.textMuted}
								style={{ marginBottom: spacing["md"] }}
							>
								SKILLS
							</Text>
							{config.progress.map((item, index) => (
								<View
									key={index}
									style={{
										marginBottom: index < config.progress!.length - 1 ? spacing["md"] : 0,
									}}
								>
									<View style={styles.progressHeader}>
										<Text variant="caption" color={colors.textMuted}>
											{item.label}
										</Text>
										<Text variant="caption" color={colors.textMuted}>
											{item.value}%
										</Text>
									</View>
									<SegmentedProgressBar
										value={item.value}
										max={item.max || 100}
										segments={20}
										size="compact"
										status={item.value > 80 ? "success" : item.value > 50 ? "neutral" : "warning"}
										valueDisplay="hidden"
									/>
								</View>
							))}
						</Card>
					)}

					{/* Actions Section */}
					{config.actions && config.actions.length > 0 && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={[styles.card, { marginTop: spacing["md"] }]}
						>
							{config.actions.map((action, index) => (
								<TouchableOpacity
									key={index}
									onPress={action.onPress}
									style={[
										styles.actionRow,
										index < config.actions!.length - 1 && {
											borderBottomWidth: 1,
											borderBottomColor: colors.border,
											paddingBottom: spacing["md"],
											marginBottom: spacing["md"],
										},
									]}
								>
									<View style={styles.actionLeft}>
										<Icon
											name={action.icon as any}
											size={20}
											color={action.variant === "danger" ? colors.primary : colors.textMuted}
										/>
										<Text
											variant="body"
											color={action.variant === "danger" ? colors.primary : colors.text}
										>
											{action.label}
										</Text>
									</View>
									<Icon name="ChevronRight" size={20} color={colors.textDisabled} />
								</TouchableOpacity>
							))}
						</Card>
					)}

					{/* Primary Action */}
					{config.primaryAction && (
						<View style={[styles.primaryAction, { marginTop: spacing["lg"] }]}>
							<Button variant="primary" onPress={config.primaryAction.onPress}>
								{config.primaryAction.label}
							</Button>
						</View>
					)}

					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
};

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		alignItems: "center",
	},
	header: {
		alignItems: "center",
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 2,
	},
	avatarPlaceholder: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	editButton: {
		padding: 8,
	},
	card: {
		width: "100%",
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	statsGrid: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	statItem: {
		alignItems: "center",
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	infoLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	actionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	actionLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	primaryAction: {
		width: "100%",
	},
});
