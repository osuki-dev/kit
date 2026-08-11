import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, Image, Text, useTheme } from "@osuki-dev/ui";

import { useTabChrome } from "@/components/tab-chrome-context";
import { useAccount } from "@/lib/data";

const defaultAvatarImage = require("../assets/commerce/osuki-default-avatar.jpg");

function withAlpha(color: string, alpha: number) {
	if (color.startsWith("#") && color.length === 7) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	return color;
}

export function TopChromeVeil() {
	const { colors, mode, shadow } = useTheme();
	const { title, scrolled } = useTabChrome();
	const { signedIn } = useAccount();
	const insets = useSafeAreaInsets();
	const progress = useSharedValue(scrolled ? 1 : 0);
	const height = scrolled ? insets.top + 52 : insets.top + 6;
	const solid = withAlpha(colors.background, mode === "dark" ? 0.9 : 0.96);
	const mid = withAlpha(colors.background, scrolled ? (mode === "dark" ? 0.78 : 0.9) : 0.16);
	const clear = withAlpha(colors.background, scrolled ? 0.18 : 0);
	const showSearch = title === "Shop";
	const showAccountAvatar = signedIn && ["Account", "账户", "帳戶"].includes(title);

	React.useEffect(() => {
		progress.value = withTiming(scrolled ? 1 : 0, { duration: 180 });
	}, [progress, scrolled]);

	const titleStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ translateY: (1 - progress.value) * -8 }],
	}));

	const searchStyle = useAnimatedStyle(() => ({
		opacity: showSearch ? progress.value : 0,
		transform: [{ translateY: (1 - progress.value) * -8 }, { scale: 0.96 + progress.value * 0.04 }],
	}));

	return (
		<View pointerEvents="box-none" style={[styles.top, { height }]}>
			<View
				style={[
					StyleSheet.absoluteFill,
					{
						backgroundColor: withAlpha(
							colors.background,
							scrolled ? (mode === "dark" ? 0.48 : 0.58) : 0.2,
						),
					},
				]}
			/>
			<LinearGradient
				colors={[solid, mid, clear]}
				locations={[0, scrolled ? 0.76 : 0.68, 1]}
				style={StyleSheet.absoluteFill}
			/>
			<Animated.View
				style={[
					styles.compactHeader,
					{
						paddingTop: insets.top,
					},
					titleStyle,
				]}
			>
				<View
					style={[
						styles.titlePill,
						{
							backgroundColor: colors.surface,
							...(mode === "light" ? shadow.pill : {}),
						},
					]}
				>
					<Text
						variant="label"
						weight="medium"
						colorKey="text"
						overflowMode="marquee"
						style={styles.compactTitle}
					>
						{title}
					</Text>
				</View>
			</Animated.View>
			{showSearch ? (
				<Animated.View
					pointerEvents={scrolled ? "auto" : "none"}
					style={[
						styles.searchSlot,
						{
							top: insets.top + 5,
							backgroundColor: colors.surface,
							...(mode === "light" ? shadow.pill : {}),
						},
						searchStyle,
					]}
				>
					<Pressable
						onPress={() => router.push("/search")}
						testID="top-search-button"
						accessibilityRole="button"
						accessibilityLabel="Search products"
						style={({ pressed }) => [styles.searchButton, { opacity: pressed ? 0.72 : 1 }]}
					>
						<Icon name="Search" size={18} color={colors.primary} />
					</Pressable>
				</Animated.View>
			) : null}
			{showAccountAvatar ? (
				<Animated.View
					pointerEvents={scrolled ? "auto" : "none"}
					style={[
						styles.accountSlot,
						{
							top: insets.top + 4,
							backgroundColor: colors.surface,
							...(mode === "light" ? shadow.pill : {}),
						},
						titleStyle,
					]}
				>
					<Pressable
						onPress={() => router.push("/account-profile")}
						testID="top-account-avatar-button"
						accessibilityRole="button"
						accessibilityLabel="Open profile"
						style={({ pressed }) => [styles.accountButton, { opacity: pressed ? 0.72 : 1 }]}
					>
						<Image
							source={defaultAvatarImage}
							style={styles.accountAvatar}
							contentFit="cover"
							cachePolicy="memory-disk"
						/>
					</Pressable>
				</Animated.View>
			) : null}
		</View>
	);
}

export function BottomChromeVeil() {
	const { colors, mode } = useTheme();
	const insets = useSafeAreaInsets();
	const height = insets.bottom + 78;
	const solid = withAlpha(colors.background, mode === "dark" ? 0.9 : 0.96);
	const clear = withAlpha(colors.background, 0);

	return (
		<View pointerEvents="none" style={[styles.bottom, { height }]}>
			<BlurView
				intensity={mode === "dark" ? 22 : 30}
				tint={mode === "dark" ? "dark" : "light"}
				style={StyleSheet.absoluteFill}
			/>
			<LinearGradient
				colors={[clear, withAlpha(colors.background, 0.58), solid]}
				locations={[0, 0.5, 1]}
				style={StyleSheet.absoluteFill}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	top: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 20,
	},
	bottom: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 20,
	},
	compactHeader: {
		height: "100%",
		alignItems: "center",
		justifyContent: "flex-end",
		paddingBottom: 8,
		paddingHorizontal: 84,
	},
	titlePill: {
		minHeight: 34,
		maxWidth: 220,
		borderRadius: 999,
		paddingHorizontal: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	compactTitle: {
		width: "100%",
		textAlign: "center",
	},
	searchSlot: {
		position: "absolute",
		left: 18,
		width: 40,
		height: 36,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	searchButton: {
		width: "100%",
		height: "100%",
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	accountSlot: {
		position: "absolute",
		right: 18,
		width: 40,
		height: 40,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		padding: 3,
	},
	accountButton: {
		width: "100%",
		height: "100%",
		borderRadius: 999,
		overflow: "hidden",
	},
	accountAvatar: {
		width: "100%",
		height: "100%",
		borderRadius: 999,
	},
});
