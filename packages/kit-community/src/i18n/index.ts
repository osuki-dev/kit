/**
 * Scalable i18n System with User Customization Support
 *
 * Features:
 * - Modular locale files (one per language)
 * - Lazy loading for non-core locales
 * - TypeScript type safety
 * - RTL support
 * - Interpolation with parameters
 * - Namespace organization (system vs user)
 * - User custom translations support
 *
 * For app developers: You can use this system for your own translations too!
 */

import React, {
	createContext,
	useContext,
	useCallback,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import type { EnTranslations } from "./locales/en";
import {
	type Locale,
	coreTranslations,
	lazyTranslations,
	isCoreLocale,
	isRTLLocale,
	localeMetadata,
} from "./registry";

// Re-export types and helpers
export type { Locale, EnTranslations };
export { isCoreLocale, isRTLLocale, localeMetadata };

// Deep merge utility
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
	const result = { ...target };

	for (const key in source) {
		if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
			result[key] = deepMerge(
				(result[key] as Record<string, unknown>) || {},
				source[key] as Record<string, unknown>,
			) as T[Extract<keyof T, string>];
		} else {
			result[key] = source[key] as T[Extract<keyof T, string>];
		}
	}

	return result;
}

// Type for all translation keys
export type TranslationKey = DeepKeys<EnTranslations>;

type DeepKeys<T> = T extends object
	? { [K in keyof T]: K extends string ? `${K}` | `${K}.${DeepKeys<T[K]>}` : never }[keyof T]
	: never;

// User custom translations type
export type UserTranslations = Partial<EnTranslations>;

// i18n State
interface I18nState {
	locale: Locale;
	messages: EnTranslations;
	isLoading: boolean;
	isRTL: boolean;
	// User custom translations per locale
	userTranslations: Map<Locale, UserTranslations>;
}

// i18n Context
interface I18nContextValue extends I18nState {
	setLocale: (locale: Locale) => Promise<void>;
	t: (key: TranslationKey, params?: Record<string, string | number>) => string;
	tExists: (key: TranslationKey) => boolean;
	// User translation APIs
	setUserTranslations: (locale: Locale, translations: UserTranslations) => void;
	addUserTranslations: (locale: Locale, translations: UserTranslations) => void;
	clearUserTranslations: (locale?: Locale) => void;
	// Utilities
	availableLocales: Locale[];
	getLocaleName: (locale: Locale) => string;
	// For advanced users: direct access to raw messages
	getRawMessage: (key: TranslationKey) => string | undefined;
}

interface I18nProviderProps {
	children: ReactNode;
	defaultLocale?: Locale;
	// Optional: Preload specific locales
	preloadLocales?: Locale[];
	// Optional: Initial user translations
	initialUserTranslations?: Partial<Record<Locale, UserTranslations>>;
	// Optional: Custom system translations (for extending kit)
	customSystemTranslations?: Partial<Record<Locale, EnTranslations>>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// Cache for loaded translations
const translationCache = new Map<Locale, EnTranslations>();

// Get nested value from object using dot notation
function getNestedValue(obj: unknown, path: string): string | undefined {
	const keys = path.split(".");
	let current: unknown = obj;

	for (const key of keys) {
		if (current && typeof current === "object" && key in current) {
			current = (current as Record<string, unknown>)[key];
		} else {
			return undefined;
		}
	}

	return typeof current === "string" ? current : undefined;
}

// Interpolate parameters in string
function interpolate(template: string, params?: Record<string, string | number>): string {
	if (!params) return template;

	return Object.entries(params).reduce(
		(acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, "g"), String(value)),
		template,
	);
}

export function I18nProvider({
	children,
	defaultLocale = "en-US",
	preloadLocales = [],
	initialUserTranslations = {},
	customSystemTranslations = {},
}: I18nProviderProps) {
	const getInitialMessages = useCallback(
		(locale: Locale): EnTranslations => {
			// Priority: customSystem > coreTranslations
			let messages: EnTranslations;

			if (isCoreLocale(locale)) {
				messages = coreTranslations[locale as keyof typeof coreTranslations];
			} else {
				// Try to get from cache or use English as fallback
				messages = translationCache.get(locale) || coreTranslations["en-US"];
			}

			// Merge custom system translations if provided
			if (customSystemTranslations[locale]) {
				messages = deepMerge(messages, customSystemTranslations[locale]!);
			}

			// Merge initial user translations
			if (initialUserTranslations[locale]) {
				messages = deepMerge(messages, initialUserTranslations[locale]!);
			}

			return messages;
		},
		[customSystemTranslations, initialUserTranslations],
	);

	const [state, setState] = useState<I18nState>({
		locale: defaultLocale,
		messages: getInitialMessages(defaultLocale),
		isLoading: false,
		isRTL: isRTLLocale(defaultLocale),
		userTranslations: new Map(
			Object.entries(initialUserTranslations) as [Locale, UserTranslations][],
		),
	});

	// Preload locales on mount
	useEffect(() => {
		const preload = async () => {
			for (const locale of preloadLocales) {
				if (!isCoreLocale(locale) && !translationCache.has(locale)) {
					try {
						// Type assertion needed because TypeScript doesn't narrow after the check
						const loader = lazyTranslations[locale as keyof typeof lazyTranslations];
						if (loader) {
							const { default: messages } = await loader();
							// Merge custom system translations
							let finalMessages = messages;
							if (customSystemTranslations[locale]) {
								finalMessages = deepMerge(finalMessages, customSystemTranslations[locale]!);
							}
							// Merge user translations
							if (state.userTranslations.has(locale)) {
								finalMessages = deepMerge(finalMessages, state.userTranslations.get(locale)!);
							}
							translationCache.set(locale, finalMessages);
						}
					} catch (error) {
						console.warn(`Failed to preload locale: ${locale}`, error);
					}
				}
			}
		};

		preload();
	}, [preloadLocales, customSystemTranslations]);

	const setLocale = useCallback(
		async (newLocale: Locale) => {
			// Check cache or load
			let messages: EnTranslations;

			if (isCoreLocale(newLocale)) {
				messages = coreTranslations[newLocale as keyof typeof coreTranslations];
			} else if (translationCache.has(newLocale)) {
				messages = translationCache.get(newLocale)!;
			} else {
				setState((prev) => ({ ...prev, isLoading: true }));

				try {
					// Type assertion needed because TypeScript doesn't narrow the type
					const loader = lazyTranslations[newLocale as keyof typeof lazyTranslations];
					if (!loader) {
						throw new Error(`Locale not found: ${newLocale}`);
					}

					const { default: loadedMessages } = await loader();
					messages = loadedMessages;
					translationCache.set(newLocale, messages);
				} catch (error) {
					console.error(`Failed to load locale: ${newLocale}`, error);
					messages = coreTranslations["en-US"];
					newLocale = "en-US";
				}
			}

			// Apply custom system translations
			if (customSystemTranslations[newLocale]) {
				messages = deepMerge(messages, customSystemTranslations[newLocale]!);
			}

			// Apply user translations
			if (state.userTranslations.has(newLocale)) {
				messages = deepMerge(messages, state.userTranslations.get(newLocale)!);
			}

			setState({
				locale: newLocale,
				messages,
				isRTL: isRTLLocale(newLocale),
				isLoading: false,
				userTranslations: state.userTranslations,
			});
		},
		[customSystemTranslations, state.userTranslations],
	);

	// Set user translations (replaces existing)
	const setUserTranslations = useCallback(
		(locale: Locale, translations: UserTranslations) => {
			setState((prev) => {
				const newUserTranslations = new Map(prev.userTranslations);
				newUserTranslations.set(locale, translations);

				// If current locale, update messages immediately
				let newMessages = prev.messages;
				if (prev.locale === locale) {
					// Get base messages
					let baseMessages: EnTranslations;
					if (isCoreLocale(locale)) {
						baseMessages = coreTranslations[locale as keyof typeof coreTranslations];
					} else {
						baseMessages = translationCache.get(locale) || coreTranslations["en-US"];
					}

					// Apply custom system translations
					if (customSystemTranslations[locale]) {
						baseMessages = deepMerge(baseMessages, customSystemTranslations[locale]!);
					}

					// Apply new user translations
					newMessages = deepMerge(baseMessages, translations);
				}

				return {
					...prev,
					messages: newMessages,
					userTranslations: newUserTranslations,
				};
			});
		},
		[customSystemTranslations],
	);

	// Add user translations (merges with existing)
	const addUserTranslations = useCallback((locale: Locale, translations: UserTranslations) => {
		setState((prev) => {
			const newUserTranslations = new Map(prev.userTranslations);
			const existing = newUserTranslations.get(locale) || {};
			const merged = deepMerge(existing, translations);
			newUserTranslations.set(locale, merged);

			// If current locale, update messages immediately
			let newMessages = prev.messages;
			if (prev.locale === locale) {
				// Start with current messages
				newMessages = deepMerge(prev.messages, translations);
			}

			return {
				...prev,
				messages: newMessages,
				userTranslations: newUserTranslations,
			};
		});
	}, []);

	// Clear user translations
	const clearUserTranslations = useCallback(
		(locale?: Locale) => {
			setState((prev) => {
				if (locale) {
					// Clear specific locale
					const newUserTranslations = new Map(prev.userTranslations);
					newUserTranslations.delete(locale);

					let newMessages = prev.messages;
					if (prev.locale === locale) {
						// Reset to base messages
						if (isCoreLocale(locale)) {
							newMessages = coreTranslations[locale as keyof typeof coreTranslations];
						} else {
							newMessages = translationCache.get(locale) || coreTranslations["en-US"];
						}
						// Re-apply custom system translations
						if (customSystemTranslations[locale]) {
							newMessages = deepMerge(newMessages, customSystemTranslations[locale]!);
						}
					}

					return {
						...prev,
						messages: newMessages,
						userTranslations: newUserTranslations,
					};
				} else {
					// Clear all user translations
					// Reset messages to base
					let newMessages: EnTranslations;
					if (isCoreLocale(prev.locale)) {
						newMessages = coreTranslations[prev.locale as keyof typeof coreTranslations];
					} else {
						newMessages = translationCache.get(prev.locale) || coreTranslations["en-US"];
					}
					// Re-apply custom system translations
					if (customSystemTranslations[prev.locale]) {
						newMessages = deepMerge(newMessages, customSystemTranslations[prev.locale]!);
					}

					return {
						...prev,
						messages: newMessages,
						userTranslations: new Map(),
					};
				}
			});
		},
		[customSystemTranslations],
	);

	const t = useCallback(
		(key: TranslationKey, params?: Record<string, string | number>): string => {
			const value = getNestedValue(state.messages, key);
			if (value === undefined) {
				// Check if it's a user custom key (not in system)
				// Return the key itself for debugging
				if (__DEV__) {
					console.warn(`Translation key not found: ${key}`);
				}
				return key;
			}
			return interpolate(value, params);
		},
		[state.messages],
	);

	const tExists = useCallback(
		(key: TranslationKey): boolean => {
			return getNestedValue(state.messages, key) !== undefined;
		},
		[state.messages],
	);

	const getRawMessage = useCallback(
		(key: TranslationKey): string | undefined => {
			return getNestedValue(state.messages, key);
		},
		[state.messages],
	);

	const availableLocales = Object.keys(localeMetadata) as Locale[];

	const getLocaleName = useCallback((locale: Locale): string => {
		return localeMetadata[locale]?.name || locale;
	}, []);

	const value: I18nContextValue = {
		...state,
		setLocale,
		t,
		tExists,
		setUserTranslations,
		addUserTranslations,
		clearUserTranslations,
		availableLocales,
		getLocaleName,
		getRawMessage,
	};

	return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextValue {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}

// Hook for RTL layout detection
export function useRTL(): boolean {
	const { isRTL } = useI18n();
	return isRTL;
}

// Hook for locale loading state
export function useLocaleLoading(): boolean {
	const { isLoading } = useI18n();
	return isLoading;
}

// Hook specifically for user custom translations
export function useUserI18n() {
	const { setUserTranslations, addUserTranslations, clearUserTranslations, t, tExists } = useI18n();

	return {
		// Translation functions
		t,
		tExists,
		// User translation management
		setUserTranslations,
		addUserTranslations,
		clearUserTranslations,
	};
}

// Utility: Format message with interpolation
export function formatMessage(message: string, params: Record<string, string | number>): string {
	return interpolate(message, params);
}

// Utility: Get all available locales for language picker
export function getAvailableLocales(): Array<{ locale: Locale; name: string; flag: string }> {
	return (Object.keys(localeMetadata) as Locale[]).map((locale) => ({
		locale,
		name: localeMetadata[locale].name,
		flag: localeMetadata[locale].flag,
	}));
}

// Utility: Create custom translation file template
export function createTranslationTemplate(): UserTranslations {
	return {};
}
