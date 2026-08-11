import React from "react";
import { View } from "react-native";

import { Card, Section, useTheme } from "@osuki-dev/ui";

import { SettingsItem, type SettingsItemConfig } from "./settings-item";

export interface SettingsSectionConfig {
	id: string;
	title: string;
	description?: string;
	items: SettingsItemConfig[];
	/** Stable test identifier for automation */
	testID?: string;
}

export interface SettingsSectionProps {
	config: SettingsSectionConfig;
	index?: number;
}

/**
 * Settings section component - groups related settings items
 *
 * @example
 * ```tsx
 * <SettingsSection
 *   config={{
 *     id: 'notifications',
 *     title: 'NOTIFICATIONS',
 *     items: [
 *       { id: 'push', type: 'toggle', label: 'Push Notifications' },
 *       { id: 'email', type: 'toggle', label: 'Email Notifications' },
 *     ],
 *   }}
 * />
 * ```
 */
export const SettingsSection: React.FC<SettingsSectionProps> = ({ config }) => {
	const { spacing } = useTheme();
	const testID = config.testID ?? `settings-section-${config.id}`;

	return (
		<View testID={testID} style={{ marginBottom: spacing["lg"] }}>
			<Section title={config.title} description={config.description} gap="sm">
				<Card
					testID={`${testID}-card`}
					variant="raised"
					border="subtle"
					padding="xs"
					style={{ gap: spacing["xs"] }}
				>
					{config.items.map((item, index) => (
						<SettingsItem
							key={item.id}
							config={{
								...item,
								last: index === config.items.length - 1,
								testID: item.testID ?? `settings-item-${config.id}-${item.id}`,
							}}
						/>
					))}
				</Card>
			</Section>
		</View>
	);
};
