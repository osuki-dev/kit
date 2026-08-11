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

export type ErrorType = "404" | "500" | "network" | "permission" | "generic";

export interface ErrorScreenConfig {
	/** Error type */
	type: ErrorType;
	/** Error title */
	title?: string;
	/** Error message */
	message?: string;
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

export interface ErrorScreenProps {
	config: ErrorScreenConfig;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		content?: ViewStyle;
		icon?: ViewStyle;
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
	errorCode: {
		fontSize: 72,
		fontWeight: "700",
		marginBottom: 16,
	},
	title: {
		marginBottom: 12,
		textAlign: "center",
	},
	message: {
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

const errorConfig: Record<
	ErrorType,
	{
		icon: IconName;
		code: string;
		defaultTitle: string;
		defaultMessage: string;
	}
> = {
	"404": {
		icon: "Search",
		code: "404",
		defaultTitle: "PAGE NOT FOUND",
		defaultMessage: "The page you are looking for doesn't exist or has been moved.",
	},
	"500": {
		icon: "Server",
		code: "500",
		defaultTitle: "SERVER ERROR",
		defaultMessage: "Something went wrong on our end. Please try again later.",
	},
	network: {
		icon: "WifiOff",
		code: "",
		defaultTitle: "NO CONNECTION",
		defaultMessage: "Please check your internet connection and try again.",
	},
	permission: {
		icon: "Lock",
		code: "403",
		defaultTitle: "ACCESS DENIED",
		defaultMessage: "You don't have permission to access this resource.",
	},
	generic: {
		icon: "AlertCircle",
		code: "",
		defaultTitle: "OOPS!",
		defaultMessage: "Something went wrong. Please try again.",
	},
};

/**
 * Error screen template
 *
 * Features:
 * - Multiple error types (404, 500, network, permission)
 * - Large error code display
 * - Icon representation
 * - Action buttons
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <ErrorScreen
 *   config={{
 *     type: "404",
 *     primaryAction: { label: "GO HOME", onPress: () => {} },
 *     secondaryAction: { label: "TRY AGAIN", onPress: () => {} },
 *   }}
 * />
 * ```
 */
export function ErrorScreen({ config, styleOverrides }: ErrorScreenProps) {
	const { colors } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { type, title, message, primaryAction, secondaryAction } = config;
	const errorInfo = errorConfig[type];

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container]}>
			<ResponsiveContainer
				maxWidth={{ xs: "100%", md: 600 }}
				horizontalPadding={pagePadding}
				alignment="center"
			>
				<View style={[staticStyles.content, styleOverrides?.content || {}]}>
					{/* Icon */}
					<View style={[staticStyles.iconContainer, styleOverrides?.icon]}>
						<Icon name={errorInfo.icon} size={64} color={colors.primary} />
					</View>

					{/* Error Code */}
					{errorInfo.code && (
						<Text style={[staticStyles.errorCode, { color: colors.textDisabled }]}>
							{errorInfo.code}
						</Text>
					)}

					{/* Title */}
					<Text variant="heading" color={colors.text} style={staticStyles.title}>
						{title || errorInfo.defaultTitle}
					</Text>

					{/* Message */}
					<Text variant="body" color={colors.textMuted} style={staticStyles.message}>
						{message || errorInfo.defaultMessage}
					</Text>

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
