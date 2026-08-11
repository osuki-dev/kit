import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import {
	Screen,
	Card,
	Text,
	StatRow,
	SegmentedProgressBar,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

import type { DashboardScreenConfig, WidgetConfig } from "../types";

export interface DashboardScreenProps {
	config: DashboardScreenConfig;
}

/**
 * Generic dashboard screen component with Osuki design system
 *
 * Features:
 * - Multiple widget types (stat, progress, hero, list)
 * - Responsive grid layout
 * - Hero title with total count
 *
 * @example
 * ```tsx
 * <DashboardScreen
 *   config={{
 *     title: 'SYSTEM DASHBOARD',
 *     widgets: [
 *       { id: 'cpu', title: 'CPU', type: 'progress', value: 64, max: 100 },
 *       { id: 'memory', title: 'MEMORY', type: 'hero', value: '8.2', unit: 'GB' },
 *     ]
 *   }}
 * />
 * ```
 */
export function DashboardScreen({ config }: DashboardScreenProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const renderWidget = (widget: WidgetConfig) => {
		const data = typeof widget.data === "function" ? widget.data() : widget.data;

		switch (widget.type) {
			case "stat":
				return renderStatWidget(widget, data);
			case "progress":
				return renderProgressWidget(widget, data);
			case "hero":
				return renderHeroWidget(widget, data);
			case "list":
				return renderListWidget(widget, data);
			default:
				return null;
		}
	};

	const renderStatWidget = (widget: WidgetConfig, data: unknown[]) => {
		if (!data || data.length === 0) return null;

		return (
			<Card variant="raised" border="subtle" padding="lg">
				<Text variant="label" color={colors.textMuted} style={styles.widgetTitle}>
					{widget.title}
				</Text>
				<View style={styles.statsContainer}>
					{data.slice(0, 5).map((item, index) => (
						<View key={index}>
							<StatRow
								label={widget.label || String(widget.field) || "VALUE"}
								value={
									widget.format
										? widget.format((item as Record<string, unknown>)[widget.field!])
										: String((item as Record<string, unknown>)[widget.field!])
								}
								unit={widget.unit}
							/>
							{index < Math.min(data.length, 5) - 1 && <View style={styles.divider} />}
						</View>
					))}
				</View>
			</Card>
		);
	};

	const renderProgressWidget = (widget: WidgetConfig, data: unknown[]) => {
		if (!data || data.length === 0) return null;

		return (
			<Card variant="raised" border="subtle" padding="lg">
				<Text variant="label" color={colors.textMuted} style={styles.widgetTitle}>
					{widget.title}
				</Text>
				{data.map((item, index) => (
					<SegmentedProgressBar
						key={index}
						value={Number((item as Record<string, unknown>)[widget.field!])}
						label={widget.label}
						valueDisplay="value"
						size="standard"
						segments={20}
						status={getStatusFromValue(
							Number((item as Record<string, unknown>)[widget.field!]),
							100,
						)}
					/>
				))}
			</Card>
		);
	};

	const renderHeroWidget = (widget: WidgetConfig, data: unknown[]) => {
		const value =
			data && data.length > 0
				? widget.format
					? widget.format((data[0] as Record<string, unknown>)[widget.field!])
					: String((data[0] as Record<string, unknown>)[widget.field!])
				: "0";

		return (
			<Card variant="raised" border="subtle" padding="lg" style={styles.heroWidget}>
				<Text variant="label" color={colors.textMuted} style={styles.widgetTitle}>
					{widget.title}
				</Text>
				<Text variant="hero" color={colors.text}>
					{value}
				</Text>
				{widget.unit && (
					<Text variant="caption" color={colors.textMuted}>
						{widget.unit}
					</Text>
				)}
			</Card>
		);
	};

	const renderListWidget = (widget: WidgetConfig, data: unknown[]) => {
		if (!data || data.length === 0) return null;

		return (
			<Card variant="raised" border="subtle" padding="lg">
				<Text variant="label" color={colors.textMuted} style={styles.widgetTitle}>
					{widget.title}
				</Text>
				<View style={styles.listContainer}>
					{data.slice(0, 6).map((item, index) => (
						<View key={index} style={styles.listItem}>
							<Text variant="caption" color={colors.textMuted}>
								{(item as Record<string, string>).name ||
									(item as Record<string, string>).title ||
									`Item ${index + 1}`}
							</Text>
							<Text variant="caption" color={colors.text}>
								{widget.format
									? widget.format((item as Record<string, unknown>)[widget.field!])
									: String((item as Record<string, unknown>)[widget.field!])}
							</Text>
						</View>
					))}
				</View>
			</Card>
		);
	};

	const getStatusFromValue = (value: number, max: number) => {
		const percentage = (value / max) * 100;
		if (percentage > 90) return "error" as const;
		if (percentage > 70) return "warning" as const;
		return "neutral" as const;
	};

	return (
		<Screen>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<ResponsiveContainer maxWidth="100%" horizontalPadding={pagePadding}>
					{/* Header */}
					<View style={{ paddingTop: spacing["md"], paddingBottom: spacing["sm"] }}>
						<Text variant="heading" color={colors.text}>
							{config.title}
						</Text>
						<Text variant="label" color={colors.textMuted} style={styles.subtitle}>
							{config.widgets.length} WIDGETS
						</Text>
					</View>

					{/* Widgets Grid */}
					<View style={{ flexDirection: "column", gap: spacing["md"], marginTop: spacing["md"] }}>
						{config.widgets.map((widget) => (
							<React.Fragment key={widget.id}>{renderWidget(widget)}</React.Fragment>
						))}
					</View>

					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	content: {
		padding: 0,
	},
	subtitle: {
		marginTop: 4,
	},
	widgetTitle: {
		marginBottom: 12,
	},
	heroWidget: {
		alignItems: "center",
		justifyContent: "center",
		minHeight: 120,
	},
	statsContainer: {
		gap: 8,
	},
	divider: {
		height: 1,
		backgroundColor: "transparent",
		marginVertical: 4,
	},
	listContainer: {
		gap: 8,
	},
	listItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
