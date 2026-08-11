import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";

export type CardVariant = "default" | "raised" | "flat";
export type CardBorder = "none" | "subtle";

export interface CardProps extends ViewProps {
	variant?: CardVariant;
	border?: CardBorder;
	radius?: "none" | "xs" | "sm" | "md" | "lg";
	padding?: "none" | "xs" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
	variant = "default",
	border = "none",
	radius = "lg",
	padding = "md",
	style,
	children,
	...rest
}) => {
	const theme = useThemeTokens();
	const card = theme.components.Card;
	const variantTokens = card[variant];

	const cardStyles = useMemo<ViewStyle>(() => {
		const paddingToken = card.padding[padding];
		const borderToken = variantTokens.border ?? "border";
		const shouldShowBorder = border === "subtle" || Boolean(variantTokens.border);
		const shouldLift = theme.mode === "light" && radius !== "none";
		return {
			backgroundColor: theme.colors[variantTokens.background],
			borderRadius: theme.radius[card.radius[radius]],
			padding: paddingToken === 0 ? 0 : theme.spacing[paddingToken],
			overflow: shouldLift ? "visible" : "hidden",
			...(shouldLift ? theme.shadow.soft : {}),
			...(shouldShowBorder && {
				borderWidth: 1,
				borderColor: theme.colors[borderToken],
			}),
		};
	}, [
		border,
		card,
		padding,
		radius,
		theme.colors,
		theme.mode,
		theme.radius,
		theme.shadow.soft,
		theme.spacing,
		variant,
		variantTokens,
	]);

	return (
		<View style={[cardStyles, style]} {...rest}>
			{children}
		</View>
	);
};
