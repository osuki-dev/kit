import React from "react";
import { View, StyleSheet, Pressable, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { Text, Toggle, Icon, type IconName, useHaptics, useTheme } from "@osuki-dev/ui";

export type SettingsItemType = "toggle" | "link" | "value" | "action" | "select" | "danger";

export interface SettingsItemConfig {
	id: string;
	type: SettingsItemType;
	label: string;
	description?: string;
	icon?: IconName;
	value?: string | boolean;
	onPress?: () => void;
	onToggle?: (value: boolean) => void;
	disabled?: boolean;
	/** Whether this is the last item in the section (no border) */
	last?: boolean;
	/** Stable test identifier for automation */
	testID?: string;
}

export interface SettingsItemProps {
	config: SettingsItemConfig;
}

/**
 * Single settings item component with complete styling encapsulation
 *
 * Features:
 * - Handles all padding internally
 * - Uses spacing and grouped surfaces instead of hard separators
 * - Supports multiple types: toggle, link, value, action, danger
 *
 * Usage: Just provide config, styling is handled automatically.
 */
export const SettingsItem: React.FC<SettingsItemProps> = ({ config }) => {
	const { colors, spacing } = useTheme();
	const haptics = useHaptics();
	const pressProgress = useSharedValue(0);
	const testID = config.testID ?? `settings-item-${config.id}`;

	const animatedContentStyle = useAnimatedStyle(() => ({
		opacity: 1 - pressProgress.value * 0.08,
		transform: [{ translateX: pressProgress.value * 2 }],
	}));

	const handlePress = () => {
		if (config.disabled) return;
		config.onPress?.();
	};

	const handlePressIn: PressableProps["onPressIn"] = () => {
		if (config.disabled) return;
		if (config.onPress) haptics.feedback("selection");
		pressProgress.value = withSpring(1, {
			stiffness: 520,
			damping: 34,
			mass: 0.72,
		});
	};

	const handlePressOut: PressableProps["onPressOut"] = () => {
		pressProgress.value = withSpring(0, {
			stiffness: 420,
			damping: 30,
			mass: 0.78,
		});
	};

	const handleToggle = (value: boolean) => {
		if (config.disabled) return;
		config.onToggle?.(value);
	};

	const getItemColor = () => {
		if (config.type === "danger") return colors.danger;
		if (config.disabled) return colors.textDisabled;
		return colors.text;
	};

	const renderContent = (contentPointerEvents: "auto" | "none" = "auto") => {
		const itemColor = getItemColor();

		return (
			<Animated.View
				pointerEvents={contentPointerEvents}
				style={[
					styles.container,
					{
						paddingHorizontal: spacing["md"],
						paddingVertical: spacing["sm"],
						gap: spacing["sm"],
					},
					animatedContentStyle,
				]}
			>
				<View style={styles.content}>
					{config.icon && (
						<View style={styles.iconSlot}>
							<Icon
								name={config.icon}
								size={22}
								color={config.type === "danger" ? colors.danger : colors.textMuted}
							/>
						</View>
					)}
					<View style={styles.textContainer}>
						<Text variant="body" color={itemColor} numberOfLines={1} style={styles.labelText}>
							{config.label}
						</Text>
						{config.description && (
							<Text
								variant="bodySmall"
								color={colors.textSubtle}
								numberOfLines={2}
								style={styles.descriptionText}
							>
								{config.description}
							</Text>
						)}
					</View>
				</View>

				<View
					pointerEvents={config.type === "toggle" ? "auto" : "none"}
					style={config.type === "toggle" ? styles.toggleSlot : styles.trailingSlot}
				>
					{config.type === "toggle" ? (
						<Toggle
							value={!!config.value}
							onValueChange={handleToggle}
							testID={`${testID}-toggle`}
							accessibilityLabel={config.label}
						/>
					) : (
						<View style={[styles.rightContent, { gap: spacing["xs"] }]}>
							{config.value && typeof config.value === "string" && (
								<Text
									variant="bodySmall"
									color={colors.textMuted}
									numberOfLines={1}
									ellipsizeMode="tail"
									style={styles.valueText}
									testID={`${testID}-value`}
								>
									{config.value}
								</Text>
							)}
							{(config.type === "link" || config.type === "select") && (
								<Icon name="ChevronRight" size={20} color={colors.textDisabled} />
							)}
						</View>
					)}
				</View>
			</Animated.View>
		);
	};

	const isPressable = config.type !== "toggle" && config.type !== "value";

	return (
		<View>
			{isPressable ? (
				<Pressable
					testID={testID}
					onPress={handlePress}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					disabled={config.disabled}
					hitSlop={6}
					accessibilityRole="button"
					accessibilityLabel={`${config.label}${typeof config.value === "string" ? `, ${config.value}` : ""}`}
					accessibilityState={{ disabled: !!config.disabled }}
					style={styles.pressable}
				>
					{renderContent("none")}
				</Pressable>
			) : (
				<View testID={testID}>{renderContent()}</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	pressable: {
		width: "100%",
	},
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		minHeight: 72,
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		flexShrink: 1,
		minWidth: 0,
		gap: 12,
	},
	iconSlot: {
		width: 32,
		minHeight: 44,
		alignItems: "center",
		justifyContent: "center",
	},
	textContainer: {
		flex: 1,
		flexShrink: 1,
		minWidth: 0,
		gap: 3,
	},
	labelText: {
		flexShrink: 1,
		minWidth: 0,
	},
	descriptionText: {
		flexShrink: 1,
		minWidth: 0,
		lineHeight: 20,
	},
	toggleSlot: {
		width: 62,
		minHeight: 44,
		alignItems: "flex-end",
		justifyContent: "center",
		flexShrink: 0,
	},
	trailingSlot: {
		flexBasis: 122,
		maxWidth: "38%",
		minHeight: 44,
		alignItems: "flex-end",
		justifyContent: "center",
		flexShrink: 0,
	},
	rightContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		maxWidth: "100%",
	},
	valueText: {
		flexShrink: 1,
		minWidth: 0,
		textAlign: "right",
	},
});
