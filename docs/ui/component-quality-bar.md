# UI Component Quality Bar

This is the minimum bar for components shipped from `@osuki-dev/ui`.

## Scope

`packages/ui` contains primitives and reusable app components. It must stay
business-neutral: no checkout flow, no Shopify integration, no license checks,
no network clients, and no product-specific persistence.

Business screens belong in `@osuki-dev/kit-community` or paid app source.

## Required Standards

Every component must meet these standards before export:

- Use theme tokens from `useTheme`; do not hardcode brand colors when a token
  exists.
- Support light and dark mode without separate consumer styles.
- Keep touch targets at least 44px for interactive controls.
- Provide stable `testID` pass-through or generated child test ids.
- Support long text without layout breakage using wrapping, `numberOfLines`, or
  `adjustsFontSizeToFit` where appropriate.
- Expose typed props with no `any`.
- Preserve platform behavior for accessibility roles, labels, disabled state,
  modal semantics, and keyboard input.
- Avoid product-specific copy, business data, API calls, or storage keys.
- Keep animation restrained and state-driven; animation should clarify state,
  not decorate it.
- Export from `packages/ui/src/components/index.ts` and document in README or
  component docs.

## Review Checklist

Use this checklist for each new component:

- Default state
- Disabled state when applicable
- Loading or pending state when applicable
- Error/warning/success variants when applicable
- Long English text
- Long CJK text
- Dark mode
- Small mobile width
- Screen reader label or semantic role
- TypeScript check
- OSS boundary check

## Public Release Rule

Before publishing the packages, run:

```bash
bun run check
bun run smoke:public-packages
```

Do not publish if either command fails.
