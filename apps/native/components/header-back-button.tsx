import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { Icon, useHaptics, useTheme } from "@osuki-dev/ui";
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

export function HeaderBackButton() {
	const { colors, mode, shadow } = useTheme();
	const haptics = useHaptics();

	return (
		<Pressable
			onPress={() => {
				haptics.feedback("selection");
				if (router.canGoBack()) {
					router.back();
				} else {
					router.replace("/");
				}
			}}
			style={({ pressed }) => [
				styles.button,
				{
					opacity: pressed ? 0.78 : 1,
					backgroundColor: withAlpha(colors.surface, mode === "dark" ? 0.82 : 0.92),
					...(mode === "light" ? shadow.pill : {}),
				},
			]}
			testID="header-back-button"
			accessibilityRole="button"
			accessibilityLabel="Back"
		>
			<Icon name="ChevronLeft" size={22} color={colors.text} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		width: headerChrome.backWidth,
		height: headerChrome.pillHeight,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 2,
	},
});
