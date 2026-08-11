import React, { useMemo } from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export interface RadioGroupOption {
	label: string;
	value: string;
	description?: string;
	disabled?: boolean;
}

export interface RadioGroupProps extends Omit<ViewProps, "style" | "children"> {
	options: RadioGroupOption[];
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	error?: string;
	direction?: "vertical" | "horizontal";
	size?: "default" | "compact";
	style?: ViewStyle;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
	options,
	value,
	onChange,
	label,
	error,
	direction = "vertical",
	size = "default",
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const containerStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			gap: theme.spacing.sm,
		}),
		[theme.spacing.sm],
	);
	const optionListStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: direction === "horizontal" ? "row" : "column",
			flexWrap: direction === "horizontal" ? "wrap" : "nowrap",
			gap: theme.spacing.sm,
		}),
		[direction, theme.spacing.sm],
	);

	return (
		<View style={[containerStyle, style]} testID={testID} {...props}>
			{label && (
				<Text variant="label" colorKey="textMuted">
					{label}
				</Text>
			)}
			<View accessibilityRole="radiogroup" style={optionListStyle}>
				{options.map((option) => (
					<RadioOption
						key={option.value}
						option={option}
						selected={option.value === value}
						onSelect={onChange}
						size={size}
						testID={testID ? `${testID}-option-${option.value}` : undefined}
					/>
				))}
			</View>
			{error && (
				<Text variant="caption" colorKey="danger">
					{error}
				</Text>
			)}
		</View>
	);
};

interface RadioOptionProps {
	option: RadioGroupOption;
	selected: boolean;
	onSelect: (value: string) => void;
	size: "default" | "compact";
	testID?: string;
}

const RadioOption: React.FC<RadioOptionProps> = ({ option, selected, onSelect, size, testID }) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const disabled = option.disabled === true;
	const minHeight = size === "compact" ? 44 : 56;
	const dotSize = selected ? 10 : 0;

	const itemStyle = useMemo<ViewStyle>(
		() => ({
			minHeight,
			flex: 1,
			minWidth: 160,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: size === "compact" ? theme.spacing.xs : theme.spacing.sm,
			borderRadius: theme.radius.lg,
			borderWidth: 1,
			borderColor: selected ? theme.colors.primary : theme.colors.border,
			backgroundColor: selected ? theme.colors.primarySubtle : theme.colors.surfaceRaised,
			opacity: disabled ? 0.48 : 1,
		}),
		[
			disabled,
			minHeight,
			selected,
			size,
			theme.colors.border,
			theme.colors.primary,
			theme.colors.primarySubtle,
			theme.colors.surfaceRaised,
			theme.radius.lg,
			theme.spacing.md,
			theme.spacing.sm,
			theme.spacing.xs,
		],
	);

	const handlePress = () => {
		if (disabled) return;
		haptics.feedback("selection");
		onSelect(option.value);
	};

	return (
		<Pressable
			accessibilityRole="radio"
			accessibilityState={{ checked: selected, disabled }}
			disabled={disabled}
			onPress={handlePress}
			style={itemStyle}
			testID={testID}
		>
			<View
				style={{
					width: 22,
					height: 22,
					borderRadius: 11,
					borderWidth: 1.5,
					borderColor: selected ? theme.colors.primary : theme.colors.borderStrong,
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
				}}
			>
				<View
					style={{
						width: dotSize,
						height: dotSize,
						borderRadius: dotSize / 2,
						backgroundColor: theme.colors.primary,
					}}
				/>
			</View>
			<View style={{ flex: 1, minWidth: 0, gap: 2 }}>
				<Text variant={size === "compact" ? "bodySmall" : "body"} colorKey="text">
					{option.label}
				</Text>
				{option.description && (
					<Text variant="caption" colorKey="textMuted">
						{option.description}
					</Text>
				)}
			</View>
			{selected && <Icon name="Check" size={16} color={theme.colors.primary} />}
		</Pressable>
	);
};
