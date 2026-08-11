import React from "react";
import { Switch, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { useHaptics } from "./haptics";

export interface ToggleProps extends Omit<ViewProps, "style" | "children"> {
	/** Current state */
	value: boolean;
	/** Change callback */
	onValueChange: (value: boolean) => void;
	/** Disabled state */
	disabled?: boolean;
	/** Additional styles */
	style?: ViewStyle;
}

/**
 * Toggle/Switch component.
 * Uses the platform Switch with Osuki token colors so it keeps native motion
 * while following the active theme.
 *
 * @example
 * ```tsx
 * <Toggle value={enabled} onValueChange={setEnabled} />
 * <Toggle value={darkMode} onValueChange={toggleMode} />
 * ```
 */
export const Toggle: React.FC<ToggleProps> = ({
	value,
	onValueChange,
	disabled = false,
	style,
	testID,
	...props
}) => {
	const { colors } = useThemeTokens();
	const haptics = useHaptics();

	const handleValueChange = (nextValue: boolean) => {
		haptics.feedback(nextValue ? "success" : "selection");
		onValueChange(nextValue);
	};

	return (
		<View
			style={[
				{
					minWidth: 44,
					minHeight: 44,
					justifyContent: "center",
					alignItems: "center",
					opacity: disabled ? 0.5 : 1,
				},
				style,
			]}
			testID={testID ? `${testID}-container` : undefined}
			{...props}
		>
			<Switch
				value={value}
				onValueChange={handleValueChange}
				disabled={disabled}
				testID={testID}
				trackColor={{
					false: colors.surfaceRaised,
					true: colors.primary,
				}}
				thumbColor={colors.onPrimary}
				ios_backgroundColor={colors.surfaceRaised}
			/>
		</View>
	);
};
