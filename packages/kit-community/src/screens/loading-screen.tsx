import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";

import {
	Screen,
	Text,
	Spinner,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

export interface LoadingScreenConfig {
	/** Loading message */
	message?: string;
	/** Sub message */
	subMessage?: string;
	/** Show spinner */
	showSpinner?: boolean;
	/** Spinner size */
	spinnerSize?: "sm" | "md" | "lg";
}

export interface LoadingScreenProps {
	config: LoadingScreenConfig;
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
	spinnerContainer: {
		marginBottom: 24,
	},
	message: {
		textAlign: "center",
		marginBottom: 8,
	},
	subMessage: {
		textAlign: "center",
	},
});

/**
 * Loading screen template
 *
 * Features:
 * - Spinner with configurable size
 * - Loading message
 * - Sub message
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <LoadingScreen
 *   config={{
 *     message: "LOADING...",
 *     subMessage: "Please wait while we fetch your data",
 *     spinnerSize: "lg",
 *   }}
 * />
 * ```
 */
export function LoadingScreen({ config, styleOverrides }: LoadingScreenProps) {
	const { colors } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { message = "LOADING...", subMessage, showSpinner = true, spinnerSize = "md" } = config;

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container]}>
			<ResponsiveContainer
				maxWidth={{ xs: "100%", md: 600 }}
				horizontalPadding={pagePadding}
				alignment="center"
			>
				<View style={[staticStyles.content, styleOverrides?.content || {}]}>
					{/* Spinner */}
					{showSpinner && (
						<View style={staticStyles.spinnerContainer}>
							<Spinner size={spinnerSize} />
						</View>
					)}

					{/* Message */}
					<Text variant="heading" color={colors.text} style={staticStyles.message}>
						{message}
					</Text>

					{/* Sub Message */}
					{subMessage && (
						<Text variant="body" color={colors.textMuted} style={staticStyles.subMessage}>
							{subMessage}
						</Text>
					)}
				</View>
			</ResponsiveContainer>
		</Screen>
	);
}
