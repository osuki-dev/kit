import React, { useMemo, useRef } from "react";
import {
	Platform,
	Pressable,
	TextInput,
	View,
	type NativeSyntheticEvent,
	type TextInputKeyPressEventData,
	type TextInputProps,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { resolveFontStyle, useThemeTokens } from "../theme";
import { FieldGroup } from "./field-group";

export interface OtpInputProps
	extends
		Omit<ViewProps, "style" | "children" | "onBlur" | "onFocus">,
		Pick<
			TextInputProps,
			"autoFocus" | "keyboardType" | "secureTextEntry" | "textContentType" | "onBlur" | "onFocus"
		> {
	value?: string;
	length?: number;
	onChange: (value: string) => void;
	onComplete?: (value: string) => void;
	label?: string;
	description?: string;
	helper?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	style?: ViewStyle;
	cellStyle?: ViewStyle;
}

export const OtpInput: React.FC<OtpInputProps> = ({
	value = "",
	length = 6,
	onChange,
	onComplete,
	label,
	description,
	helper,
	error,
	required = false,
	disabled = false,
	autoFocus,
	keyboardType = "number-pad",
	secureTextEntry = false,
	textContentType = "oneTimeCode",
	onBlur,
	onFocus,
	style,
	cellStyle,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const inputs = useRef<Array<TextInput | null>>([]);
	const safeLength = Math.max(1, length);
	const digits = Array.from({ length: safeLength }, (_, index) => value[index] ?? "");
	const cellWidth = safeLength > 6 ? 42 : 48;

	const rowStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			flexWrap: "wrap",
		}),
		[theme.spacing.sm],
	);

	const updateAt = (index: number, nextText: string) => {
		const nextChunk = nextText.replace(/\s+/g, "");
		const chars = digits.slice();
		if (nextChunk.length > 1) {
			for (let offset = 0; offset < nextChunk.length && index + offset < safeLength; offset += 1) {
				chars[index + offset] = nextChunk[offset] ?? "";
			}
			const nextValue = chars.join("").slice(0, safeLength);
			onChange(nextValue);
			const nextFocusIndex = Math.min(index + nextChunk.length, safeLength - 1);
			inputs.current[nextFocusIndex]?.focus();
			if (nextValue.length === safeLength && chars.every(Boolean)) {
				onComplete?.(nextValue);
			}
			return;
		}

		const nextChar = nextChunk.slice(-1);
		chars[index] = nextChar;
		const nextValue = chars.join("").slice(0, safeLength);
		onChange(nextValue);
		if (nextChar && index < safeLength - 1) {
			inputs.current[index + 1]?.focus();
		}
		if (nextValue.length === safeLength && chars.every(Boolean)) {
			onComplete?.(nextValue);
		}
	};

	const handleKeyPress = (
		index: number,
		event: NativeSyntheticEvent<TextInputKeyPressEventData>,
	) => {
		if (event.nativeEvent.key !== "Backspace" || digits[index]) return;
		if (index > 0) inputs.current[index - 1]?.focus();
	};

	return (
		<FieldGroup
			label={label}
			description={description}
			helper={helper}
			error={error}
			required={required}
			disabled={disabled}
			style={style}
			testID={testID}
			{...props}
		>
			<View style={rowStyle}>
				{digits.map((digit, index) => (
					<Pressable
						key={index}
						accessibilityRole="button"
						accessibilityLabel={`${label ?? "Verification code"} digit ${index + 1}`}
						accessibilityState={{ disabled }}
						disabled={disabled}
						onPress={() => inputs.current[index]?.focus()}
						style={[
							{
								width: cellWidth,
								height: 52,
								alignItems: "center",
								justifyContent: "center",
								borderWidth: 1,
								borderRadius: theme.radius.lg,
								borderColor: error ? theme.colors.danger : theme.colors.border,
								backgroundColor: theme.colors.surface,
								opacity: disabled ? 0.56 : 1,
							},
							cellStyle,
						]}
						testID={testID ? `${testID}-cell-${index}` : undefined}
					>
						<TextInput
							ref={(node) => {
								inputs.current[index] = node;
							}}
							autoFocus={autoFocus && index === 0}
							editable={!disabled}
							keyboardType={keyboardType}
							maxLength={safeLength}
							onBlur={onBlur}
							onChangeText={(text) => updateAt(index, text)}
							onFocus={onFocus}
							onKeyPress={(event) => handleKeyPress(index, event)}
							secureTextEntry={secureTextEntry}
							selectTextOnFocus
							style={{
								width: "100%",
								height: "100%",
								color: theme.colors.text,
								...resolveFontStyle(theme.fonts, theme.typeStyles.label.fontFamily, "bold"),
								fontSize: 20,
								includeFontPadding: Platform.OS === "android" ? false : undefined,
								padding: 0,
								paddingVertical: 0,
								textAlign: "center",
								textAlignVertical: "center",
							}}
							testID={testID ? `${testID}-input-${index}` : undefined}
							textContentType={textContentType}
							value={digit}
						/>
					</Pressable>
				))}
			</View>
		</FieldGroup>
	);
};
