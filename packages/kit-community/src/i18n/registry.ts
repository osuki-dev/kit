/**
 * i18n Locale Registry
 *
 * This file manages all available locales. To add a new language:
 *
 * 1. Create a new file in ./locales/[lang].ts
 * 2. Export the translations object
 * 3. Add the locale to the registry below
 * 4. Update the Locale type
 */

import type { EnTranslations } from "./locales/en";

// Core locales (always loaded)
import { en } from "./locales/en";
import { zh } from "./locales/zh";
import { zhTW } from "./locales/zh-TW";

// Additional locales (lazy loaded)
// import { ja } from './locales/ja';
// import { ko } from './locales/ko';
// import { de } from './locales/de';
// import { fr } from './locales/fr';
// import { es } from './locales/es';
// import { it } from './locales/it';
// import { pt } from './locales/pt';
// import { ru } from './locales/ru';
// import { ar } from './locales/ar';

export type Locale =
	| "en-US" // English (United States)
	| "zh-CN" // Chinese (Simplified)
	| "zh-TW" // Chinese (Traditional)
	| "ja-JP" // Japanese (lazy loaded)
	| "ko-KR" // Korean (lazy loaded)
	| "de-DE" // German (lazy loaded)
	| "fr-FR" // French (lazy loaded)
	| "es-ES" // Spanish (lazy loaded)
	| "it-IT" // Italian (lazy loaded)
	| "pt-PT" // Portuguese (lazy loaded)
	| "ru-RU" // Russian (lazy loaded)
	| "ar-SA" // Arabic (lazy loaded)
	| "hi-IN" // Hindi (lazy loaded)
	| "th-TH" // Thai (lazy loaded)
	| "vi-VN"; // Vietnamese (lazy loaded)

// Core translations (bundled with app)
export const coreTranslations = {
	"en-US": en,
	"zh-CN": zh,
	"zh-TW": zhTW,
} as const;

// Extended translations (lazy loaded on demand)
// Store as dynamic imports for code splitting
export const lazyTranslations: Partial<
	Record<Exclude<Locale, keyof typeof coreTranslations>, () => Promise<{ default: EnTranslations }>>
> = {
	// ja: () => import('./locales/ja').then(m => ({ default: m.ja })),
	// ko: () => import('./locales/ko').then(m => ({ default: m.ko })),
	// de: () => import('./locales/de').then(m => ({ default: m.de })),
	// fr: () => import('./locales/fr').then(m => ({ default: m.fr })),
	// es: () => import('./locales/es').then(m => ({ default: m.es })),
	// it: () => import('./locales/it').then(m => ({ default: m.it })),
	// pt: () => import('./locales/pt').then(m => ({ default: m.pt })),
	// ru: () => import('./locales/ru').then(m => ({ default: m.ru })),
	// ar: () => import('./locales/ar').then(m => ({ default: m.ar })),
};

// Locale metadata for UI display
export const localeMetadata: Record<Locale, { name: string; flag: string; isRTL: boolean }> = {
	"en-US": { name: "English (US)", flag: "🇺🇸", isRTL: false },
	"zh-CN": { name: "简体中文", flag: "🇨🇳", isRTL: false },
	"zh-TW": { name: "繁體中文", flag: "🇹🇼", isRTL: false },
	"ja-JP": { name: "日本語", flag: "🇯🇵", isRTL: false },
	"ko-KR": { name: "한국어", flag: "🇰🇷", isRTL: false },
	"de-DE": { name: "Deutsch", flag: "🇩🇪", isRTL: false },
	"fr-FR": { name: "Français", flag: "🇫🇷", isRTL: false },
	"es-ES": { name: "Español", flag: "🇪🇸", isRTL: false },
	"it-IT": { name: "Italiano", flag: "🇮🇹", isRTL: false },
	"pt-PT": { name: "Português", flag: "🇵🇹", isRTL: false },
	"ru-RU": { name: "Русский", flag: "🇷🇺", isRTL: false },
	"ar-SA": { name: "العربية", flag: "🇸🇦", isRTL: true },
	"hi-IN": { name: "हिन्दी", flag: "🇮🇳", isRTL: false },
	"th-TH": { name: "ไทย", flag: "🇹🇭", isRTL: false },
	"vi-VN": { name: "Tiếng Việt", flag: "🇻🇳", isRTL: false },
};

// Helper to check if locale is core
export function isCoreLocale(locale: Locale): boolean {
	return locale in coreTranslations;
}

// Helper to check if locale is RTL
export function isRTLLocale(locale: Locale): boolean {
	return localeMetadata[locale]?.isRTL ?? false;
}
