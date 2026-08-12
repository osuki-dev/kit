# @osuki-dev/kit-community

Osuki Design System - Application Kit

Schema-driven UI templates for rapid application development. Build complete screens with configuration objects.

## Features

- **30+ Pre-built Templates**: Complete screens ready to use
- **Configuration-Driven**: Screens from JSON-like config objects
- **Type-Safe**: Full TypeScript support with Zod validation
- **Responsive**: Automatic mobile/desktop adaptation
- **Style Overrides**: Customize every template

## Installation

```bash
bun add @osuki-dev/kit-community
```

Nothing is bundled. Beyond `@osuki-dev/ui` and its own peers, this package
expects the host app to provide `zod`, `react-native-safe-area-context`,
`react-native-reanimated`, and `@tanstack/react-form` (used by `TanstackForm`),
so there is exactly one copy of each in the app.

## Templates

### 🏢 Business Templates

| Template         | Description         | Key Features                             |
| ---------------- | ------------------- | ---------------------------------------- |
| `LoginScreen`    | Authentication page | Social login, error handling, responsive |
| `RegisterScreen` | Sign up flow        | Validation, terms, responsive            |
| `ProfileScreen`  | User profile        | Avatar, stats, actions, bio              |
| `SettingsScreen` | App settings        | Sections, toggles, links                 |
| `SecurityScreen` | Security center     | 2FA, sessions, danger zone               |

### 📊 Data Templates

| Template          | Description        | Key Features                            |
| ----------------- | ------------------ | --------------------------------------- |
| `ListScreen`      | Entity list view   | Virtualized rows, search, sort, actions |
| `DetailScreen`    | Entity details     | Hero, sections, metadata                |
| `FormScreen`      | Data entry         | Validation, sections, responsive        |
| `DashboardScreen` | Analytics overview | Widgets, stats, progress                |
| `SearchScreen`    | Search results     | Filters, trending, history              |

### 💬 Social Templates

| Template           | Description     | Key Features                   |
| ------------------ | --------------- | ------------------------------ |
| `ChatScreen`       | Messaging UI    | Bubbles, typing, quick replies |
| `OnboardingScreen` | User onboarding | Steps, progress, skip          |
| `GalleryScreen`    | Image gallery   | Grid/masonry, filters          |

### 🛍️ E-Commerce Templates

| Template         | Description     | Key Features                      |
| ---------------- | --------------- | --------------------------------- |
| `ProductScreen`  | Product details | Gallery, specs, variants, reviews |
| `CartScreen`     | Shopping cart   | Items, quantity, promo codes      |
| `CheckoutScreen` | Checkout flow   | 3-step (address→payment→review)   |
| `OrderScreen`    | Order status    | Timeline, tracking, items         |

### 📰 Content Templates

| Template             | Description   | Key Features                 |
| -------------------- | ------------- | ---------------------------- |
| `ArticleScreen`      | Blog/article  | Author, content, related     |
| `FeedScreen`         | Social feed   | Posts, likes, media          |
| `MediaPlayerScreen`  | Audio/Video   | Controls, progress, playlist |
| `NotificationCenter` | Notifications | Grouped, filters, badges     |

### 🛠️ Tool Templates

| Template         | Description    | Key Features               |
| ---------------- | -------------- | -------------------------- |
| `CalendarScreen` | Calendar view  | Month/week/day, events     |
| `CameraScreen`   | Camera/Scanner | Photo/video/QR modes       |
| `FileBrowser`    | File manager   | List/grid, selection, sort |

### ⚠️ Special Pages

| Template           | Description        | Key Features                  |
| ------------------ | ------------------ | ----------------------------- |
| `ErrorScreen`      | Error pages        | 404, 500, network, permission |
| `EmptyStateScreen` | Empty states       | Icon, message, CTA            |
| `LoadingScreen`    | Loading state      | Spinner, message              |
| `WelcomeScreen`    | Welcome/onboarding | Brand, features, CTAs         |

### 🧭 Navigation Containers

| Template          | Description          | Key Features              |
| ----------------- | -------------------- | ------------------------- |
| `TabbedScreen`    | Top tabs container   | Configurable tabs, badges |
| `BottomNavScreen` | Bottom nav container | 3-5 items, badges         |

## Kit Components

| Component         | Description                      |
| ----------------- | -------------------------------- |
| `FormField`       | Auto-render field by type        |
| `SettingsItem`    | Settings row (toggle/link/value) |
| `SettingsSection` | Grouped settings                 |
| `SecurityItem`    | Security check item              |
| `SessionList`     | Active sessions                  |
| `ValidationError` | Form error display               |
| `EmptyState`      | Empty state placeholder          |

## Usage Example

```tsx
import { ProductScreen } from "@osuki-dev/kit-community";
import type { ProductScreenConfig } from "@osuki-dev/kit-community";

const config: ProductScreenConfig = {
	name: "Wireless Headphones",
	price: 299,
	images: ["url1", "url2"],
	rating: 4.5,
	inStock: true,
	primaryAction: {
		label: "ADD TO CART",
		onPress: () => addToCart(),
	},
};

export default function ProductPage() {
	return <ProductScreen config={config} />;
}
```

## Composable Modules

Screens can be assembled from higher-level modules so a scaffold can choose the right slices for an app type.

```tsx
import {
	SettingsScreen,
	composeAppScaffold,
	createComposedAppTemplateManifest,
	createSettingsModule,
	describeSettingsModule,
} from "@osuki-dev/kit-community";

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

const manifest = createComposedAppTemplateManifest({
	appType: "shopify",
	capabilities: shopifyComposition.summary.capabilities,
});

const settingsDescriptor = describeSettingsModule({
	template: "shopify",
	visibleSections: ["commerce", "billing", "integrations"],
});

const settingsModule = createSettingsModule({
	template: "shopify",
	sectionOrder: ["account", "commerce", "billing", "integrations", "notifications"],
	itemOrder: {
		billing: ["billing.plan", "billing.invoices", "billing.status"],
	},
	groups: [
		{ id: "store", title: "Store operations", sections: ["commerce", "billing"] },
		{ id: "platform", title: "Platform", sections: ["integrations"] },
	],
	context: {
		appName: "Demo Shop",
		signedIn: true,
		userName: "Ada",
		userEmail: "ada@example.com",
		defaultAddressLabel: "Home",
		paymentMethodLabel: "Visa 4242",
		planName: "Launch",
		billingStatus: "Active",
		integrationCount: 3,
		connectedStoreLabel: "Demo Shopify",
		notificationsEnabled: true,
		shoppingModeEnabled: true,
	},
	handlers: {
		onEditProfile: () => {},
		onManageOrders: () => {},
		onManageAddresses: () => {},
		onManagePayments: () => {},
		onManagePlan: () => {},
		onManageIntegrations: () => {},
		onManageApiKeys: () => {},
		onToggleNotifications: (enabled) => {},
	},
	hiddenItems: ["notifications.marketing"],
	itemOverrides: {
		"commerce.orders": { label: "Purchases" },
		"billing.plan": { label: "Subscription" },
	},
});

export function SettingsPage() {
	return <SettingsScreen module={settingsModule} />;
}
```

Use `composeAppScaffold()` when a user picks an app type or describes required capabilities. It returns the account, commerce, and settings module selection that can be passed into manifest generation. For example, a Shopify app selects account, product display, search, cart, checkout, orders, billing, integrations, and settings; a SaaS app can select account, billing, integrations, and settings without pulling in commerce screens.

Use `createSettingsModule()` as the settings composition boundary. It supports `visibleSections`, `visibleItems`, `sectionOrder`, `itemOrder`, `groups`, `groupOverrides`, `hiddenItems`, and `itemOverrides`, so generated apps can reshape a settings center without forking `SettingsScreen`.

Use `describeSettingsModule()` when building a scaffold UI. It returns serializable groups, sections, items, layout order, and capability flags so a user can preview what a settings template will include before the app is generated.

Available settings templates:

| Template   | Included modules                                                                      |
| ---------- | ------------------------------------------------------------------------------------- |
| `default`  | Account, notifications, appearance, privacy, support                                  |
| `shopify`  | Account, commerce, billing, integrations, notifications, appearance, privacy, support |
| `content`  | Account, integrations, notifications, appearance, privacy, support                    |
| `internal` | Account, developer, integrations, notifications, appearance, privacy, danger          |
| `saas`     | Account, billing, integrations, notifications, appearance, privacy, support           |

## Template Configuration

All templates accept:

```typescript
interface TemplateProps {
	config: TemplateConfig; // Required configuration
	isLoading?: boolean; // Loading state
	styleOverrides?: {
		// Style customization
		container?: ViewStyle;
		header?: ViewStyle;
		content?: ViewStyle;
		// Template-specific areas...
	};
}
```

## Complete Example: E-Commerce Flow

```tsx
// Product → Cart → Checkout → Order

// 1. Product Screen
<ProductScreen
  config={{
    name: "Product",
    price: 100,
    images: [...],
    primaryAction: { label: "ADD TO CART", onPress: () => {} }
  }}
/>

// 2. Cart Screen
<CartScreen
  config={{
    items: [...],
    subtotal: 100,
    shipping: 10,
    total: 110,
    primaryAction: { label: "CHECKOUT", onPress: () => {} }
  }}
/>

// 3. Checkout Screen
<CheckoutScreen
  config={{
    currentStep: "shipping",
    items: [...],
    total: 110,
    shippingAddress: {...}
  }}
/>

// 4. Order Screen
<OrderScreen
  config={{
    orderId: "ORD-123",
    status: "shipped",
    items: [...],
    timeline: [...]
  }}
/>
```

## Entity System

Define entities with Zod schemas:

```typescript
import { defineEntity } from '@osuki-dev/kit-community';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  status: z.enum(['active', 'inactive']),
});

const UserEntity = defineEntity(UserSchema, {
  name: 'User',
  icon: 'User',
  list: {
    title: 'USERS',
    columns: [
      { key: 'name', label: 'NAME', variant: 'primary' },
      { key: 'email', label: 'EMAIL' },
      { key: 'role', label: 'ROLE', type: 'tag' },
    ],
  },
  detail: {
    title: 'USER DETAILS',
    hero: { title: 'name', subtitle: 'email' },
    sections: [
      { id: 'info', title: 'INFORMATION', fields: ['name', 'email', 'role'] },
    ],
  },
});

// Use with ListScreen/DetailScreen
<ListScreen entity={UserEntity} data={users} />
<DetailScreen entity={UserEntity} data={user} />
```

## License

MIT
