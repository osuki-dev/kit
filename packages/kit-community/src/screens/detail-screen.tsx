import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import {
	Screen,
	Surface,
	Card,
	Text,
	Button,
	StatRow,
	Tag,
	Icon,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

import { useI18n } from "../i18n";
import type { EntityBase, EntityConfig, FieldType } from "../types";

export interface DetailScreenProps<T extends EntityBase> {
	entity: EntityConfig<T>;
	data: T;
	onActionPress?: (action: string, item: T) => void;
	onBackPress?: () => void;
	headerRight?: React.ReactNode;
	statusText?: string;
	testID?: string;
}

/**
 * Generic detail screen component with Osuki design system
 *
 * Features:
 * - Hero section with title, subtitle, metric
 * - Grouped sections
 * - StatRows for data display
 * - Metadata timestamps
 *
 * @example
 * ```tsx
 * <DetailScreen
 *   entity={UserEntity}
 *   data={user}
 *   onBackPress={() => navigation.goBack()}
 * />
 * ```
 */
export function DetailScreen<T extends EntityBase>({
	entity,
	data,
	onActionPress,
	onBackPress,
	headerRight,
	statusText,
	testID = "detail-screen",
}: DetailScreenProps<T>) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const { t } = useI18n();
	const config = entity.detail;

	if (!config) {
		throw new Error(`Entity ${entity.name} does not have detail configuration`);
	}

	const hero = config.hero;
	const titleValue = String(data[hero.title] || "");
	const subtitleValue = hero.subtitle ? String(data[hero.subtitle] || "") : undefined;

	const formatValue = (value: unknown, type?: FieldType): string => {
		if (value === null || value === undefined) return "-";

		switch (type) {
			case "date":
				return new Date(value as string | number | Date).toLocaleDateString();
			case "datetime":
				return new Date(value as string | number | Date).toLocaleString();
			case "boolean":
				return value ? t("list.yes") : t("list.no");
			case "currency":
				return `${Number(value).toLocaleString()}`;
			case "percent":
				return `${Number(value).toFixed(1)}%`;
			default:
				return String(value);
		}
	};

	const renderField = (key: keyof T, type?: FieldType, colorMap?: Record<string, string>) => {
		const value = data[key];
		const displayValue = formatValue(value, type);

		// Determine color
		let colorKey: keyof typeof colors = "text";
		if (colorMap && typeof value === "string" && colorMap[value]) {
			switch (colorMap[value]) {
				case "primary":
					colorKey = "primary";
					break;
				case "success":
					colorKey = "success";
					break;
				case "warning":
					colorKey = "warning";
					break;
				case "error":
					colorKey = "primary";
					break;
			}
		}

		// Render based on type
		if (type === "boolean") {
			return (
				<Text variant="data" color={value ? colors.success : colors.textDisabled}>
					{displayValue}
				</Text>
			);
		}

		if (type === "tag") {
			return <Tag variant={colorKey === "text" ? "default" : "active"}>{displayValue}</Tag>;
		}

		return (
			<Text variant="body" color={colorKey === "text" ? colors.text : colors[colorKey]}>
				{displayValue}
			</Text>
		);
	};

	return (
		<Screen testID={testID}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<ResponsiveContainer maxWidth="100%" horizontalPadding={pagePadding}>
					{/* Hero Section */}
					<Surface
						variant="page"
						style={{ paddingTop: spacing["md"], paddingBottom: spacing["lg"] }}
					>
						<View style={styles.heroRow}>
							<View style={styles.heroContent}>
								<Text variant="display" color={colors.text}>
									{titleValue}
								</Text>
								{subtitleValue && (
									<Text variant="subheading" color={colors.textMuted}>
										{subtitleValue}
									</Text>
								)}
							</View>

							{hero.metric && (
								<View style={styles.heroMetric}>
									<Text variant="hero" color={colors.text}>
										{formatValue(data[hero.metric.value])}
									</Text>
									<Text variant="label" color={colors.textMuted}>
										{hero.metric.label}
									</Text>
									{hero.metric.unit && (
										<Text variant="caption" color={colors.textDisabled}>
											{hero.metric.unit}
										</Text>
									)}
								</View>
							)}

							{headerRight}
						</View>

						{/* Actions Bar */}
						{config.actions && config.actions.length > 0 && (
							<View style={styles.actionsBar}>
								{config.actions.map((action) =>
									action.visible && !action.visible(data) ? null : (
										<Button
											key={action.id}
											variant={action.variant || "secondary"}
											testID={`${testID}-action-${action.id}`}
											onPress={() => {
												onActionPress?.(action.id, data);
												action.onPress?.(data);
											}}
										>
											{action.label}
										</Button>
									),
								)}
							</View>
						)}
						{statusText ? (
							<Card
								variant="raised"
								border="subtle"
								padding="md"
								style={{ marginTop: spacing["md"] }}
								testID={`${testID}-status`}
							>
								<Text variant="caption" color={colors.textMuted}>
									{statusText}
								</Text>
							</Card>
						) : null}
					</Surface>

					{/* Sections */}
					<View style={{ marginTop: spacing["md"], gap: spacing["md"] }}>
						{config.sections.map((section) => (
							<Card
								key={section.id}
								variant="raised"
								border="subtle"
								padding="lg"
								style={{ marginBottom: spacing["md"] }}
							>
								<Text
									variant="label"
									color={colors.textMuted}
									style={{ marginBottom: spacing["md"] }}
								>
									{section.title}
								</Text>

								<View
									style={{
										flexDirection: section.columns === 2 ? "row" : "column",
										gap: spacing["md"],
									}}
								>
									{section.fields.map((fieldKey) => {
										// Find column config if exists
										const columnConfig = entity.list?.columns.find((c) => c.key === fieldKey);

										return (
											<View
												key={String(fieldKey)}
												style={{
													gap: spacing["xs"],
													flex: section.columns === 2 ? 1 : undefined,
												}}
											>
												<Text variant="caption" color={colors.textMuted}>
													{columnConfig?.label || String(fieldKey).toUpperCase()}
												</Text>
												{renderField(fieldKey, columnConfig?.type, columnConfig?.colorMap)}
											</View>
										);
									})}
								</View>
							</Card>
						))}
					</View>

					{/* Metadata */}
					{config.metadata && (config.metadata.createdAt || config.metadata.updatedAt) && (
						<Card
							variant="raised"
							border="subtle"
							padding="md"
							style={{ marginTop: spacing["md"] }}
						>
							{config.metadata.createdAt && (
								<StatRow
									label={t("detail.created")}
									value={formatValue(data[config.metadata.createdAt], "datetime")}
								/>
							)}
							{config.metadata.updatedAt && (
								<StatRow
									label={t("detail.updated")}
									value={formatValue(data[config.metadata.updatedAt], "datetime")}
								/>
							)}
						</Card>
					)}

					<View style={{ height: spacing["4xl"] }} />
				</ResponsiveContainer>
			</ScrollView>

			{/* Back Button */}
			{onBackPress && (
				<TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.7}>
					<Icon name="ChevronLeft" size={28} color={colors.text} />
				</TouchableOpacity>
			)}
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
	heroRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	heroContent: {
		flex: 1,
	},
	heroMetric: {
		alignItems: "flex-end",
	},
	actionsBar: {
		flexDirection: "row",
		gap: 12,
		marginTop: 24,
		flexWrap: "wrap",
	},
	backButton: {
		position: "absolute",
		top: 60,
		left: 16,
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "transparent",
	},
});
