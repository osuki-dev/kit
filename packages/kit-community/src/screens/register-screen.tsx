import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	Input,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	KeyboardAwareScrollView,
	KeyboardToolbar,
} from "@osuki-dev/ui";
import { ValidationError } from "../components/validation-error";
import { useI18n } from "../i18n";

export interface RegisterScreenProps {
	/** App/brand name */
	brandName?: string;
	/** Registration handler */
	onRegister: (data: { name: string; email: string; password: string }) => void | Promise<void>;
	/** Navigate to login */
	onLoginPress?: () => void;
	/** Loading state */
	isLoading?: boolean;
	/** Error message */
	error?: string;
	/** Enable name field */
	requireName?: boolean;
}

// Static styles - all layout, no dimensions
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
});

/**
 * Register screen component with Osuki design system
 *
 * Uses responsive layout with no hardcoded max-width.
 * Form width adapts to screen size for optimal readability.
 *
 * @example
 * ```tsx
 * <RegisterScreen
 *   brandName="MY APP"
 *   requireName={true}
 *   onRegister={async ({ name, email, password }) => {
 *     await auth.signUp(name, email, password);
 *   }}
 *   onLoginPress={() => navigate('login')}
 * />
 * ```
 */
export function RegisterScreen({
	brandName = "APP",
	onRegister,
	onLoginPress,
	isLoading,
	error,
	requireName = true,
}: RegisterScreenProps) {
	const { colors, spacing } = useTheme();
	const { formMaxWidth, pagePadding, isMobile } = useResponsiveTheme();
	const { t } = useI18n();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	// Dynamic spacing
	const layoutSpacing = {
		pagePaddingTop: 0,
		brandMargin: spacing["3xl"],
		formMargin: spacing["xl"],
		inputGap: spacing["md"],
		buttonMargin: spacing["lg"],
		actionGap: spacing["sm"],
	};

	const handleRegister = () => {
		setLocalError(null);
		if (isLoading) return;
		if (requireName && !name.trim()) {
			setLocalError(t("validation.required"));
			return;
		}
		if (!email.trim() || !email.includes("@")) {
			setLocalError(t("validation.email"));
			return;
		}
		if (password.length < 8) {
			setLocalError(t("validation.minLength", { min: 8 }));
			return;
		}
		if (password !== confirmPassword) {
			setLocalError(t("validation.match"));
			return;
		}
		onRegister({ name: name.trim(), email: email.trim().toLowerCase(), password });
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
							{t("auth.register")}
						</Text>
					</View>

					{/* Error */}
					{(error || localError) && (
						<View style={{ alignItems: "center", marginBottom: layoutSpacing.inputGap }}>
							<ValidationError testID="register-error-message" message={(error ?? localError)!} />
						</View>
					)}

					{/* Form */}
					<Card
						variant="raised"
						border="subtle"
						padding="lg"
						style={[staticStyles.formSection, { marginBottom: layoutSpacing.formMargin }]}
					>
						<View style={{ gap: layoutSpacing.inputGap }}>
							{requireName && (
								<Input
									variant="outline"
									label={t("auth.fullName")}
									value={name}
									onChangeText={setName}
									placeholder="Mika Tan"
									autoComplete="name"
									testID="register-name-input"
								/>
							)}

							<Input
								variant="outline"
								label={t("auth.email")}
								value={email}
								onChangeText={setEmail}
								keyboardType="email-address"
								autoCapitalize="none"
								placeholder="email@example.com"
								autoComplete="email"
								testID="register-email-input"
							/>

							<Input
								variant="outline"
								label={t("auth.password")}
								value={password}
								onChangeText={setPassword}
								secureTextEntry
								placeholder={t("auth.createPassword")}
								autoComplete="new-password"
								testID="register-password-input"
							/>

							<Input
								variant="outline"
								label={t("auth.confirmPassword")}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry
								placeholder={t("auth.confirmPasswordPlaceholder")}
								autoComplete="new-password"
								testID="register-confirm-password-input"
							/>
						</View>

						<View style={{ marginTop: layoutSpacing.buttonMargin }}>
							<Button
								variant="primary"
								onPress={handleRegister}
								disabled={isLoading}
								testID="register-submit-button"
								style={{ width: isMobile ? "100%" : undefined }}
							>
								{isLoading ? t("auth.creatingAccount") : t("auth.register")}
							</Button>
						</View>
					</Card>

					{/* Login Link */}
					{onLoginPress && (
						<View style={{ alignItems: "center" }}>
							<TouchableOpacity onPress={onLoginPress} testID="register-login-link">
								<Text variant="body" color={colors.textMuted}>
									{t("auth.hasAccount")}{" "}
									<Text variant="body" color={colors.primary}>
										{t("auth.login")}
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
