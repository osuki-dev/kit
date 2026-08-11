import { StyleSheet, View } from "react-native";

import { Text, useTheme } from "@osuki-dev/ui";

export function StatusPill({
	children,
	tone = "neutral",
	testID,
}: {
	children: string;
	tone?: "neutral" | "success" | "danger";
	testID?: string;
}) {
	const { colors, spacing, radius } = useTheme();
	const background =
		tone === "danger"
			? colors.dangerSubtle
			: tone === "success"
				? "rgba(18, 183, 106, 0.12)"
				: colors.surfaceRaised;
	const colorKey = tone === "danger" ? "danger" : tone === "success" ? "success" : "textMuted";

	return (
		<View
			testID={testID}
			style={[
				styles.root,
				{
					backgroundColor: background,
					borderRadius: radius.pill,
					paddingHorizontal: spacing.md,
					paddingVertical: spacing.xs,
				},
			]}
		>
			<Text variant="caption" colorKey={colorKey}>
				{children}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		alignSelf: "flex-start",
		maxWidth: "100%",
	},
});
