import React from "react";
import {
	KeyboardStickyView as RNKeyboardStickyView,
	type KeyboardStickyViewProps as RNKeyboardStickyViewProps,
} from "react-native-keyboard-controller";

export type KeyboardStickyViewProps = RNKeyboardStickyViewProps;

/**
 * Keyboard-sticky view component
 *
 * Keeps content sticky to the keyboard as it appears/disappears.
 * Part of the Osuki Design System keyboard integration.
 *
 * @example
 * ```tsx
 * <KeyboardStickyView>
 *   <ActionButtons />
 * </KeyboardStickyView>
 * ```
 */
export const KeyboardStickyView: React.FC<KeyboardStickyViewProps> = ({ children, ...props }) => {
	return <RNKeyboardStickyView {...props}>{children}</RNKeyboardStickyView>;
};
