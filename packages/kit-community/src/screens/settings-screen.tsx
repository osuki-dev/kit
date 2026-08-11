import React from "react";
import { View } from "react-native";

import { Screen, Surface, Text, useTheme, KeyboardAwareScrollView } from "@osuki-dev/ui";

import { SettingsSection, type SettingsSectionConfig } from "../components/settings-section";
import type { SettingsModuleDefinition } from "../modules";

export interface SettingsScreenProps {
	/** Screen title */
	title?: string;
	/** Settings sections */
	sections?: SettingsSectionConfig[];
	/** Generated module definition from createSettingsModule() */
	module?: SettingsModuleDefinition;
	/** Header component */
	header?: React.ReactNode;
	/** Footer component */
	footer?: React.ReactNode;
}

/**
 * Settings screen component with Osuki design system
 *
 * @example
 * ```tsx
 * <SettingsScreen
 *   title="SETTINGS"
 *   sections={[
 *     {
 *       id: 'notifications',
 *       title: 'NOTIFICATIONS',
 *       items: [
 *         { id: 'push', type: 'toggle', label: 'Push Notifications', value: true },
 *         { id: 'email', type: 'toggle', label: 'Email Notifications', value: false },
 *       ],
 *     },
 *     {
 *       id: 'appearance',
 *       title: 'APPEARANCE',
 *       items: [
 *         { id: 'dark', type: 'toggle', label: 'Dark Mode', value: true },
 *         { id: 'lang', type: 'value', label: 'Language', value: 'English' },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export function SettingsScreen({ title, sections, module, header, footer }: SettingsScreenProps) {
	const { colors, spacing } = useTheme();
	const resolvedTitle = title ?? module?.title ?? "Settings";
	const resolvedSections = sections ?? module?.sections ?? [];
	const sectionsById = new Map(resolvedSections.map((section) => [section.id, section]));
	const groups =
		module?.layout.groups
			.map((group) => ({
				...group,
				sections: group.sections
					.map((sectionId) => sectionsById.get(sectionId))
					.filter((section): section is SettingsSectionConfig => Boolean(section)),
			}))
			.filter((group) => group.sections.length > 0) ?? [];

	// Dynamic spacing
	const layoutSpacing = {
		pagePaddingTop: 0,
		headerPadding: spacing["md"],
		contentPadding: spacing["md"],
		bottomPadding: spacing["4xl"],
	};

	return (
		<Screen style={{ paddingTop: layoutSpacing.pagePaddingTop }}>
			<KeyboardAwareScrollView>
				{/* Header */}
				<Surface variant="page" style={{ padding: layoutSpacing.headerPadding }}>
					<Text variant="heading" color={colors.text}>
						{resolvedTitle}
					</Text>
					{header}
				</Surface>

				{/* Settings Sections */}
				<View style={{ paddingHorizontal: layoutSpacing.contentPadding }}>
					{groups.length > 0
						? groups.map((group, groupIndex) => (
								<View key={group.id} style={{ marginBottom: spacing["lg"] }}>
									<View style={{ marginBottom: spacing["sm"], gap: spacing["xs"] }}>
										<Text variant="label" color={colors.textMuted}>
											{group.title}
										</Text>
										{group.description && (
											<Text variant="bodySmall" color={colors.textSubtle}>
												{group.description}
											</Text>
										)}
									</View>
									{group.sections.map((section, sectionIndex) => (
										<SettingsSection
											key={section.id}
											config={section}
											index={groupIndex + sectionIndex}
										/>
									))}
								</View>
							))
						: resolvedSections.map((section, index) => (
								<SettingsSection key={section.id} config={section} index={index} />
							))}
				</View>

				{/* Footer */}
				{footer && <View style={{ padding: layoutSpacing.contentPadding }}>{footer}</View>}

				<View style={{ height: layoutSpacing.bottomPadding }} />
			</KeyboardAwareScrollView>
		</Screen>
	);
}
