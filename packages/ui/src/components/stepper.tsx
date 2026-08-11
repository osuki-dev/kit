import React, { useMemo } from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export interface StepperProps extends Omit<ViewProps, "children"> {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	label?: string;
	disabled?: boolean;
	decrementLabel?: string;
	incrementLabel?: string;
	formatValue?: (value: number) => string;
}

export const Stepper: React.FC<StepperProps> = ({
	value,
	onChange,
	min = Number.NEGATIVE_INFINITY,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	label,
	disabled = false,
	decrementLabel = "Decrease",
	incrementLabel = "Increase",
	formatValue,
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const canDecrement = !disabled && value - step >= min;
	const canIncrement = !disabled && value + step <= max;
	const displayValue = formatValue ? formatValue(value) : String(value);

	const containerStyle = useMemo<ViewStyle>(
		() => ({ width: "100%", gap: theme.spacing.sm }),
		[theme.spacing.sm],
	);

	const commit = (nextValue: number) => {
		const clamped = Math.min(Math.max(nextValue, min), max);
		haptics.feedback("selection");
		onChange(clamped);
	};

	return (
		<View style={[containerStyle, style]} testID={testID} {...props}>
			{label && (
				<Text variant="label" colorKey="textMuted">
					{label}
				</Text>
			)}
			<View
				style={{
					minHeight: 48,
					flexDirection: "row",
					alignItems: "center",
					borderRadius: theme.radius.pill,
					borderWidth: 1,
					borderColor: theme.colors.border,
					backgroundColor: theme.colors.surfaceRaised,
					overflow: "hidden",
				}}
			>
				<StepperButton
					icon="Minus"
					label={decrementLabel}
					disabled={!canDecrement}
					onPress={() => commit(value - step)}
					testID={testID ? `${testID}-decrement` : undefined}
				/>
				<View
					style={{
						flex: 1,
						minWidth: 64,
						alignItems: "center",
						justifyContent: "center",
						paddingHorizontal: theme.spacing.md,
					}}
				>
					<Text variant="body" colorKey={disabled ? "textDisabled" : "text"} numberOfLines={1}>
						{displayValue}
					</Text>
				</View>
				<StepperButton
					icon="Plus"
					label={incrementLabel}
					disabled={!canIncrement}
					onPress={() => commit(value + step)}
					testID={testID ? `${testID}-increment` : undefined}
				/>
			</View>
		</View>
	);
};

interface StepperButtonProps {
	icon: "Minus" | "Plus";
	label: string;
	disabled: boolean;
	onPress: () => void;
	testID?: string;
}

const StepperButton: React.FC<StepperButtonProps> = ({
	icon,
	label,
	disabled,
	onPress,
	testID,
}) => {
	const theme = useThemeTokens();

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onPress}
			style={{
				width: 48,
				minHeight: 48,
				alignItems: "center",
				justifyContent: "center",
				opacity: disabled ? 0.42 : 1,
			}}
			testID={testID}
		>
			<Icon name={icon} size={18} color={theme.colors.text} />
		</Pressable>
	);
};
