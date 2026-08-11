# Osuki Data Layer

The native app keeps commerce and customer account responsibilities separate.

## Current Adapters

- `ShopifyStorefrontAdapter` reads public product data from Shopify Storefront API.
- `ApiOsukiAdapter` is a scaffold for a remote backend with the same product, cart, order, and settings contract.
- `BffAccountAdapter` connects only account methods to a backend/BFF.
- `SQLiteOsukiAdapter` stores cart state, orders, settings, and deterministic local data on device.
- `LocalAccountAdapter` is the explicit mock account backend used by default.
- `createDefaultAccountAdapter` selects `LocalAccountAdapter` by default and switches to `BffAccountAdapter` only when `EXPO_PUBLIC_OSUKI_ACCOUNT_BFF_URL` is configured.
- `AccountDataAdapter` is the boundary for sign in, sign up, profile, addresses, and account order history.
- Screens consume hooks such as `useProducts`, `useCart`, `useAccount`, and `useSettings`; they do not access SQLite or Shopify directly.

The default app intentionally uses `LocalAccountAdapter` backed by SQLite settings and seed data. This makes the template fully interactive without shipping Customer Account API secrets, Admin API credentials, or confidential OAuth settings in the mobile bundle.

## Shopify Storefront

Shopify product reads use GraphQL over HTTP through `react-native-nitro-fetch` on native and standard `fetch` on web. Apollo is not required for this template.

```sh
EXPO_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN=osuki-77sfxugu.myshopify.com
EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
EXPO_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION=2026-04
```

Storefront public access tokens can be configured in the app. Customer Account API credentials, Admin API tokens, OAuth client secrets, and refresh tokens should not be shipped in the app.

## Account Mode

The default account mode is local and deterministic:

```sh
# unset by default
EXPO_PUBLIC_OSUKI_ACCOUNT_BFF_URL=
```

Set `EXPO_PUBLIC_OSUKI_ACCOUNT_BFF_URL` only when the app has a backend that owns Shopify Customer Account API OAuth, token refresh, and session security. The mobile bundle should not contain Shopify Admin credentials, private Storefront tokens, Customer Account API client secrets, or refresh tokens.

## Replacing The Account Mock

Keep UI screens and hooks unchanged. Replace the account methods behind `AccountDataAdapter` with a backend/BFF implementation:

```tsx
import { BffAccountAdapter, OsukiDataProvider } from "@/lib/data";

<OsukiDataProvider
	accountAdapter={
		new BffAccountAdapter({
			baseUrl: "https://api.example.com",
			getToken: () => getAppSafeSessionToken(),
		})
	}
>
	<App />
</OsukiDataProvider>;
```

Product reads still come from Shopify Storefront, while account reads and writes go to the BFF. If you want to replace the entire commerce backend too, pass a full `adapter` to `OsukiDataProvider` instead.

In production, the BFF owns Shopify Customer Account OAuth, token refresh, session cookies, and account/customer mapping. The mobile app should receive only app-safe session state and normalized account data. See `bff-account-adapter.ts` for the account endpoint contract.

Until those backend credentials are available, keep the default local account mock. It exercises the same UI hooks, checkout prefill, address selection, and account order surfaces that a production account backend will use later.

## Deterministic Local Data

For deterministic e2e data, set:

```sh
EXPO_PUBLIC_OSUKI_DATABASE_NAME=osuki-e2e.db
EXPO_PUBLIC_OSUKI_RESET_DB=1
```

To switch to another commerce backend later, construct `OsukiRepository` with another `OsukiDataAdapter` inside `OsukiDataProvider`.
