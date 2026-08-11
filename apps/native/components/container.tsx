import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useTheme } from "@osuki-dev/ui";

export function Container({
	children,
	topInset = false,
	horizontalInsets = true,
}: {
	children: React.ReactNode;
	topInset?: boolean;
	horizontalInsets?: boolean;
}) {
	const { colors } = useTheme();
	const edges: Edge[] = [
		...(topInset ? (["top"] as const) : []),
		...(horizontalInsets ? (["left", "right"] as const) : []),
		"bottom",
	];

	return (
		<SafeAreaView edges={edges} style={[styles.container, { backgroundColor: colors.background }]}>
			{children}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
