# i18n Internationalization

Osuki Kit comes with a powerful, scalable i18n system that you can also use for your own app translations.

## Quick Start

### 1. Setup

```tsx
import { I18nProvider } from "@osuki-dev/kit-community";

function App() {
	return (
		<I18nProvider defaultLocale="en-US">
			<YourApp />
		</I18nProvider>
	);
}
```

### 2. Use Translations

```tsx
import { useI18n } from "@osuki-dev/kit-community";

function MyComponent() {
	const { t, locale, setLocale } = useI18n();

	return (
		<View>
			{/* System translations */}
			<Text>{t("auth.login")}</Text>
			<Text>{t("common.save")}</Text>

			{/* With parameters */}
			<Text>{t("validation.minLength", { min: 6 })}</Text>

			{/* Switch language */}
			<Button title="Switch to Chinese" onPress={() => setLocale("zh-CN")} />
		</View>
	);
}
```

## Adding Your Own Translations

### Method 1: Initial Translations (Recommended)

```tsx
const myAppTranslations = {
	"en-US": {
		myapp: {
			welcome: "Welcome to My App",
			slogan: "The best app ever",
		},
	},
	"zh-CN": {
		myapp: {
			welcome: "欢迎使用我的应用",
			slogan: "最佳应用体验",
		},
	},
};

<I18nProvider defaultLocale="en-US" initialUserTranslations={myAppTranslations}>
	<YourApp />
</I18nProvider>;
```

### Method 2: Dynamic Updates

```tsx
import { useUserI18n } from "@osuki-dev/kit-community";

function MyComponent() {
	const { addUserTranslations, t } = useUserI18n();

	const loadTranslations = () => {
		addUserTranslations("ja-JP", {
			myapp: {
				welcome: "ようこそ",
			},
		});
	};

	return (
		<View>
			<Text>{t("myapp.welcome")}</Text>
			<Button title="Load Japanese" onPress={loadTranslations} />
		</View>
	);
}
```

### Method 3: Lazy Loading from API

```tsx
const { addUserTranslations } = useUserI18n();

async function loadFromAPI(locale) {
	const response = await fetch(`/api/translations/${locale}`);
	const translations = await response.json();
	addUserTranslations(locale, translations);
}
```

## Overriding System Translations

You can override any system translation:

```tsx
const customTranslations = {
	"en-US": {
		common: {
			save: "SAVE CHANGES", // Override default "SAVE"
		},
		auth: {
			login: "SIGN IN TO APP", // Override default "SIGN IN"
		},
	},
};

<I18nProvider initialUserTranslations={customTranslations}>
	<YourApp />
</I18nProvider>;
```

## Available System Translation Keys

### Common

```
common.save, common.cancel, common.delete, common.edit
common.create, common.submit, common.loading, common.error
common.success, common.required, common.optional, common.back
common.next, common.done, common.close, common.open
```

### Auth

```
auth.login, auth.register, auth.logout
auth.email, auth.password, auth.confirmPassword
auth.fullName, auth.forgotPassword, auth.noAccount, auth.hasAccount
auth.signingIn, auth.creatingAccount, auth.signUp
```

### Form

```
form.createTitle, form.editTitle, form.fieldRequired
form.fieldOptional, form.invalidFormat, form.submitError
form.submitSuccess, form.saving
```

### Validation

```
validation.required, validation.email, validation.url
validation.minLength, validation.maxLength
validation.min, validation.max, validation.pattern
```

### Settings

```
settings.title, settings.notifications, settings.appearance
settings.language, settings.security, settings.about
```

### List And Detail Screens

```
list.searchPlaceholder, list.actions, list.noData
list.adjustSearch, list.yes, list.no
detail.created, detail.updated
```

### E-commerce

```
ecommerce.addToCart, ecommerce.checkout, ecommerce.total
ecommerce.inStock, ecommerce.outOfStock, ecommerce.orderSummary
```

## RTL (Right-to-Left) Support

Automatic RTL layout detection:

```tsx
import { useRTL } from "@osuki-dev/kit-community";

function MyComponent() {
	const isRTL = useRTL();

	return (
		<View style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
			<Text>Content adapts automatically</Text>
		</View>
	);
}
```

## Language Picker Example

```tsx
import { useI18n, getAvailableLocales } from "@osuki-dev/kit-community";

function LanguagePicker() {
	const { locale, setLocale } = useI18n();
	const languages = getAvailableLocales();

	return (
		<View>
			{languages.map((lang) => (
				<Button
					key={lang.locale}
					title={`${lang.flag} ${lang.name}`}
					onPress={() => setLocale(lang.locale)}
				/>
			))}
		</View>
	);
}
```

## Interpolation with Parameters

```tsx
// Translation: "Must be at least {min} characters"
t("validation.minLength", { min: 6 });
// Result: "Must be at least 6 characters"

// Translation: "Hello, {name}!"
t("greeting.hello", { name: "John" });
// Result: "Hello, John!"
```

## Available Locales

| Code    | Language              | Flag | RTL |
| ------- | --------------------- | ---- | --- |
| `en-US` | English (US)          | 🇺🇸   | No  |
| `zh-CN` | Chinese (Simplified)  | 🇨🇳   | No  |
| `zh-TW` | Chinese (Traditional) | 🇹🇼   | No  |
| `ja-JP` | Japanese              | 🇯🇵   | No  |
| `ko-KR` | Korean                | 🇰🇷   | No  |
| `de-DE` | German                | 🇩🇪   | No  |
| `fr-FR` | French                | 🇫🇷   | No  |
| `es-ES` | Spanish               | 🇪🇸   | No  |
| `it-IT` | Italian               | 🇮🇹   | No  |
| `pt-PT` | Portuguese            | 🇵🇹   | No  |
| `ru-RU` | Russian               | 🇷🇺   | No  |
| `ar-SA` | Arabic                | 🇸🇦   | Yes |
| `hi-IN` | Hindi                 | 🇮🇳   | No  |
| `th-TH` | Thai                  | 🇹🇭   | No  |
| `vi-VN` | Vietnamese            | 🇻🇳   | No  |

## TypeScript Support

For type-safe custom keys, extend the interface:

```typescript
// types/i18n.d.ts
declare module "@osuki-dev/kit-community" {
	interface EnTranslations {
		myapp: {
			welcome: string;
			features: {
				title: string;
			};
		};
	}
}
```

## API Reference

### I18nProvider Props

| Prop                      | Type                               | Description           |
| ------------------------- | ---------------------------------- | --------------------- |
| `defaultLocale`           | `Locale`                           | Initial language      |
| `preloadLocales`          | `Locale[]`                         | Locales to preload    |
| `initialUserTranslations` | `Record<Locale, UserTranslations>` | Your app translations |

### useI18n() Return Values

| Property                | Type            | Description             |
| ----------------------- | --------------- | ----------------------- |
| `t(key, params?)`       | `string`        | Translate a key         |
| `tExists(key)`          | `boolean`       | Check if key exists     |
| `locale`                | `Locale`        | Current locale          |
| `setLocale(locale)`     | `Promise<void>` | Change language         |
| `isRTL`                 | `boolean`       | RTL layout flag         |
| `isLoading`             | `boolean`       | Loading state           |
| `availableLocales`      | `Locale[]`      | All supported locales   |
| `getLocaleName(locale)` | `string`        | Get locale display name |

### useUserI18n() Return Values

| Property                                    | Type   | Description              |
| ------------------------------------------- | ------ | ------------------------ |
| `setUserTranslations(locale, translations)` | `void` | Replace all translations |
| `addUserTranslations(locale, translations)` | `void` | Merge with existing      |
| `clearUserTranslations(locale?)`            | `void` | Clear user translations  |

## Best Practices

1. **Organize by namespace**: Use `myapp.feature.key` pattern
2. **Keep keys flat**: Avoid deep nesting beyond 3 levels
3. **Use parameters**: For dynamic values, not concatenation
4. **Default values**: Always provide English as fallback
5. **Lazy loading**: Only load languages when needed
6. **Type safety**: Extend EnTranslations for your custom keys

## Example: Complete App Setup

```tsx
// App.tsx
import { I18nProvider } from "@osuki-dev/kit-community";
import { View, Text, Button } from "react-native";

const appTranslations = {
	"en-US": {
		app: {
			title: "My Awesome App",
			subtitle: "Built with Osuki Kit",
		},
	},
	"zh-CN": {
		app: {
			title: "我的超棒应用",
			subtitle: "使用 Osuki Kit 构建",
		},
	},
};

export default function App() {
	return (
		<I18nProvider defaultLocale="en-US" initialUserTranslations={appTranslations}>
			<HomeScreen />
		</I18nProvider>
	);
}

// HomeScreen.tsx
import { useI18n } from "@osuki-dev/kit-community";

function HomeScreen() {
	const { t, setLocale } = useI18n();

	return (
		<View>
			<Text>{t("app.title")}</Text>
			<Text>{t("app.subtitle")}</Text>
			<Text>{t("common.save")}</Text>

			<Button title="中文" onPress={() => setLocale("zh-CN")} />
			<Button title="English" onPress={() => setLocale("en-US")} />
		</View>
	);
}
```

## Migration from Other i18n Libraries

If you're using react-i18next or similar:

```tsx
// Before (react-i18next)
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
t("key");

// After (@osuki-dev/kit-community)
import { useI18n } from "@osuki-dev/kit-community";
const { t } = useI18n();
t("key");
```

The API is intentionally similar for easy migration.
