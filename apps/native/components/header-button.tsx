import { forwardRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon, useHaptics, useTheme } from "@osuki-dev/ui";

export const HeaderButton = forwardRef<View, { onPress?: () => void }>(({ onPress }, ref) => {
	const { colors } = useTheme();
	const haptics = useHaptics();

	return (
		<Pressable
			ref={ref}
			onPress={() => {
				haptics.feedback("selection");
				onPress?.();
			}}
			style={({ pressed }) => [
				styles.button,
				{
					backgroundColor: pressed ? colors.surface : "transparent",
					opacity: pressed ? 0.7 : 1,
				},
			]}
		>
			<Icon name="Info" size={20} color={colors.text} />
		</Pressable>
	);
});

const styles = StyleSheet.create({
	button: {
		padding: 8,
		marginRight: 8,
		borderRadius: 4,
	},
});
