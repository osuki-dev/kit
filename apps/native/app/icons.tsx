import { View, ScrollView, StyleSheet, Text } from "react-native";
import * as LucideIcons from "lucide-react-native";

import { Screen, Card, Icon, useTheme } from "@osuki-dev/ui";

// Get all icon names from Lucide
const iconNames = Object.keys(LucideIcons).filter(
	(key) => key !== "default" && key !== "icons" && key !== "createIcons",
) as (keyof typeof LucideIcons)[];

// Group icons alphabetically
const groupedIcons = iconNames.reduce(
	(acc, name) => {
		const firstLetter = name[0].toUpperCase();
		if (!acc[firstLetter]) acc[firstLetter] = [];
		acc[firstLetter].push(name);
		return acc;
	},
	{} as Record<string, (keyof typeof LucideIcons)[]>,
);

const alphabet = Object.keys(groupedIcons).sort();

export default function IconsPage() {
	const { colors, spacing } = useTheme();

	return (
		<Screen>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.title, { color: colors.text }]}>LUCIDE ICONS</Text>
					<Text style={[styles.subtitle, { color: colors.textMuted }]}>
						{iconNames.length} ICONS AVAILABLE
					</Text>
				</View>

				{/* Usage Example */}
				<Card variant="raised" border="subtle" padding="lg">
					<Text style={[styles.sectionTitle, { color: colors.text }]}>USAGE EXAMPLE</Text>
					<View style={styles.exampleRow}>
						<Icon name="Home" />
						<Icon name="Settings" color={colors.textMuted} />
						<Icon name="Search" color={colors.primary} />
						<Icon name="User" size={32} />
						<Icon name="Bell" strokeWidth={1} />
						<Icon name="Menu" strokeWidth={2} />
					</View>
				</Card>

				{/* All Icons */}
				{alphabet.map((letter) => (
					<View key={letter} style={styles.letterSection}>
						<Text style={[styles.letterTitle, { color: colors.textMuted }]}>{letter}</Text>
						<Card variant="raised" border="subtle" padding="md">
							<View style={styles.iconGrid}>
								{groupedIcons[letter].map((iconName) => (
									<View key={String(iconName)} style={styles.iconItem}>
										<Icon name={iconName as any} size={20} />
										<Text style={[styles.iconName, { color: colors.textMuted }]} numberOfLines={1}>
											{String(iconName)}
										</Text>
									</View>
								))}
							</View>
						</Card>
					</View>
				))}

				<View style={{ height: spacing["4xl"] }} />
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	content: {
		padding: 16,
		gap: 24,
	},
	header: {
		marginTop: 16,
		marginBottom: 8,
	},
	title: {
		fontSize: 48,
		fontFamily: "NotoSansJP_700Bold",
		letterSpacing: 0,
	},
	subtitle: {
		fontSize: 11,
		fontFamily: "NotoSans_500Medium",
		letterSpacing: 0,
		marginTop: 8,
	},
	sectionTitle: {
		fontSize: 11,
		fontFamily: "NotoSans_500Medium",
		letterSpacing: 0,
		marginBottom: 16,
	},
	exampleRow: {
		flexDirection: "row",
		gap: 24,
		alignItems: "center",
	},
	letterSection: {
		gap: 8,
	},
	letterTitle: {
		fontSize: 11,
		fontFamily: "NotoSans_500Medium",
		letterSpacing: 0,
		marginTop: 8,
	},
	iconGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	iconItem: {
		width: 80,
		alignItems: "center",
		gap: 4,
	},
	iconName: {
		fontSize: 9,
		fontFamily: "NotoSans_400Regular",
		textAlign: "center",
	},
});
