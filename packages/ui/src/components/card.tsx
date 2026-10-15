import React, { createContext, useContext, useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import {
	getCachedTransformedColor,
	useSurfaceDecorator,
	useThemeTokens,
	type SurfaceMeta,
} from "../theme";

export type CardVariant = "default" | "raised" | "flat";
export type CardBorder = "none" | "subtle";
export type CardRadius = "none" | "xs" | "sm" | "md" | "lg";
export type CardPadding = "none" | "xs" | "sm" | "md" | "lg";

const absoluteFill: ViewStyle = {
	position: "absolute",
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
};

export interface CardMeta {
	variant: CardVariant;
	border: CardBorder;
	radius: CardRadius;
	padding: CardPadding;
	slot: string;
	baseColor: string;
	resolvedBackgroundColor: string;
	borderRadius: number;
}

export interface CardContextValue {
	meta: CardMeta;
}

const CardContext = createContext<CardContextValue | null>(null);

export function useCard(): CardContextValue {
	const context = useContext(CardContext);
	if (!context) {
		throw new Error("Card compound components must be used within Card.Root");
	}
	return context;
}

export interface CardRootProps extends ViewProps {
	variant?: CardVariant;
	border?: CardBorder;
	radius?: CardRadius;
	padding?: CardPadding;
	slot?: string;
	children?: React.ReactNode;
}

export function CardRoot({
	variant = "default",
	border = "none",
	radius = "lg",
	padding = "md",
	slot = "cards.decoration",
	style,
	children,
	...rest
}: CardRootProps) {
	const theme = useThemeTokens();
	const decorator = useSurfaceDecorator();
	const card = theme.components.Card;
	const variantTokens = card[variant];

	const baseColor = theme.colors[variantTokens.background];
	const borderRadius = theme.radius[card.radius[radius]];

	const surfaceMeta: SurfaceMeta = useMemo(
		() => ({
			slot,
			variant,
			baseColor,
			borderRadius,
		}),
		[slot, variant, baseColor, borderRadius],
	);

	const resolvedBackgroundColor = useMemo(() => {
		if (decorator?.transformBackground) {
			return getCachedTransformedColor(baseColor, surfaceMeta, decorator.transformBackground);
		}
		return baseColor;
	}, [baseColor, decorator, surfaceMeta]);

	const cardStyles = useMemo<ViewStyle>(() => {
		const paddingToken = card.padding[padding];
		const borderToken = variantTokens.border ?? "border";
		const shouldShowBorder = border === "subtle" || Boolean(variantTokens.border);
		const shouldLift = theme.mode === "light" && radius !== "none";
		return {
			position: "relative",
			borderRadius,
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
		borderRadius,
		card.padding,
		padding,
		radius,
		theme.colors,
		theme.mode,
		theme.shadow.soft,
		theme.spacing,
		variantTokens.border,
	]);

	const contextValue = useMemo<CardContextValue>(
		() => ({
			meta: {
				variant,
				border,
				radius,
				padding,
				slot,
				baseColor,
				resolvedBackgroundColor,
				borderRadius,
			},
		}),
		[
			variant,
			border,
			radius,
			padding,
			slot,
			baseColor,
			resolvedBackgroundColor,
			borderRadius,
		],
	);

	return (
		<CardContext.Provider value={contextValue}>
			<View style={[cardStyles, style]} {...rest}>
				{children}
			</View>
		</CardContext.Provider>
	);
}

export interface CardBackgroundProps extends ViewProps {
	children?: React.ReactNode;
}

export function CardBackground({ style, children, ...props }: CardBackgroundProps) {
	const { meta } = useCard();
	const decorator = useSurfaceDecorator();
	const surfaceMeta: SurfaceMeta = useMemo(
		() => ({
			slot: meta.slot,
			variant: meta.variant,
			baseColor: meta.baseColor,
			borderRadius: meta.borderRadius,
		}),
		[meta.slot, meta.variant, meta.baseColor, meta.borderRadius],
	);

	return (
		<View
			collapsable={true}
			pointerEvents="none"
			style={[
				absoluteFill,
				{
					backgroundColor: meta.resolvedBackgroundColor,
					borderRadius: meta.borderRadius,
				},
				style,
			]}
			{...props}
		>
			{decorator?.renderDecoration?.(surfaceMeta)}
			{children}
		</View>
	);
}

export interface CardHeaderProps extends ViewProps {
	children?: React.ReactNode;
}

export function CardHeader({ style, children, ...props }: CardHeaderProps) {
	return (
		<View style={style} {...props}>
			{children}
		</View>
	);
}

export interface CardContentProps extends ViewProps {
	children?: React.ReactNode;
}

export function CardContent({ style, children, ...props }: CardContentProps) {
	return (
		<View style={[{ minWidth: 0 }, style]} {...props}>
			{children}
		</View>
	);
}

export interface CardFooterProps extends ViewProps {
	children?: React.ReactNode;
}

export function CardFooter({ style, children, ...props }: CardFooterProps) {
	return (
		<View style={style} {...props}>
			{children}
		</View>
	);
}

export interface CardProps extends ViewProps {
	variant?: CardVariant;
	border?: CardBorder;
	radius?: CardRadius;
	padding?: CardPadding;
	slot?: string;
}

export function Card({
	variant = "default",
	border = "none",
	radius = "lg",
	padding = "md",
	slot = "cards.decoration",
	style,
	children,
	...rest
}: CardProps) {
	return (
		<CardRoot
			variant={variant}
			border={border}
			radius={radius}
			padding={padding}
			slot={slot}
			style={style}
			{...rest}
		>
			<CardBackground />
			{children}
		</CardRoot>
	);
}

Card.Root = CardRoot;
Card.Background = CardBackground;
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
