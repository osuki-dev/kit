import React, { useMemo } from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon, type IconName } from "./icon";
import { useHaptics } from "./haptics";

export interface ToolbarAction {
	id: string;
	icon: IconName;
	label: string;
	onPress: () => void;
	disabled?: boolean;
	selected?: boolean;
}

export interface ToolbarProps extends ViewProps {
	actions: ToolbarAction[];
	label?: string;
	variant?: "plain" | "surface";
	density?: "compact" | "comfortable";
}

export const Toolbar: React.FC<ToolbarProps> = ({
	actions,
	label,
	variant = "surface",
	density = "comfortable",
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const compact = density === "compact";
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.xs,
			padding: variant === "surface" ? theme.spacing.xs : 0,
			borderRadius: theme.radius.pill,
			backgroundColor: variant === "surface" ? theme.colors.surfaceRaised : "transparent",
		}),
		[theme.colors.surfaceRaised, theme.radius.pill, theme.spacing.xs, variant],
	);

	return (
		<View
			accessibilityRole="toolbar"
			accessibilityLabel={label}
			style={[containerStyle, style]}
			testID={testID}
			{...props}
		>
			{actions.map((action) => (
				<ToolbarButton
					key={action.id}
					action={action}
					compact={compact}
					testID={testID ? `${testID}-action-${action.id}` : undefined}
				/>
			))}
		</View>
	);
};

interface ToolbarButtonProps {
	action: ToolbarAction;
	compact: boolean;
	testID?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ action, compact, testID }) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const disabled = action.disabled === true;
	const selected = action.selected === true;

	const handlePress = () => {
		if (disabled) return;
		haptics.feedback("selection");
		action.onPress();
	};

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={action.label}
			accessibilityState={{ disabled, selected }}
			disabled={disabled}
			onPress={handlePress}
			style={{
				minWidth: compact ? 40 : 44,
				height: compact ? 40 : 44,
				borderRadius: theme.radius.pill,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: selected ? theme.colors.surface : "transparent",
				opacity: disabled ? 0.42 : 1,
			}}
			testID={testID}
		>
			<Icon
				name={action.icon}
				size={compact ? 18 : 20}
				color={selected ? theme.colors.primary : theme.colors.textMuted}
			/>
		</Pressable>
	);
};
