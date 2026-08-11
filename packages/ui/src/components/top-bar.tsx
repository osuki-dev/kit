import React, { useMemo } from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeTokens } from "../theme";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export interface TopBarAction {
	icon: IconName;
	label: string;
	onPress: () => void;
	disabled?: boolean;
}

export interface TopBarProps extends Omit<ViewProps, "style" | "children"> {
	title: string;
	subtitle?: string;
	onBack?: () => void;
	backLabel?: string;
	leading?: React.ReactNode;
	trailing?: React.ReactNode;
	actions?: TopBarAction[];
	safeArea?: "none" | "top";
	elevation?: "flat" | "divider";
	style?: ViewStyle;
}

export const TopBar: React.FC<TopBarProps> = ({
	title,
	subtitle,
	onBack,
	backLabel = "Back",
	leading,
	trailing,
	actions,
	safeArea = "top",
	elevation = "flat",
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const insets = useSafeAreaInsets();
	const topPadding = safeArea === "top" ? insets.top : 0;

	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			minHeight: 56 + topPadding,
			paddingTop: topPadding,
			paddingHorizontal: theme.spacing.md,
			paddingBottom: theme.spacing.sm,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			backgroundColor: theme.colors.surface,
			borderBottomWidth: elevation === "divider" ? 1 : 0,
			borderBottomColor: theme.colors.border,
		}),
		[
			elevation,
			theme.colors.border,
			theme.colors.surface,
			theme.spacing.md,
			theme.spacing.sm,
			topPadding,
		],
	);

	return (
		<View style={[containerStyle, style]} testID={testID} {...props}>
			{leading ??
				(onBack ? (
					<TopBarIconButton
						icon="ChevronLeft"
						label={backLabel}
						onPress={onBack}
						testID={testID ? `${testID}-back` : undefined}
					/>
				) : null)}
			<View style={{ flex: 1, minWidth: 0 }}>
				<Text variant="subheading" colorKey="text" numberOfLines={1}>
					{title}
				</Text>
				{subtitle && (
					<Text variant="caption" colorKey="textMuted" numberOfLines={1}>
						{subtitle}
					</Text>
				)}
			</View>
			{trailing}
			{actions?.map((action) => (
				<TopBarIconButton
					key={action.label}
					icon={action.icon}
					label={action.label}
					onPress={action.onPress}
					disabled={action.disabled}
					testID={testID ? `${testID}-action-${action.label}` : undefined}
				/>
			))}
		</View>
	);
};

interface TopBarIconButtonProps {
	icon: IconName;
	label: string;
	onPress: () => void;
	disabled?: boolean;
	testID?: string;
}

const TopBarIconButton: React.FC<TopBarIconButtonProps> = ({
	icon,
	label,
	onPress,
	disabled = false,
	testID,
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const handlePress = () => {
		if (disabled) return;
		haptics.feedback("selection");
		onPress();
	};

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={handlePress}
			style={{
				width: 44,
				height: 44,
				borderRadius: 22,
				alignItems: "center",
				justifyContent: "center",
				opacity: disabled ? 0.44 : 1,
			}}
			testID={testID}
		>
			<Icon name={icon} size={22} color={theme.colors.text} />
		</Pressable>
	);
};
