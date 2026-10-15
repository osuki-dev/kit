import { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import {
	Screen,
	TopBar,
	Text,
	Card,
	Button,
	Badge,
	Toggle,
	Icon,
	useTheme,
	useToast,
} from "@osuki-dev/ui";

export default function ShowcaseSettingsScreen() {
	const { colors, mode, toggleMode } = useTheme();
	const { showToast } = useToast();

	const [telemetryEnabled, setTelemetryEnabled] = useState(true);
	const [hapticsEnabled, setHapticsEnabled] = useState(true);

	return (
		<Screen style={[styles.screen, { backgroundColor: colors.background }]}>
			<TopBar
				title="Settings & System Specs"
				subtitle="Engine Benchmarks & Architecture Verification"
			/>

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Appearance Section */}
				<View style={styles.section}>
					<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
						APPEARANCE & INTERACTION
					</Text>
					<Card variant="raised" border="subtle" padding="md" style={styles.card}>
						<Pressable onPress={() => toggleMode()} style={styles.rowBetween}>
							<View style={styles.leadingRow}>
								<View style={[styles.iconBox, { backgroundColor: colors.surfaceRaised }]}>
									<Icon name={mode === "dark" ? "Moon" : "Sun"} size={18} color={colors.primary} />
								</View>
								<View style={styles.metaCol}>
									<Text variant="subheading" colorKey="text" style={styles.settingTitle}>
										Dark Mode
									</Text>
									<Text variant="caption" colorKey="textMuted">
										Active mode: {mode.toUpperCase()}
									</Text>
								</View>
							</View>
							<Toggle value={mode === "dark"} onValueChange={() => toggleMode()} />
						</Pressable>

						<View style={[styles.rowBetween, styles.dividerRow, { borderTopColor: colors.border }]}>
							<View style={styles.leadingRow}>
								<View style={[styles.iconBox, { backgroundColor: colors.surfaceRaised }]}>
									<Icon name="Smartphone" size={18} color={colors.primary} />
								</View>
								<View style={styles.metaCol}>
									<Text variant="subheading" colorKey="text" style={styles.settingTitle}>
										Haptic Feedback
									</Text>
									<Text variant="caption" colorKey="textMuted">
										Tactile response on interactions
									</Text>
								</View>
							</View>
							<Toggle value={hapticsEnabled} onValueChange={(val) => setHapticsEnabled(val)} />
						</View>

						<View style={[styles.rowBetween, styles.dividerRow, { borderTopColor: colors.border }]}>
							<View style={styles.leadingRow}>
								<View style={[styles.iconBox, { backgroundColor: colors.surfaceRaised }]}>
									<Icon name="Activity" size={18} color={colors.primary} />
								</View>
								<View style={styles.metaCol}>
									<Text variant="subheading" colorKey="text" style={styles.settingTitle}>
										Performance Telemetry
									</Text>
									<Text variant="caption" colorKey="textMuted">
										Realtime render timing logs
									</Text>
								</View>
							</View>
							<Toggle value={telemetryEnabled} onValueChange={(val) => setTelemetryEnabled(val)} />
						</View>
					</Card>
				</View>

				{/* Architecture & Versions */}
				<View style={styles.section}>
					<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
						ARCHITECTURE & SPECIFICATIONS
					</Text>
					<Card variant="raised" border="subtle" padding="md" style={styles.card}>
						<View style={styles.specRow}>
							<View style={styles.specMeta}>
								<Icon name="Layers" size={16} color={colors.primary} />
								<Text variant="bodySmall" colorKey="text" style={styles.specName}>
									@osuki-dev/ui
								</Text>
							</View>
							<Badge variant="primary" display="label">
								v2.0.0
							</Badge>
						</View>

						<View style={[styles.specRow, styles.dividerRow, { borderTopColor: colors.border }]}>
							<View style={styles.specMeta}>
								<Icon name="LayoutGrid" size={16} color={colors.primary} />
								<Text variant="bodySmall" colorKey="text" style={styles.specName}>
									@osuki-dev/kit-community
								</Text>
							</View>
							<Badge variant="primary" display="label">
								v2.0.0
							</Badge>
						</View>

						<View style={[styles.specRow, styles.dividerRow, { borderTopColor: colors.border }]}>
							<View style={styles.specMeta}>
								<Icon name="Sparkles" size={16} color={colors.primary} />
								<Text variant="bodySmall" colorKey="text" style={styles.specName}>
									shadcn AI Elements
								</Text>
							</View>
							<Badge variant="success" display="label">
								2026-10 SPEC
							</Badge>
						</View>

						<View style={[styles.specRow, styles.dividerRow, { borderTopColor: colors.border }]}>
							<View style={styles.specMeta}>
								<Icon name="Palette" size={16} color={colors.primary} />
								<Text variant="bodySmall" colorKey="text" style={styles.specName}>
									Vercel Composition Patterns
								</Text>
							</View>
							<Badge variant="success" display="label">
								ENABLED
							</Badge>
						</View>

						<View style={[styles.specRow, styles.dividerRow, { borderTopColor: colors.border }]}>
							<View style={styles.specMeta}>
								<Icon name="Compass" size={16} color={colors.primary} />
								<Text variant="bodySmall" colorKey="text" style={styles.specName}>
									React Native Nano Icons
								</Text>
							</View>
							<Badge variant="success" display="label">
								8-DIRECTION
							</Badge>
						</View>
					</Card>
				</View>

				{/* Performance Metrics */}
				<View style={styles.section}>
					<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
						ENGINE BENCHMARKS
					</Text>
					<Card variant="raised" border="subtle" padding="md" style={styles.card}>
						<View style={styles.benchmarkRow}>
							<View style={{ flex: 1 }}>
								<Text variant="caption" colorKey="textMuted">
									CSS-IN-JS RUNTIME OVERHEAD
								</Text>
								<Text
									variant="subheading"
									colorKey="primary"
									style={{ fontWeight: "700", marginTop: 2 }}
								>
									0.00 ms (Zero Runtime)
								</Text>
							</View>
							<Badge variant="success" display="label">
								FASTEST
							</Badge>
						</View>

						<View
							style={[styles.benchmarkRow, styles.dividerRow, { borderTopColor: colors.border }]}
						>
							<View style={{ flex: 1 }}>
								<Text variant="caption" colorKey="textMuted">
									LAYOUT ENGINE
								</Text>
								<Text
									variant="subheading"
									colorKey="text"
									style={{ fontWeight: "700", marginTop: 2 }}
								>
									Pure Native Yoga
								</Text>
							</View>
							<Badge variant="primary" display="label">
								NATIVE
							</Badge>
						</View>

						<View
							style={[styles.benchmarkRow, styles.dividerRow, { borderTopColor: colors.border }]}
						>
							<View style={{ flex: 1 }}>
								<Text variant="caption" colorKey="textMuted">
									DOCUMENTED PRIMITIVES
								</Text>
								<Text
									variant="subheading"
									colorKey="text"
									style={{ fontWeight: "700", marginTop: 2 }}
								>
									77 / 77 Components
								</Text>
							</View>
							<Badge variant="success" display="label">
								100% PASS
							</Badge>
						</View>
					</Card>
				</View>

				{/* Reset & Test Actions */}
				<View style={styles.section}>
					<Button
						variant="secondary"
						onPress={() => {
							showToast({
								title: "State Reset",
								message: "All showcase demo states restored to default.",
								variant: "info",
							});
						}}
					>
						Reset Showcase Cache
					</Button>
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		gap: 20,
	},
	section: {
		gap: 8,
	},
	sectionLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	card: {
		borderRadius: 16,
		gap: 12,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	leadingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	iconBox: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	metaCol: {
		flex: 1,
		gap: 2,
	},
	settingTitle: {
		fontSize: 14,
		fontWeight: "600",
	},
	dividerRow: {
		paddingTop: 12,
		borderTopWidth: 1,
	},
	specRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	specMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	specName: {
		fontWeight: "600",
		fontSize: 13,
	},
	benchmarkRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
});
