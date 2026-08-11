import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@osuki-dev/ui";

function withAlpha(color: string, alpha: number) {
	if (color.startsWith("#") && color.length === 7) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	return color;
}

export function StackHeaderBackground() {
	const { colors, mode } = useTheme();
	const solid = withAlpha(colors.background, mode === "dark" ? 0.94 : 0.98);
	const mid = withAlpha(colors.background, mode === "dark" ? 0.74 : 0.86);
	const clear = withAlpha(colors.background, 0);

	return (
		<View pointerEvents="none" style={StyleSheet.absoluteFill}>
			<LinearGradient colors={[solid, mid, clear]} locations={[0, 0.56, 1]} style={styles.veil} />
		</View>
	);
}

const styles = StyleSheet.create({
	veil: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 156,
	},
});
