import React, { useMemo, useState } from "react";
import { ScrollView, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Sheet } from "./bottom-sheet";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";
import { SheetListItem } from "./sheet-list-item";

export type MenuItemTone = "default" | "destructive";

export interface MenuItem {
	id: string;
	label: string;
	description?: string;
	icon?: IconName;
	tone?: MenuItemTone;
	disabled?: boolean;
}

export interface MenuProps extends Omit<ViewProps, "style" | "children"> {
	items: MenuItem[];
	onSelect: (item: MenuItem) => void;
	selectedId?: string;
	label?: string;
	triggerLabel?: string;
	placeholder?: string;
	disabled?: boolean;
	sheetTitle?: string;
	closeLabel?: string;
	style?: ViewStyle;
}

export const Menu: React.FC<MenuProps> = ({
	items,
	onSelect,
	selectedId,
	label,
	triggerLabel,
	placeholder = "Open menu",
	disabled = false,
	sheetTitle,
	closeLabel,
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const [open, setOpen] = useState(false);
	const selectedItem = items.find((item) => item.id === selectedId);
	const resolvedTriggerLabel = triggerLabel ?? selectedItem?.label ?? placeholder;

	const triggerStyle = useMemo<ViewStyle>(
		() => ({
			minHeight: 44,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.radius.pill,
			backgroundColor: theme.colors.surfaceRaised,
			borderWidth: 1,
			borderColor: theme.colors.border,
			opacity: disabled ? 0.56 : 1,
		}),
		[
			disabled,
			theme.colors.border,
			theme.colors.surfaceRaised,
			theme.radius.pill,
			theme.spacing.md,
			theme.spacing.sm,
		],
	);

	const handleOpen = () => {
		if (disabled) return;
		haptics.feedback("selection");
	};

	const handleSelect = (item: MenuItem) => {
		if (item.disabled) return;
		onSelect(item);
		setOpen(false);
	};

	return (
		<Sheet.Root open={open} onOpenChange={setOpen} disabled={disabled}>
			<View style={style} testID={testID} {...props}>
				{label && (
					<Text variant="label" colorKey="textMuted" style={{ marginBottom: theme.spacing.xs }}>
						{label}
					</Text>
				)}
				<Sheet.Trigger
					accessibilityLabel={resolvedTriggerLabel}
					disabled={disabled}
					onPress={handleOpen}
					style={triggerStyle}
					testID={testID ? `${testID}-trigger` : undefined}
				>
					{selectedItem?.icon && (
						<Icon name={selectedItem.icon} size={18} color={theme.colors.textMuted} />
					)}
					<View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
						<Text variant="button" colorKey="text" numberOfLines={1}>
							{resolvedTriggerLabel}
						</Text>
					</View>
					<Icon name="ChevronDown" size={18} color={theme.colors.textMuted} />
				</Sheet.Trigger>

				<Sheet.Content closeLabel={closeLabel} maxHeight="72%">
					<Sheet.Handle />
					{sheetTitle || label ? (
						<Sheet.Header>
							<Sheet.HeaderText>
								<Sheet.Title>{sheetTitle ?? label}</Sheet.Title>
							</Sheet.HeaderText>
							<Sheet.Close label={closeLabel} />
						</Sheet.Header>
					) : null}
					<Sheet.Body>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View
								style={{ gap: theme.spacing.xs }}
								testID={testID ? `${testID}-items` : undefined}
							>
								{items.map((item) => {
									const selected = item.id === selectedId;
									return (
										<SheetListItem
											key={item.id}
											role="menuitem"
											label={item.label}
											description={item.description}
											icon={item.icon}
											selected={selected}
											disabled={item.disabled}
											tone={item.tone}
											onPress={() => handleSelect(item)}
											testID={testID ? `${testID}-item-${item.id}` : undefined}
										/>
									);
								})}
							</View>
						</ScrollView>
					</Sheet.Body>
				</Sheet.Content>
			</View>
		</Sheet.Root>
	);
};
