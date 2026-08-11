import { ArticleScreen } from "@osuki-dev/kit-community";
import type { ArticleScreenConfig } from "@osuki-dev/kit-community";
import { useState } from "react";

import { catalogAssets } from "@/lib/catalog-assets";

export default function Articleproduct() {
	const [statusText, setStatusText] = useState("Ready to share");

	const articleConfig: ArticleScreenConfig = {
		title: "The Art of Minimalist Design",
		subtitle: "How Swiss design principles influence modern UI",
		content:
			"Minimalist design is more than just an aesthetic choice—it's a philosophy that prioritizes clarity, functionality, and purpose. Born from the Swiss Style movement of the 1950s, minimalist design has become the foundation of modern user interface design.\n\nThe core principles are simple: remove everything that doesn't serve a purpose, embrace whitespace, and let content breathe. Every element on the screen should earn its place.\n\nTypography plays a crucial role. Clean, readable fonts with clear hierarchies guide users through content effortlessly. Color is used sparingly but intentionally, often as a way to highlight important actions or information.\n\nIn mobile interfaces, these principles are even more critical. Limited screen real estate demands ruthless prioritization. What stays? What goes? The decisions we make define the user experience.",
		image: catalogAssets.workspace,
		author: {
			name: "Sarah Chen",
			bio: "Design Lead at Osuki Studio",
		},
		date: new Date("2026-03-15"),
		readTime: 5,
		category: "DESIGN",
		tags: ["MINIMALISM", "UI DESIGN", "SWISS STYLE"],
		related: [
			{
				id: "1",
				title: "Color Theory in UI",
				excerpt: "Understanding how color affects user perception",
				image: catalogAssets.cafe,
			},
			{
				id: "2",
				title: "Typography Systems",
				excerpt: "Building scalable type hierarchies",
				image: catalogAssets.workspace,
			},
		],
		primaryAction: {
			label: "SHARE ARTICLE",
			testID: "article-share-button",
			onPress: () => setStatusText("Share link copied"),
		},
		statusText,
	};

	return <ArticleScreen config={articleConfig} />;
}
