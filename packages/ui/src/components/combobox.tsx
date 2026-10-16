import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useThemeTokens } from "../theme";
import { Command, type CommandOption } from "./command";
import { Icon } from "./icon";
import { Popover } from "./popover";
import { Text } from "./text";

export interface ComboboxProps {
	options: CommandOption[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	disabled?: boolean;
	empty?: string;
}

export function Combobox({
	options,
	value,
	onChange,
	placeholder = "Select",
	searchPlaceholder = "Search",
	disabled = false,
	empty = "No results",
}: ComboboxProps) {
	const theme = useThemeTokens();
	const [open, setOpen] = useState(false);
	const selected = options.find((option) => option.value === value);
	let label = placeholder;
	let labelColor = theme.colors.textDisabled;
	if (selected) {
		label = selected.label;
		labelColor = theme.colors.text;
	}

	return (
		<Popover.Root
			open={open}
			onOpenChange={(next) => {
				if (disabled) return;
				setOpen(next);
			}}
		>
			<Popover.Trigger disabled={disabled} style={styles.trigger}>
				<View
					style={[
						styles.field,
						{
							borderColor: theme.colors.border,
							borderRadius: theme.radius.lg,
							backgroundColor: theme.colors.surface,
							opacity: disabled ? 0.56 : 1,
						},
					]}
				>
					<Text variant="body" color={labelColor} numberOfLines={1} style={styles.label}>
						{label}
					</Text>
					<Icon name="ChevronDown" size={18} color={theme.colors.textMuted} />
				</View>
			</Popover.Trigger>
			<Popover.Content>
				<Command
					options={options}
					placeholder={searchPlaceholder}
					empty={empty}
					onSelect={(next) => {
						onChange(next);
						setOpen(false);
					}}
				/>
			</Popover.Content>
		</Popover.Root>
	);
}

const styles = StyleSheet.create({
	trigger: {
		width: "100%",
	},
	field: {
		minHeight: 48,
		borderWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: 12,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	label: {
		flex: 1,
		minWidth: 0,
	},
});
