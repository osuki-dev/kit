import {
	DefaultTheme,
	DarkTheme,
	type Theme as NavigationTheme,
} from "expo-router/react-navigation";
import { resolveFontStyle } from "./typography";
import { useThemeTokens } from "./theme-provider";
import type { OsukiTheme } from "./types";

export const createNavigationTheme = (theme: OsukiTheme): NavigationTheme => {
	const baseTheme = theme.mode === "dark" ? DarkTheme : DefaultTheme;
	const { colors } = theme;
	const bodyFamily = theme.typeStyles.body.fontFamily;
	const bodyRegular = resolveFontStyle(theme.fonts, bodyFamily, "regular");
	const bodyMedium = resolveFontStyle(theme.fonts, bodyFamily, "medium");
	const bodyBold = resolveFontStyle(theme.fonts, bodyFamily, "bold");

	return {
		...baseTheme,
		dark: theme.mode === "dark",
		colors: {
			primary: colors.primary,
			background: colors.background,
			card: colors.surface,
			text: colors.text,
			border: colors.border,
			notification: colors.danger,
		},
		fonts: {
			...baseTheme.fonts,
			regular: {
				...baseTheme.fonts.regular,
				...bodyRegular,
				fontFamily: bodyRegular.fontFamily ?? baseTheme.fonts.regular.fontFamily,
			},
			medium: {
				...baseTheme.fonts.medium,
				...bodyMedium,
				fontFamily: bodyMedium.fontFamily ?? baseTheme.fonts.medium.fontFamily,
			},
			bold: {
				...baseTheme.fonts.bold,
				...bodyBold,
				fontFamily: bodyBold.fontFamily ?? baseTheme.fonts.bold.fontFamily,
			},
			heavy: {
				...baseTheme.fonts.heavy,
				...bodyBold,
				fontFamily: bodyBold.fontFamily ?? baseTheme.fonts.heavy.fontFamily,
			},
		},
	};
};

export const getNavigationScreenOptions = (theme: OsukiTheme) => {
	const { colors } = theme;
	const labelFamily = theme.typeStyles.label.fontFamily;
	const labelRegular = resolveFontStyle(theme.fonts, labelFamily, "regular");
	const labelMedium = resolveFontStyle(theme.fonts, labelFamily, "medium");
	return {
		headerStyle: {
			backgroundColor: colors.background,
			elevation: 0,
			shadowOpacity: 0,
			borderBottomWidth: 0,
		},
		headerShadowVisible: false,
		headerTitleStyle: {
			...labelMedium,
			fontSize: 13,
			letterSpacing: 0,
			textTransform: "uppercase" as const,
			color: colors.text,
		},
		headerTintColor: colors.text,
		headerBackTitleStyle: {
			...labelRegular,
			fontSize: 13,
		},
		contentStyle: { backgroundColor: colors.background },
		drawerStyle: {
			backgroundColor: colors.surface,
			borderRightWidth: 1,
			borderRightColor: colors.border,
		},
		drawerLabelStyle: {
			...labelMedium,
			fontSize: 13,
			letterSpacing: 0,
			textTransform: "uppercase" as const,
			color: colors.text,
		},
		drawerInactiveTintColor: colors.textMuted,
		drawerActiveTintColor: colors.text,
		drawerActiveBackgroundColor: colors.surfaceRaised,
		tabBarStyle: {
			backgroundColor: colors.surface,
			borderTopWidth: 1,
			borderTopColor: colors.border,
			elevation: 0,
			shadowOpacity: 0,
		},
		tabBarLabelStyle: {
			...labelMedium,
			fontSize: 11,
			letterSpacing: 0,
			textTransform: "uppercase" as const,
		},
		tabBarActiveTintColor: colors.text,
		tabBarInactiveTintColor: colors.textMuted,
		sceneContainerStyle: { backgroundColor: colors.background },
	};
};

// Named explicitly so declaration emit does not inline unexported types from
// expo-router's internals, which cannot be referenced from a published .d.ts.
export interface OsukiNavigationTheme {
	theme: NavigationTheme;
	screenOptions: ReturnType<typeof getNavigationScreenOptions>;
	colors: OsukiTheme["colors"];
	mode: OsukiTheme["mode"];
}

export const useNavigationTheme = (): OsukiNavigationTheme => {
	const themeTokens = useThemeTokens();
	return {
		theme: createNavigationTheme(themeTokens),
		screenOptions: getNavigationScreenOptions(themeTokens),
		colors: themeTokens.colors,
		mode: themeTokens.mode,
	};
};
