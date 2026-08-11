import React, { useMemo, useState } from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { BottomSheet } from "./bottom-sheet";
import { Button } from "./button";
import { FieldGroup } from "./field-group";
import { Icon } from "./icon";
import { Input, type InputVariant } from "./input";
import { Text } from "./text";

export type DateInputMode = "date" | "time" | "datetime";

export interface DateInputProps extends Omit<ViewProps, "style" | "children"> {
	mode?: DateInputMode;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	description?: string;
	placeholder?: string;
	helper?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	variant?: InputVariant;
	sheetTitle?: string;
	applyLabel?: string;
	clearLabel?: string;
	todayLabel?: string;
	nowLabel?: string;
	closeLabel?: string;
	style?: ViewStyle;
}

const pad2 = (value: number) => String(value).padStart(2, "0");

function formatDateValue(mode: DateInputMode, date = new Date()) {
	const year = date.getFullYear();
	const month = pad2(date.getMonth() + 1);
	const day = pad2(date.getDate());
	const hours = pad2(date.getHours());
	const minutes = pad2(date.getMinutes());

	if (mode === "time") return `${hours}:${minutes}`;
	if (mode === "datetime") return `${year}-${month}-${day} ${hours}:${minutes}`;
	return `${year}-${month}-${day}`;
}

function getPlaceholder(mode: DateInputMode) {
	if (mode === "time") return "HH:MM";
	if (mode === "datetime") return "YYYY-MM-DD HH:MM";
	return "YYYY-MM-DD";
}

function getIconName(mode: DateInputMode) {
	return mode === "time" ? "Clock" : "Calendar";
}

function getKeyboardType(mode: DateInputMode) {
	return mode === "datetime" ? "default" : "numbers-and-punctuation";
}

export const DateInput: React.FC<DateInputProps> = ({
	mode = "date",
	value = "",
	onChange,
	label,
	description,
	placeholder,
	helper,
	error,
	required = false,
	disabled = false,
	variant = "outline",
	sheetTitle,
	applyLabel = "Apply",
	clearLabel = "Clear",
	todayLabel = "Today",
	nowLabel = "Now",
	closeLabel,
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(value);
	const resolvedPlaceholder = placeholder ?? getPlaceholder(mode);
	const iconName = getIconName(mode);

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
			backgroundColor: theme.colors.surface,
			opacity: disabled ? 0.56 : 1,
		}),
		[
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

	const openSheet = () => {
		if (disabled) return;
		setDraft(value);
		setOpen(true);
	};

	const applyDraft = () => {
		onChange(draft.trim());
		setOpen(false);
	};

	const clearValue = () => {
		setDraft("");
		onChange("");
		setOpen(false);
	};

	const setCurrentValue = () => {
		setDraft(formatDateValue(mode));
	};

	return (
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
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={label ?? resolvedPlaceholder}
				accessibilityState={{ expanded: open, disabled }}
				disabled={disabled}
				onPress={openSheet}
				style={triggerStyle}
				testID={testID ? `${testID}-trigger` : undefined}
			>
				<Icon name={iconName} size={18} color={theme.colors.textMuted} />
				<View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
					<Text variant="body" colorKey={value ? "text" : "textDisabled"} numberOfLines={1}>
						{value || resolvedPlaceholder}
					</Text>
				</View>
				<Icon name="ChevronDown" size={18} color={theme.colors.textMuted} />
			</Pressable>

			<BottomSheet
				visible={open}
				onClose={() => setOpen(false)}
				title={sheetTitle ?? label}
				closeLabel={closeLabel}
			>
				<View style={{ gap: theme.spacing.md }}>
					<Input
						testID={testID ? `${testID}-input` : undefined}
						label={label}
						variant={variant}
						value={draft}
						onChangeText={setDraft}
						placeholder={resolvedPlaceholder}
						keyboardType={getKeyboardType(mode)}
						autoCapitalize="none"
						autoCorrect={false}
					/>
					<View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
						<Button
							variant="secondary"
							onPress={setCurrentValue}
							testID={testID ? `${testID}-current` : undefined}
							style={{ flex: 1 }}
						>
							{mode === "date" ? todayLabel : nowLabel}
						</Button>
						<Button
							variant="secondary"
							onPress={clearValue}
							testID={testID ? `${testID}-clear` : undefined}
							style={{ flex: 1 }}
						>
							{clearLabel}
						</Button>
					</View>
					<Button
						variant="primary"
						onPress={applyDraft}
						testID={testID ? `${testID}-apply` : undefined}
					>
						{applyLabel}
					</Button>
				</View>
			</BottomSheet>
		</FieldGroup>
	);
};
