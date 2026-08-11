import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import {
	Screen,
	Button,
	Card,
	Icon,
	Input,
	ResponsiveContainer,
	Tag,
	Text,
	useResponsiveTheme,
	useTheme,
} from "@osuki-dev/ui";

import { Container } from "@/components/container";
import { StatusPill } from "@/components/status-pill";
import { useAccount } from "@/lib/data";

export default function AccountAddressesRoute() {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const { signedIn, addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } =
		useAccount();
	const [savingAddressId, setSavingAddressId] = useState<string | null>(null);
	const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [form, setForm] = useState({
		name: "",
		street: "",
		city: "",
		zip: "",
		country: "USA",
		phone: "",
	});
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

	const updateField = (field: keyof typeof form, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
		setFieldErrors((current) => ({ ...current, [field]: undefined }));
		setError(null);
		setMessage(null);
	};

	const handleSetDefault = async (addressId: string) => {
		setSavingAddressId(addressId);
		setError(null);
		setMessage(null);
		try {
			await setDefaultAddress(addressId);
			setMessage("Default checkout address updated.");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to update address.");
		} finally {
			setSavingAddressId(null);
		}
	};

	const handleAddAddress = async () => {
		setError(null);
		setMessage(null);
		const nextErrors: Partial<Record<keyof typeof form, string>> = {};
		if (!form.name.trim()) nextErrors.name = "Add a recipient name.";
		if (!form.street.trim()) nextErrors.street = "Add a street address.";
		if (!form.city.trim()) nextErrors.city = "Add a city.";
		if (!form.zip.trim()) nextErrors.zip = "Add a ZIP or postal code.";
		if (!form.country.trim()) nextErrors.country = "Add a country.";

		if (Object.keys(nextErrors).length > 0) {
			setFieldErrors(nextErrors);
			setError("Check the highlighted address fields.");
			return;
		}

		setAdding(true);
		try {
			const input = {
				...form,
				phone: form.phone.trim() || undefined,
				isDefault: editingAddressId ? undefined : true,
			};
			if (editingAddressId) await updateAddress(editingAddressId, input);
			else await addAddress(input);
			setForm({ name: "", street: "", city: "", zip: "", country: "USA", phone: "" });
			setEditingAddressId(null);
			setFieldErrors({});
			setMessage(editingAddressId ? "Address updated." : "Address saved and set for checkout.");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to save address.");
		} finally {
			setAdding(false);
		}
	};

	const handleEditAddress = (addressId: string) => {
		const address = addresses.find((item) => item.id === addressId);
		if (!address) return;
		setEditingAddressId(addressId);
		setForm({
			name: address.name,
			street: address.street,
			city: address.city,
			zip: address.zip,
			country: address.country,
			phone: address.phone ?? "",
		});
		setFieldErrors({});
		setError(null);
		setMessage(null);
	};

	const handleRemoveAddress = async (addressId: string) => {
		setSavingAddressId(addressId);
		setError(null);
		setMessage(null);
		try {
			await removeAddress(addressId);
			if (editingAddressId === addressId) setEditingAddressId(null);
			setMessage("Address removed.");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to remove address.");
		} finally {
			setSavingAddressId(null);
		}
	};

	return (
		<Container>
			<Screen>
				<ScrollView
					contentInsetAdjustmentBehavior="never"
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
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
								Addresses
							</Text>
							<Text variant="body" colorKey="textMuted">
								Choose the address used by checkout and delivery updates.
							</Text>
						</View>

						{signedIn ? (
							<View style={{ gap: spacing.md }}>
								{error ? (
									<StatusPill tone="danger" testID="account-address-error">
										{error}
									</StatusPill>
								) : null}
								{message ? (
									<StatusPill tone="success" testID="account-address-message">
										{message}
									</StatusPill>
								) : null}
								<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
									<View style={styles.addressTopRow}>
										<View style={[styles.iconBubble, { backgroundColor: colors.primarySubtle }]}>
											<Icon name="Plus" size={20} color={colors.primary} />
										</View>
										<View style={styles.copy}>
											<Text variant="heading" colorKey="text">
												{editingAddressId ? "Edit delivery address" : "Add delivery address"}
											</Text>
											<Text variant="bodySmall" colorKey="textMuted">
												New addresses are saved locally and used by checkout.
											</Text>
										</View>
									</View>
									<View style={styles.formGrid}>
										<Input
											label="RECIPIENT"
											variant="outline"
											value={form.name}
											onChangeText={(value) => updateField("name", value)}
											error={fieldErrors.name}
											testID="account-address-name-input"
										/>
										<Input
											label="STREET"
											variant="outline"
											value={form.street}
											onChangeText={(value) => updateField("street", value)}
											error={fieldErrors.street}
											testID="account-address-street-input"
										/>
										<View style={styles.inlineFields}>
											<Input
												label="CITY"
												variant="outline"
												value={form.city}
												onChangeText={(value) => updateField("city", value)}
												error={fieldErrors.city}
												containerStyle={styles.inlineField}
												testID="account-address-city-input"
											/>
											<Input
												label="ZIP"
												variant="outline"
												value={form.zip}
												onChangeText={(value) => updateField("zip", value)}
												error={fieldErrors.zip}
												keyboardType="number-pad"
												containerStyle={styles.inlineField}
												testID="account-address-zip-input"
											/>
										</View>
										<Input
											label="COUNTRY"
											variant="outline"
											value={form.country}
											onChangeText={(value) => updateField("country", value)}
											error={fieldErrors.country}
											testID="account-address-country-input"
										/>
										<Input
											label="PHONE"
											variant="outline"
											value={form.phone}
											onChangeText={(value) => updateField("phone", value)}
											keyboardType="phone-pad"
											testID="account-address-phone-input"
										/>
									</View>
									<Button
										variant="primary"
										onPress={handleAddAddress}
										disabled={adding}
										testID="account-address-add-button"
									>
										{adding ? "SAVING" : editingAddressId ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
									</Button>
									{editingAddressId ? (
										<Button
											variant="ghost"
											onPress={() => setEditingAddressId(null)}
											testID="account-address-cancel-edit"
										>
											CANCEL
										</Button>
									) : null}
								</Card>
								{addresses.map((address) => (
									<View key={address.id} testID={`account-address-${address.id}`}>
										<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
											<View style={styles.addressTopRow}>
												<View
													style={[styles.iconBubble, { backgroundColor: colors.primarySubtle }]}
												>
													<Icon name="MapPin" size={20} color={colors.primary} />
												</View>
												<View style={styles.copy}>
													<View style={styles.titleRow}>
														<Text
															variant="heading"
															colorKey="text"
															overflowMode="marquee"
															marqueePlayback="manual"
														>
															{address.name}
														</Text>
														{address.isDefault ? <Tag variant="active">DEFAULT</Tag> : null}
													</View>
													<Text
														variant="body"
														colorKey="textMuted"
														overflowMode="marquee"
														marqueePlayback="manual"
													>
														{address.street}, {address.city} {address.zip}, {address.country}
													</Text>
													{address.phone ? (
														<Text variant="caption" colorKey="textMuted">
															{address.phone}
														</Text>
													) : null}
												</View>
												<Icon
													name={address.isDefault ? "CheckCircle2" : "Circle"}
													size={22}
													color={address.isDefault ? colors.primary : colors.textDisabled}
												/>
											</View>
											{savingAddressId === address.id ? (
												<Text variant="caption" colorKey="textMuted">
													Updating checkout address...
												</Text>
											) : null}
											<View style={styles.addressActions}>
												<Button
													variant="secondary"
													onPress={() => handleSetDefault(address.id)}
													disabled={address.isDefault || savingAddressId === address.id}
													testID={`account-address-default-${address.id}`}
												>
													{address.isDefault ? "DEFAULT" : "SET DEFAULT"}
												</Button>
												<Button
													variant="ghost"
													onPress={() => handleEditAddress(address.id)}
													testID={`account-address-edit-${address.id}`}
												>
													EDIT
												</Button>
												<Button
													variant="destructive"
													onPress={() => handleRemoveAddress(address.id)}
													disabled={savingAddressId === address.id}
													testID={`account-address-remove-${address.id}`}
												>
													REMOVE
												</Button>
											</View>
										</Card>
									</View>
								))}
							</View>
						) : (
							<Card variant="raised" border="subtle" padding="lg" style={{ gap: spacing.md }}>
								<Icon name="MapPin" size={32} color={colors.primary} />
								<Text variant="heading" colorKey="text">
									Sign in to manage addresses
								</Text>
								<Text variant="body" colorKey="textMuted">
									Save preferred delivery details and speed up checkout.
								</Text>
								<Button
									variant="primary"
									onPress={() => router.push("/auth-screen")}
									testID="account-addresses-sign-in-button"
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

const styles = StyleSheet.create({
	header: {
		gap: 8,
	},
	addressTopRow: {
		flexDirection: "row",
		gap: 14,
	},
	iconBubble: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: "center",
		justifyContent: "center",
	},
	copy: {
		flex: 1,
		minWidth: 0,
		gap: 6,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	formGrid: {
		gap: 12,
	},
	inlineFields: {
		flexDirection: "row",
		gap: 12,
	},
	inlineField: {
		flex: 1,
	},
	addressActions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
});
