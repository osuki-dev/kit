import React from "react";
import {
	KeyboardToolbar as RNKeyboardToolbar,
	type KeyboardToolbarProps as RNKeyboardToolbarProps,
} from "react-native-keyboard-controller";
import { useThemeTokens, type Colors } from "../theme";

export type KeyboardToolbarProps = RNKeyboardToolbarProps;

/**
 * Convert Osuki design system colors to KeyboardToolbar theme
 */
const createToolbarTheme = (colors: Colors) => ({
	light: {
		primary: colors.text,
		disabled: colors.textDisabled,
		background: colors.surfaceRaised,
		ripple: colors.textMuted,
	},
	dark: {
		primary: colors.text,
		disabled: colors.textDisabled,
		background: colors.surfaceRaised,
		ripple: colors.textMuted,
	},
});

/**
 * Keyboard toolbar component with Osuki Design System styling
 *
 * Provides previous/next/done buttons for navigating between form inputs.
 * Styled to match the active Osuki theme typography.
 *
 * Features:
 * - Previous/Next navigation buttons
 * - Done button to dismiss keyboard
 * - Osuki design system colors
 * - Proper dark/light mode support
 *
 * @example
 * ```tsx
 * <KeyboardToolbar
 *   doneText="DONE"
 * />
 * ```
 */
export const KeyboardToolbar: React.FC<KeyboardToolbarProps> = ({ children, theme, ...props }) => {
	const { colors } = useThemeTokens();

	// Use custom theme if provided, otherwise use Osuki design system colors
	const toolbarTheme = theme ?? createToolbarTheme(colors);

	return (
		<RNKeyboardToolbar theme={toolbarTheme} {...props}>
			{children}
		</RNKeyboardToolbar>
	);
};
