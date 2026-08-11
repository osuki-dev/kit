import { useCallback, useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	type NativeSyntheticEvent,
	type NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Card,
	Text,
	Button,
	Icon,
	Image,
	SegmentedProgressBar,
	Toggle,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";
import { Container } from "@/components/container";
import { StackScrollChrome } from "@/components/stack-scroll-chrome";

const securityPreferencesImage = require("../assets/commerce/osuki-security-preferences.jpg");

// Security item component
function SecurityItem({
	icon,
	title,
	description,
	status,
}: {
	icon: string;
	title: string;
	description: string;
	status: "secure" | "warning" | "danger";
}) {
	const { colors } = useTheme();

	const statusConfig = {
		secure: { color: colors.success, icon: "CheckCircle", label: "SECURE" },
		warning: { color: colors.warning, icon: "AlertCircle", label: "WARNING" },
		danger: { color: colors.primary, icon: "XCircle", label: "ATTENTION" },
	};

	const config = statusConfig[status];

	return (
		<Card variant="raised" border="subtle" padding="md" style={styles.securityCard}>
			<View style={styles.securityRow}>
				<View style={[styles.iconContainer, { backgroundColor: config.color + "15" }]}>
					<Icon name={icon as any} size={24} color={config.color} />
				</View>
				<View style={styles.securityContent}>
					<Text variant="label" color={colors.text}>
						{title}
					</Text>
					<Text variant="caption" color={colors.textMuted}>
						{description}
					</Text>
				</View>
				<View style={styles.securityStatus}>
					<Icon name={config.icon as any} size={20} color={config.color} />
					<Text variant="caption" color={config.color} style={{ fontSize: 10 }}>
						{config.label}
					</Text>
				</View>
			</View>
		</Card>
	);
}

// Session item component
function SessionItem({
	id,
	device,
	location,
	lastActive,
	current = false,
	onRevoke,
}: {
	id: string;
	device: string;
	location: string;
	lastActive: string;
	current?: boolean;
	onRevoke?: (sessionId: string) => void;
}) {
	const { colors } = useTheme();

	return (
		<View style={styles.sessionItem}>
			<View style={styles.sessionLeft}>
				<Icon
					name={device.includes("iPhone") ? "Smartphone" : "Monitor"}
					size={20}
					color={colors.textMuted}
				/>
				<View style={styles.sessionInfo}>
					<Text variant="body" color={colors.text}>
						{device}{" "}
						{current && (
							<Text variant="caption" color={colors.success}>
								(Current)
							</Text>
						)}
					</Text>
					<Text variant="caption" color={colors.textDisabled}>
						{location} • {lastActive}
					</Text>
				</View>
			</View>
			{!current && (
				<Button
					variant="ghost"
					onPress={() => onRevoke?.(id)}
					testID={`security-session-revoke-${id}`}
				>
					REVOKE
				</Button>
			)}
		</View>
	);
}

export default function SecurityPage() {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const insets = useSafeAreaInsets();

	const [twoFactor, setTwoFactor] = useState(true);
	const [biometric, setBiometric] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [score, setScore] = useState(85);
	const [statusText, setStatusText] = useState("Security center ready");
	const [deleteRequested, setDeleteRequested] = useState(false);
	const [sessions, setSessions] = useState([
		{
			id: "iphone",
			device: "iPhone 15 Pro",
			location: "San Francisco, CA",
			lastActive: "Active now",
			current: true,
		},
		{
			id: "macbook",
			device: "MacBook Pro",
			location: "San Francisco, CA",
			lastActive: "2 hours ago",
			current: false,
		},
		{
			id: "windows",
			device: "Chrome on Windows",
			location: "New York, NY",
			lastActive: "3 days ago",
			current: false,
		},
	]);
	const otherSessionCount = sessions.filter((session) => !session.current).length;

	const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const nextScrolled = event.nativeEvent.contentOffset.y > 42;
		setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
	}, []);

	const handleRevokeSession = (sessionId: string) => {
		const session = sessions.find((item) => item.id === sessionId);
		setSessions((current) => current.filter((item) => item.id !== sessionId));
		setStatusText(`${session?.device ?? "Session"} revoked`);
	};

	const handleRevokeAll = () => {
		setSessions((current) => current.filter((item) => item.current));
		setStatusText("All other sessions revoked");
	};

	return (
		<Container>
			<Screen>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					onScroll={handleScroll}
					scrollEventThrottle={16}
					contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 68 }}
				>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 600, lg: 680 }}
						horizontalPadding={pagePadding}
						alignment="center"
					>
						{/* Header */}
						<View style={[styles.header, { marginTop: spacing["md"] }]}>
							<Text variant="heading" colorKey="text">
								SECURITY
							</Text>
							<Text variant="body" colorKey="textMuted">
								Manage your account security
							</Text>
						</View>

						<Card variant="raised" padding="none" style={styles.visualCard}>
							<Image
								source={securityPreferencesImage}
								style={styles.visualImage}
								contentFit="cover"
								cachePolicy="memory-disk"
								transition={180}
							/>
							<View style={styles.visualCopy}>
								<Text variant="label" colorKey="textMuted">
									ACCOUNT PROTECTION
								</Text>
								<Text variant="body" colorKey="text">
									Review sign-in methods, trusted sessions, and recovery controls in one place.
								</Text>
							</View>
						</Card>

						{/* Security Score */}
						<View style={[styles.section, { marginTop: spacing["lg"] }]}>
							<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
								SECURITY SCORE
							</Text>

							<Card variant="raised" border="subtle" padding="lg">
								<View style={styles.scoreRow}>
									<Text variant="hero" colorKey="text">
										{score}%
									</Text>
									<Text variant="caption" colorKey="textMuted">
										Good protection level
									</Text>
								</View>
								<View style={{ marginTop: spacing["md"] }}>
									<SegmentedProgressBar
										value={score}
										max={100}
										status="success"
										size="compact"
										segments={20}
										valueDisplay="hidden"
									/>
								</View>
								<View
									style={[styles.scoreActions, { marginTop: spacing["md"], gap: spacing["sm"] }]}
								>
									<Button
										variant="primary"
										onPress={() => {
											setScore(92);
											setStatusText("Security score improved to 92%");
										}}
										testID="security-improve-score"
									>
										IMPROVE SCORE
									</Button>
									<Button
										variant="ghost"
										onPress={() =>
											setStatusText("Password, sessions, and recovery checks reviewed")
										}
										testID="security-view-details"
									>
										VIEW DETAILS
									</Button>
								</View>
							</Card>
						</View>

						<Card
							variant="raised"
							border="subtle"
							padding="md"
							style={[styles.statusCard, { marginTop: spacing["md"] }]}
							testID="security-status"
						>
							<Text variant="bodySmall" colorKey={deleteRequested ? "danger" : "success"}>
								{statusText}
							</Text>
						</Card>

						{/* Security Status */}
						<View style={[styles.section, { marginTop: spacing["lg"] }]}>
							<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
								SECURITY CHECKS
							</Text>

							<View style={{ gap: spacing["sm"] }}>
								<SecurityItem
									icon="Key"
									title="Password"
									description="Last changed 2 days ago"
									status="secure"
								/>
								<SecurityItem
									icon="Smartphone"
									title="Two-Factor Auth"
									description={
										twoFactor ? "Enabled via authenticator app" : "Disabled for this session"
									}
									status={twoFactor ? "secure" : "warning"}
								/>
								<SecurityItem
									icon="Mail"
									title="Recovery Email"
									description="Not verified"
									status="warning"
								/>
								<SecurityItem
									icon="Shield"
									title="Active Sessions"
									description={`${sessions.length} active ${sessions.length === 1 ? "device" : "devices"}`}
									status={otherSessionCount > 0 ? "warning" : "secure"}
								/>
							</View>
						</View>

						{/* Authentication Methods */}
						<View style={[styles.section, { marginTop: spacing["lg"] }]}>
							<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
								AUTHENTICATION
							</Text>

							<Card variant="raised" border="subtle" padding="lg">
								<View style={styles.toggleRow}>
									<View style={styles.toggleLeft}>
										<Icon name="ShieldCheck" size={20} color={colors.textMuted} />
										<View style={styles.toggleContent}>
											<Text variant="body">Two-Factor Authentication</Text>
											<Text variant="caption" color={colors.textDisabled}>
												{twoFactor
													? "Two-factor authentication enabled"
													: "Two-factor authentication disabled"}
											</Text>
										</View>
									</View>
									<Toggle
										value={twoFactor}
										onValueChange={(value) => {
											setTwoFactor(value);
											setStatusText(
												value
													? "Two-factor authentication enabled"
													: "Two-factor authentication disabled",
											);
										}}
										testID="security-two-factor-toggle"
										accessibilityLabel="Two-factor authentication"
									/>
								</View>

								<View style={[styles.toggleDivider, { borderColor: colors.border }]} />

								<View style={styles.toggleRow}>
									<View style={styles.toggleLeft}>
										<Icon name="Fingerprint" size={20} color={colors.textMuted} />
										<View style={styles.toggleContent}>
											<Text variant="body">Biometric Login</Text>
											<Text variant="caption" color={colors.textDisabled}>
												{biometric ? "Biometric login enabled" : "Biometric login disabled"}
											</Text>
										</View>
									</View>
									<Toggle
										value={biometric}
										onValueChange={(value) => {
											setBiometric(value);
											setStatusText(value ? "Biometric login enabled" : "Biometric login disabled");
										}}
										testID="security-biometric-toggle"
										accessibilityLabel="Biometric login"
									/>
								</View>
							</Card>
						</View>

						{/* Active Sessions */}
						<View style={[styles.section, { marginTop: spacing["lg"] }]}>
							<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
								ACTIVE SESSIONS
							</Text>

							<Card variant="raised" border="subtle" padding="lg">
								<View style={{ gap: spacing["md"] }}>
									<Text variant="caption" color={colors.textMuted}>
										{sessions.length} active {sessions.length === 1 ? "device" : "devices"}
									</Text>
									{sessions.map((session) => (
										<SessionItem
											key={session.id}
											id={session.id}
											device={session.device}
											location={session.location}
											lastActive={session.lastActive}
											current={session.current}
											onRevoke={handleRevokeSession}
										/>
									))}
								</View>

								{sessions.some((session) => !session.current) ? (
									<View
										style={[
											styles.sessionActions,
											{ marginTop: spacing["lg"], gap: spacing["sm"] },
										]}
									>
										<Button
											variant="secondary"
											onPress={handleRevokeAll}
											testID="security-revoke-all"
										>
											REVOKE ALL
										</Button>
										<Button
											variant="ghost"
											onPress={() => setStatusText(`${sessions.length} active sessions reviewed`)}
											testID="security-view-all-sessions"
										>
											VIEW ALL
										</Button>
									</View>
								) : null}
							</Card>
						</View>

						{/* Danger Zone */}
						<View
							style={[styles.section, { marginTop: spacing["lg"], marginBottom: spacing["4xl"] }]}
						>
							<Text variant="label" color={colors.primary} style={styles.sectionLabel}>
								DANGER ZONE
							</Text>

							<Card
								variant="raised"
								border="subtle"
								padding="lg"
								style={{ borderColor: colors.primary + "30" }}
							>
								<View style={{ gap: spacing["md"] }}>
									<View style={styles.dangerRow}>
										<View style={styles.dangerContent}>
											<Text variant="body" color={colors.primary}>
												Delete Account
											</Text>
											<Text variant="caption" color={colors.textDisabled}>
												{deleteRequested
													? "Account deletion requires final confirmation"
													: "This action cannot be undone"}
											</Text>
										</View>
										<Button
											variant="destructive"
											onPress={() => {
												setDeleteRequested(true);
												setStatusText("Account deletion requires final confirmation");
											}}
											testID="security-delete-account"
										>
											DELETE
										</Button>
									</View>
								</View>
							</Card>
						</View>
					</ResponsiveContainer>
				</ScrollView>
				<StackScrollChrome title="SECURITY" scrolled={scrolled} />
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	header: {
		alignItems: "center",
		marginBottom: 8,
	},
	section: {
		width: "100%",
	},
	sectionLabel: {
		marginBottom: 8,
	},
	visualCard: {
		width: "100%",
		overflow: "hidden",
		marginTop: 8,
	},
	visualImage: {
		width: "100%",
		height: 180,
	},
	visualCopy: {
		gap: 6,
		padding: 18,
	},
	scoreRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	scoreActions: {
		flexDirection: "row",
	},
	securityCard: {
		width: "100%",
	},
	statusCard: {
		width: "100%",
	},
	securityRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	securityContent: {
		flex: 1,
	},
	securityStatus: {
		alignItems: "center",
		gap: 2,
	},
	toggleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	toggleLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	toggleContent: {
		flex: 1,
	},
	toggleDivider: {
		height: 1,
		marginVertical: 16,
	},
	sessionItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	sessionLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	sessionInfo: {
		flex: 1,
	},
	sessionActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	dangerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	dangerContent: {
		flex: 1,
	},
});
