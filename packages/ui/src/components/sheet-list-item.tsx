import React, { useMemo } from "react";
import { Pressable, View, type AccessibilityRole, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export type SheetListItemTone = "default" | "destructive";

export interface SheetListItemProps {
	label: string;
	description?: string;
	icon?: IconName;
	selected?: boolean;
	disabled?: boolean;
	tone?: SheetListItemTone;
	variant?: "plain" | "raised";
	role?: AccessibilityRole;
	onPress: () => void;
	style?: ViewStyle;
	testID?: string;
}

export const SheetListItem: React.FC<SheetListItemProps> = ({
	label,
	description,
	icon,
	selected = false,
	disabled = false,
	tone = "default",
	variant = "plain",
	role = "button",
	onPress,
	style,
	testID,
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const tokens = theme.components.ListItem;
	const destructive = tone === "destructive";
	const foreground = destructive ? theme.colors.danger : theme.colors.text;

	const baseStyle = useMemo<ViewStyle>(
		() => ({
			minHeight: tokens.minHeight,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing[tokens.gap],
			paddingHorizontal: theme.spacing[tokens.paddingX],
			paddingVertical: theme.spacing[tokens.paddingY],
			borderRadius: theme.radius[tokens.radius],
			backgroundColor: selected
				? theme.colors[tokens.selectedBackground]
				: destructive
					? theme.colors[tokens.destructiveBackground]
					: variant === "raised"
						? theme.colors.surfaceRaised
						: tokens.background === "transparent"
							? "transparent"
							: theme.colors[tokens.background],
			opacity: disabled ? 0.44 : 1,
		}),
		[
			destructive,
			disabled,
			selected,
			theme.colors.surfaceRaised,
			theme.colors,
			theme.radius,
			theme.spacing,
			tokens,
			variant,
		],
	);

	const handlePress = () => {
		if (disabled) return;
		haptics.feedback(destructive ? "warning" : "selection");
		onPress();
	};

	return (
		<Pressable
			accessibilityRole={role}
			accessibilityLabel={label}
			accessibilityState={{ selected, disabled }}
			disabled={disabled}
			onPress={handlePress}
			style={({ pressed }) => [
				baseStyle,
				pressed && !disabled && !selected && !destructive
					? { backgroundColor: theme.colors.surfaceRaised }
					: undefined,
				style,
			]}
			testID={testID}
		>
			{icon && <Icon name={icon} size={18} color={foreground} />}
			<View style={{ flex: 1, minWidth: 0, gap: 2 }}>
				<Text variant="body" color={foreground} numberOfLines={1}>
					{label}
				</Text>
				{description && (
					<Text variant="caption" colorKey="textMuted" numberOfLines={2}>
						{description}
					</Text>
				)}
			</View>
			{selected && <Icon name="Check" size={18} color={theme.colors.primary} />}
		</Pressable>
	);
};
