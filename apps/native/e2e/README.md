# Agent Device E2E

Osuki Kit uses Agent Device for real simulator E2E. The suite is split into three layers so daily UI work stays fast while release checks can still be broad.

## Layout

- `maestro/ios` and `maestro/android`: hand-written smoke flows. Keep these short, stable, and focused on the product purchase/account loop.
- `generated`: generated route and component coverage. Do not edit these files by hand; run `bun run e2e:generate`.
- `replay/ios` and `replay/android`: recorded `.ad` replay scripts for deterministic flows that need precise selectors.
- `artifacts`: screenshots, videos, replay timing, and JUnit output. This directory is ignored by git.

## Prerequisites

1. Install and boot the target simulator/emulator.
2. Install the native dev build with app id `dev.osuki.kit`.
3. Start Metro from this package:

```sh
bun run dev
```

If a native module was added or changed, rebuild first:

```sh
bun expo prebuild
bun run ios
bun run android
```

## Daily Smoke Runs

```sh
bun run e2e:ios
bun run e2e:android
```

Pass a specific device through to Agent Device after `--`:

```sh
bun run e2e:ios -- --udid CED32909-9A08-498A-BF5B-940F1C0BECF3
bun run e2e:android -- --serial emulator-5554
```

Record video for a smoke run:

```sh
bun run e2e:ios:record
bun run e2e:android:record
```

Artifacts are written to:

```txt
e2e/artifacts/maestro-ios-smoke
e2e/artifacts/maestro-android-smoke
```

## Generated Coverage

Run this before release-level checks or after broad navigation/component changes:

```sh
bun run e2e:generated:ios
bun run e2e:generated:android
```

Generated coverage includes one flow per route plus the `/component-e2e` screen that exercises exported `@osuki-dev/ui` primitives.

## Replay Workflow

Agent Device replay is a two-pass workflow:

1. Explore or record with a live device session.
2. Re-run the recorded `.ad` file deterministically with `agent-device test`.

Record an iOS flow:

```sh
agent-device open dev.osuki.kit --platform ios --session record-checkout --save-script ./e2e/replay/ios/checkout.ad
agent-device snapshot -i --session record-checkout
# interact with refs, for example: agent-device click @e13 --session record-checkout
agent-device close --session record-checkout
```

Run recorded replay scripts:

```sh
bun run e2e:replay:ios
bun run e2e:replay:android
```

When selectors go stale after UI work, update locally and review the diff before committing:

```sh
agent-device replay -u ./e2e/replay/ios/checkout.ad --session update-checkout
```

## Authoring Standards

- Every screen and interactive UI primitive must expose a stable `testID`.
- Prefer `testID` or accessibility labels over visible text for dynamic, localized, or Shopify-sourced content.
- Keep one flow to one user intent: purchase loop, account preferences, search, order tracking, auth validation, etc.
- Put platform-specific expectations in the matching `maestro/<platform>` or `replay/<platform>` directory.
- Avoid hard-coded LAN dev URLs in maintained smoke flows. Prefer app deep links such as `osuki:///search`.
- Use `clearState: true` for smoke flows that must start from default locale/theme state.
- Capture screenshots or video for visual polish regressions and keep only useful evidence in commits.
