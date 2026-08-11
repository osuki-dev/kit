# Contributing to Osuki Kit

Thanks for taking the time to look at this. This document is short and blunt so
you can tell quickly whether a change is likely to land.

## What we accept

| Change                                                 | Status                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| Bug fixes                                              | ✅ Send a PR                                               |
| Accessibility fixes                                    | ✅ Send a PR                                               |
| Platform behavior differences (iOS vs Android)         | ✅ Send a PR                                               |
| Documentation and examples                             | ✅ Send a PR                                               |
| New props, variants, or sizes on an existing component | ⚠️ Open an issue first                                     |
| A new component                                        | ⚠️ Decided by [the roadmap](docs/ui/roadmap.md), not by PR |
| A second styling system, or a runtime dependency       | ❌ Not accepted                                            |
| Business logic in `@osuki-dev/ui`                      | ❌ Not accepted                                            |

The last two are architectural, not stylistic. `@osuki-dev/ui` stays
domain-neutral: no checkout flow, no network clients, no product-specific
storage. Screen-level recipes belong in `@osuki-dev/kit-community`.

If you want a component that is not on the roadmap, open an issue describing the
problem you hit — not the component you want. Most requests are better solved by
composing existing primitives, and the ones that are not become roadmap items.

## Setup

```bash
bun install
```

Run the showcase app on a simulator or emulator:

```bash
cd apps/native
bun run ios       # or: bun run android
```

The `ios/` and `android/` projects are generated and not committed. Anything
that must survive regeneration belongs in `apps/native/app.json` — bundle
identifiers, icons, the splash screen, the iOS privacy manifest, and config
plugins. Editing a generated project directly is discarded by the next
`expo prebuild`.

## Before you open a PR

```bash
bun run check                  # lint, format, types, tests
bun run check:app-contracts    # app-level UI contracts
bun run check:docs-coverage    # every exported component is documented
bun run smoke:public-packages  # both packages pack and install cleanly
```

All four must pass. `bun run check` writes formatting changes, so commit
whatever it produces.

## Component changes

Every component shipped from `@osuki-dev/ui` must meet
[the quality bar](docs/ui/component-quality-bar.md). The short version:

- Read colors and spacing from `useTheme`; no raw literals when a token exists
- Light and dark mode without separate consumer styles
- Interactive targets at least 44px
- Stable `testID` pass-through
- Long English **and** long CJK text without layout breakage
- Typed props, no `any`
- Animation clarifies state; it does not decorate

Check your change against the review list in that document before opening a PR.

## Package boundaries

`packages/ui` and `packages/kit-community` publish to npm. Two rules follow from
that:

- **Never publish a path-based protocol.** `workspace:`, `file:`, and `link:`
  ranges do not survive publishing, and the contract tests fail the build if one
  appears in `dependencies`, `peerDependencies`, or `optionalDependencies`.
  `catalog:` is fine and is what the workspace uses — `bun pm pack` substitutes
  the catalog version into the archive, and `smoke:public-packages` asserts that
  on the real archive rather than trusting the source manifest.
- **React Native resolves source, everything else resolves `lib/`.** Ten
  components use Reanimated worklets that must be compiled by Reanimated's Babel
  plugin, which Metro runs over `node_modules`. Keep the `react-native` export
  condition pointing at `./src`.

## Commits

Use Conventional Commit subjects:

```txt
fix: keep the sheet backdrop above the keyboard
feat: add a size union to SegmentedControl
docs: document the theme preset registry
test: cover long CJK labels in ListItem
```

Lowercase type, then `: `, then a concise imperative subject. Prefer `feat`,
`fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, or `chore`.

## Changesets

If your change affects published behavior, add a changeset:

```bash
bun run changeset
```

Write one sentence aimed at a consumer — it becomes the changelog entry. Skip it
for the showcase app, docs, CI, and repository policy. Full detail in
[docs/releasing.md](docs/releasing.md).

## Reporting a bug

Include the versions from the support matrix in the [README](README.md), the
platform, and a minimal reproduction. A screenshot or recording helps for
anything visual.

One thing we ask specifically: if you report that a change "had no effect" in a
simulator, first confirm your edit actually reached the device — a stale bundle
looks exactly like a broken component.

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).
