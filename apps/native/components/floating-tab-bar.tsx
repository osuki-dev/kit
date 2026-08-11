import React from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { Icon, Image, Text, useHaptics, useTheme, type IconName } from "@osuki-dev/ui";
import { useAccount, useCart } from "@/lib/data";
import { useI18n } from "@osuki-dev/kit-community";

const defaultAvatarImage = require("../assets/commerce/osuki-default-avatar.jpg");

const TAB_META: Record<
	string,
	{
		labelKey:
			| "navigation.shop"
			| "navigation.categories"
			| "navigation.cart"
			| "navigation.account";
		icon: IconName;
		activeIcon: IconName;
		testID: string;
	}
> = {
	index: {
		labelKey: "navigation.shop",
		icon: "ShoppingBag",
		activeIcon: "ShoppingBag",
		testID: "tab-shop",
	},
	categories: {
		labelKey: "navigation.categories",
		icon: "LayoutGrid",
		activeIcon: "LayoutGrid",
		testID: "tab-categories",
	},
	bag: {
		labelKey: "navigation.cart",
		icon: "ShoppingBag",
		activeIcon: "ShoppingBag",
		testID: "tab-cart",
	},
	account: {
		labelKey: "navigation.account",
		icon: "CircleUserRound",
		activeIcon: "CircleUserRound",
		testID: "tab-account",
	},
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FloatingTabItem({
	routeKey,
	routeName,
	active,
	onPress,
	badgeCount,
}: {
	routeKey: string;
	routeName: string;
	active: boolean;
	onPress: () => void;
	badgeCount?: number;
}) {
	const { colors, spacing, radius } = useTheme();
	const { t } = useI18n();
	const { signedIn } = useAccount();
	const progress = useSharedValue(active ? 1 : 0);
	const meta = TAB_META[routeName] ?? {
		labelKey: undefined,
		icon: "Circle",
		activeIcon: "CircleDot",
		testID: `tab-${routeName}`,
	};
	const label = meta.labelKey ? t(meta.labelKey) : routeName;

	React.useEffect(() => {
		progress.value = withTiming(active ? 1 : 0, { duration: 180 });
	}, [active, progress]);

	const itemStyle = useAnimatedStyle(() => ({
		transform: [{ scale: 0.98 + progress.value * 0.02 }],
		opacity: 0.72 + progress.value * 0.28,
	}));

	return (
		<AnimatedPressable
			key={routeKey}
			testID={meta.testID}
			accessibilityRole="tab"
			accessibilityLabel={label}
			accessibilityState={{ selected: active }}
			onPress={onPress}
			style={[
				styles.item,
				{
					borderRadius: radius.pill,
					paddingHorizontal: spacing.xs,
				},
				itemStyle,
			]}
		>
			{routeName === "account" && signedIn ? (
				<View
					style={[
						styles.avatarTabIcon,
						{
							backgroundColor: active ? colors.primarySubtle : colors.surface,
							borderColor: active ? colors.primary : colors.border,
						},
					]}
				>
					<Image
						source={defaultAvatarImage}
						style={styles.avatarTabImage}
						contentFit="cover"
						cachePolicy="memory-disk"
					/>
				</View>
			) : (
				<Icon
					name={active ? meta.activeIcon : meta.icon}
					size={21}
					color={active ? colors.primary : colors.textSubtle}
					strokeWidth={active ? 1.8 : 1.5}
				/>
			)}
			{badgeCount ? (
				<View style={[styles.badge, { backgroundColor: colors.primary }]}>
					<Text variant="caption" color={colors.onPrimary} style={styles.badgeText}>
						{badgeCount > 9 ? "9+" : String(badgeCount)}
					</Text>
				</View>
			) : null}
			<Text
				variant="caption"
				color={active ? colors.primary : colors.textMuted}
				style={styles.label}
				numberOfLines={1}
			>
				{label}
			</Text>
		</AnimatedPressable>
	);
}

export function FloatingTabBar({
	state,
	descriptors: _descriptors,
	navigation,
	insets,
}: BottomTabBarProps) {
	const { colors, spacing, radius, mode, shadow } = useTheme();
	const haptics = useHaptics();
	const { items } = useCart();
	const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
	const [dockWidth, setDockWidth] = React.useState(0);
	const activeIndex = useSharedValue(state.index);
	const horizontalInset = spacing.xs;
	const tabCount = Math.max(state.routes.length, 1);
	const indicatorWidth = dockWidth > 0 ? (dockWidth - horizontalInset * 2) / tabCount : 0;

	React.useEffect(() => {
		activeIndex.value = withTiming(state.index, { duration: 240 });
	}, [activeIndex, state.index]);

	const handleDockLayout = React.useCallback((event: LayoutChangeEvent) => {
		setDockWidth(event.nativeEvent.layout.width);
	}, []);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: horizontalInset + activeIndex.value * indicatorWidth }],
	}));

	return (
		<View
			pointerEvents="box-none"
			style={[
				styles.wrapper,
				{
					paddingBottom: Math.max(insets.bottom + spacing.sm, spacing.md),
					paddingHorizontal: spacing.md,
				},
			]}
		>
			<BlurView
				pointerEvents="none"
				intensity={mode === "dark" ? 28 : 36}
				tint={mode === "dark" ? "dark" : "light"}
				style={styles.glassVeil}
			/>
			<View
				testID="floating-tab-bar"
				accessibilityRole="tablist"
				onLayout={handleDockLayout}
				style={[
					styles.dock,
					{
						borderRadius: radius.pill,
						padding: spacing.xs,
						backgroundColor: colors.surfaceRaised,
						...(mode === "light" ? shadow.soft : {}),
					},
				]}
			>
				{indicatorWidth > 0 && (
					<Animated.View
						pointerEvents="none"
						accessibilityElementsHidden
						importantForAccessibility="no-hide-descendants"
						style={[
							styles.indicator,
							{
								width: indicatorWidth,
								borderRadius: radius.pill,
								backgroundColor: colors.surface,
								...(mode === "light" ? shadow.pill : {}),
							},
							indicatorStyle,
						]}
					/>
				)}
				{state.routes.map((route, index) => {
					const active = state.index === index;

					const onPress = () => {
						haptics.feedback(active ? "selection" : "light");
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!active && !event.defaultPrevented) {
							navigation.navigate(route.name, route.params);
						}
					};

					return (
						<FloatingTabItem
							key={route.key}
							routeKey={route.key}
							routeName={route.name}
							active={active}
							onPress={onPress}
							badgeCount={route.name === "bag" ? cartCount : undefined}
						/>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		zIndex: 30,
	},
	glassVeil: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		top: -34,
	},
	dock: {
		width: "100%",
		maxWidth: 340,
		minHeight: 54,
		flexDirection: "row",
		alignItems: "center",
	},
	indicator: {
		position: "absolute",
		top: 4,
		bottom: 4,
		left: 0,
	},
	item: {
		position: "relative",
		flex: 1,
		minHeight: 46,
		alignItems: "center",
		justifyContent: "center",
		gap: 3,
		zIndex: 2,
	},
	badge: {
		position: "absolute",
		top: 5,
		right: 20,
		minWidth: 16,
		height: 16,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 4,
	},
	badgeText: {
		fontSize: 9,
		lineHeight: 11,
	},
	avatarTabIcon: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 1,
		padding: 1,
		overflow: "hidden",
	},
	avatarTabImage: {
		width: "100%",
		height: "100%",
		borderRadius: 999,
	},
	label: {
		textAlign: "center",
		fontSize: 10,
		lineHeight: 13,
		textTransform: "none",
	},
});
