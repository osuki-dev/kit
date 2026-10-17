import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useResolvedSurfaceFill, useThemeTokens, type Colors } from "../theme";
import { Text } from "./text";

export type BadgeVariant = "default" | "primary" | "success" | "warning";

export interface BadgeProps {
	/** Badge content - number or text */
	children?: number | string;
	/** Visual variant */
	variant?: BadgeVariant;
	/** Label or compact dot presentation */
	display?: "label" | "dot";
	/** Additional container styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * Badge component for notifications and status indicators
 *
 * Osuki Design Rules:
 * - Pill-shaped (999px radius)
 * - Monospace caption text
 * - 4px 8px padding for text badges
 * - 8px diameter for dot badges
 * - Positioned absolute top-right by default
 *
 * @example
 * ```tsx
 * <Badge>3</Badge>
 * <Badge variant="primary">NEW</Badge>
 * <Badge display="dot" />
 * <Badge variant="success">99+</Badge>
 * ```
 */
export function BadgeRoot({
	children,
	variant = "default",
	display = "label",
	style,
	testID,
}: Omit<BadgeProps, "children"> & { children?: React.ReactNode }) {
	const { colors, radius } = useThemeTokens();
	const baseColor = badgeFill(colors, variant);
	const fill = useResolvedSurfaceFill(
		baseColor,
		React.useMemo(
			() => ({
				slot: "badges.background",
				role: "mark",
				variant,
				baseColor,
				borderRadius: radius.pill,
			}),
			[baseColor, radius.pill, variant],
		),
	);
	if (display === "dot") {
		return <View testID={testID} style={[styles.dot, { backgroundColor: fill }, style]} />;
	}
	return (
		<View testID={testID} style={[styles.label, { backgroundColor: fill }, style]}>
			{children}
		</View>
	);
}

export function BadgeLabel({ children }: { children?: BadgeProps["children"] }) {
	const { colors } = useThemeTokens();
	return (
		<Text
			variant="caption"
			color={colors.background}
			weight="bold"
			transform="uppercase"
			hugSlack={false}
		>
			{badgeLabel(children)}
		</Text>
	);
}

function BadgeFacade({ children, display = "label", ...props }: BadgeProps) {
	if (display === "dot") return <BadgeRoot display="dot" {...props} />;
	return (
		<BadgeRoot display="label" {...props}>
			<BadgeLabel>{children}</BadgeLabel>
		</BadgeRoot>
	);
}

export const Badge = Object.assign(BadgeFacade, {
	Root: BadgeRoot,
	Label: BadgeLabel,
});

function badgeFill(colors: Colors, variant: BadgeVariant) {
	if (variant === "primary") return colors.primary;
	if (variant === "success") return colors.success;
	if (variant === "warning") return colors.warning;
	return colors.text;
}

function badgeLabel(children: BadgeProps["children"]) {
	if (typeof children === "number") {
		if (children > 99) return "99+";
		return String(children);
	}
	if (typeof children === "string") return children;
	return "";
}

const styles = StyleSheet.create({
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	label: {
		alignSelf: "flex-start",
		maxWidth: "100%",
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 999,
		justifyContent: "center",
		alignItems: "center",
	},
});
