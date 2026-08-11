import React from "react";
import { View, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

import {
	Screen,
	Text,
	Icon,
	Badge,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	type IconName,
} from "@osuki-dev/ui";

export interface BottomNavItem {
	id: string;
	label: string;
	icon: IconName;
	activeIcon?: IconName;
	badge?: number;
	content: React.ReactNode;
}

export interface BottomNavScreenConfig {
	/** Navigation items */
	items: BottomNavItem[];
	/** Active item ID */
	activeItemId?: string;
}

export interface BottomNavScreenProps {
	config: BottomNavScreenConfig;
	/** Navigation change handler */
	onNavChange?: (itemId: string) => void;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		content?: ViewStyle;
		navBar?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	navBar: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginBottom: 16,
		padding: 4,
	},
	navItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 50,
		paddingVertical: 8,
		paddingHorizontal: 8,
		gap: 4,
	},
	iconContainer: {
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
		width: 24,
		height: 24,
	},
	badge: {
		position: "absolute",
		top: -4,
		right: -4,
	},
});

/**
 * Bottom navigation container template
 *
 * Features:
 * - Fixed bottom navigation bar
 * - Icon and label for each item
 * - Active state highlighting
 * - Badge support
 * - 3-5 items recommended
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <BottomNavScreen
 *   config={{
 *     items: [
 *       { id: "1", label: "Home", icon: "Home", content: <HomeScreen /> },
 *       { id: "2", label: "Search", icon: "Search", content: <SearchScreen /> },
 *       { id: "3", label: "Profile", icon: "User", content: <ProfileScreen /> },
 *     ],
 *     activeItemId: "1",
 *   }}
 * />
 * ```
 */
export function BottomNavScreen({ config, onNavChange, styleOverrides }: BottomNavScreenProps) {
	const { colors, spacing, mode, shadow } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { items, activeItemId: controlledActiveId } = config;

	const [activeItem, setActiveItem] = React.useState(controlledActiveId || items[0]?.id);

	const currentItem = items.find((i) => i.id === activeItem);

	const handleNavPress = (itemId: string) => {
		setActiveItem(itemId);
		onNavChange?.(itemId);
	};

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container]}>
			{/* Content Area */}
			<View style={[staticStyles.content, styleOverrides?.content || {}]}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					<View style={{ paddingVertical: spacing["md"], flex: 1 }}>{currentItem?.content}</View>
				</ResponsiveContainer>
			</View>

			{/* Bottom Navigation */}
			<View
				testID="kit-bottom-nav"
				style={[
					staticStyles.navBar,
					{ backgroundColor: colors.surfaceRaised, borderRadius: 999 },
					styleOverrides?.navBar,
				]}
			>
				{items.map((item) => {
					const isActive = activeItem === item.id;
					const iconName = isActive && item.activeIcon ? item.activeIcon : item.icon;

					return (
						<TouchableOpacity
							key={item.id}
							testID={`kit-bottom-nav-${item.id}`}
							accessibilityRole="tab"
							accessibilityState={{ selected: isActive }}
							onPress={() => handleNavPress(item.id)}
							style={[
								staticStyles.navItem,
								{
									borderRadius: 999,
									backgroundColor: isActive ? colors.surface : "transparent",
									...(isActive && mode === "light" ? shadow.pill : {}),
								},
							]}
						>
							<View style={staticStyles.iconContainer}>
								<Icon
									name={iconName}
									size={22}
									color={isActive ? colors.primary : colors.textMuted}
								/>

								{item.badge !== undefined && item.badge > 0 && (
									<View style={staticStyles.badge}>
										<Badge variant="primary" display="dot">
											{item.badge}
										</Badge>
									</View>
								)}
							</View>

							<Text variant="caption" color={isActive ? colors.primary : colors.textMuted}>
								{item.label}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</Screen>
	);
}
