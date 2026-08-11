import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import {
	Screen,
	Button,
	Card,
	Icon,
	Input,
	ResponsiveContainer,
	Text,
	useResponsiveTheme,
	useTheme,
} from "@osuki-dev/ui";

import { Container } from "@/components/container";
import { StatusPill } from "@/components/status-pill";
import { useAccount } from "@/lib/data";

export default function AccountProfileRoute() {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const { signedIn, profile, addresses, updateProfile } = useAccount();
	const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
	const [form, setForm] = useState({ name: "", email: "", phone: "" });
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

	useEffect(() => {
		if (!profile) return;
		setForm({
			name: profile.name,
			email: profile.email,
			phone: profile.phone ?? "",
		});
	}, [profile]);

	const updateField = (field: keyof typeof form, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
		setFieldErrors((current) => ({ ...current, [field]: undefined }));
		setError(null);
		setMessage(null);
	};

	const handleSave = async () => {
		setError(null);
		setMessage(null);
		const nextErrors: Partial<Record<keyof typeof form, string>> = {};
		if (!form.name.trim()) nextErrors.name = "Add your full name.";
		if (!form.email.trim()) {
			nextErrors.email = "Add your email address.";
		} else if (!form.email.includes("@")) {
			nextErrors.email = "Use a valid email address.";
		}
		if (form.phone.trim() && form.phone.trim().length < 7) {
			nextErrors.phone = "Use a reachable phone number.";
		}

		if (Object.keys(nextErrors).length > 0) {
			setFieldErrors(nextErrors);
			setError("Check the highlighted profile fields.");
			return;
		}

		setSaving(true);
		try {
			await updateProfile({
				name: form.name.trim(),
				email: form.email.trim().toLowerCase(),
				phone: form.phone.trim(),
			});
			setMessage("Profile updated.");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to update profile.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Container>
			<Screen>
				<ScrollView
					contentInsetAdjustmentBehavior="never"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingTop: 24, paddingBottom: 80 }}
				>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 620, lg: 720 }}
						horizontalPadding={pagePadding}
						alignment="center"
						style={{ gap: spacing.xl }}
					>
						<View style={styles.header}>
							<Text variant="display" colorKey="text">
								Profile
							</Text>
							<Text variant="body" colorKey="textMuted">
								Manage the customer details used for checkout and delivery updates.
							</Text>
						</View>

						{signedIn && profile ? (
							<>
								<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.lg }}>
									<View style={styles.profileTopRow}>
										<View style={[styles.avatar, { backgroundColor: colors.primarySubtle }]}>
											<Icon name="User" size={28} color={colors.primary} />
										</View>
										<View style={styles.copy}>
											<Text
												variant="heading"
												colorKey="text"
												overflowMode="marquee"
												marqueePlayback="manual"
											>
												{profile.name}
											</Text>
											<Text
												variant="bodySmall"
												colorKey="textMuted"
												overflowMode="marquee"
												marqueePlayback="manual"
											>
												{profile.email}
											</Text>
										</View>
									</View>

									<View style={styles.infoGrid}>
										<Input
											label="FULL NAME"
											variant="outline"
											value={form.name}
											onChangeText={(name) => updateField("name", name)}
											error={fieldErrors.name}
											selectTextOnFocus
											testID="account-profile-name-input"
										/>
										<Input
											label="EMAIL"
											variant="outline"
											value={form.email}
											onChangeText={(email) => updateField("email", email)}
											keyboardType="email-address"
											autoCapitalize="none"
											autoComplete="email"
											error={fieldErrors.email}
											selectTextOnFocus
											testID="account-profile-email-input"
										/>
										<Input
											label="PHONE"
											variant="outline"
											value={form.phone}
											onChangeText={(phone) => updateField("phone", phone)}
											keyboardType="phone-pad"
											autoComplete="tel"
											error={fieldErrors.phone}
											selectTextOnFocus
											testID="account-profile-phone-input"
										/>
										<Info
											label="Customer since"
											value={new Date(profile.createdAt).toLocaleDateString()}
										/>
										<Info label="Default address" value={defaultAddress?.city ?? "Not selected"} />
									</View>

									{error ? (
										<StatusPill tone="danger" testID="account-profile-error">
											{error}
										</StatusPill>
									) : null}
									{message ? (
										<StatusPill tone="success" testID="account-profile-message">
											{message}
										</StatusPill>
									) : null}

									<View style={styles.actionRow}>
										<Button
											variant="secondary"
											onPress={() => router.push("/account-addresses")}
											style={styles.actionButton}
											testID="account-profile-addresses-button"
										>
											ADDRESSES
										</Button>
										<Button
											variant="primary"
											onPress={handleSave}
											disabled={saving}
											style={styles.actionButton}
											testID="account-profile-save-button"
										>
											{saving ? "SAVING" : "SAVE"}
										</Button>
									</View>
								</Card>
							</>
						) : (
							<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
								<Icon name="UserRound" size={32} color={colors.primary} />
								<Text variant="heading" colorKey="text">
									Sign in to view profile
								</Text>
								<Text variant="body" colorKey="textMuted">
									Keep checkout, addresses, and order history tied to one account.
								</Text>
								<Button
									variant="primary"
									onPress={() => router.push("/auth-screen")}
									testID="account-profile-sign-in-button"
								>
									SIGN IN
								</Button>
							</Card>
						)}
					</ResponsiveContainer>
				</ScrollView>
			</Screen>
		</Container>
	);
}

function Info({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.infoItem}>
			<Text variant="label" colorKey="textMuted">
				{label}
			</Text>
			<Text variant="body" colorKey="text" overflowMode="marquee" marqueePlayback="manual">
				{value}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		gap: 8,
	},
	profileTopRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
	},
	copy: {
		flex: 1,
		minWidth: 0,
		gap: 4,
	},
	infoGrid: {
		gap: 14,
	},
	infoItem: {
		gap: 4,
	},
	actionRow: {
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		flex: 1,
	},
});
