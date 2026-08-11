import React from "react";
import { View, StyleSheet } from "react-native";

import { Screen, Surface, Card, Text, useTheme, KeyboardAwareScrollView } from "@osuki-dev/ui";

import { SecurityItem, type SecurityItemConfig } from "../components/security-item";
import { SessionList, type Session } from "../components/session-list";

export interface SecuritySectionConfig {
	id: string;
	title: string;
	variant?: "default" | "danger";
	items: SecurityItemConfig[];
}

export interface SecurityScreenProps {
	/** Screen title */
	title: string;
	/** Security sections */
	sections: SecuritySectionConfig[];
	/** Active sessions (optional) */
	sessions?: Session[];
	/** Session logout handlers */
	onLogoutSession?: (sessionId: string) => void;
	onLogoutAllSessions?: () => void;
	/** Header component */
	header?: React.ReactNode;
}

// Static styles
const staticStyles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	content: {
		padding: 0,
	},
	itemsContainer: {
		// Dynamic gap applied inline
	},
	divider: {
		height: 1,
		backgroundColor: "transparent",
	},
});

/**
 * Security screen component with Osuki design system
 *
 * Specialized for security settings with:
 * - Password management
 * - 2FA/MFA settings
 * - Biometric auth
 * - Active sessions
 * - Danger zone (account deletion)
 *
 * @example
 * ```tsx
 * <SecurityScreen
 *   title="SECURITY"
 *   sections={[
 *     {
 *       id: 'auth',
 *       title: 'AUTHENTICATION',
 *       items: [
 *         { id: 'password', type: 'password', label: 'Password' },
 *         { id: '2fa', type: '2fa', label: 'Two-Factor Auth', status: 'enabled', value: true },
 *         { id: 'biometric', type: 'biometric', label: 'Biometric Auth', value: true },
 *       ],
 *     },
 *     {
 *       id: 'danger',
 *       title: 'DANGER ZONE',
 *       variant: 'danger',
 *       items: [
 *         { id: 'delete', type: 'danger', label: 'Delete Account' },
 *       ],
 *     },
 *   ]}
 *   sessions={activeSessions}
 * />
 * ```
 */
export function SecurityScreen({
	title,
	sections,
	sessions,
	onLogoutSession,
	onLogoutAllSessions,
	header,
}: SecurityScreenProps) {
	const { colors, spacing } = useTheme();

	// Dynamic spacing
	const layoutSpacing = {
		pagePaddingTop: 0,
		headerPadding: spacing["md"],
		contentPadding: spacing["md"],
		sectionGap: spacing["md"],
		itemGap: spacing["xs"],
		bottomPadding: spacing["4xl"],
	};

	return (
		<Screen style={{ paddingTop: layoutSpacing.pagePaddingTop }}>
			<KeyboardAwareScrollView>
				{/* Header */}
				<Surface variant="page" style={{ padding: layoutSpacing.headerPadding }}>
					<Text variant="heading" color={colors.text}>
						{title}
					</Text>
					{header}
				</Surface>

				{/* Security Sections */}
				<View style={{ paddingHorizontal: layoutSpacing.contentPadding }}>
					{sections.map((section) => (
						<Card
							key={section.id}
							variant="raised"
							border="subtle"
							padding="lg"
							style={{
								marginBottom: layoutSpacing.sectionGap,
								borderColor: section.variant === "danger" ? colors.primary : undefined,
							}}
						>
							<Text
								variant="label"
								color={section.variant === "danger" ? colors.primary : colors.textMuted}
								style={{ marginBottom: layoutSpacing.itemGap }}
							>
								{section.title}
							</Text>

							<View style={[staticStyles.itemsContainer, { gap: layoutSpacing.itemGap }]}>
								{section.items.map((item, index) => (
									<View key={item.id}>
										<SecurityItem config={item} />
										{index < section.items.length - 1 && (
											<View
												style={[staticStyles.divider, { marginVertical: layoutSpacing.itemGap }]}
											/>
										)}
									</View>
								))}
							</View>
						</Card>
					))}

					{/* Active Sessions Section */}
					{sessions && sessions.length > 0 && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={{ marginBottom: layoutSpacing.sectionGap }}
						>
							<Text
								variant="label"
								color={colors.textMuted}
								style={{ marginBottom: spacing["md"] }}
							>
								ACTIVE SESSIONS
							</Text>

							<SessionList
								sessions={sessions}
								onLogout={onLogoutSession}
								onLogoutAll={onLogoutAllSessions}
							/>
						</Card>
					)}
				</View>

				<View style={{ height: layoutSpacing.bottomPadding }} />
			</KeyboardAwareScrollView>
		</Screen>
	);
}
