import { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import {
	Screen,
	Card,
	Text,
	Button,
	Input,
	Icon,
	Image,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";
import { Container } from "@/components/container";
import { StatusPill } from "@/components/status-pill";
import { useAccount } from "@/lib/data";
import { completeAccountOAuth, requestAccountLoginUrl } from "@/lib/data/account-bff-client";

const authAccessImage = require("../assets/commerce/osuki-auth-hero.jpg");
const accountBffUrl = process.env.EXPO_PUBLIC_OSUKI_ACCOUNT_BFF_URL;
const accountRedirectUri = AuthSession.makeRedirectUri({
	scheme: "osuki",
	path: "account/callback",
});

WebBrowser.maybeCompleteAuthSession();

export default function AuthPage() {
	const { colors, spacing, shadow, mode: themeMode } = useTheme();
	const { formMaxWidth, pagePadding, buttonMinWidth, isMobile } = useResponsiveTheme();
	const { signIn, signUp, refresh } = useAccount();
	const usesShopifyAccount = Boolean(accountBffUrl);

	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, string>>>(
		{},
	);

	const updateField = (field: keyof typeof formData, value: string) => {
		setFormData((data) => ({ ...data, [field]: value }));
		setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
		if (error) setError(null);
	};

	const changeMode = (nextMode: "signin" | "signup") => {
		setMode(nextMode);
		setError(null);
		setFieldErrors({});
	};

	const handleSubmit = async () => {
		setError(null);
		setFieldErrors({});
		if (usesShopifyAccount) {
			await handleShopifyOAuth();
			return;
		}

		const email = formData.email.trim();
		const password = formData.password.trim();
		const name = formData.name.trim();
		const nextErrors: Partial<Record<keyof typeof formData, string>> = {};
		if (mode === "signup" && !name) {
			nextErrors.name = "Enter your full name.";
		}
		if (!email) {
			nextErrors.email = "Enter your email address.";
		} else if (!email.includes("@")) {
			nextErrors.email = "Use a valid email address.";
		}
		if (!password) {
			nextErrors.password = "Enter your password.";
		} else if (password.length < 8) {
			nextErrors.password = "Use at least 8 characters.";
		}
		if (mode === "signup" && formData.password !== formData.confirmPassword) {
			nextErrors.confirmPassword = "Passwords do not match.";
		}

		if (Object.keys(nextErrors).length > 0) {
			setFieldErrors(nextErrors);
			setError("Check the highlighted fields and try again.");
			return;
		}

		setIsLoading(true);
		try {
			if (mode === "signup") {
				await signUp(name, email, password);
			} else {
				await signIn(email, password);
			}
			router.replace("/(tabs)/account");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to continue.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleShopifyOAuth = async () => {
		if (!accountBffUrl) return;

		setIsLoading(true);
		try {
			const login = await requestAccountLoginUrl(accountBffUrl);
			const result = await WebBrowser.openAuthSessionAsync(login.url, accountRedirectUri);
			if (result.type !== "success") {
				setError("Sign-in was cancelled.");
				return;
			}

			const callbackUrl = new URL(result.url);
			const code = callbackUrl.searchParams.get("code");
			const state = callbackUrl.searchParams.get("state");
			if (!code || !state) {
				setError("Shopify did not return a valid authorization code.");
				return;
			}

			await completeAccountOAuth(accountBffUrl, { code, state });
			await refresh();
			router.replace("/(tabs)/account");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to complete secure sign-in.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container>
			<Screen>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<ResponsiveContainer
						maxWidth={formMaxWidth}
						horizontalPadding={pagePadding}
						alignment="center"
						style={styles.container}
					>
						<View
							style={[
								styles.heroCard,
								{
									backgroundColor: colors.surface,
									marginBottom: spacing["lg"],
									...(themeMode === "light" ? shadow.soft : {}),
								},
							]}
						>
							<Image
								source={authAccessImage}
								style={styles.heroImage}
								contentFit="cover"
								cachePolicy="memory-disk"
								transition={180}
							/>
							<LinearGradient
								colors={[
									themeMode === "dark" ? `${colors.background}22` : `${colors.background}10`,
									themeMode === "dark" ? `${colors.background}DD` : `${colors.background}F2`,
								]}
								locations={[0.18, 1]}
								style={StyleSheet.absoluteFill}
							/>
							<View style={styles.heroContent}>
								<View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
									<Icon name="UserRound" size={24} color={colors.primary} />
								</View>
								<Text variant="heading" colorKey="text" style={styles.heroTitle}>
									{mode === "signin" ? "Welcome back" : "Create your account"}
								</Text>
								<Text variant="body" colorKey="textMuted" style={styles.heroCopy}>
									{mode === "signin"
										? "Access saved addresses, order history, and faster checkout."
										: "Save delivery details and keep purchases connected from day one."}
								</Text>
							</View>
						</View>

						<View
							style={[
								styles.modeToggle,
								{
									backgroundColor: colors.surfaceRaised,
									marginBottom: spacing["md"],
								},
							]}
						>
							<TouchableOpacity
								style={[
									styles.modeButton,
									mode === "signin" && {
										backgroundColor: colors.surface,
										...(themeMode === "light" ? shadow.soft : {}),
									},
								]}
								onPress={() => changeMode("signin")}
								testID="auth-mode-sign-in"
							>
								<Text variant="label" color={mode === "signin" ? colors.text : colors.textDisabled}>
									SIGN IN
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modeButton,
									mode === "signup" && {
										backgroundColor: colors.surface,
										...(themeMode === "light" ? shadow.soft : {}),
									},
								]}
								onPress={() => changeMode("signup")}
								testID="auth-mode-sign-up"
							>
								<Text variant="label" color={mode === "signup" ? colors.text : colors.textDisabled}>
									SIGN UP
								</Text>
							</TouchableOpacity>
						</View>

						<Card variant="raised" padding="lg" style={styles.formCard}>
							{usesShopifyAccount ? (
								<View style={styles.oauthPanel}>
									<View
										style={[
											styles.oauthIcon,
											{
												backgroundColor:
													themeMode === "dark" ? `${colors.primary}22` : `${colors.primary}18`,
											},
										]}
									>
										<Icon name="ShieldCheck" size={28} color={colors.primary} />
									</View>
									<Text variant="subheading" colorKey="text" style={styles.oauthTitle}>
										{mode === "signin" ? "Use your Shopify account" : "Create with Shopify"}
									</Text>
									<Text variant="body" colorKey="textMuted" style={styles.oauthCopy}>
										We will open Shopify in a secure browser session. Osuki never receives your
										customer password, and your account stays connected to checkout.
									</Text>
								</View>
							) : (
								<View style={{ gap: spacing["md"] }}>
									{mode === "signup" && (
										<Input
											label="FULL NAME"
											variant="outline"
											value={formData.name}
											onChangeText={(text) => updateField("name", text)}
											placeholder="Mika Tan"
											autoCapitalize="words"
											error={fieldErrors.name}
											testID="auth-name-input"
										/>
									)}

									<Input
										label="EMAIL"
										variant="outline"
										value={formData.email}
										onChangeText={(text) => updateField("email", text)}
										placeholder="email@example.com"
										keyboardType="email-address"
										autoCapitalize="none"
										autoComplete="email"
										error={fieldErrors.email}
										testID="auth-email-input"
									/>

									<Input
										label="PASSWORD"
										variant="outline"
										value={formData.password}
										onChangeText={(text) => updateField("password", text)}
										placeholder="Enter password"
										secureTextEntry
										autoComplete={mode === "signup" ? "new-password" : "current-password"}
										error={fieldErrors.password}
										testID="auth-password-input"
									/>

									{mode === "signup" && (
										<Input
											label="CONFIRM PASSWORD"
											variant="outline"
											value={formData.confirmPassword}
											onChangeText={(text) => updateField("confirmPassword", text)}
											placeholder="Confirm password"
											secureTextEntry
											autoComplete="new-password"
											error={fieldErrors.confirmPassword}
											testID="auth-confirm-password-input"
										/>
									)}
								</View>
							)}

							{error ? (
								<View style={{ marginTop: spacing["md"], alignItems: "center" }}>
									<StatusPill tone="danger" testID="auth-error-message">
										{error}
									</StatusPill>
								</View>
							) : null}

							<View style={{ marginTop: spacing["lg"] }}>
								<Button
									variant="primary"
									onPress={handleSubmit}
									disabled={isLoading}
									testID="auth-submit-button"
									style={{ width: isMobile ? "100%" : (buttonMinWidth as number) * 2 }}
								>
									{isLoading
										? "LOADING..."
										: usesShopifyAccount
											? mode === "signin"
												? "CONTINUE SECURELY"
												: "CREATE SECURELY"
											: mode === "signin"
												? "SIGN IN"
												: "CREATE ACCOUNT"}
								</Button>
							</View>
						</Card>
					</ResponsiveContainer>
				</ScrollView>
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	container: {
		flex: 1,
		justifyContent: "flex-start",
		paddingTop: 20,
		paddingBottom: 32,
	},
	logoContainer: {
		width: 52,
		height: 52,
		borderRadius: 26,
		justifyContent: "center",
		alignItems: "center",
	},
	heroCard: {
		minHeight: 260,
		borderRadius: 34,
		overflow: "hidden",
		justifyContent: "flex-end",
	},
	heroImage: {
		...StyleSheet.absoluteFill,
	},
	heroContent: {
		gap: 10,
		padding: 22,
		paddingTop: 68,
	},
	heroTitle: {
		fontSize: 36,
		lineHeight: 42,
	},
	heroCopy: {
		maxWidth: 430,
	},
	modeToggle: {
		flexDirection: "row",
		borderRadius: 999,
		padding: 5,
		gap: 4,
	},
	modeButton: {
		flex: 1,
		alignItems: "center",
		borderRadius: 999,
		paddingVertical: 13,
	},
	formCard: {
		width: "100%",
	},
	oauthPanel: {
		alignItems: "center",
		gap: 12,
		paddingVertical: 10,
	},
	oauthIcon: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	oauthTitle: {
		textAlign: "center",
	},
	oauthCopy: {
		maxWidth: 430,
		textAlign: "center",
	},
});
