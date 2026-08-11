import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import {
	Screen,
	Text,
	Button,
	Card,
	Icon,
	Image,
	Tag,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	Sheet,
} from "@osuki-dev/ui";
import { SettingsSection, useI18n, type SettingsSectionConfig } from "@osuki-dev/kit-community";

import { Container } from "@/components/container";
import { useTabChromeScreen } from "@/components/tab-chrome-context";
import { useAccount, useAccountOrders, useSettings } from "@/lib/data";
import { defaultLocale, getLocaleLabel, localeOptions } from "@/lib/locale-options";
import { defaultThemePresetId, getThemePresetLabel, themePresets } from "@/lib/theme-presets";

type SelectOption = {
	label: string;
	value: string;
	description?: string;
};

type SelectSheet = {
	key: string;
	title: string;
	defaultValue: string;
	options: SelectOption[];
};

const accountHeroImage = require("../../assets/commerce/osuki-account-hero.jpg");
const defaultAvatarImage = require("../../assets/commerce/osuki-default-avatar.jpg");

const toSelectOptions = (options: string[]): SelectOption[] =>
	options.map((option) => ({ label: option, value: option }));

const selectOptions: Record<string, Omit<SelectSheet, "key">> = {
	themePreset: {
		title: "Theme",
		defaultValue: defaultThemePresetId,
		options: themePresets.map((preset) => ({
			label: preset.label,
			value: preset.id,
			description: preset.description,
		})),
	},
	language: {
		title: "Language",
		defaultValue: defaultLocale,
		options: localeOptions.map((option) => ({
			label: option.label,
			value: option.value,
			description: option.description,
		})),
	},
	region: {
		title: "Region",
		defaultValue: "United States",
		options: toSelectOptions(["United States", "Mainland China", "Japan", "Singapore"]),
	},
	dataMode: {
		title: "Shopping Mode",
		defaultValue: "Standard",
		options: toSelectOptions(["Standard", "Express", "Travel"]),
	},
};

function getSelectTitle(key: keyof typeof selectOptions, t: ReturnType<typeof useI18n>["t"]) {
	switch (key) {
		case "themePreset":
			return t("settings.theme");
		case "language":
			return t("settings.language");
		case "region":
			return t("settings.region");
		case "dataMode":
			return t("settings.shoppingMode");
		default:
			return selectOptions[key].title;
	}
}

export default function SettingsPage() {
	const { spacing, toggleMode, mode, resolvedMode, colors, shadow } = useTheme();
	const { t } = useI18n();
	const { pagePadding } = useResponsiveTheme();
	const { settings, setSetting } = useSettings();
	const { signedIn, profile, addresses, signOut } = useAccount();
	const { orders } = useAccountOrders();
	const [sheet, setSheet] = useState<SelectSheet | null>(null);
	const handleChromeScroll = useTabChromeScreen(t("account.title"));
	const openAccountProfile = useCallback(() => {
		router.push(signedIn ? "/account-profile" : "/auth-screen");
	}, [signedIn]);
	const openAccountOrders = useCallback(() => {
		router.push(signedIn ? "/account-orders" : "/auth-screen");
	}, [signedIn]);
	const openAccountAddresses = useCallback(() => {
		router.push(signedIn ? "/account-addresses" : "/auth-screen");
	}, [signedIn]);

	const openSelect = useCallback(
		(key: keyof typeof selectOptions) => {
			setSheet({ key, ...selectOptions[key], title: getSelectTitle(key, t) });
		},
		[t],
	);

	const selectValue = async (key: string, value: string) => {
		await setSetting(key, value);
		setSheet(null);
	};

	const sections = useMemo<SettingsSectionConfig[]>(
		() => [
			{
				id: "appearance",
				title: t("settings.appearance"),
				items: [
					{
						id: "theme",
						type: "select",
						label: t("settings.theme"),
						description: t("settings.themeDescription"),
						icon: "Palette",
						value: getThemePresetLabel(settings.themePreset),
						onPress: () => openSelect("themePreset"),
					},
					{
						id: "language",
						type: "select",
						label: t("settings.language"),
						description: t("settings.languageDescription"),
						icon: "Languages",
						value: getLocaleLabel(settings.language),
						onPress: () => openSelect("language"),
					},
					{
						id: "dark-mode",
						type: "toggle",
						label: t("settings.darkMode"),
						description: t("settings.darkModeDescription"),
						icon: "Moon",
						value: resolvedMode === "dark",
						onToggle: () => toggleMode(),
					},
				],
			},
			{
				id: "notifications",
				title: t("settings.notifications"),
				items: [
					{
						id: "push",
						type: "toggle",
						label: t("settings.pushNotifications"),
						description: t("settings.pushNotificationsDescription"),
						icon: "Bell",
						value: settings.pushNotifications !== "false",
						onToggle: (value) => setSetting("pushNotifications", value),
					},
					{
						id: "haptics",
						type: "toggle",
						label: t("settings.hapticFeedback"),
						icon: "Smartphone",
						value: settings.haptics !== "false",
						onToggle: (value) => setSetting("haptics", value),
					},
				],
			},
			{
				id: "shopping",
				title: t("settings.shopping"),
				items: [
					{
						id: "data-mode",
						type: "select",
						label: t("settings.shoppingMode"),
						description: t("settings.shoppingModeDescription"),
						icon: "ShoppingBag",
						value: settings.dataMode ?? "Standard",
						onPress: () => openSelect("dataMode"),
					},
					{
						id: "region",
						type: "select",
						label: t("settings.region"),
						icon: "MapPin",
						value: settings.region ?? "United States",
						onPress: () => openSelect("region"),
					},
				],
			},
			{
				id: "privacy",
				title: t("settings.privacy"),
				items: [
					{
						id: "analytics",
						type: "toggle",
						label: t("settings.analytics"),
						icon: "BarChart",
						value: settings.analytics === "true",
						onToggle: (value) => setSetting("analytics", value),
					},
					{
						id: "security",
						type: "link",
						label: t("settings.security"),
						icon: "Shield",
						value: t("settings.enabled"),
						onPress: () => router.push("/security-screen"),
					},
				],
			},
			{
				id: "about",
				title: t("settings.about"),
				items: [
					{
						id: "version",
						type: "value",
						label: t("settings.version"),
						icon: "Info",
						value: "v0.0.1",
					},
					{
						id: "signout",
						type: "danger",
						label: signedIn ? t("settings.logout") : t("auth.signInToContinue"),
						icon: "LogOut",
						onPress: signedIn ? signOut : () => router.push("/auth-screen"),
					},
				],
			},
		],
		[mode, openSelect, resolvedMode, settings, setSetting, signOut, signedIn, t, toggleMode],
	);

	return (
		<Container topInset>
			<Screen>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentInsetAdjustmentBehavior="automatic"
					onScroll={handleChromeScroll}
					scrollEventThrottle={16}
					contentContainerStyle={{ flexGrow: 1, paddingTop: 6, paddingBottom: 132 }}
				>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 600, lg: 680 }}
						horizontalPadding={pagePadding}
						alignment="center"
					>
						<Pressable
							onPress={openAccountProfile}
							accessibilityRole="button"
							testID="account-hero-profile-entry"
							style={({ pressed }) => [
								styles.accountHero,
								{
									marginBottom: spacing.xl,
									opacity: pressed ? 0.92 : 1,
									...(mode === "light" ? shadow.soft : {}),
								},
							]}
						>
							<Image
								source={accountHeroImage}
								style={StyleSheet.absoluteFill}
								contentFit="cover"
								cachePolicy="memory-disk"
								transition={180}
							/>
							<LinearGradient
								colors={[
									`${colors.background}12`,
									mode === "dark" ? `${colors.background}CC` : `${colors.background}F2`,
								]}
								locations={[0.22, 1]}
								style={StyleSheet.absoluteFill}
							/>
							<View style={styles.heroTopRow}>
								<Tag variant={signedIn ? "active" : "default"}>
									{signedIn ? t("account.signedInBadge") : t("account.guestBadge")}
								</Tag>
								<View style={[styles.heroAvatar, { backgroundColor: colors.primarySubtle }]}>
									<Image
										source={defaultAvatarImage}
										style={styles.avatarImage}
										contentFit="cover"
										cachePolicy="memory-disk"
									/>
								</View>
							</View>
							<View style={styles.heroCopy}>
								<Text
									variant="display"
									colorKey="text"
									overflowMode="marquee"
									marqueePlayback="manual"
								>
									{profile?.name ?? t("account.title")}
								</Text>
								<Text variant="bodySmall" colorKey="textMuted" numberOfLines={2}>
									{signedIn ? profile?.email : t("account.guestDescription")}
								</Text>
							</View>
							{signedIn ? null : (
								<Button
									variant="primary"
									onPress={() => router.push("/auth-screen")}
									testID="account-sign-in-button"
									style={styles.heroButton}
								>
									{t("auth.login")}
								</Button>
							)}
						</Pressable>

						{signedIn ? (
							<Card
								variant="raised"
								padding="lg"
								style={[styles.shoppingCard, { marginBottom: spacing["xl"] }]}
								testID="account-shopping-card"
							>
								<View style={styles.sectionLabelRow}>
									<Text variant="label" colorKey="textMuted">
										{t("account.shopping")}
									</Text>
								</View>

								<TouchableOpacity
									style={[styles.ordersEntry, { backgroundColor: colors.surfaceRaised }]}
									onPress={openAccountOrders}
									accessibilityRole="button"
									hitSlop={8}
									activeOpacity={0.72}
									testID="account-orders-primary-entry"
								>
									<View style={[styles.ordersIcon, { backgroundColor: colors.primarySubtle }]}>
										<Icon name="PackageCheck" size={22} color={colors.primary} />
									</View>
									<View style={styles.ordersCopy}>
										<Text variant="body" colorKey="text">
											{t("account.orders")}
										</Text>
										<Text variant="caption" colorKey="textMuted" numberOfLines={2}>
											{t("account.ordersDescription")}
										</Text>
									</View>
									{orders.length ? <Tag variant="active">{String(orders.length)}</Tag> : null}
									<Icon name="ChevronRight" size={18} color={colors.textMuted} />
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.ordersEntry, { backgroundColor: colors.surfaceRaised }]}
									onPress={openAccountAddresses}
									accessibilityRole="button"
									hitSlop={8}
									activeOpacity={0.72}
									testID="account-addresses-entry"
								>
									<View style={[styles.ordersIcon, { backgroundColor: colors.primarySubtle }]}>
										<Icon name="MapPin" size={22} color={colors.primary} />
									</View>
									<View style={styles.ordersCopy}>
										<Text variant="body" colorKey="text">
											{t("account.addresses")}
										</Text>
										<Text variant="caption" colorKey="textMuted" numberOfLines={2}>
											{addresses[0]
												? `${addresses[0].street}, ${addresses[0].city} ${addresses[0].zip}`
												: t("account.addressesDescription")}
										</Text>
									</View>
									<Icon name="ChevronRight" size={18} color={colors.textMuted} />
								</TouchableOpacity>
							</Card>
						) : null}

						{sections.map((section, index) => (
							<SettingsSection key={section.id} config={section} index={index} />
						))}

						<View
							style={[styles.footer, { marginTop: spacing["3xl"], marginBottom: spacing["4xl"] }]}
						>
							<Text variant="caption" colorKey="textDisabled" style={styles.center}>
								{t("account.brandName")}
							</Text>
						</View>
					</ResponsiveContainer>
				</ScrollView>
			</Screen>

			<Sheet.Root open={!!sheet} onOpenChange={(open) => !open && setSheet(null)}>
				<Sheet.Content maxHeight="72%">
					<Sheet.Handle />
					<Sheet.Header>
						<Sheet.HeaderText>
							<Sheet.Title>{sheet?.title}</Sheet.Title>
						</Sheet.HeaderText>
						<Sheet.Close label={t("common.close")} testID="settings-select-close" />
					</Sheet.Header>
					<Sheet.Body>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View style={{ gap: spacing.md }}>
								{sheet?.options.map((option) => {
									const selected = (settings[sheet.key] ?? sheet.defaultValue) === option.value;
									const optionTestID = option.value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
									return (
										<Pressable
											key={option.value}
											onPress={() => selectValue(sheet.key, option.value)}
											style={[
												styles.option,
												{
													backgroundColor: selected ? colors.primarySubtle : colors.surfaceRaised,
													...(mode === "light" && !selected ? shadow.pill : {}),
												},
											]}
											testID={`settings-select-${sheet.key}-${optionTestID}`}
											accessibilityRole="button"
											accessibilityState={{ selected }}
										>
											<View style={styles.optionCopy}>
												<Text variant="body" colorKey="text">
													{option.label}
												</Text>
												{option.description ? (
													<Text variant="caption" colorKey="textMuted">
														{option.description}
													</Text>
												) : null}
											</View>
											{selected && <Icon name="Check" size={18} color={colors.primary} />}
										</Pressable>
									);
								})}
							</View>
						</ScrollView>
					</Sheet.Body>
				</Sheet.Content>
			</Sheet.Root>
		</Container>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	accountHero: {
		minHeight: 286,
		borderRadius: 30,
		overflow: "hidden",
		padding: 20,
		justifyContent: "space-between",
	},
	heroTopRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	heroAvatar: {
		width: 58,
		height: 58,
		borderRadius: 29,
		padding: 3,
		overflow: "hidden",
	},
	avatarImage: {
		width: "100%",
		height: "100%",
		borderRadius: 999,
	},
	heroCopy: {
		gap: 6,
		maxWidth: 360,
	},
	heroButton: {
		alignSelf: "flex-start",
		minWidth: 156,
	},
	shoppingCard: {
		gap: 14,
	},
	sectionLabelRow: {
		paddingTop: 2,
	},
	ordersEntry: {
		minHeight: 74,
		borderRadius: 22,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	ordersIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
	},
	ordersCopy: {
		flex: 1,
		minWidth: 0,
		gap: 3,
	},
	addressBlock: {
		gap: 6,
		borderRadius: 18,
		padding: 14,
	},
	addressHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	footer: {
		alignItems: "center",
	},
	center: {
		textAlign: "center",
	},
	option: {
		minHeight: 62,
		borderRadius: 18,
		paddingHorizontal: 18,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	optionCopy: {
		flex: 1,
		paddingRight: 16,
	},
});
