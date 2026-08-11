import { useMemo, useState } from "react";

import { FeedScreen } from "@osuki-dev/kit-community";
import type { FeedItem, FeedScreenConfig } from "@osuki-dev/kit-community";
import { catalogAssets } from "@/lib/catalog-assets";

const initialItems: FeedItem[] = [
	{
		id: "1",
		author: {
			name: "Sarah Chen",
			handle: "@sarahchen",
		},
		content:
			"Just shipped our new design system! Excited to share what we've been working on for the past few months. Clean, minimal, and incredibly flexible.",
		type: "text",
		timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
		likes: 124,
		comments: 18,
		shares: 5,
		isLiked: true,
	},
	{
		id: "2",
		author: {
			name: "Mike Ross",
			handle: "@mikeross",
		},
		content: "Working from my favorite coffee shop today. The aesthetic here is everything.",
		type: "image",
		media: [catalogAssets.cafe],
		timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
		likes: 89,
		comments: 12,
		shares: 2,
	},
	{
		id: "3",
		author: {
			name: "Design Weekly",
			handle: "@designweekly",
		},
		content:
			"New article: The future of mobile design systems. What trends should we expect in 2026?",
		type: "link",
		link: {
			title: "The Future of Mobile Design Systems",
			url: "designweekly.com/article/123",
			image: catalogAssets.workspace,
		},
		timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
		likes: 256,
		comments: 34,
		shares: 45,
	},
];

const nextItems: FeedItem[] = [
	{
		id: "4",
		author: {
			name: "Osuki Studio",
			handle: "@osuki",
		},
		content:
			"Polished the account handoff today: Storefront stays public, account data routes through a replaceable backend boundary.",
		type: "image",
		media: [catalogAssets.workspace],
		timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
		likes: 73,
		comments: 9,
		shares: 6,
	},
];

export default function FeedPage() {
	const [items, setItems] = useState(initialItems);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const config = useMemo<FeedScreenConfig>(
		() => ({
			items,
			hasMore: items.length < initialItems.length + nextItems.length,
			isLoadingMore,
		}),
		[isLoadingMore, items],
	);

	const updateItem = (itemId: string, updater: (item: FeedItem) => FeedItem) => {
		setItems((current) => current.map((item) => (item.id === itemId ? updater(item) : item)));
	};

	const handleLike = (itemId: string) => {
		updateItem(itemId, (item) => {
			const isLiked = !item.isLiked;
			return {
				...item,
				isLiked,
				likes: Math.max(0, item.likes + (isLiked ? 1 : -1)),
			};
		});
	};

	const handleComment = (itemId: string) => {
		updateItem(itemId, (item) => ({
			...item,
			comments: item.comments + 1,
		}));
	};

	const handleShare = (itemId: string) => {
		updateItem(itemId, (item) => ({
			...item,
			shares: item.shares + 1,
		}));
	};

	const handleBookmark = (itemId: string) => {
		updateItem(itemId, (item) => ({
			...item,
			isBookmarked: !item.isBookmarked,
		}));
	};

	const handleLoadMore = () => {
		setIsLoadingMore(true);
		setItems((current) => {
			const existingIds = new Set(current.map((item) => item.id));
			return [...current, ...nextItems.filter((item) => !existingIds.has(item.id))];
		});
		setIsLoadingMore(false);
	};

	return (
		<FeedScreen
			config={config}
			onLike={handleLike}
			onComment={handleComment}
			onShare={handleShare}
			onBookmark={handleBookmark}
			onLoadMore={handleLoadMore}
		/>
	);
}
