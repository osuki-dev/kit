import React, { type ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";

export interface ButtonGroupRootProps extends ViewProps {
	children?: ReactNode;
}

/**
 * Joins adjacent actions into one control. The group clips inner corners, so
 * each child can stay a normal `Button`.
 */
export function ButtonGroupRoot({ children, style, ...props }: ButtonGroupRootProps) {
	const theme = useThemeTokens();
	const items = React.Children.toArray(children);
	return (
		<View
			style={[
				styles.root,
				{
					borderColor: theme.colors.border,
					borderRadius: theme.radius.lg,
					backgroundColor: theme.colors.border,
				},
				style,
			]}
			{...props}
		>
			{items.map((child, index) => (
				<View key={index} style={styles.item}>
					{child}
				</View>
			))}
		</View>
	);
}

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
	Root: ButtonGroupRoot,
});

const styles = StyleSheet.create({
	root: {
		flexDirection: "row",
		alignItems: "stretch",
		overflow: "hidden",
		borderWidth: StyleSheet.hairlineWidth,
		gap: StyleSheet.hairlineWidth,
	},
	item: {
		flex: 1,
		minWidth: 0,
	},
});
