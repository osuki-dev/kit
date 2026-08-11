import React, { useMemo } from "react";
import { Pressable, View, type PressableProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export interface DataRowProps extends Omit<PressableProps, "style" | "children"> {
	label: string;
	value?: string | number;
	description?: string;
	leadingIcon?: IconName;
	trailing?: React.ReactNode;
	separator?: "none" | "bottom";
	size?: "default" | "compact";
	style?: ViewStyle;
}

export const DataRow: React.FC<DataRowProps> = ({
	label,
	value,
	description,
	leadingIcon,
	trailing,
	separator = "none",
	size = "default",
	style,
	onPress,
	disabled,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const isPressable = typeof onPress === "function";
	const isDisabled = disabled === true;

	const containerStyle = useMemo<ViewStyle>(
		() => ({
			minHeight: size === "compact" ? 48 : 60,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			paddingVertical: size === "compact" ? theme.spacing.xs : theme.spacing.sm,
			borderBottomWidth: separator === "bottom" ? 1 : 0,
			borderBottomColor: theme.colors.border,
			opacity: isDisabled ? 0.48 : 1,
		}),
		[isDisabled, separator, size, theme.colors.border, theme.spacing.sm, theme.spacing.xs],
	);

	const handlePress: PressableProps["onPress"] = (event) => {
		if (isDisabled) return;
		haptics.feedback("selection");
		onPress?.(event);
	};

	const content = (
		<>
			{leadingIcon && (
				<View style={{ width: 32, alignItems: "center", justifyContent: "center" }}>
					<Icon name={leadingIcon} size={20} color={theme.colors.textMuted} />
				</View>
			)}
			<View style={{ flex: 1, minWidth: 0, gap: 2 }}>
				<Text variant="bodySmall" colorKey="text" numberOfLines={1}>
					{label}
				</Text>
				{description && (
					<Text variant="caption" colorKey="textMuted" numberOfLines={2}>
						{description}
					</Text>
				)}
			</View>
			{value !== undefined && (
				<Text
					variant="bodySmall"
					colorKey="textMuted"
					numberOfLines={1}
					style={{ maxWidth: 150, textAlign: "right" }}
				>
					{value}
				</Text>
			)}
			{trailing}
			{isPressable && <Icon name="ChevronRight" size={18} color={theme.colors.textSubtle} />}
		</>
	);

	if (!isPressable) {
		return (
			<View style={[containerStyle, style]} testID={testID}>
				{content}
			</View>
		);
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled: isDisabled }}
			disabled={isDisabled}
			onPress={handlePress}
			style={[containerStyle, style]}
			testID={testID}
			{...props}
		>
			{content}
		</Pressable>
	);
};
