import React from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	type ViewStyle,
	type TextStyle,
} from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	Icon,
	Badge,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	type IconName,
} from "@osuki-dev/ui";

export type NotificationType = "info" | "success" | "warning" | "message" | "system";

export interface NotificationItem {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	icon?: IconName;
	image?: string;
	timestamp: Date;
	isRead: boolean;
	onPress?: () => void;
}

export interface NotificationGroup {
	date: string;
	items: NotificationItem[];
}

export interface NotificationCenterConfig {
	/** Notification groups (by date) */
	groups: NotificationGroup[];
	/** Unread count */
	unreadCount: number;
	/** Filter tabs */
	filters?: Array<{
		id: string;
		label: string;
		count?: number;
	}>;
	/** Active filter */
	activeFilter?: string;
}

export interface NotificationCenterProps {
	config: NotificationCenterConfig;
	/** Action handlers */
	onItemPress?: (item: NotificationItem) => void;
	onMarkRead?: (itemId: string) => void;
	onMarkAllRead?: () => void;
	onDelete?: (itemId: string) => void;
	onFilterChange?: (filterId: string) => void;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		item?: ViewStyle;
		groupHeader?: TextStyle;
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
	},
	filterSection: {
		flexDirection: "row",
		gap: 8,
		padding: 16,
	},
	filterChip: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 16,
		borderWidth: 1,
	},
	groupContainer: {
		marginBottom: 16,
	},
	groupHeader: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	itemCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 16,
		borderBottomWidth: 1,
	},
	itemPressArea: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	deleteButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	unreadIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginTop: 6,
	},
	itemIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	itemContent: {
		flex: 1,
		gap: 4,
	},
	itemHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
});

const typeConfig: Record<
	NotificationType,
	{ icon: IconName; color: "text" | "primary" | "success" | "warning" }
> = {
	info: { icon: "Info", color: "text" },
	success: { icon: "CheckCircle", color: "success" },
	warning: { icon: "AlertTriangle", color: "warning" },
	message: { icon: "MessageSquare", color: "text" },
	system: { icon: "Settings", color: "text" },
};

/**
 * Notification center template
 *
 * Features:
 * - Grouped by date
 * - Unread indicators
 * - Type icons and colors
 * - Filter tabs
 * - Mark all as read
 * - Delete action
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <NotificationCenter
 *   config={{
 *     groups: [
 *       {
 *         date: "Today",
 *         items: [
 *           { id: "1", type: "message", title: "New message", isRead: false, timestamp: new Date() },
 *         ],
 *       },
 *     ],
 *     unreadCount: 1,
 *   }}
 *   onMarkRead={(id) => markNotificationRead(id)}
 * />
 * ```
 */
export function NotificationCenter({
	config,
	onItemPress,
	onMarkRead,
	onMarkAllRead,
	onDelete,
	onFilterChange,
	styleOverrides,
}: NotificationCenterProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { groups, unreadCount, filters, activeFilter } = config;

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

	// Empty state
	if (groups.every((g) => g.items.length === 0)) {
		return (
			<Screen style={staticStyles.container}>
				<View style={staticStyles.emptyContainer}>
					<Icon name="Bell" size={64} color={colors.textDisabled} />
					<Text variant="heading" color={colors.textMuted} style={{ marginTop: 16 }}>
						NO NOTIFICATIONS
					</Text>
					<Text variant="body" color={colors.textDisabled}>
						You're all caught up!
					</Text>
				</View>
			</Screen>
		);
	}

	return (
		<Screen style={staticStyles.container}>
			<ScrollView style={staticStyles.scrollView} showsVerticalScrollIndicator={false}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 600, lg: 680 }}
					horizontalPadding={pagePadding}
				>
					{/* Header */}
					<View style={[staticStyles.headerSection, { borderBottomColor: colors.border }]}>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
							<Text variant="heading" color={colors.text}>
								NOTIFICATIONS
							</Text>
							{unreadCount > 0 && <Badge variant="primary">{unreadCount}</Badge>}
						</View>

						{unreadCount > 0 && (
							<Button variant="ghost" onPress={onMarkAllRead} testID="notifications-mark-all-read">
								MARK ALL READ
							</Button>
						)}
					</View>

					{/* Filters */}
					{filters && filters.length > 0 && (
						<View style={staticStyles.filterSection}>
							{filters.map((filter) => (
								<TouchableOpacity
									key={filter.id}
									onPress={() => onFilterChange?.(filter.id)}
									testID={`notifications-filter-${filter.id}`}
									style={[
										staticStyles.filterChip,
										{
											borderColor: activeFilter === filter.id ? colors.text : colors.border,
											backgroundColor:
												activeFilter === filter.id ? colors.surfaceRaised : "transparent",
										},
									]}
								>
									<Text
										variant="caption"
										color={activeFilter === filter.id ? colors.text : colors.textMuted}
									>
										{filter.label}
										{filter.count !== undefined && ` (${filter.count})`}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					)}

					{/* Notification Groups */}
					{groups.map((group) => (
						<View key={group.date} style={staticStyles.groupContainer}>
							<Text
								variant="label"
								color={colors.textMuted}
								style={[
									staticStyles.groupHeader,
									...(styleOverrides?.groupHeader ? [styleOverrides.groupHeader] : []),
								]}
							>
								{group.date.toUpperCase()}
							</Text>

							<Card variant="flat" border="subtle">
								{group.items.map((item, index) => {
									const typeInfo = typeConfig[item.type];
									const isLast = index === group.items.length - 1;

									return (
										<View
											key={item.id}
											testID={`notification-item-${item.id}`}
											style={[
												staticStyles.itemCard,
												{
													borderBottomColor: colors.border,
													borderBottomWidth: isLast ? 0 : 1,
													backgroundColor: item.isRead
														? "transparent"
														: colors.surfaceRaised + "30",
												},
												styleOverrides?.item,
											]}
										>
											<TouchableOpacity
												testID={`notification-open-${item.id}`}
												activeOpacity={0.76}
												onPress={() => {
													onItemPress?.(item);
													if (!item.isRead) onMarkRead?.(item.id);
												}}
												style={staticStyles.itemPressArea}
											>
												{/* Unread Indicator */}
												{!item.isRead && (
													<View
														style={[
															staticStyles.unreadIndicator,
															{ backgroundColor: colors.primary },
														]}
													/>
												)}

												{/* Icon */}
												<View
													style={[
														staticStyles.itemIcon,
														{ backgroundColor: colors[typeInfo.color] + "20" },
													]}
												>
													<Icon
														name={item.icon || typeInfo.icon}
														size={20}
														color={colors[typeInfo.color]}
													/>
												</View>

												{/* Content */}
												<View style={staticStyles.itemContent}>
													<View style={staticStyles.itemHeader}>
														<Text variant="body" color={colors.text}>
															{item.title}
														</Text>
														<Text variant="caption" color={colors.textDisabled}>
															{formatTime(item.timestamp)}
														</Text>
													</View>

													{item.message && (
														<Text variant="caption" color={colors.textMuted}>
															{item.message}
														</Text>
													)}
												</View>
											</TouchableOpacity>

											{onDelete ? (
												<TouchableOpacity
													accessibilityLabel={`Delete ${item.title}`}
													testID={`notification-delete-${item.id}`}
													activeOpacity={0.76}
													onPress={() => onDelete(item.id)}
													style={[
														staticStyles.deleteButton,
														{ backgroundColor: colors.dangerSubtle },
													]}
												>
													<Icon name="Trash2" size={18} color={colors.danger} />
												</TouchableOpacity>
											) : null}
										</View>
									);
								})}
							</Card>
						</View>
					))}

					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}
