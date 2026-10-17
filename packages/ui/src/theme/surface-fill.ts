import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

/** A string fill a caller put on `style`. Non-string fills stay on the style. */
export function readStringFill(style: StyleProp<ViewStyle> | undefined): string | undefined {
	const flat = StyleSheet.flatten(style);
	return typeof flat?.backgroundColor === "string" ? flat.backgroundColor : undefined;
}

/**
 * Removes a string `backgroundColor` so the decorator can paint that fill once.
 * Layout, radius, and any non-string fill stay put.
 */
export function withoutStringFill(style: StyleProp<ViewStyle> | undefined): ViewStyle | undefined {
	const flat = StyleSheet.flatten(style) ?? undefined;
	if (!flat || typeof flat.backgroundColor !== "string") return flat;
	const { backgroundColor: _fill, ...rest } = flat;
	return rest;
}
