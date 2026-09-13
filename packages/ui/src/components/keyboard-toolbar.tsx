import React from "react";
import {
	KeyboardToolbar as RNKeyboardToolbar,
	type KeyboardToolbarProps as RNKeyboardToolbarProps,
} from "react-native-keyboard-controller";
import { useThemeTokens, type Colors } from "../theme";

export interface KeyboardToolbarProps extends RNKeyboardToolbarProps {
	/**
	 * Replaces the toolbar fill, which is otherwise the `surfaceRaised` token.
	 * Applied to both the light and the dark entry of the resolved theme and
	 * merged last, so it also wins over an explicitly supplied `theme`.
	 *
	 * The underlying `react-native-keyboard-controller` toolbar accepts no
	 * `style`, so this is the fill hook the other primitives get from
	 * `style.backgroundColor`. Intended for a single app-wide surface treatment
	 * -- a user-controlled background opacity over theme artwork, for instance.
	 */
	backgroundColor?: string;
}

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
 * - `backgroundColor` overrides the fill without restating the whole theme
 *
 * @example
 * ```tsx
 * <KeyboardToolbar
 *   doneText="DONE"
 * />
 *
 * // One app-wide surface treatment, applied where the toolbar is mounted
 * <KeyboardToolbar backgroundColor={translucentSurface} />
 * ```
 */
export const KeyboardToolbar: React.FC<KeyboardToolbarProps> = ({
	children,
	theme,
	backgroundColor,
	...props
}) => {
	const { colors } = useThemeTokens();

	// Use custom theme if provided, otherwise use Osuki design system colors
	const baseTheme = theme ?? createToolbarTheme(colors);
	const toolbarTheme =
		backgroundColor === undefined
			? baseTheme
			: {
					light: { ...baseTheme.light, background: backgroundColor },
					dark: { ...baseTheme.dark, background: backgroundColor },
				};

	return (
		<RNKeyboardToolbar theme={toolbarTheme} {...props}>
			{children}
		</RNKeyboardToolbar>
	);
};
