import type { Locale } from "@osuki-dev/kit-community";

export type LocaleOption = {
	label: string;
	value: Locale;
	description: string;
};

export const localeOptions: LocaleOption[] = [
	{
		label: "English (US)",
		value: "en-US",
		description: "Default storefront language.",
	},
	{
		label: "简体中文",
		value: "zh-CN",
		description: "面向中文用户的本地化界面。",
	},
	{
		label: "繁體中文",
		value: "zh-TW",
		description: "面向繁體中文使用者的本地化界面。",
	},
];

export const defaultLocale: Locale = "en-US";

export function resolveLocale(value?: string | null): Locale {
	const match = localeOptions.find((option) => option.value === value);
	return match?.value ?? defaultLocale;
}

export function getLocaleLabel(value?: string | null) {
	const locale = resolveLocale(value);
	return localeOptions.find((option) => option.value === locale)?.label ?? "English (US)";
}
