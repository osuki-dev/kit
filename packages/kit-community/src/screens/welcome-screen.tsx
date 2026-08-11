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
} from "@osuki-dev/ui";

export interface WelcomeFeature {
	icon: string;
	title: string;
	description: string;
}

export interface WelcomeScreenConfig {
	/** Brand/App name */
	brandName: string;
	/** Tagline */
	tagline?: string;
	/** Features list */
	features?: WelcomeFeature[];
	/** Primary CTA */
	primaryAction: {
		label: string;
		onPress: () => void;
	};
	/** Secondary CTA */
	secondaryAction?: {
		label: string;
		onPress: () => void;
	};
}

export interface WelcomeScreenProps {
	config: WelcomeScreenConfig;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		content?: ViewStyle;
		features?: ViewStyle;
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
	brandSection: {
		alignItems: "center",
		marginBottom: 32,
	},
	logoContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 24,
	},
	brandName: {
		textAlign: "center",
		marginBottom: 8,
	},
	tagline: {
		textAlign: "center",
	},
	featuresSection: {
		width: "100%",
		maxWidth: 400,
		marginBottom: 32,
	},
	featureItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 16,
		marginBottom: 24,
	},
	featureIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	featureContent: {
		flex: 1,
	},
	featureTitle: {
		marginBottom: 4,
	},
	actions: {
		width: "100%",
		maxWidth: 400,
		gap: 12,
	},
});

/**
 * Welcome screen template
 *
 * Features:
 * - Brand logo/name
 * - Tagline
 * - Feature highlights
 * - Primary and secondary CTAs
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <WelcomeScreen
 *   config={{
 *     brandName: "Osuki UI",
 *     tagline: "Design with purpose",
 *     features: [
 *       { icon: "Palette", title: "Beautiful", description: "Swiss-inspired design" },
 *     ],
 *     primaryAction: { label: "GET STARTED", onPress: () => {} },
 *   }}
 * />
 * ```
 */
export function WelcomeScreen({ config, styleOverrides }: WelcomeScreenProps) {
	const { colors } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { brandName, tagline, features, primaryAction, secondaryAction } = config;

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container]}>
			<ResponsiveContainer
				maxWidth={{ xs: "100%", md: 600 }}
				horizontalPadding={pagePadding}
				alignment="center"
			>
				<View style={[staticStyles.content, styleOverrides?.content || {}]}>
					{/* Brand Section */}
					<View style={staticStyles.brandSection}>
						<View style={[staticStyles.logoContainer, { backgroundColor: colors.surfaceRaised }]}>
							<Icon name="Box" size={48} color={colors.text} />
						</View>

						<Text variant="display" color={colors.text} style={staticStyles.brandName}>
							{brandName}
						</Text>

						{tagline && (
							<Text variant="subheading" color={colors.textMuted} style={staticStyles.tagline}>
								{tagline}
							</Text>
						)}
					</View>

					{/* Features */}
					{features && features.length > 0 && (
						<View style={[staticStyles.featuresSection, styleOverrides?.features]}>
							{features.map((feature, index) => (
								<View key={index} style={staticStyles.featureItem}>
									<View
										style={[staticStyles.featureIcon, { backgroundColor: colors.surfaceRaised }]}
									>
										<Icon name={feature.icon as any} size={24} color={colors.textMuted} />
									</View>
									<View style={staticStyles.featureContent}>
										<Text variant="body" color={colors.text} style={staticStyles.featureTitle}>
											{feature.title}
										</Text>
										<Text variant="caption" color={colors.textMuted}>
											{feature.description}
										</Text>
									</View>
								</View>
							))}
						</View>
					)}

					{/* Actions */}
					<View style={staticStyles.actions}>
						<Button variant="primary" onPress={primaryAction.onPress}>
							{primaryAction.label}
						</Button>

						{secondaryAction && (
							<Button variant="secondary" onPress={secondaryAction.onPress}>
								{secondaryAction.label}
							</Button>
						)}
					</View>
				</View>
			</ResponsiveContainer>
		</Screen>
	);
}
