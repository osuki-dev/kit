# What this changes

<!-- One or two sentences. Link the issue if there is one. -->

Closes #

## Why

<!-- The defect or the constraint. Skip if the title already says it. -->

## Checks

```bash
bun run check
bun run check:app-contracts
bun run check:docs-coverage
bun run smoke:public-packages
```

- [ ] All four pass locally
- [ ] Commit subjects follow Conventional Commits

## If this touches a component

- [ ] Verified in light **and** dark mode
- [ ] Verified with long English text and long CJK text
- [ ] Interactive targets are at least 44px
- [ ] `testID` still passes through
- [ ] Colors and spacing come from `useTheme`, not literals
- [ ] Verified on iOS **and** Android

<!--
Verified on one platform only? Say which. A reviewer can run the other, but
only if you tell them it was not covered.
-->

## If this changes a public API

- [ ] `docs/ui/components.md` and the package README are updated (`check:docs-coverage` enforces this)
- [ ] No `workspace:`, `catalog:`, `file:`, or `link:` range added to any dependency field
- [ ] The `react-native` export condition still points at `./src`

Renaming a semantic or component token is a breaking change: consumers key
their theme overrides on those names. Call it out here if this PR does that.

## If this touches native configuration

- [ ] The setting lives in `apps/native/app.json`, not in a generated `ios/` or `android/` project

## Screenshots

<!-- Required for anything visual. Light and dark, both platforms if possible. -->
