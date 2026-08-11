import { EmptyStateScreen } from "@osuki-dev/kit-community";
import type { EmptyStateConfig } from "@osuki-dev/kit-community";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text, useTheme } from "@osuki-dev/ui";

const emptyStates: Array<{ icon: EmptyStateConfig["icon"]; title: string; description: string }> = [
	{ icon: "Inbox", title: "NO MESSAGES", description: "Your inbox is empty" },
	{ icon: "Search", title: "NO RESULTS", description: "Try adjusting your search" },
	{ icon: "Folder", title: "NO FILES", description: "Upload your first file" },
	{ icon: "ShoppingCart", title: "CART EMPTY", description: "Add some items to get started" },
	{ icon: "Heart", title: "NO FAVORITES", description: "Items you like will appear here" },
];

export default function EmptyStateproduct() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [actionMessage, setActionMessage] = useState("Choose a state and trigger its action.");
	const { colors } = useTheme();

	const current = emptyStates[currentIndex];
	const handleAction = () => {
		const nextIndex = (currentIndex + 1) % emptyStates.length;
		setCurrentIndex(nextIndex);
		setActionMessage(`Handled ${current.title}; showing ${emptyStates[nextIndex]!.title}`);
	};

	return (
		<View style={{ flex: 1 }}>
			{/* State Selector */}
			<View style={{ padding: 16, paddingTop: 60, gap: 8 }}>
				<Text variant="label" color={colors.textMuted}>
					EMPTY STATE TYPE
				</Text>
				<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
					{emptyStates.map((state, index) => (
						<Button
							key={state.icon}
							variant={currentIndex === index ? "primary" : "secondary"}
							onPress={() => {
								setCurrentIndex(index);
								setActionMessage(`Selected ${state.title}`);
							}}
						>
							{state.icon.toUpperCase()}
						</Button>
					))}
				</View>
				<Text variant="caption" color={colors.textMuted} testID="empty-state-action-message">
					{actionMessage}
				</Text>
			</View>

			{/* Empty State Screen */}
			<EmptyStateScreen
				config={{
					icon: current.icon,
					title: current.title,
					description: current.description,
					primaryAction: {
						label: "TAKE ACTION",
						onPress: handleAction,
						testID: "empty-state-primary-action",
					},
				}}
			/>
		</View>
	);
}
