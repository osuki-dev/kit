import React, { forwardRef, useCallback, useState, type ReactNode } from "react";
import {
	StyleSheet,
	TextInput,
	View,
	type StyleProp,
	type TextInputInstance,
	type TextInputProps,
	type TextStyle,
	type ViewStyle,
} from "react-native";
import { Text } from "../components/text";
import { resolveFontStyle, useThemeTokens } from "../theme";
import { styleFontWeight } from "./font-weight";

/**
 * Internal field used by Input, SearchInput, and PromptInput.
 *
 * The platform draws a TextInput placeholder with the view typeface, which
 * ignores a custom font on some Android devices. The native hint stays
 * transparent for the screen reader. The visible hint is Text.
 */

const PLACEHOLDER_LINE_RATIO = 1.35;

const PLACEMENT_KEYS = [
	"flex",
	"flexGrow",
	"flexShrink",
	"flexBasis",
	"alignSelf",
	"width",
	"minWidth",
	"maxWidth",
	"margin",
	"marginTop",
	"marginRight",
	"marginBottom",
	"marginLeft",
	"marginHorizontal",
	"marginVertical",
	"marginStart",
	"marginEnd",
	"position",
	"top",
	"right",
	"bottom",
	"left",
	"zIndex",
] as const;

const TYPE_KEYS = [
	"fontFamily",
	"fontSize",
	"fontStyle",
	"fontWeight",
	"fontVariationSettings",
	"letterSpacing",
	"lineHeight",
	"textAlign",
	"includeFontPadding",
	"padding",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft",
	"paddingHorizontal",
	"paddingVertical",
	"paddingStart",
	"paddingEnd",
	"borderWidth",
	"borderTopWidth",
	"borderLeftWidth",
	"borderRightWidth",
	"borderBottomWidth",
] as const;

type Loose = Record<string, unknown>;

/** The three styles one field style becomes. */
export function splitFieldStyle(style: TextInputProps["style"]): {
	wrapper: ViewStyle;
	input: TextStyle;
	placeholder: TextStyle;
} {
	const flat = (StyleSheet.flatten(style) ?? {}) as Loose;
	const wrapper: Loose = {};
	const input: Loose = { ...flat };
	const placeholder: Loose = {};
	for (const key of PLACEMENT_KEYS) {
		if (flat[key] === undefined) continue;
		wrapper[key] = flat[key];
		delete input[key];
	}
	if (wrapper.flex !== undefined || wrapper.flexGrow !== undefined) input.flexGrow = 1;
	for (const key of TYPE_KEYS) {
		if (flat[key] === undefined) continue;
		placeholder[key] = flat[key];
	}
	if (Object.keys(placeholder).some((key) => key.startsWith("border"))) {
		placeholder.borderColor = "transparent";
	}
	return {
		wrapper: wrapper as ViewStyle,
		input: input as TextStyle,
		placeholder: placeholder as TextStyle,
	};
}

export const TextField: React.ForwardRefExoticComponent<
	TextInputProps & React.RefAttributes<TextInputInstance>
> = forwardRef<TextInputInstance, TextInputProps>(function TextField(
	{
		style,
		placeholder,
		placeholderTextColor,
		value,
		defaultValue,
		onChangeText,
		onFocus,
		onBlur,
		multiline,
		children,
		...rest
	},
	ref,
) {
	const { colors, fonts, typeStyles } = useThemeTokens();
	const [typed, setTyped] = useState(defaultValue ?? "");
	const handleChangeText = useCallback(
		(next: string) => {
			setTyped(next);
			onChangeText?.(next);
		},
		[onChangeText],
	);
	const currentValue = value ?? typed;
	const empty = currentValue.length === 0;
	// A field whose style names no family is set in the theme's body face, at
	// the style's weight, through the same resolution as `Text`. The system face
	// is left to the style, which already says everything it needs.
	const flat = StyleSheet.flatten(style) ?? undefined;
	let fieldStyle: TextInputProps["style"] = style;
	if (flat?.fontFamily === undefined) {
		const face = resolveFontStyle(
			fonts,
			typeStyles.body.fontFamily,
			styleFontWeight(flat?.fontWeight) ?? "regular",
			{ fontSize: flat?.fontSize ?? typeStyles.body.fontSize },
		);
		if (face.fontFamily !== undefined) fieldStyle = [style, face];
	}
	const parts = splitFieldStyle(fieldStyle);

	let fieldSize = 16;
	if (typeof parts.placeholder.fontSize === "number") fieldSize = parts.placeholder.fontSize;
	let lineHeight = Math.ceil(fieldSize * PLACEHOLDER_LINE_RATIO);
	if (typeof parts.placeholder.lineHeight === "number") {
		lineHeight = parts.placeholder.lineHeight;
	}
	const placeholderStyle = { ...parts.placeholder, lineHeight };

	let hintColor = colors.textSubtle;
	if (typeof placeholderTextColor === "string") hintColor = placeholderTextColor;

	let wrapperStyle: StyleProp<ViewStyle> = parts.wrapper;
	let overlayAlign: ViewStyle = styles.centre;
	if (!multiline) {
		wrapperStyle = [parts.wrapper, { minHeight: lineHeight, justifyContent: "center" }];
	} else {
		overlayAlign = styles.top;
	}

	let hint: ReactNode = null;
	if (empty && placeholder) {
		hint = (
			<Text
				accessible={false}
				importantForAccessibility="no"
				variant="body"
				color={hintColor}
				style={[styles.placeholder, placeholderStyle]}
			>
				{placeholder}
			</Text>
		);
	}

	return (
		<View style={wrapperStyle}>
			<TextInput
				ref={ref}
				{...rest}
				multiline={multiline}
				value={value}
				defaultValue={defaultValue}
				onChangeText={handleChangeText}
				onFocus={onFocus}
				onBlur={onBlur}
				placeholder={placeholder}
				placeholderTextColor="transparent"
				style={parts.input}
			>
				{children}
			</TextInput>
			<View pointerEvents="none" style={[StyleSheet.absoluteFill, overlayAlign, styles.caretGap]}>
				{hint}
			</View>
		</View>
	);
});

const styles = StyleSheet.create({
	top: { justifyContent: "flex-start" },
	centre: { justifyContent: "center" },
	placeholder: { alignSelf: "stretch" },
	caretGap: { paddingLeft: 3 },
});
