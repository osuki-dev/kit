import { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import {
	Screen,
	TopBar,
	Text,
	Card,
	Button,
	Badge,
	Icon,
	SegmentedControl,
	Slider,
	SurfaceDecoratorProvider,
	useTheme,
	multiplyAlpha,
	type IconDirection,
} from "@osuki-dev/ui";

const THEMES = [
	{ key: "default", label: "Default", color: "#64748b", bg: undefined, isDark: false },
	{ key: "blueprint", label: "Blueprint", color: "#38bdf8", bg: "#0b2545", isDark: true },
	{ key: "cyber", label: "Cyber Violet", color: "#a855f7", bg: "#1e1b4b", isDark: true },
	{ key: "mesh", label: "Warm Mesh", color: "#ec4899", bg: "#2e1065", isDark: true },
	{ key: "forest", label: "Forest Pine", color: "#34d399", bg: "#064e3b", isDark: true },
	{ key: "sunset", label: "Sunset Coral", color: "#f97316", bg: "#450a0a", isDark: true },
] as const;

type CompassSlot = {
	dir?: IconDirection;
	label: string;
	deg?: number;
	isCenter?: boolean;
};

const COMPASS_GRID: CompassSlot[] = [
	{ dir: "up-left", label: "NW", deg: 315 },
	{ dir: "up", label: "N", deg: 0 },
	{ dir: "up-right", label: "NE", deg: 45 },
	{ dir: "left", label: "W", deg: 270 },
	{ label: "CENTER", isCenter: true },
	{ dir: "right", label: "E", deg: 90 },
	{ dir: "down-left", label: "SW", deg: 225 },
	{ dir: "down", label: "S", deg: 180 },
	{ dir: "down-right", label: "SE", deg: 135 },
];

export default function ThemingAndIconsScreen() {
	const { colors, mode, toggleMode } = useTheme();

	const [activeThemeKey, setActiveThemeKey] = useState<string>("default");
	const [surfaceOpacity, setSurfaceOpacity] = useState(1);
	const [segment, setSegment] = useState("overview");
	const [iconDirection, setIconDirection] = useState<IconDirection>("up");

	const activeTheme = useMemo(
		() => THEMES.find((t) => t.key === activeThemeKey) ?? THEMES[0],
		[activeThemeKey],
	);

	const decoratorContext = useMemo(() => {
		return {
			transformBackground: (baseColor: string) => {
				const color = activeTheme.bg ?? baseColor;
				if (surfaceOpacity >= 0.999) return color;
				return multiplyAlpha(color, surfaceOpacity);
			},
		};
	}, [activeTheme.bg, surfaceOpacity]);

	const currentDegrees = useMemo(() => {
		switch (iconDirection) {
			case "up":
				return 0;
			case "up-right":
				return 45;
			case "right":
				return 90;
			case "down-right":
				return 135;
			case "down":
				return 180;
			case "down-left":
				return 225;
			case "left":
				return 270;
			case "up-left":
				return 315;
			default:
				return 0;
		}
	}, [iconDirection]);

	const cardTextColor = activeTheme.isDark ? "#f8fafc" : colors.text;
	const cardMutedColor = activeTheme.isDark ? "#94a3b8" : colors.textMuted;

	return (
		<SurfaceDecoratorProvider {...decoratorContext}>
			<Screen style={[styles.screen, { backgroundColor: colors.background }]}>
				<TopBar
					title="Theming & Nano Icons"
					subtitle="Vercel Composition Patterns & 8-Direction Math"
					actions={[
						{
							icon: mode === "dark" ? "Sun" : "Moon",
							onPress: toggleMode,
							label: "Toggle Theme",
						},
					]}
				/>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Header Banner */}
					<Card variant="raised" border="subtle" padding="md" style={styles.bannerCard}>
						<View style={styles.bannerBadgeRow}>
							<Badge variant="primary" display="label">
								COMPOSITION PATTERNS
							</Badge>
							<Text variant="caption" style={{ color: cardMutedColor }}>
								Zero-CSS Runtime Extensibility
							</Text>
						</View>
						<Text variant="heading" style={{ marginTop: 4, color: cardTextColor }}>
							Vercel Decorator Inversion
						</Text>
						<Text
							variant="bodySmall"
							style={{ marginTop: 4, lineHeight: 19, color: cardMutedColor }}
						>
							External applications can inject surface background transforms, card fills, and icon
							resolvers without altering primitive component code or incurring CSS-in-JS overhead.
						</Text>
						<Button
							variant="secondary"
							style={{ marginTop: 12 }}
							onPress={() => router.push("/custom-theme")}
							testID="open-custom-theme"
						>
							Open the custom-theme screen
						</Button>
					</Card>

					{/* 1. Vercel Surface Decorator Playground */}
					<View style={styles.section}>
						<View style={styles.rowBetween}>
							<Text variant="label" style={[styles.sectionLabel, { color: cardMutedColor }]}>
								1. SURFACE DECORATOR THEMES
							</Text>
							<Badge variant="default" display="label">
								{activeTheme.label.toUpperCase()}
							</Badge>
						</View>

						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.themeChipsScroll}
						>
							{THEMES.map((theme) => {
								const active = activeThemeKey === theme.key;
								return (
									<Pressable
										key={theme.key}
										onPress={() => setActiveThemeKey(theme.key)}
										style={[
											styles.themeChip,
											{
												backgroundColor: active ? theme.color : colors.surface,
												borderColor: active ? theme.color : colors.border,
											},
										]}
									>
										<View style={[styles.themeIndicator, { backgroundColor: theme.color }]} />
										<Text
											variant="caption"
											style={{
												color: active ? "#ffffff" : colors.text,
												fontWeight: "600",
												marginLeft: 6,
											}}
										>
											{theme.label}
										</Text>
									</Pressable>
								);
							})}
						</ScrollView>

						<View style={styles.opacityBlock}>
							<Text variant="caption" style={{ color: cardMutedColor }}>
								SURFACE OPACITY {Math.round(surfaceOpacity * 100)}%
							</Text>
							<Slider
								value={surfaceOpacity}
								minimumValue={0.4}
								maximumValue={1}
								onValueChange={setSurfaceOpacity}
							/>
							<SegmentedControl
								variant="pill"
								value={segment}
								onChange={setSegment}
								options={[
									{ value: "overview", label: "Overview" },
									{ value: "tokens", label: "Tokens" },
									{ value: "engine", label: "Engine" },
								]}
							/>
						</View>

						{/* Compound Card with active decorator */}
						<Card.Root
							variant="raised"
							border="subtle"
							style={[styles.decoratorCard, { minHeight: 190 }]}
						>
							<Card.Background />
							<Card.Header>
								<View style={styles.rowBetween}>
									<Text variant="subheading" style={{ color: cardTextColor, fontWeight: "700" }}>
										Compound Card.Root
									</Text>
									<Badge variant={activeTheme.isDark ? "primary" : "default"} display="label">
										{activeTheme.isDark ? "TRANSFORMED" : "SYSTEM DECOR"}
									</Badge>
								</View>
								<Text variant="caption" style={{ color: cardMutedColor, marginTop: 4 }}>
									Background rendering is cleanly delegated to Card.Background with Yoga collapsable
									layout.
								</Text>
							</Card.Header>
							<Card.Content>
								<View
									style={[
										styles.infoPill,
										{
											backgroundColor: activeTheme.isDark
												? "rgba(255,255,255,0.08)"
												: colors.surfaceRaised,
										},
									]}
								>
									<Text variant="caption" style={{ color: cardTextColor }}>
										Active background:{" "}
										<Text variant="caption" style={{ color: activeTheme.color, fontWeight: "700" }}>
											{activeTheme.bg ?? "Default (Transparent)"}
										</Text>
									</Text>
								</View>
							</Card.Content>
							<Card.Footer>
								<Button.Root variant="primary">
									<Button.Background />
									<Button.Icon name="Sparkles" />
									<Button.Label>Compound Button</Button.Label>
								</Button.Root>
							</Card.Footer>
						</Card.Root>
					</View>

					{/* 2. Nano Icons & 8-Direction Rotation */}
					<View style={styles.section}>
						<View style={styles.rowBetween}>
							<Text variant="label" style={[styles.sectionLabel, { color: cardMutedColor }]}>
								2. NANO ICONS 8-DIRECTION GEOMETRY
							</Text>
							<Badge variant="primary" display="label">
								{`${iconDirection.toUpperCase()} · ${currentDegrees}°`}
							</Badge>
						</View>

						<Card variant="raised" border="subtle" padding="md" style={styles.bannerCard}>
							<Text variant="caption" style={{ color: cardMutedColor, marginBottom: 16 }}>
								Geometric angle calculations normalize any source icon to 8 discrete orientations
								with zero runtime layout thrashing.
							</Text>

							{/* Direction Compass Dial */}
							<View style={styles.compassContainer}>
								<View style={styles.compassDial}>
									{COMPASS_GRID.map((slot, idx) => {
										if (slot.isCenter) {
											return (
												<View
													key="center"
													style={[
														styles.compassCenter,
														activeTheme.isDark && {
															backgroundColor: "rgba(255,255,255,0.08)",
															borderColor: "rgba(255,255,255,0.15)",
														},
													]}
												>
													<Icon
														name="Compass"
														size={26}
														color={colors.primary}
														direction={iconDirection}
													/>
													<Text
														variant="caption"
														style={{
															fontSize: 10,
															fontWeight: "700",
															color: colors.primary,
															marginTop: 2,
														}}
													>
														{`${currentDegrees}°`}
													</Text>
												</View>
											);
										}

										const active = iconDirection === slot.dir;
										return (
											<Pressable
												key={slot.dir ?? idx}
												onPress={() => slot.dir && setIconDirection(slot.dir)}
												style={[
													styles.compassCell,
													{
														backgroundColor: active
															? colors.primary
															: activeTheme.isDark
																? "rgba(255,255,255,0.08)"
																: colors.surface,
														borderColor: active
															? colors.primary
															: activeTheme.isDark
																? "rgba(255,255,255,0.15)"
																: colors.border,
													},
												]}
											>
												<Text
													variant="caption"
													style={{
														color: active
															? colors.onPrimary
															: activeTheme.isDark
																? "#f8fafc"
																: colors.text,
														fontWeight: active ? "700" : "600",
														fontSize: 11,
													}}
												>
													{slot.label}
												</Text>
											</Pressable>
										);
									})}
								</View>
							</View>

							{/* Specimen Showcase Row */}
							<View
								style={[
									styles.specimenRow,
									{
										backgroundColor: activeTheme.isDark
											? "rgba(255,255,255,0.06)"
											: colors.surfaceRaised,
										borderColor: activeTheme.isDark ? "rgba(255,255,255,0.12)" : colors.border,
									},
								]}
							>
								<View style={styles.specimenItem}>
									<Icon name="ArrowUp" size={30} direction={iconDirection} color={colors.primary} />
									<Text variant="caption" style={[styles.specimenLabel, { color: cardTextColor }]}>
										ArrowUp
									</Text>
									<Text variant="caption" style={[styles.specimenDeg, { color: cardMutedColor }]}>
										{`${currentDegrees}°`}
									</Text>
								</View>

								<View style={styles.specimenItem}>
									<Icon
										name="Navigation"
										size={30}
										direction={iconDirection}
										color={colors.primary}
									/>
									<Text variant="caption" style={[styles.specimenLabel, { color: cardTextColor }]}>
										Navigation
									</Text>
									<Text variant="caption" style={[styles.specimenDeg, { color: cardMutedColor }]}>
										{`${currentDegrees}°`}
									</Text>
								</View>

								<View style={styles.specimenItem}>
									<Icon name="Compass" size={30} direction={iconDirection} color={colors.primary} />
									<Text variant="caption" style={[styles.specimenLabel, { color: cardTextColor }]}>
										Compass
									</Text>
									<Text variant="caption" style={[styles.specimenDeg, { color: cardMutedColor }]}>
										{`${currentDegrees}°`}
									</Text>
								</View>

								<View style={styles.specimenItem}>
									<Icon name="Send" size={30} direction={iconDirection} color={colors.primary} />
									<Text variant="caption" style={[styles.specimenLabel, { color: cardTextColor }]}>
										Send
									</Text>
									<Text variant="caption" style={[styles.specimenDeg, { color: cardMutedColor }]}>
										{`${currentDegrees}°`}
									</Text>
								</View>
							</View>
						</Card>
					</View>
				</ScrollView>
			</Screen>
		</SurfaceDecoratorProvider>
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
	bannerCard: {
		borderRadius: 16,
	},
	bannerBadgeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},
	section: {
		gap: 10,
	},
	sectionLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	themeChipsScroll: {
		gap: 8,
		paddingVertical: 2,
	},
	themeChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
	},
	themeIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	opacityBlock: {
		gap: 8,
		marginTop: 4,
	},
	decoratorCard: {
		borderRadius: 16,
		padding: 16,
		marginTop: 6,
	},
	infoPill: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		marginVertical: 4,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	compassContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 12,
	},
	compassDial: {
		width: 216,
		height: 216,
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		alignContent: "space-between",
	},
	compassCell: {
		width: 66,
		height: 66,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	compassCenter: {
		width: 66,
		height: 66,
		borderRadius: 33,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(128,128,128,0.08)",
	},
	specimenRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		paddingVertical: 16,
		borderRadius: 14,
		borderWidth: 1,
		marginTop: 8,
	},
	specimenItem: {
		alignItems: "center",
		minWidth: 64,
	},
	specimenLabel: {
		marginTop: 6,
		fontWeight: "600",
		fontSize: 12,
	},
	specimenDeg: {
		fontSize: 10,
		marginTop: 2,
	},
});
