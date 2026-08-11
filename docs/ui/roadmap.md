# UI Roadmap

This file decides which new components are accepted. `@osuki-dev/ui` grows
around work that repeats across admin, commerce, account, settings, and
content-heavy mobile apps — not around one screen that needed something once.

[CONTRIBUTING.md](../../CONTRIBUTING.md) points here for a reason: a PR adding a
component that is not on **Accepting proposals** below is closed on scope, not
on quality. That is not meant to be discouraging — it means the decision is
predictable and made before you write the code.

## Shipped

Everything below is exported, documented in
[components.md](components.md), and covered by the `/component-e2e` route.

**Foundation** — theme provider, typography, theme presets for brand, density,
and shape.

**Layout** — `Screen`, `ScrollScreen`, `Surface`, `Card`, `Stack`, `Section`,
`Divider`, `ResponsiveContainer`, `ResponsiveGrid`, keyboard-aware wrappers.

**Actions** — `Button`, `PressableScale`, `PressableCard`.

**Forms** — `Input`, `Textarea`, `SearchInput`, `Select`, `DateInput`,
`Checkbox`, `RadioGroup`, `Toggle`, `SegmentedControl`, `Stepper`, `OtpInput`,
`FieldGroup`, `Tabs`.

**Feedback** — `Alert`, `ToastProvider`/`useToast`, `Skeleton`, `Spinner`,
`InlineActivity`, `LoadingView`, `EmptyState`, `ErrorView`, `ProgressBar`,
`SegmentedProgressBar`, `Badge`, `Tag`.

**Overlays** — `Modal`, `Dialog`, `BottomSheet`, `ActionSheet`, `Menu`,
`Tooltip`.

**Data and display** — `ListItem`, `DataRow`, `DataTable`, `StatRow`,
`MetricCard`, `Timeline`, `Avatar`, `AvatarGroup`, `Image`, `Pagination`.

**Navigation** — `TopBar`, `Toolbar`.

## Accepting proposals

These are on the list and not yet built. A PR implementing one is welcome —
open an issue first so the API is agreed before you write it.

- `CommandPalette`
- `Breadcrumbs`

## Not accepted in `@osuki-dev/ui`

These encode app-level semantics rather than primitive UI behavior. They are
valuable, but they belong in `@osuki-dev/kit-community` or in app source:

`ProductCard`, `OrderSummary`, `QuantityStepper`, `AccountHeader`,
`SettingsRow`, `PreferenceGroup`, `CheckoutStepper`.

The test is not "is this reusable" — these all are. It is whether the component
would have to know what a product, an order, or an account is.

## Proposing something not on this list

Open an issue describing **the problem you hit**, not the component you want.
Most requests turn out to be composable from existing primitives, and the ones
that are not become entries under _Accepting proposals_. Include:

- the screen you were building and what you had to write by hand
- why composing existing primitives did not work
- whether the same shape shows up in more than one kind of app

A component earns a place here by appearing in unrelated products, not by being
needed once.

## Before a new component ships

Anything added under _Accepting proposals_ must clear
[the quality bar](component-quality-bar.md) and:

- appear in [components.md](components.md) and the package README —
  `bun run check:docs-coverage` fails the build otherwise
- render in light and dark without consumer-side styles
- survive long English **and** long CJK text
- expose a stable `testID` and appear in the `/component-e2e` route
- ship with a changeset, since a new export is a minor bump
