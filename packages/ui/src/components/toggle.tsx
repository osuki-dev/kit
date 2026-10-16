import React, { createContext, useContext, useMemo } from "react";
import { Switch, View, type ViewProps, type ViewStyle } from "react-native";
import { useResolvedSurfaceFill, useThemeTokens } from "../theme";
import { useHaptics } from "./haptics";

export interface ToggleState {
	value: boolean;
}

export interface ToggleActions {
	setValue: (value: boolean) => void;
}

export interface ToggleMeta {
	disabled: boolean;
}

export interface ToggleContextValue {
	state: ToggleState;
	actions: ToggleActions;
	meta: ToggleMeta;
}

const ToggleContext = createContext<ToggleContextValue | null>(null);

export function useToggle(): ToggleContextValue {
	const context = useContext(ToggleContext);
	if (!context) throw new Error("Toggle parts must be used within Toggle.Root");
	return context;
}

export interface ToggleRootProps extends Omit<ViewProps, "style" | "children"> {
	value: boolean;
	onValueChange: (value: boolean) => void;
	disabled?: boolean;
	style?: ViewStyle;
	children?: React.ReactNode;
}

export function ToggleRoot({
	value,
	onValueChange,
	disabled = false,
	style,
	testID,
	children,
	...props
}: ToggleRootProps) {
	const haptics = useHaptics();
	const setValue = React.useCallback(
		(next: boolean) => {
			haptics.feedback(next ? "success" : "selection");
			onValueChange(next);
		},
		[haptics, onValueChange],
	);
	const context = useMemo<ToggleContextValue>(
		() => ({
			state: { value },
			actions: { setValue },
			meta: { disabled },
		}),
		[disabled, setValue, value],
	);
	return (
		<ToggleContext.Provider value={context}>
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
				{children ?? <ToggleControl testID={testID} />}
			</View>
		</ToggleContext.Provider>
	);
}

export function ToggleControl({ testID }: { testID?: string }) {
	const { colors } = useThemeTokens();
	const { state, actions, meta } = useToggle();
	const off = useResolvedSurfaceFill(colors.surfaceRaised, {
		slot: "toggles.track",
		variant: "off",
		baseColor: colors.surfaceRaised,
	});
	const on = useResolvedSurfaceFill(colors.primary, {
		slot: "toggles.track",
		variant: "on",
		baseColor: colors.primary,
		selected: true,
	});
	return (
		<Switch
			value={state.value}
			onValueChange={actions.setValue}
			disabled={meta.disabled}
			testID={testID}
			trackColor={{ false: off, true: on }}
			thumbColor={colors.onPrimary}
			ios_backgroundColor={off}
		/>
	);
}

export interface ToggleProps extends Omit<ToggleRootProps, "children"> {}

export const Toggle = Object.assign(ToggleRoot, {
	Root: ToggleRoot,
	Control: ToggleControl,
});
