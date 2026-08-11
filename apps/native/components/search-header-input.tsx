import { useCallback, useRef } from "react";
import {
	Pressable,
	StyleSheet,
	TextInput,
	View,
	type TextInput as TextInputRef,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { Icon, resolveFontStyle, useTheme } from "@osuki-dev/ui";
import { headerChrome } from "@/components/header-chrome";

export function SearchHeaderInput({
	value,
	onChangeText,
	onSubmit,
	onClear,
}: {
	value: string;
	onChangeText: (value: string) => void;
	onSubmit: () => void;
	onClear: () => void;
}) {
	const { colors, fonts, mode, shadow, typeStyles } = useTheme();
	const inputRef = useRef<TextInputRef>(null);

	useFocusEffect(
		useCallback(() => {
			let frame = 0;
			const timer = setTimeout(() => {
				frame = requestAnimationFrame(() => inputRef.current?.focus());
			}, 80);

			return () => {
				clearTimeout(timer);
				if (frame) {
					cancelAnimationFrame(frame);
				}
			};
		}, []),
	);

	return (
		<View
			style={[
				styles.root,
				{
					backgroundColor: colors.surface,
					...(mode === "light" ? shadow.pill : {}),
				},
			]}
			testID="search-header-input"
		>
			<Icon name="Search" size={17} color={colors.primary} />
			<TextInput
				ref={inputRef}
				testID="search-header-input-control"
				value={value}
				onChangeText={onChangeText}
				onSubmitEditing={onSubmit}
				placeholder="Search"
				placeholderTextColor={colors.textDisabled}
				autoFocus
				returnKeyType="search"
				style={[
					styles.input,
					{
						color: colors.text,
						...resolveFontStyle(fonts, typeStyles.body.fontFamily, "regular"),
					},
				]}
			/>
			{value.length > 0 ? (
				<Pressable
					onPress={onClear}
					style={({ pressed }) => [styles.clearButton, { opacity: pressed ? 0.62 : 1 }]}
					testID="search-header-clear"
					accessibilityRole="button"
					accessibilityLabel="Clear search"
					hitSlop={8}
				>
					<Icon name="X" size={15} color={colors.textMuted} />
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		height: headerChrome.pillHeight,
		width: headerChrome.searchWidth,
		maxWidth: headerChrome.searchMaxWidth,
		marginLeft: 0,
		borderRadius: 999,
		paddingLeft: headerChrome.searchPaddingLeft,
		paddingRight: headerChrome.searchPaddingRight,
		flexDirection: "row",
		alignItems: "center",
		gap: 7,
	},
	input: {
		flex: 1,
		minWidth: 0,
		fontSize: 16,
		lineHeight: 20,
		padding: 0,
		paddingVertical: 0,
		includeFontPadding: false,
		textAlignVertical: "center",
	},
	clearButton: {
		width: 26,
		height: 26,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
});
