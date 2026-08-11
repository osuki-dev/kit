import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	Input,
	Icon,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	KeyboardAwareScrollView,
	KeyboardToolbar,
} from "@osuki-dev/ui";
import { ValidationError } from "../components/validation-error";
import { useI18n } from "../i18n";

export interface LoginScreenProps {
	/** App/brand name */
	brandName?: string;
	/** Enable social login */
	providers?: ("email" | "google" | "apple" | "github")[];
	/** Login handler */
	onLogin: (email: string, password: string) => void | Promise<void>;
	/** Navigate to register */
	onRegisterPress?: () => void;
	/** Navigate to forgot password */
	onForgotPasswordPress?: () => void;
	/** Loading state */
	isLoading?: boolean;
	/** Error message */
	error?: string;
}

// Static styles - no hardcoded dimensions, all responsive
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	brandSection: {
		alignItems: "center",
	},
	formSection: {
		width: "100%",
	},
	actionsSection: {
		alignItems: "center",
	},
	socialButtons: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 16,
	},
	socialButton: {
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
	},
});

/**
 * Login screen component with Osuki design system
 *
 * Uses responsive layout with no hardcoded max-width.
 * Form width adapts to screen size for optimal readability.
 *
 * Features:
 * - Email/password login
 * - Social login providers
 * - Error handling
 * - Brand customization
 *
 * @example
 * ```tsx
 * <LoginScreen
 *   brandName="MY APP"
 *   providers={['email', 'google', 'apple']}
 *   onLogin={async (email, password) => {
 *     await auth.signIn(email, password);
 *   }}
 *   onRegisterPress={() => navigate('register')}
 *   onForgotPasswordPress={() => navigate('forgot')}
 * />
 * ```
 */
export function LoginScreen({
	brandName = "APP",
	providers = ["email"],
	onLogin,
	onRegisterPress,
	onForgotPasswordPress,
	isLoading,
	error,
}: LoginScreenProps) {
	const { colors, spacing } = useTheme();
	const { formMaxWidth, pagePadding, isMobile } = useResponsiveTheme();
	const { t } = useI18n();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// Dynamic spacing
	const layoutSpacing = {
		pagePaddingTop: 0,
		brandMargin: spacing["3xl"],
		formMargin: spacing["xl"],
		inputGap: spacing["md"],
		buttonMargin: spacing["lg"],
		actionGap: spacing["sm"],
		socialGap: spacing["lg"],
	};

	// Social button responsive size
	const socialButtonSize = isMobile ? 44 : 48;

	const handleLogin = () => {
		if (isLoading) return;
		onLogin(email, password);
	};

	return (
		<Screen style={[staticStyles.container, { paddingTop: layoutSpacing.pagePaddingTop }]}>
			<KeyboardAwareScrollView>
				<KeyboardToolbar doneText={t("common.done")} />
				<ResponsiveContainer
					maxWidth={formMaxWidth}
					horizontalPadding={pagePadding}
					alignment="center"
					style={{ paddingTop: layoutSpacing.pagePaddingTop }}
				>
					{/* Brand */}
					<View style={[staticStyles.brandSection, { marginBottom: layoutSpacing.brandMargin }]}>
						<Text variant="hero" color={colors.text}>
							{brandName}
						</Text>
						<Text variant="label" color={colors.textMuted}>
							{t("auth.login")}
						</Text>
					</View>

					{/* Error */}
					{error && (
						<View style={{ alignItems: "center", marginBottom: layoutSpacing.inputGap }}>
							<ValidationError testID="login-error-message" message={error} />
						</View>
					)}

					{/* Form */}
					{providers.includes("email") && (
						<Card
							variant="raised"
							border="subtle"
							padding="lg"
							style={[staticStyles.formSection, { marginBottom: layoutSpacing.formMargin }]}
						>
							<View style={{ gap: layoutSpacing.inputGap }}>
								<Input
									variant="outline"
									label={t("auth.email")}
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
									autoCapitalize="none"
									placeholder="email@example.com"
									autoComplete="email"
									testID="login-email-input"
								/>

								<Input
									variant="outline"
									label={t("auth.password")}
									value={password}
									onChangeText={setPassword}
									secureTextEntry
									placeholder={t("auth.enterPassword")}
									autoComplete="current-password"
									testID="login-password-input"
								/>
							</View>

							<View style={{ marginTop: layoutSpacing.buttonMargin }}>
								<Button
									variant="primary"
									onPress={handleLogin}
									disabled={isLoading}
									testID="login-submit-button"
									style={{ width: isMobile ? "100%" : undefined }}
								>
									{isLoading ? t("auth.signingIn") : t("auth.login")}
								</Button>
							</View>

							{onForgotPasswordPress && (
								<TouchableOpacity
									onPress={onForgotPasswordPress}
									style={{ marginTop: layoutSpacing.actionGap, alignSelf: "center" }}
									testID="login-forgot-password"
								>
									<Text variant="caption" color={colors.textMuted}>
										{t("auth.forgotPassword")}
									</Text>
								</TouchableOpacity>
							)}
						</Card>
					)}

					{/* Social Login */}
					{providers.filter((p) => p !== "email").length > 0 && (
						<View style={[staticStyles.actionsSection, { gap: layoutSpacing.socialGap }]}>
							<Text variant="caption" color={colors.textDisabled}>
								{t("auth.orContinueWith")}
							</Text>

							<View style={staticStyles.socialButtons}>
								{providers.includes("google") && (
									<TouchableOpacity
										style={[
											staticStyles.socialButton,
											{
												backgroundColor: colors.surfaceRaised,
												width: socialButtonSize,
												height: socialButtonSize,
											},
										]}
									>
										<Icon name="Search" size={isMobile ? 20 : 24} color={colors.text} />
									</TouchableOpacity>
								)}
								{providers.includes("apple") && (
									<TouchableOpacity
										style={[
											staticStyles.socialButton,
											{
												backgroundColor: colors.surfaceRaised,
												width: socialButtonSize,
												height: socialButtonSize,
											},
										]}
									>
										<Icon name="Apple" size={isMobile ? 20 : 24} color={colors.text} />
									</TouchableOpacity>
								)}
								{providers.includes("github") && (
									<TouchableOpacity
										style={[
											staticStyles.socialButton,
											{
												backgroundColor: colors.surfaceRaised,
												width: socialButtonSize,
												height: socialButtonSize,
											},
										]}
									>
										<Icon name="GitBranch" size={isMobile ? 20 : 24} color={colors.text} />
									</TouchableOpacity>
								)}
							</View>
						</View>
					)}

					{/* Register Link */}
					{onRegisterPress && (
						<View style={{ marginTop: layoutSpacing.formMargin, alignItems: "center" }}>
							<TouchableOpacity onPress={onRegisterPress} testID="login-register-link">
								<Text variant="body" color={colors.textMuted}>
									{t("auth.noAccount")}{" "}
									<Text variant="body" color={colors.primary}>
										{t("auth.signUp")}
									</Text>
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</ResponsiveContainer>
			</KeyboardAwareScrollView>
		</Screen>
	);
}
