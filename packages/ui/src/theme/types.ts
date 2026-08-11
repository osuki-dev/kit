import type { TextStyle } from "react-native";
import type { spacing } from "./spacing";
import type { radius, motion, shadow, iconography } from "./motion";
import type {
	FontFamily,
	FontRegistry,
	FontWeight,
	TypographyStyles,
	TypeStyle,
	TypeStyleName,
} from "./typography";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedThemeMode = "light" | "dark";
export type ColorMode = ResolvedThemeMode;

export interface ThemeStorageAdapter {
	getItem: (key: string) => string | null | Promise<string | null>;
	setItem: (key: string, value: string) => void | Promise<void>;
	removeItem?: (key: string) => void | Promise<void>;
}

export interface ThemeColors {
	background: string;
	surface: string;
	surfaceRaised: string;
	border: string;
	borderStrong: string;
	text: string;
	textMuted: string;
	textSubtle: string;
	textDisabled: string;
	primary: string;
	onPrimary: string;
	primarySubtle: string;
	danger: string;
	dangerSubtle: string;
	success: string;
	warning: string;
	info: string;
}

export type ColorToken = keyof ThemeColors;
export type SpaceToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type SpacingScale = Record<SpaceToken, number>;
export type RadiusScale = Record<RadiusToken, number>;

export interface SemanticTokens {
	canvas: ColorToken;
	surface: ColorToken;
	surfaceElevated: ColorToken;
	divider: ColorToken;
	focusRing: ColorToken;
	interactive: ColorToken;
	interactiveMuted: ColorToken;
	positive: ColorToken;
	caution: ColorToken;
	critical: ColorToken;
}

export interface CommerceTokens {
	price: ColorToken;
	compareAtPrice: ColorToken;
	sale: ColorToken;
	saleSubtle: ColorToken;
	inventoryInStock: ColorToken;
	inventoryLow: ColorToken;
	inventoryOut: ColorToken;
	checkoutAccent: ColorToken;
	productCardRadius: RadiusToken;
	productImageRadius: RadiusToken;
	productImageAspectRatio: number;
	productGridMinWidth: number;
}

export interface ButtonVariantTokens {
	background: ColorToken | "transparent";
	foreground: ColorToken;
	border?: ColorToken;
}

export interface ButtonTokens {
	height: number;
	paddingX: SpaceToken;
	paddingY: SpaceToken;
	radius: RadiusToken;
	primary: ButtonVariantTokens;
	secondary: ButtonVariantTokens;
	ghost: ButtonVariantTokens;
	destructive: ButtonVariantTokens;
}

export interface CardVariantTokens {
	background: ColorToken;
	border?: ColorToken;
}

export interface CardTokens {
	default: CardVariantTokens;
	raised: CardVariantTokens;
	flat: CardVariantTokens;
	radius: Record<"none" | "xs" | "sm" | "md" | "lg", RadiusToken>;
	padding: Record<"none" | "xs" | "sm" | "md" | "lg", SpaceToken | 0>;
}

export interface InputTokens {
	background: ColorToken | "transparent";
	foreground: ColorToken;
	placeholder: ColorToken;
	border: ColorToken;
	borderFocused: ColorToken;
	borderError: ColorToken;
	radius: RadiusToken;
	paddingX: SpaceToken;
	paddingY: SpaceToken;
}

export interface SheetTokens {
	background: ColorToken;
	scrim: string;
	handle: ColorToken;
	radius: RadiusToken;
	paddingX: SpaceToken;
	paddingTop: SpaceToken;
	paddingBottom: SpaceToken;
	maxHeightOffset: SpaceToken;
}

export interface ListItemTokens {
	minHeight: number;
	paddingX: SpaceToken;
	paddingY: SpaceToken;
	radius: RadiusToken;
	background: ColorToken | "transparent";
	selectedBackground: ColorToken;
	destructiveBackground: ColorToken;
	gap: SpaceToken;
}

export interface TabsTokens {
	height: number;
	padding: SpaceToken;
	radius: RadiusToken;
	background: ColorToken;
	activeBackground: ColorToken;
	activeForeground: ColorToken;
	inactiveForeground: ColorToken;
}

export interface SurfaceTokens {
	page: ColorToken;
	surface: ColorToken;
	raised: ColorToken;
}

export interface TextTokens {
	defaultColor: ColorToken;
	displayColor: ColorToken;
	mutedColor: ColorToken;
}

export interface ComponentTokens {
	Button: ButtonTokens;
	Card: CardTokens;
	Input: InputTokens;
	Surface: SurfaceTokens;
	Text: TextTokens;
	Sheet: SheetTokens;
	ListItem: ListItemTokens;
	Tabs: TabsTokens;
}

export interface OsukiTheme {
	name: string;
	mode: ResolvedThemeMode;
	colors: ThemeColors;
	semantic: SemanticTokens;
	commerce: CommerceTokens;
	spacing: SpacingScale;
	radius: RadiusScale;
	motion: typeof motion;
	shadow: typeof shadow;
	iconography: typeof iconography;
	typeStyles: TypographyStyles;
	typography: TypographyStyles;
	fonts: FontRegistry;
	components: ComponentTokens;
}

export type Theme = OsukiTheme;
export type Colors = ThemeColors;
export type { FontFamily, FontWeight, TypeStyle, TypeStyleName, TextStyle };

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends (...args: never[]) => unknown
		? T[P]
		: T[P] extends object
			? DeepPartial<T[P]>
			: T[P];
};

export type ThemeOverride = DeepPartial<Omit<OsukiTheme, "mode">> & {
	light?: DeepPartial<Omit<OsukiTheme, "mode">>;
	dark?: DeepPartial<Omit<OsukiTheme, "mode">>;
};

export interface ThemeModeContextValue {
	mode: ThemeMode;
	resolvedMode: ResolvedThemeMode;
	setMode: (mode: ThemeMode) => void;
	toggleMode: () => void;
}

export type ThemeContextValue = Omit<OsukiTheme, "mode"> & ThemeModeContextValue;
