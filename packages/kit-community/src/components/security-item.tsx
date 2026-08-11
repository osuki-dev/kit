import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Text, Button, Toggle, Icon, type IconName, useTheme } from "@osuki-dev/ui";

export type SecurityItemType =
	| "toggle"
	| "password"
	| "2fa"
	| "biometric"
	| "session"
	| "recovery"
	| "danger"
	| "action";

export interface SecurityItemConfig {
	id: string;
	type: SecurityItemType;
	label: string;
	description?: string;
	icon?: IconName;
	value?: string | boolean;
	status?: "enabled" | "disabled" | "required";
	onPress?: () => void;
	onToggle?: (value: boolean) => void;
	disabled?: boolean;
	/** Stable test identifier for automation */
	testID?: string;
}

export interface SecurityItemProps {
	config: SecurityItemConfig;
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	textContainer: {
		flex: 1,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
});

/**
 * Security item component - specialized for security settings
 *
 * Includes special handling for:
 * - Password change
 * - 2FA toggle
 * - Biometric auth
 * - Active sessions
 * - Recovery codes
 * - Danger zone actions
 */
export const SecurityItem: React.FC<SecurityItemProps> = ({ config }) => {
	const { colors, spacing } = useTheme();
	const testID = config.testID ?? `security-item-${config.id}`;

	const handlePress = () => {
		if (config.disabled) return;
		config.onPress?.();
	};

	const handleToggle = (value: boolean) => {
		if (config.disabled) return;
		config.onToggle?.(value);
	};

	// Dynamic spacing
	const layoutSpacing = {
		paddingVertical: spacing["sm"],
		iconMargin: spacing["sm"],
		gap: spacing["xs"],
		statusGap: spacing["sm"],
	};

	const getStatusColor = () => {
		switch (config.status) {
			case "enabled":
			case "required":
				return colors.success;
			case "disabled":
				return colors.textDisabled;
			default:
				return colors.textMuted;
		}
	};

	const renderContent = () => {
		switch (config.type) {
			case "toggle":
			case "2fa":
			case "biometric":
				return (
					<View
						style={[staticStyles.container, { paddingVertical: layoutSpacing.paddingVertical }]}
					>
						<View style={[staticStyles.content, { gap: layoutSpacing.iconMargin }]}>
							{config.icon && <Icon name={config.icon} size={20} color={colors.textMuted} />}
							<View style={[staticStyles.textContainer, { gap: layoutSpacing.gap }]}>
								<Text variant="body" color={config.disabled ? colors.textDisabled : colors.text}>
									{config.label}
								</Text>
								{config.description && (
									<Text variant="caption" color={colors.textDisabled}>
										{config.description}
									</Text>
								)}
							</View>
						</View>
						<View style={[staticStyles.statusContainer, { gap: layoutSpacing.statusGap }]}>
							{config.status && (
								<Text variant="caption" color={getStatusColor()}>
									{config.status.toUpperCase()}
								</Text>
							)}
							<Toggle
								testID={`${testID}-toggle`}
								value={!!config.value}
								onValueChange={handleToggle}
							/>
						</View>
					</View>
				);

			case "password":
				return (
					<View
						style={[staticStyles.container, { paddingVertical: layoutSpacing.paddingVertical }]}
					>
						<View style={[staticStyles.content, { gap: layoutSpacing.iconMargin }]}>
							{config.icon && <Icon name={config.icon} size={20} color={colors.textMuted} />}
							<View style={[staticStyles.textContainer, { gap: layoutSpacing.gap }]}>
								<Text variant="body" color={colors.text}>
									{config.label}
								</Text>
								{config.description && (
									<Text variant="caption" color={colors.textDisabled}>
										{config.description}
									</Text>
								)}
							</View>
						</View>
						<Button testID={`${testID}-change`} variant="secondary" onPress={handlePress}>
							CHANGE
						</Button>
					</View>
				);

			case "recovery":
				return (
					<View
						style={[staticStyles.container, { paddingVertical: layoutSpacing.paddingVertical }]}
					>
						<View style={[staticStyles.content, { gap: layoutSpacing.iconMargin }]}>
							{config.icon && <Icon name={config.icon} size={20} color={colors.textMuted} />}
							<View style={[staticStyles.textContainer, { gap: layoutSpacing.gap }]}>
								<Text variant="body" color={colors.text}>
									{config.label}
								</Text>
								{config.description && (
									<Text variant="caption" color={colors.textDisabled}>
										{config.description}
									</Text>
								)}
							</View>
						</View>
						<Button testID={`${testID}-view`} variant="ghost" onPress={handlePress}>
							VIEW
						</Button>
					</View>
				);

			case "danger":
				return (
					<View
						style={[staticStyles.container, { paddingVertical: layoutSpacing.paddingVertical }]}
					>
						<View style={[staticStyles.content, { gap: layoutSpacing.iconMargin }]}>
							{config.icon && <Icon name={config.icon} size={20} color={colors.primary} />}
							<View style={[staticStyles.textContainer, { gap: layoutSpacing.gap }]}>
								<Text variant="body" color={colors.primary}>
									{config.label}
								</Text>
								{config.description && (
									<Text variant="caption" color={colors.textDisabled}>
										{config.description}
									</Text>
								)}
							</View>
						</View>
					</View>
				);

			case "session":
			case "action":
			default:
				return (
					<View
						style={[staticStyles.container, { paddingVertical: layoutSpacing.paddingVertical }]}
					>
						<View style={[staticStyles.content, { gap: layoutSpacing.iconMargin }]}>
							{config.icon && <Icon name={config.icon} size={20} color={colors.textMuted} />}
							<View style={[staticStyles.textContainer, { gap: layoutSpacing.gap }]}>
								<Text variant="body" color={config.disabled ? colors.textDisabled : colors.text}>
									{config.label}
								</Text>
								{config.description && (
									<Text variant="caption" color={colors.textDisabled}>
										{config.description}
									</Text>
								)}
							</View>
						</View>
						{config.value && typeof config.value === "string" && (
							<Text variant="caption" color={colors.textMuted}>
								{config.value}
							</Text>
						)}
					</View>
				);
		}
	};

	const isPressable =
		config.type === "session" || config.type === "action" || config.type === "danger";

	if (isPressable) {
		return (
			<TouchableOpacity onPress={handlePress} disabled={config.disabled} activeOpacity={0.7}>
				<View testID={testID}>{renderContent()}</View>
			</TouchableOpacity>
		);
	}

	return <View testID={testID}>{renderContent()}</View>;
};
