import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";

import {
	Screen,
	Text,
	Button,
	Icon,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	type IconName,
} from "@osuki-dev/ui";

export interface EmptyStateConfig {
	/** Icon name */
	icon: IconName;
	/** Title */
	title: string;
	/** Description */
	description?: string;
	/** Primary action */
	primaryAction?: {
		label: string;
		onPress: () => void;
		testID?: string;
	};
	/** Secondary action */
	secondaryAction?: {
		label: string;
		onPress: () => void;
		testID?: string;
	};
}

export interface EmptyStateScreenProps {
	config: EmptyStateConfig;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		content?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	iconContainer: {
		marginBottom: 24,
	},
	title: {
		textAlign: "center",
		marginBottom: 12,
	},
	description: {
		textAlign: "center",
		marginBottom: 32,
		maxWidth: 400,
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
});

/**
 * Empty state screen template
 *
 * Features:
 * - Custom icon
 * - Title and description
 * - Primary and secondary actions
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <EmptyStateScreen
 *   config={{
 *     icon: "Inbox",
 *     title: "NO MESSAGES",
 *     description: "Your inbox is empty. Start a conversation!",
 *     primaryAction: { label: "NEW MESSAGE", onPress: () => {} },
 *   }}
 * />
 * ```
 */
export function EmptyStateScreen({ config, styleOverrides }: EmptyStateScreenProps) {
	const { colors } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { icon, title, description, primaryAction, secondaryAction } = config;

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container]}>
			<ResponsiveContainer
				maxWidth={{ xs: "100%", md: 600 }}
				horizontalPadding={pagePadding}
				alignment="center"
			>
				<View style={[staticStyles.content, styleOverrides?.content || {}]}>
					{/* Icon */}
					<View style={staticStyles.iconContainer}>
						<Icon name={icon} size={64} color={colors.textDisabled} />
					</View>

					{/* Title */}
					<Text variant="heading" color={colors.text} style={staticStyles.title}>
						{title}
					</Text>

					{/* Description */}
					{description && (
						<Text variant="body" color={colors.textMuted} style={staticStyles.description}>
							{description}
						</Text>
					)}

					{/* Actions */}
					{(primaryAction || secondaryAction) && (
						<View style={staticStyles.actions}>
							{secondaryAction && (
								<Button
									variant="secondary"
									onPress={secondaryAction.onPress}
									testID={secondaryAction.testID}
								>
									{secondaryAction.label}
								</Button>
							)}
							{primaryAction && (
								<Button
									variant="primary"
									onPress={primaryAction.onPress}
									testID={primaryAction.testID}
								>
									{primaryAction.label}
								</Button>
							)}
						</View>
					)}
				</View>
			</ResponsiveContainer>
		</Screen>
	);
}
