# Osuki Market

Osuki Market is the native Expo app in this workspace. It is structured like a real mobile commerce product: a curated shop, operational overview, client records, account preferences, checkout, and order tracking.

## Navigation

- `app/(tabs)/index.tsx`: Shop home
- `app/(tabs)/operations.tsx`: Business overview
- `app/(tabs)/account.tsx`: Account and preferences
- Root stack routes: product details, bag, checkout, order, client profiles, security, and supporting flows

The app uses Expo Router Native Tabs for the primary product areas and a root Stack for deeper workflows so detail pages keep a clear back path.

## Run

```bash
bun run dev
```

For a native Android build:

```bash
bun run android
```

## QA

```bash
bun run check
bun run e2e:generate
```

Agent-device flows live in `e2e/generated` and cover page loading, component interactions, and the purchase path.

## Data Boundary

The app intentionally separates public commerce data from customer account data:

- Product listing and product detail use Shopify Storefront API through `ShopifyStorefrontAdapter`.
- Cart, checkout draft state, orders, settings, and the default account experience are stored locally through SQLite so the template works out of the box.
- Account sign in, profile, addresses, and account order history are mocked by the local account backend. This keeps the template interactive without putting Customer Account API secrets, Admin API credentials, or confidential OAuth settings in the mobile bundle.

When a real account backend is available, keep the UI and hooks unchanged and replace the account side of the data layer behind `AccountDataAdapter`. A production integration should route Customer Account API/OAuth token handling through a backend or BFF owned by the app.

See `lib/data/README.md` for the adapter contract and replacement skeleton.
