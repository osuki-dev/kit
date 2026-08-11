---
name: osuki-ui-architecture
description: Preserve Osuki's React Native UI, theme, and component-composition architecture. Use when creating, changing, reviewing, or optimizing files in packages/ui, packages/kit-community UI or theme code, reusable Kit components, design tokens, theme providers, compound components, sheets, dialogs, menus, selects, forms, component variants, or UI render performance.
---

# Osuki UI Architecture

Apply these rules before editing reusable UI or theme code. Inspect existing consumers before changing a public API, then implement and verify the smallest coherent architectural change.

## Preserve Package Boundaries

- Keep `@osuki-dev/ui` MIT and domain-neutral. Put primitives, accessibility behavior, semantic tokens, component tokens, and generic composition state here.
- Keep `@osuki-dev/kit-community` focused on reusable screen recipes. Do not create a second global theme system or duplicate base semantic tokens.
- Keep industry workflows and complete product recipes out of both packages. Product cards, variant selectors, cart, checkout, and account flows may compose these primitives, but commerce behavior must not be pushed down into them.
- Do not weaken a package to make a downstream product look more valuable. A primitive that is worse than it could be helps no one.

## Use The Theme Layers

Maintain this dependency direction:

```text
foundation -> semantic -> domain -> component -> recipe
```

- Foundation tokens define raw color, spacing, radius, typography, motion, shadow, and icon scales.
- Semantic tokens describe purpose such as canvas, divider, focus, positive, caution, and critical.
- Domain tokens describe an industry such as commerce without owning component behavior.
- Component tokens reference foundation or semantic tokens. Avoid raw color and spacing literals in reusable components.
- Recipe tokens belong to a Kit or app and describe screen composition, not a parallel global theme.
- Keep light and dark values in presets. Keep component code mode-agnostic unless native platform behavior requires otherwise.
- Create theme overrides outside render or memoize them. Unstable override objects invalidate the full token context.
- Use a real color utility for alpha and blending. Do not append alpha hex to an arbitrary color string.
- Avoid duplicate aliases that expose the same token set under multiple names.

## Minimize Context Subscriptions

- Use `useThemeTokens()` in visual components that only read tokens.
- Use `useThemeMode()` only in controls that read or change the selected mode.
- Reserve `useTheme()` for app-level convenience when both token and mode state are genuinely needed.
- Keep token context separate from mode actions and persistence state.
- Memoize Provider values and callbacks. A Provider must expose a stable interface, not its internal state implementation.

For stateful composition roots, expose a typed interface shaped as:

```ts
interface ComponentContextValue<State, Actions, Meta> {
	state: State;
	actions: Actions;
	meta: Meta;
}
```

Consumers must depend on this contract rather than whether state is local, controlled, stored, or provided by an adapter.

## Compose Complex Components

- Use compound components for Sheet, Dialog, Select, Menu, Tabs, and other controls with independently replaceable regions.
- Prefer `Root`, `Trigger`, `Content`, `Header`, `Body`, `Footer`, and item subcomponents when those regions have meaningful behavior or customization.
- Keep a convenience facade for common usage when it materially reduces call-site code. Build it from the same primitives; do not maintain two implementations.
- Prefer children composition over `renderHeader`, `renderFooter`, or arrays of configuration objects when consumers need custom UI or behavior.
- Lift shared state to the nearest composition root so trigger, content, items, and actions share one source of truth.
- Centralize overlay dismissal, focus/accessibility state, safe-area handling, keyboard behavior, and haptics in the owning primitive.
- Do not expose arbitrary internal style slots as the first extension mechanism. Stable subcomponents and tokens are safer public contracts.

## Control Variants And Booleans

- Keep orthogonal semantic state booleans such as `disabled`, `loading`, `required`, and controlled `selected`.
- Replace booleans that select appearance, density, or layout with an explicit `variant`, `size`, or `layout` union.
- Replace multiple booleans that can create illegal combinations with one state union. For example, use `status: "pending" | "active" | "completed"` instead of `active` plus `completed`.
- Split components when booleans select fundamentally different ownership or behavior. Prefer `Screen`, `ScrollScreen`, and `Surface` over a primitive that conditionally owns scrolling, full-screen layout, and safe areas.
- Do not encode every state as a variant. Accessibility and async state remain state.

## Protect Native Performance

- Keep large lists virtualized and keep row props stable.
- Avoid allocating large style maps, option maps, or theme overrides on every render.
- Use Reanimated shared values for continuous animation; do not drive frame-by-frame motion through React state.
- Treat `memo`, `useMemo`, and `useCallback` as measured tools. Apply them at stable boundaries and list rows, not mechanically everywhere.
- Prevent theme or provider changes from rerendering unrelated subtrees.
- Keep touch targets at least 44x44 and preserve Android text vertical alignment, safe-area insets, keyboard behavior, and reduced-motion expectations.

## Migration Workflow

1. Read the primitive, its tokens, exports, documentation, tests, and all important consumers.
2. Classify each prop as content, semantic state, visual variant, layout ownership, or extension point.
3. Define the desired public composition contract before moving implementation.
4. Keep behavior in one implementation and build convenience APIs from it.
5. Update public exports, contract tests, component docs, and affected Kit consumers together.
6. Run `bun --filter @osuki-dev/ui check-types` and `bun --filter @osuki-dev/ui test` for UI changes.
7. Run affected Kit type checks and tests.
8. For interaction or visual changes, verify the real native flow on Android or iOS, including keyboard, safe areas, long text, loading, disabled, error, and dark mode states.

## Review Gate

Before finishing, confirm:

- There is one source of truth for theme and component state.
- The open UI primitive remains domain-neutral.
- No invalid boolean combinations were introduced.
- Complex regions are composable without copying the primitive.
- Theme consumers subscribe only to the state they need.
- Safe areas, keyboard, accessibility, and Android rendering are handled by the owning primitive.
- Public API changes include contracts, docs, and real consumer migration.

Adapted for Osuki from Vercel's React Composition Patterns: https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns
