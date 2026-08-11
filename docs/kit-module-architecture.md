# Kit Module Architecture

Osuki kit should be built for generated apps, not only hand-written screens. The long-term scaffold flow is:

1. User chooses an app type, for example `shopify`.
2. Scaffold selects required modules through `composeAppScaffold`: user system, product display, cart, checkout, order tracking, settings.
3. Each module contributes screens, config contracts, UI primitives, routes, test flows, and optional starter data.
4. The generated app stays editable because every module is configuration-driven and typed.

## Layers

### 1. UI primitives

Package: `@osuki-dev/ui`

These must be stable, small, and reusable across all modules:

- Controls: `Button`, `Input`, `Select`, `DateInput`, `Checkbox`, `RadioGroup`, `Toggle`, `Stepper`, `Tabs`, `SegmentedControl`.
- States: `LoadingView`, `EmptyState`, `ErrorView`, `Skeleton`, `Toast`, `Alert`.
- Overlays: `Modal`, `BottomSheet`, `ActionSheet`, `Menu`, `Tooltip`.
- Data/display: `Badge`, `Tag`, `Avatar`, `Timeline`, `MetricCard`, `DataRow`, `ListItem`.
- Layout: `Surface`, `Stack`, `Section`, `ResponsiveContainer`, `ResponsiveGrid`, keyboard-aware wrappers.

Quality bar:

- No hidden app-specific dependencies.
- Stable dimensions for repeated rows, lists, and controls.
- Works on native and web where supported by React Native.
- Exported from the package root and covered by the component E2E catalog.

### 2. Kit modules

Package: `@osuki-dev/kit-community`

Modules are higher-level contracts that combine screens and reusable configuration.

Current direction:

| Module     | Purpose                               | Key screens/config                                            |
| ---------- | ------------------------------------- | ------------------------------------------------------------- |
| `settings` | Rich configurable app settings        | `createSettingsModule`, `SettingsScreen`                      |
| `commerce` | Product, cart, checkout, order status | `createCommerceModule`, commerce screens                      |
| `account`  | Login, registration, profile          | `createAccountModule`, account screens                        |
| `data`     | Generic entity CRUD shell             | `ListScreen`, `DetailScreen`, `FormScreen`, `DashboardScreen` |
| `content`  | Article/feed/media templates          | `ArticleScreen`, `FeedScreen`, `MediaPlayerScreen`            |
| `tools`    | Calendar/camera/files utility screens | `CalendarScreen`, `CameraScreen`, `FileBrowser`               |

Module quality bar:

- Typed config in public exports.
- Presets for common app types.
- Item/section override points instead of forks.
- No Pro-only imports in community packages.
- Public contract tests for exports and module composition.

### 3. App templates

Templates pick modules, not individual low-level files.

Example scaffold selection:

```ts
const shopifyComposition = composeAppScaffold({
	appType: "shopify",
	capabilities: [
		"account",
		"registration",
		"profile",
		"commerce",
		"productDisplay",
		"productSearch",
		"cart",
		"checkout",
		"orders",
		"settings",
		"billing",
		"integrations",
	],
});
```

`composeAppScaffold` and `selectAppScaffold` are exported from
`@osuki-dev/kit-community/modules` and return typed contracts: the resolved app
template, capabilities, auth providers, commerce features, and settings modules.
They describe a composition; they do not write files.

This repository publishes the contracts, not a generator. Turning a composition
into starter source — routes, navigation, module config, fixtures, screen
configs — is left to the consumer, because what a generated app should look like
is a product decision rather than a UI one.

A template declares its type in `template.json`:

```json
{
	"id": "shopify-app-kit-community",
	"appTemplate": "shopify",
	"requirements": {
		"capabilities": ["account", "commerce", "cart", "checkout", "settings", "billing"]
	}
}
```

`createAppTemplateManifest` turns `appTemplate` plus `requirements` into a
machine-readable manifest carrying three parts:

- `editionMetadata`: stable template family/edition identity, version,
  integrations, distribution, documentation entry id, and artifact identity.
  Related editions share `familyId` while keeping separate `templateId` values.
- `selection`: the selected scaffold template, default settings preset, base
  capabilities, and recommended use cases for scaffold pickers.
- `composition`: the resolved app template, capabilities, auth providers,
  commerce features, and settings modules.

`assertTemplateEditionMetadata` validates that shape, so a consumer that builds
its own generator can reuse the same contract instead of inventing a manifest
format.

## Settings Module

Settings is the first module that should behave like a configurable system, because every app needs it but every app differs.

Use:

```tsx
import { SettingsScreen, createSettingsModule } from "@osuki-dev/kit-community";

const module = createSettingsModule({
	template: "shopify",
	context: {
		appName: "Demo Shop",
		signedIn: true,
		userName: "Ada",
		userEmail: "ada@example.com",
		defaultAddressLabel: "Home",
		paymentMethodLabel: "Visa 4242",
		notificationsEnabled: true,
		shoppingModeEnabled: true,
	},
	handlers: {
		onManageOrders: () => {},
		onManageAddresses: () => {},
		onManagePayments: () => {},
		onToggleShoppingMode: (enabled) => {},
	},
	hiddenItems: ["notifications.marketing"],
	itemOverrides: {
		"commerce.orders": { label: "Purchases" },
	},
});

export function SettingsPage() {
	return <SettingsScreen module={module} />;
}
```

Supported settings templates:

| Template   | Modules                                                                               |
| ---------- | ------------------------------------------------------------------------------------- |
| `default`  | account, notifications, appearance, privacy, support                                  |
| `shopify`  | account, commerce, billing, integrations, notifications, appearance, privacy, support |
| `content`  | account, integrations, notifications, appearance, privacy, support                    |
| `internal` | account, developer, integrations, notifications, appearance, privacy, danger          |
| `saas`     | account, billing, integrations, notifications, appearance, privacy, support           |

## Account And Commerce Modules

The same pattern now exists for account and commerce:

```ts
import {
	createAccountModule,
	createCommerceModule,
	createAppTemplateManifest,
} from "@osuki-dev/kit-community";

const account = createAccountModule({
	providers: ["email", "apple", "google"],
	enableRegistration: true,
	enableProfile: true,
});

const commerce = createCommerceModule({
	features: ["product", "search", "cart", "checkout", "orders"],
	enableTabs: true,
});

const shopify = createAppTemplateManifest("shopify");
```

`createAppTemplateManifest("shopify")` currently assembles:

- `account`: login, registration, profile.
- `commerce`: product, search, cart, checkout, orders.
- `settings`: account, commerce, billing, integrations, notifications, appearance, privacy, support.
- navigation entries for tab-capable module routes.
- E2E flow ids from selected modules.
- a manifest that downstream scaffold tooling can package and diff.
