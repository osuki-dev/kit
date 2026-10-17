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
 * The bare field under Input, SearchInput, Textarea, PromptInput, InputGroup
 * and Command, exported so an app can build its own field with a drawn
 * placeholder.
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

/**
 * A React Native `TextInput`'s props, plus `shortPlaceholder`. `children` are
 * the value's runs (nested `Text`, for highlighted spans); `placeholderTextColor`
 * colours the drawn placeholder, `colors.textSubtle` by default.
 */
export type TextFieldProps = TextInputProps & {
	/**
	 * Shown instead of `placeholder` when the full placeholder would wrap at the
	 * field's width, so an empty field stays one line high.
	 */
	shortPlaceholder?: string;
};

/** Whether a placeholder wrapped when last measured, by its text. */
const lastWrap = new Map<string, boolean>();

/**
 * `style` set in the theme's body face at the style's size and weight, through
 * the same resolution as `Text`, when it names no family. For the kit's own
 * fields; `TextField` itself leaves an unnamed family to the platform.
 */
export function useBodyFaceStyle(style: TextInputProps["style"]): TextInputProps["style"] {
	const { fonts, typeStyles } = useThemeTokens();
	const flat = StyleSheet.flatten(style) ?? undefined;
	if (flat?.fontFamily !== undefined) return style;
	const face = resolveFontStyle(
		fonts,
		typeStyles.body.fontFamily,
		styleFontWeight(flat?.fontWeight) ?? "regular",
		{ fontSize: flat?.fontSize ?? typeStyles.body.fontSize },
	);
	return face.fontFamily === undefined ? style : [style, face];
}

/**
 * A `TextInput` with its placeholder drawn by `Text`, in the style's family
 * when it names one. Placement styles (flex, margins, width, position) go on a
 * wrapper; everything else on the input. It brings no chrome: no fill,
 * border, label or error.
 *
 * With `children` (the value drawn as spans) `value` is not passed to the
 * native input, which refuses both; it still decides whether the field is
 * empty.
 */
export const TextField: React.ForwardRefExoticComponent<
	TextFieldProps & React.RefAttributes<TextInputInstance>
> = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
	{
		style,
		placeholder: fullPlaceholder,
		shortPlaceholder,
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
	const { colors, typeStyles } = useThemeTokens();
	const [typed, setTyped] = useState(defaultValue ?? "");
	const handleChangeText = useCallback(
		(next: string) => {
			setTyped(next);
			onChangeText?.(next);
		},
		[onChangeText],
	);
	const empty = (value ?? typed).length === 0;
	// Whether the full placeholder wraps, measured by an invisible copy laid out
	// as the visible one is. The copy always holds the full text, so switching
	// to the short one cannot switch it back. Seeded from the last measure of
	// the same text, so a remounted field does not show the long text first.
	const [placeholderWraps, setPlaceholderWraps] = useState(
		() => (fullPlaceholder !== undefined && lastWrap.get(fullPlaceholder)) || false,
	);
	const probing = Boolean(shortPlaceholder && fullPlaceholder && empty);
	const placeholder = probing && placeholderWraps ? shortPlaceholder : fullPlaceholder;
	// The family is the style's: one that names none is left to the platform.
	const parts = splitFieldStyle(style);

	// The placeholder line follows the field's own size, or the body size the
	// drawn placeholder falls back to.
	let fieldSize = typeStyles.body.fontSize;
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

	let probe: ReactNode = null;
	if (probing) {
		probe = (
			<View
				pointerEvents="none"
				accessible={false}
				importantForAccessibility="no-hide-descendants"
				style={[StyleSheet.absoluteFill, styles.top, styles.caretGap, styles.probe]}
			>
				<Text
					accessible={false}
					variant="body"
					color="transparent"
					style={[styles.placeholder, placeholderStyle]}
					onTextLayout={(event) => {
						const wraps = event.nativeEvent.lines.length > 1;
						if (fullPlaceholder) lastWrap.set(fullPlaceholder, wraps);
						setPlaceholderWraps(wraps);
					}}
				>
					{fullPlaceholder}
				</Text>
			</View>
		);
	}

	// React Native refuses `value` together with `children`; the runs are the
	// value then, and `value` only decides whether the field is empty.
	const valueProps = children === undefined ? { value } : undefined;

	return (
		<View style={wrapperStyle}>
			<TextInput
				ref={ref}
				{...rest}
				multiline={multiline}
				{...valueProps}
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
			{probe}
		</View>
	);
});

const styles = StyleSheet.create({
	top: { justifyContent: "flex-start" },
	centre: { justifyContent: "center" },
	placeholder: { alignSelf: "stretch" },
	caretGap: { paddingLeft: 3 },
	probe: { opacity: 0 },
});

/**
 * `TextField` set in the theme's body face when its style names no family:
 * what the kit's own fields are built on. Not exported from the package.
 */
export const BodyTextField: React.ForwardRefExoticComponent<
	TextFieldProps & React.RefAttributes<TextInputInstance>
> = forwardRef<TextInputInstance, TextFieldProps>(function BodyTextField({ style, ...props }, ref) {
	return <TextField ref={ref} {...props} style={useBodyFaceStyle(style)} />;
});
