import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, type ViewStyle } from "react-native";

import { Screen, Text, useTheme, useResponsiveTheme, ResponsiveContainer } from "@osuki-dev/ui";

export interface TabItem {
	id: string;
	label: string;
	content: React.ReactNode;
	badge?: number;
}

export interface TabbedScreenConfig {
	/** Tab items */
	tabs: TabItem[];
	/** Active tab ID */
	activeTabId?: string;
}

export interface TabbedScreenProps {
	config: TabbedScreenConfig;
	/** Tab change handler */
	onTabChange?: (tabId: string) => void;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		tabBar?: ViewStyle;
		content?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	tabBar: {
		flexDirection: "row",
		borderBottomWidth: 1,
	},
	tab: {
		flex: 1,
		paddingVertical: 16,
		alignItems: "center",
		borderBottomWidth: 2,
		borderBottomColor: "transparent",
	},
	tabContent: {
		flex: 1,
	},
});

/**
 * Tabbed screen container template
 *
 * Features:
 * - Horizontal tab bar
 * - Active tab indicator
 * - Badge support
 * - Scrollable content per tab
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <TabbedScreen
 *   config={{
 *     tabs: [
 *       { id: "1", label: "Tab 1", content: <View /> },
 *       { id: "2", label: "Tab 2", content: <View /> },
 *     ],
 *     activeTabId: "1",
 *   }}
 * />
 * ```
 */
export function TabbedScreen({ config, onTabChange, styleOverrides }: TabbedScreenProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { tabs, activeTabId: controlledActiveId } = config;

	const [activeTab, setActiveTab] = useState(controlledActiveId || tabs[0]?.id);

	const currentTab = tabs.find((t) => t.id === activeTab);

	const handleTabPress = (tabId: string) => {
		setActiveTab(tabId);
		onTabChange?.(tabId);
	};

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container]}>
			{/* Tab Bar */}
			<View
				style={[
					staticStyles.tabBar,
					{ borderBottomColor: colors.border },
					styleOverrides?.tabBar || {},
				]}
			>
				{tabs.map((tab) => (
					<TouchableOpacity
						key={tab.id}
						onPress={() => handleTabPress(tab.id)}
						style={[
							staticStyles.tab,
							{
								borderBottomColor: activeTab === tab.id ? colors.text : "transparent",
							},
							styleOverrides?.tabBar,
						]}
					>
						<Text variant="label" color={activeTab === tab.id ? colors.text : colors.textMuted}>
							{tab.label}
							{tab.badge !== undefined && tab.badge > 0 && ` (${tab.badge})`}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Tab Content */}
			<ScrollView
				style={staticStyles.tabContent}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styleOverrides?.content}
			>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					<View style={{ paddingVertical: spacing["md"] }}>{currentTab?.content}</View>
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}
