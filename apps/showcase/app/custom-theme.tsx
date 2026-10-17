import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, type TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
	Button,
	Card,
	EmptyState,
	Input,
	PressableScale,
	ScrollScreen,
	Section,
	SegmentedControl,
	Skeleton,
	Slider,
	SurfaceDecoratorProvider,
	Tabs,
	Text,
	TextPlateProvider,
	ThemeProvider,
	multiplyAlpha,
	useThemeMode,
	type SurfaceMeta,
	type ThemeOverride,
} from "@osuki-dev/ui";

/**
 * The custom-theme case in one screen: a fixed backdrop behind the shell, an
 * opacity policy applied to every surface, artwork on cards, plates for text
 * that stands on the backdrop, and an appearance profile that changes radii
 * and press feedback. Everything goes through the theme API; no component
 * here is wrapped.
 */

type Profile = "rounded" | "square";

const PROFILES: Record<Profile, ThemeOverride> = {
	rounded: {},
	square: {
		radius: { xs: 2, sm: 4, md: 4, lg: 6 },
		components: {
			Button: { radius: "sm" },
			Input: { radius: "sm", searchRadius: "sm" },
			Tabs: { radius: "sm" },
			SegmentedControl: { radius: "sm", optionRadius: "xs" },
		},
		motion: { press: { control: 1, surface: 0.97 } },
	},
};

const BACKDROP: Record<"light" | "dark", readonly [string, string, string]> = {
	light: ["#FDE68A", "#F9A8D4", "#A5B4FC"],
	dark: ["#1E1B4B", "#4C1D95", "#0F172A"],
};

export default function CustomThemeScreen() {
	const { resolvedMode } = useThemeMode();
	const [opacity, setOpacity] = useState(0.72);
	const [profile, setProfile] = useState<Profile>("rounded");
	const [tab, setTab] = useState("cards");
	const [density, setDensity] = useState("comfortable");

	// Recreated when the slider moves: components memoize on its identity.
	const transformBackground = useCallback(
		(color: string, meta: SurfaceMeta) => {
			// Marks keep their colour; an overlay on an already translucent
			// track is made opaque enough to read as the selection.
			if (meta.role === "mark") return color;
			if (meta.role === "overlay") return multiplyAlpha(color, Math.min(1, opacity + 0.2));
			return multiplyAlpha(color, opacity);
		},
		[opacity],
	);

	const renderDecoration = useCallback(
		(meta: SurfaceMeta) => {
			if (meta.slot === "screens.page") {
				return <LinearGradient colors={BACKDROP[resolvedMode]} style={StyleSheet.absoluteFill} />;
			}
			if (meta.slot === "cards.decoration") {
				return (
					<LinearGradient
						colors={["rgba(255, 255, 255, 0.18)", "rgba(255, 255, 255, 0)"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={StyleSheet.absoluteFill}
					/>
				);
			}
			return null;
		},
		[resolvedMode],
	);

	// Text standing on the backdrop gets a plate once surfaces are see-through.
	const plate = useMemo<TextStyle | null>(
		() =>
			opacity < 0.9
				? {
						alignSelf: "flex-start",
						paddingHorizontal: 6,
						borderRadius: 6,
						backgroundColor:
							resolvedMode === "dark" ? "rgba(15, 23, 42, 0.62)" : "rgba(255, 255, 255, 0.7)",
					}
				: null,
		[opacity, resolvedMode],
	);

	return (
		<ThemeProvider mode={resolvedMode} theme={PROFILES[profile]}>
			<SurfaceDecoratorProvider
				transformBackground={transformBackground}
				renderDecoration={renderDecoration}
			>
				<TextPlateProvider plate={plate}>
					<ScrollScreen safeArea="bottom" contentContainerStyle={styles.content}>
						<Section title="Surface opacity" description="Every kit surface follows the policy.">
							<Slider
								value={opacity}
								minimumValue={0.3}
								maximumValue={1}
								step={0.01}
								onValueChange={setOpacity}
								testID="custom-theme-opacity"
							/>
						</Section>

						<Section title="Appearance profile" description="Radii and press feedback from tokens.">
							<SegmentedControl
								value={profile}
								onChange={(next) => setProfile(next as Profile)}
								options={[
									{ label: "Rounded", value: "rounded" },
									{ label: "Square", value: "square" },
								]}
								testID="custom-theme-profile"
							/>
						</Section>

						<Tabs
							variant="pill"
							indicator="slide"
							value={tab}
							onChange={setTab}
							options={[
								{ label: "Cards", value: "cards" },
								{ label: "Fields", value: "fields" },
								{ label: "Empty", value: "empty", badge: 2 },
							]}
							testID="custom-theme-tabs"
						/>

						<Section
							title="Segment tabs"
							description="layering=segments: each trigger paints its own fill, nothing stacks."
						>
							<Tabs
								variant="pill"
								layering="segments"
								value={tab}
								onChange={setTab}
								options={[
									{ label: "Cards", value: "cards" },
									{ label: "Fields", value: "fields" },
									{ label: "Empty", value: "empty" },
								]}
								testID="custom-theme-segment-tabs"
							/>
						</Section>

						{tab === "cards" ? (
							<View style={styles.stack}>
								<Card variant="raised" border="subtle">
									<Text variant="subheading">Card with artwork</Text>
									<Text variant="bodySmall" colorKey="textMuted">
										The gradient comes from renderDecoration on the cards.decoration slot.
									</Text>
								</Card>
								<PressableScale onPress={() => {}} accessibilityLabel="Pressable surface">
									<Card variant="flat" border="subtle">
										<Text variant="body">Press me: the dip comes from motion.press.surface.</Text>
									</Card>
								</PressableScale>
								<Skeleton lines={2} />
								<View style={styles.row}>
									<Button variant="primary">Primary</Button>
									<Button variant="secondary">Secondary</Button>
								</View>
							</View>
						) : null}

						{tab === "fields" ? (
							<View style={styles.stack}>
								<Input
									label="Display name"
									placeholder="Ada Lovelace"
									helper="Shown on your profile"
								/>
								<SegmentedControl
									value={density}
									onChange={setDensity}
									options={[
										{ label: "Compact", value: "compact" },
										{ label: "Comfortable", value: "comfortable" },
									]}
								/>
							</View>
						) : null}

						{tab === "empty" ? (
							<EmptyState
								icon="Inbox"
								title="Nothing here yet"
								message="Empty-state copy stands on the backdrop, so it takes the plate."
							/>
						) : null}
					</ScrollScreen>
				</TextPlateProvider>
			</SurfaceDecoratorProvider>
		</ThemeProvider>
	);
}

const styles = StyleSheet.create({
	content: { padding: 16, gap: 20 },
	stack: { gap: 12 },
	row: { flexDirection: "row", gap: 12 },
});
