# Repository boundary

This repository is public and MIT licensed. It contains two published packages
and one showcase app:

- `packages/ui` — `@osuki-dev/ui`, the UI primitives and theme
- `packages/kit-community` — `@osuki-dev/kit-community`, the screen templates
- `apps/native` — the Expo showcase app that exercises both

That is the whole scope. Never add product business logic, production
credentials, license enforcement, or deployment automation here. These packages
stay domain-neutral: a primitive must not learn what a product, an order, or an
account is, and a screen template must not acquire a network client.

# Osuki UI architecture

For any work that creates, changes, reviews, or optimizes reusable UI
components, themes, providers, design tokens, component variants, sheets,
dialogs, selects, menus, forms, or UI render performance, read and follow:

```txt
.agents/skills/osuki-ui-architecture/SKILL.md
```

Treat it as the architectural contract for `packages/ui` and the UI/theme code
in `packages/kit-community`. Apply it before planning or editing so package
boundaries, theme layering, composition APIs, and native performance do not
drift.

For consuming the packages rather than changing them, read:

```txt
.agents/skills/osuki-kit/SKILL.md
```

# Checks

```sh
bun run check              # oxlint, oxfmt --write, turbo check-types test
bun run check:ci           # same, but oxfmt --check
bun run check:app-contracts
bun run check:docs-coverage
bun run smoke:public-packages
```

`check:docs-coverage` fails when an exported component is missing from
`docs/ui/components.md` or the package README. Adding an export means updating
both in the same change.

# Commit messages

Use Conventional Commit subjects for every repository commit:

```txt
feat: add template edition metadata
fix: preserve generated catalog links
docs: explain the metadata handoff
test: cover Community and Pro manifests
chore: refresh generated artifacts
```

Use a lowercase type followed by `: ` and a concise imperative subject. Prefer
`feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, or `chore`. Do
not use bare sentence-style subjects such as `Update files` or `Complete work`.

# Releasing

Any change to published behavior needs a changeset (`bun run changeset`). CI
opens the version PR and publishes to npm. Read `docs/releasing.md` before
changing the release flow — particularly the rule that renaming a semantic or
component token is a breaking change.

# agent-device

Use `agent-device` only for app and device automation tasks.

Before planning device work, run:

```sh
agent-device --version
agent-device help workflow
```

For exploratory QA, read:

```sh
agent-device help dogfood
```

For logs, network, traces, profiling, alerts, or runtime failures, read:

```sh
agent-device help debugging
```

For React Native component trees, props, state, hooks, slow renders, or
rerenders, read:

```sh
agent-device help react-devtools
```

For React Native, Expo, Metro, Fast Refresh blockers, overlays, or React
DevTools routing, read:

```sh
agent-device help react-native
```

Use either MCP tools or the CLI in the integrated terminal. If `agent-device` is
not on `PATH` but the user installed it globally in another shell, resolve the
absolute binary path the same way the user would from a normal terminal session.
Do not silently fall back to `npx -y agent-device@latest`.

Prefer this loop for app verification:

```txt
open -> snapshot -i -> act -> re-snapshot -> verify -> close
```

Use current refs such as `@e3` from `snapshot -i` for exploration and selectors
such as `id="submit"` or `label="Save"` for durable commands. Keep mutating
commands against one session serial. Capture screenshots, logs, network, perf,
traces, recordings, and `.ad` replay scripts only when they add evidence.

For reviews or planning-only tasks, do not run devices unless explicitly
requested.

# Expo simulator preview

The showcase app lives in `apps/native`.

```sh
cd apps/native
bun run sim
```

Open `http://localhost:50042` for the standalone simulator preview. Metro also
mounts the preview middleware at `http://localhost:8081/.sim` while `bun run dev`
is running.

Do not expose `serve-sim` on `0.0.0.0` or a public network unless the user
explicitly asks and accepts the risk.

# Agent-device e2e coverage

The showcase app's generated e2e suite lives in `apps/native/e2e`.

```sh
cd apps/native
bun run e2e:generate
bun run e2e:ios      # or: bun run e2e:android
```

The suite is executed by `agent-device test --maestro`, writes artifacts to
`apps/native/e2e/artifacts`, and covers one flow per page plus the
`/component-e2e` route for exported `@osuki-dev/ui` primitives. When adding a
page or exported UI component, update
`apps/native/e2e/generate-agent-device-flows.mjs` in the same change.
