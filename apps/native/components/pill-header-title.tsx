import { StyleSheet, View } from "react-native";

import { Text, useTheme } from "@osuki-dev/ui";
import { headerChrome } from "@/components/header-chrome";

function withAlpha(color: string, alpha: number) {
	if (color.startsWith("#") && color.length === 7) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	return color;
}

export function PillHeaderTitle({ children }: { children?: string }) {
	const { colors, mode, shadow } = useTheme();

	return (
		<View
			style={[
				styles.pill,
				{
					backgroundColor: withAlpha(colors.surface, mode === "dark" ? 0.82 : 0.92),
					...(mode === "light" ? shadow.pill : {}),
				},
			]}
			testID="pill-header-title"
			accessibilityRole="header"
		>
			<Text
				variant="label"
				color={colors.text}
				numberOfLines={1}
				adjustsFontSizeToFit
				minimumFontScale={0.72}
				style={styles.titleText}
			>
				{children}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	pill: {
		minHeight: headerChrome.pillHeight,
		maxWidth: headerChrome.titleMaxWidth,
		width: "100%",
		paddingHorizontal: headerChrome.titlePaddingX,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	titleText: {
		maxWidth: "100%",
		textAlign: "center",
	},
});
