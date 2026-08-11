import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, Text, useHaptics, useTheme } from "@osuki-dev/ui";
import { headerChrome } from "@/components/header-chrome";

function withAlpha(color: string, alpha: number) {
	if (color.startsWith("#") && color.length === 7) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	return color;
}

export function StackScrollChrome({ title, scrolled }: { title: string; scrolled: boolean }) {
	const { colors, mode, shadow } = useTheme();
	const haptics = useHaptics();
	const insets = useSafeAreaInsets();
	const progress = useSharedValue(scrolled ? 1 : 0);
	const solid = withAlpha(colors.background, mode === "dark" ? 0.9 : 0.96);
	const mid = withAlpha(colors.background, mode === "dark" ? 0.76 : 0.88);
	const clear = withAlpha(colors.background, 0);

	React.useEffect(() => {
		progress.value = withTiming(scrolled ? 1 : 0, { duration: 180 });
	}, [progress, scrolled]);

	const veilStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
	}));

	const titleStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ translateY: (1 - progress.value) * -6 }, { scale: 0.96 + progress.value * 0.04 }],
	}));

	return (
		<View
			pointerEvents="box-none"
			style={[styles.root, { height: insets.top + headerChrome.pillHeight + 18 }]}
		>
			<Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, veilStyle]}>
				<LinearGradient
					colors={[solid, mid, clear]}
					locations={[0, 0.72, 1]}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>

			<Pressable
				onPress={() => {
					haptics.feedback("selection");
					if (router.canGoBack()) {
						router.back();
					} else {
						router.replace("/");
					}
				}}
				style={({ pressed }) => [
					styles.backButton,
					{
						top: insets.top + headerChrome.rowTopOffset,
						opacity: pressed ? 0.78 : 1,
						backgroundColor: withAlpha(colors.surface, mode === "dark" ? 0.82 : 0.92),
						...(mode === "light" ? shadow.pill : {}),
					},
				]}
				testID="stack-scroll-back-button"
				accessibilityRole="button"
				accessibilityLabel="Back"
			>
				<Icon name="ChevronLeft" size={22} color={colors.text} />
			</Pressable>

			<Animated.View
				pointerEvents={scrolled ? "auto" : "none"}
				style={[
					styles.titleWrap,
					{
						top: insets.top + headerChrome.rowTopOffset,
					},
					titleStyle,
				]}
			>
				<View
					style={[
						styles.titlePill,
						{
							backgroundColor: withAlpha(colors.surface, mode === "dark" ? 0.82 : 0.92),
							...(mode === "light" ? shadow.pill : {}),
						},
					]}
					testID="stack-scroll-title"
					accessibilityRole="header"
				>
					<Text variant="label" color={colors.text} overflowMode="marquee" style={styles.titleText}>
						{title}
					</Text>
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 40,
	},
	backButton: {
		position: "absolute",
		left: 16,
		width: headerChrome.backWidth,
		height: headerChrome.pillHeight,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	titleWrap: {
		position: "absolute",
		left: 84,
		right: 84,
		alignItems: "center",
	},
	titlePill: {
		minHeight: headerChrome.pillHeight,
		maxWidth: headerChrome.titleMaxWidth,
		width: "100%",
		borderRadius: 999,
		paddingHorizontal: headerChrome.titlePaddingX,
		alignItems: "center",
		justifyContent: "center",
	},
	titleText: {
		maxWidth: "100%",
		textAlign: "center",
	},
});
