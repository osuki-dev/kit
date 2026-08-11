# Security Policy

## Supported versions

| Package                    | Version | Supported |
| -------------------------- | ------- | --------- |
| `@osuki-dev/ui`            | 0.2.x   | ✅        |
| `@osuki-dev/kit-community` | 0.2.x   | ✅        |
| Both                       | < 0.2   | ❌        |

During 0.x only the latest minor receives fixes. There is no backporting.

## Reporting a vulnerability

**Do not open a public issue.**

Report privately through GitHub:

1. Go to the [Security tab](https://github.com/osuki-dev/kit/security)
2. Choose **Report a vulnerability**
3. Describe the issue, affected versions, and a reproduction

You will get an acknowledgement within 5 working days. If a report is confirmed,
we will agree a disclosure timeline with you before publishing anything.

## Scope

These packages are UI libraries. They ship no network client, no credential
storage, and no authentication code, so the realistic surface is narrow. Reports
we do want:

- A component that renders untrusted input in a way that escapes its container
  or triggers unintended navigation
- A theme or config path that lets caller-controlled data reach a native API
- A dependency in `dependencies` or `peerDependencies` with a known advisory
- Anything in a published archive that should not have shipped — credentials,
  private source, or machine-local paths

Out of scope:

- The showcase app in `apps/native`. It runs on mock data and local adapters
  behind a public Shopify Storefront token against a demo store, and is not a
  deployment target.
- Vulnerabilities in Expo, React Native, or another upstream dependency. Report
  those to the upstream project; tell us if you need a version bump here.

## Handling of secrets

This repository must never contain credentials. The one committed secret-shaped
value is the Shopify Storefront **public** access token in
`apps/native/lib/data/shopify-storefront-adapter.ts`, which points the showcase
app at a demo store. Shopify designs that token class to be embedded in client
code: it grants anonymous catalog reads and cart creation, nothing more. Any
Admin API token, OAuth client secret, customer access token, refresh token, or
`.env` file is out of bounds — if you find one, treat it as a vulnerability and
report it privately.
