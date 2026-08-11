import React from "react";
import {
	KeyboardAvoidingView as RNKeyboardAvoidingView,
	type KeyboardAvoidingViewProps as RNKeyboardAvoidingViewProps,
} from "react-native-keyboard-controller";

export type KeyboardAvoidingViewProps = RNKeyboardAvoidingViewProps;

/**
 * Keyboard-avoiding view component
 *
 * Automatically adjusts view position when keyboard appears.
 * Part of the Osuki Design System keyboard integration.
 *
 * Default props:
 * - behavior: "padding" (iOS only, no-op on Android)
 *
 * @example
 * ```tsx
 * <KeyboardAvoidingView>
 *   <MessageInput />
 * </KeyboardAvoidingView>
 * ```
 */
export const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = ({
	children,
	behavior = "padding",
	...props
}) => {
	return (
		<RNKeyboardAvoidingView behavior={behavior} {...props}>
			{children}
		</RNKeyboardAvoidingView>
	);
};
