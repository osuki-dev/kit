import React from "react";
import { View, StyleSheet, TouchableOpacity, type DimensionValue } from "react-native";

import {
	Text,
	Button,
	Icon,
	type IconName,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

export interface EmptyStateProps {
	/** Lucide icon name (PascalCase) */
	icon: IconName;
	/** Main title (ALL CAPS recommended) */
	title: string;
	/** Description text */
	description?: string;
	/** Primary action button */
	action?: {
		label: string;
		onPress: () => void;
		variant?: "primary" | "secondary";
	};
	/** Secondary action (text link) */
	secondaryAction?: {
		label: string;
		onPress: () => void;
	};
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * Empty state component with Osuki design system
 *
 * Uses responsive layout with no hardcoded dimensions.
 * Adapts icon size, content width, and action button width
 * based on screen size.
 *
 * Use when:
 * - List has no items
 * - Search returns no results
 * - Feature is empty
 * - Error state with recovery option
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="Inbox"
 *   title="NO MESSAGES"
 *   description="Your inbox is empty"
 *   action={{ label: 'REFRESH', onPress: handleRefresh }}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	title,
	description,
	action,
	secondaryAction,
	testID = "empty-state",
}) => {
	const { colors, spacing } = useTheme();
	const { emptyState, isMobile } = useResponsiveTheme();

	// Responsive icon size
	const iconSize = emptyState.iconSize;
	const iconContainerSize = iconSize * 1.2;

	return (
		<ResponsiveContainer
			maxWidth={emptyState.maxWidth}
			horizontalPadding={isMobile ? 24 : 32}
			alignment="center"
			style={styles.container}
			testID={testID}
		>
			{/* Icon */}
			<View
				testID={`${testID}-icon`}
				style={[
					styles.iconContainer,
					{
						width: iconContainerSize,
						height: iconContainerSize,
						borderRadius: iconContainerSize / 2,
						backgroundColor: colors.surfaceRaised,
						marginBottom: spacing["lg"],
					},
				]}
			>
				<Icon name={icon} size={iconSize * 0.5} color={colors.textMuted} />
			</View>

			{/* Title */}
			<Text
				variant="heading"
				color={colors.text}
				style={[styles.title, { marginBottom: spacing["sm"] }]}
			>
				{title}
			</Text>

			{/* Description */}
			{description && (
				<Text
					variant="body"
					color={colors.textMuted}
					style={[styles.description, { marginBottom: spacing["lg"] }]}
				>
					{description}
				</Text>
			)}

			{/* Action Button */}
			{action && (
				<View
					style={[
						styles.actionContainer,
						{ minWidth: emptyState.actionMinWidth as DimensionValue },
					]}
				>
					<Button
						testID={`${testID}-primary-action`}
						variant={action.variant || "primary"}
						onPress={action.onPress}
						style={{ width: isMobile ? "100%" : undefined }}
					>
						{action.label}
					</Button>
				</View>
			)}

			{/* Secondary Action */}
			{secondaryAction && (
				<TouchableOpacity
					testID={`${testID}-secondary-action`}
					onPress={secondaryAction.onPress}
					style={[styles.secondaryAction, { marginTop: spacing["md"], padding: spacing["sm"] }]}
				>
					<Text variant="caption" color={colors.primary}>
						{secondaryAction.label}
					</Text>
				</TouchableOpacity>
			)}
		</ResponsiveContainer>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	iconContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		textAlign: "center",
	},
	description: {
		textAlign: "center",
	},
	actionContainer: {
		width: "100%",
	},
	secondaryAction: {
		// Spacing handled in component
	},
});
