import React, { useMemo, useState } from "react";
import { ScrollView, View, type ViewProps, type ViewStyle } from "react-native";
import { useResolvedSurfaceFill, useThemeTokens } from "../theme";
import { Sheet } from "./bottom-sheet";
import { FieldGroup } from "./field-group";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";
import { SheetListItem } from "./sheet-list-item";

export interface SelectOption {
	label: string;
	value: string;
	description?: string;
	disabled?: boolean;
}

export interface SelectProps extends Omit<ViewProps, "style" | "children"> {
	options: SelectOption[];
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	description?: string;
	placeholder?: string;
	helper?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	sheetTitle?: string;
	closeLabel?: string;
	style?: ViewStyle;
}

const SelectView: React.FC<SelectProps> = ({
	options,
	value,
	onChange,
	label,
	description,
	placeholder = "Select...",
	helper,
	error,
	required = false,
	disabled = false,
	sheetTitle,
	closeLabel,
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const triggerFill = useResolvedSurfaceFill(theme.colors.surface, {
		slot: "selects.trigger",
		baseColor: theme.colors.surface,
	});
	const haptics = useHaptics();
	const [open, setOpen] = useState(false);
	const selectedOption = options.find((option) => option.value === value);

	const triggerStyle = useMemo<ViewStyle>(
		() => ({
			minHeight: 48,
			width: "100%",
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderWidth: 1,
			borderRadius: theme.radius.lg,
			borderColor: error ? theme.colors.danger : theme.colors.border,
			backgroundColor: triggerFill,
			opacity: disabled ? 0.56 : 1,
		}),
		[
			triggerFill,
			disabled,
			error,
			theme.colors.border,
			theme.colors.danger,
			theme.colors.surface,
			theme.radius.lg,
			theme.spacing.md,
			theme.spacing.sm,
		],
	);

	const handleOpen = () => {
		if (disabled) return;
		haptics.feedback("selection");
	};

	const handleSelect = (option: SelectOption) => {
		if (option.disabled) return;
		onChange(option.value);
		setOpen(false);
	};

	return (
		<Sheet.Root open={open} onOpenChange={setOpen} disabled={disabled}>
			<FieldGroup
				label={label}
				description={description}
				helper={helper}
				error={error}
				required={required}
				disabled={disabled}
				style={style}
				testID={testID}
				{...props}
			>
				<Sheet.Trigger
					accessibilityLabel={label ?? placeholder}
					disabled={disabled}
					onPress={handleOpen}
					style={triggerStyle}
					testID={testID ? `${testID}-trigger` : undefined}
				>
					<View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
						<Text
							variant="body"
							colorKey={selectedOption ? "text" : "textDisabled"}
							numberOfLines={1}
						>
							{selectedOption?.label ?? placeholder}
						</Text>
						{selectedOption?.description && (
							<Text variant="caption" colorKey="textMuted" numberOfLines={1}>
								{selectedOption.description}
							</Text>
						)}
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
								testID={testID ? `${testID}-options` : undefined}
							>
								{options.map((option) => (
									<SelectItem
										key={option.value}
										option={option}
										selected={option.value === value}
										onPress={() => handleSelect(option)}
										testID={testID ? `${testID}-option-${option.value}` : undefined}
									/>
								))}
							</View>
						</ScrollView>
					</Sheet.Body>
				</Sheet.Content>
			</FieldGroup>
		</Sheet.Root>
	);
};

export function SelectItem({
	option,
	selected,
	onPress,
	testID,
}: {
	option: SelectOption;
	selected: boolean;
	onPress: () => void;
	testID?: string;
}) {
	return (
		<SheetListItem
			label={option.label}
			description={option.description}
			selected={selected}
			disabled={option.disabled}
			onPress={onPress}
			testID={testID}
		/>
	);
}

export const Select = Object.assign(SelectView, {
	Root: SelectView,
	Item: SelectItem,
});
