import React from "react";
import {
	KeyboardAwareScrollView as RNKeyboardAwareScrollView,
	type KeyboardAwareScrollViewProps as RNKeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

export type KeyboardAwareScrollViewProps = RNKeyboardAwareScrollViewProps;

/**
 * Keyboard-aware scroll view component
 *
 * Automatically adjusts scroll view content when keyboard appears.
 * Part of the Osuki Design System keyboard integration.
 *
 * Default props:
 * - bottomOffset: 50
 * - extraKeyboardSpace: 20
 *
 * @example
 * ```tsx
 * <KeyboardAwareScrollView>
 *   <FormContent />
 * </KeyboardAwareScrollView>
 * ```
 */
export const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
	children,
	bottomOffset = 50,
	extraKeyboardSpace = 20,
	...props
}) => {
	return (
		<RNKeyboardAwareScrollView
			bottomOffset={bottomOffset}
			extraKeyboardSpace={extraKeyboardSpace}
			{...props}
		>
			{children}
		</RNKeyboardAwareScrollView>
	);
};
