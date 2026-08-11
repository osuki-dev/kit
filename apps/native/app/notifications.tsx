import { useMemo, useState } from "react";

import { NotificationCenter } from "@osuki-dev/kit-community";
import type { NotificationCenterConfig } from "@osuki-dev/kit-community";

type NotificationGroup = NotificationCenterConfig["groups"][number];

const seedGroups: NotificationGroup[] = [
	{
		date: "Today",
		items: [
			{
				id: "1",
				type: "message",
				title: "New message from Sarah",
				message: "Hey, can we discuss the new design?",
				timestamp: new Date(Date.now() - 30 * 60 * 1000),
				isRead: false,
				icon: "MessageSquare",
			},
			{
				id: "2",
				type: "success",
				title: "Order delivered",
				message: "Your order #1234 has been delivered",
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
				isRead: false,
			},
			{
				id: "3",
				type: "info",
				title: "System update",
				message: "New features are now available",
				timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
				isRead: true,
			},
		],
	},
	{
		date: "Yesterday",
		items: [
			{
				id: "4",
				type: "warning",
				title: "Storage almost full",
				message: "You have used 90% of your storage",
				timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
				isRead: true,
			},
			{
				id: "5",
				type: "message",
				title: "New follower",
				message: "John Doe started following you",
				timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
				isRead: true,
			},
		],
	},
];

export default function NotificationsPage() {
	const [groups, setGroups] = useState(seedGroups);
	const [activeFilter, setActiveFilter] = useState("all");

	const config = useMemo<NotificationCenterConfig>(() => {
		const unreadCount = countUnread(groups);
		const allCount = countItems(groups);
		const messageCount = groups.reduce(
			(total, group) => total + group.items.filter((item) => item.type === "message").length,
			0,
		);
		const visibleGroups = filterGroups(groups, activeFilter);

		return {
			groups: visibleGroups,
			unreadCount,
			filters: [
				{ id: "all", label: "All", count: allCount },
				{ id: "unread", label: "Unread", count: unreadCount },
				{ id: "mentions", label: "Mentions", count: messageCount },
			],
			activeFilter,
		};
	}, [activeFilter, groups]);

	const markRead = (itemId: string) => {
		setGroups((current) =>
			current.map((group) => ({
				...group,
				items: group.items.map((item) => (item.id === itemId ? { ...item, isRead: true } : item)),
			})),
		);
	};

	const markAllRead = () => {
		setGroups((current) =>
			current.map((group) => ({
				...group,
				items: group.items.map((item) => ({ ...item, isRead: true })),
			})),
		);
	};

	const deleteNotification = (itemId: string) => {
		setGroups((current) =>
			current
				.map((group) => ({
					...group,
					items: group.items.filter((item) => item.id !== itemId),
				}))
				.filter((group) => group.items.length > 0),
		);
	};

	return (
		<NotificationCenter
			config={config}
			onMarkRead={markRead}
			onMarkAllRead={markAllRead}
			onDelete={deleteNotification}
			onFilterChange={setActiveFilter}
		/>
	);
}

function countItems(groups: NotificationGroup[]) {
	return groups.reduce((total, group) => total + group.items.length, 0);
}

function countUnread(groups: NotificationGroup[]) {
	return groups.reduce(
		(total, group) => total + group.items.filter((item) => !item.isRead).length,
		0,
	);
}

function filterGroups(groups: NotificationGroup[], filter: string): NotificationGroup[] {
	if (filter === "unread") {
		return groups
			.map((group) => ({
				...group,
				items: group.items.filter((item) => !item.isRead),
			}))
			.filter((group) => group.items.length > 0);
	}

	if (filter === "mentions") {
		return groups
			.map((group) => ({
				...group,
				items: group.items.filter((item) => item.type === "message"),
			}))
			.filter((group) => group.items.length > 0);
	}

	return groups;
}
