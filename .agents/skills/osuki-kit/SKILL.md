---
name: osuki-kit
description: Build React Native and Expo screens with @osuki-dev/ui and @osuki-dev/kit-community. Use when writing or reviewing app UI that imports either package — picking a component, theming, dark mode, spacing, CJK text, screen templates, or wiring testIDs. For changing the packages themselves, use osuki-ui-architecture instead.
---

# Osuki Kit

Two packages, one theme.

- **`@osuki-dev/ui`** — 65 primitives: `Text`, `Button`, `Input`, `Select`,
  `Sheet`, `Dialog`, `Tabs`, `ListItem`, `Screen`, `EmptyState`, and the theme.
  This is the layer you build screens _out of_.
- **`@osuki-dev/kit-community`** — ~30 whole screens driven by config objects:
  `LoginScreen`, `SettingsScreen`, `ProductScreen`, `CheckoutScreen`,
  `ListScreen`, `DashboardScreen`. This is the layer you build screens _from_
  when the screen is a shape the kit already knows.

Reach for `kit-community` first when the screen is a standard shape, and drop to
`@osuki-dev/ui` when it is not. Do not rebuild a login or settings screen out of
primitives because you did not check whether a template existed.

## Read the docs before writing code

The authoritative docs ship **inside the npm package**, so they always match the
installed version and need no network:

```txt
node_modules/@osuki-dev/ui/docs/
```

In this repository they are at `packages/ui/docs/`. Read the one that matches
what you are doing — do not read all five.

| You are…                         | Read                 |
| -------------------------------- | -------------------- |
| setting up a new app             | `getting-started.md` |
| choosing a component             | `components.md`      |
| theming, dark mode, brand colour | `theme.md`           |
| assembling a whole screen        | `patterns.md`        |
| reviewing a diff                 | `conventions.md`     |

`README.md` in that folder is the 60-second index. Start there if unsure.

For `kit-community` screen templates and their config shapes, read
`node_modules/@osuki-dev/kit-community/README.md` (in this repository:
`packages/kit-community/README.md`), then the screen's own props type in
`src/screens/`.

## The four rules

These are the ones that produce a broken screen rather than an ugly one, and
four of the five most common review findings. Apply them without being asked.

**1. Colour comes from the theme, never from a literal.** No hex, no `rgba()`,
no named CSS colour in application code.

```tsx
// wrong — invisible until someone opens dark mode
<View style={{ backgroundColor: "#F6F7F9" }} />;

// right
const { colors } = useThemeTokens();
<View style={{ backgroundColor: colors.surfaceRaised }} />;
```

**2. Spacing and radius come from tokens.** `theme.spacing.md`, not `12`. The
scale is the only reason a screen made of six components reads as one screen.

**3. Anything tappable is at least 44pt.** The components enforce it; a layout
wrapping them can defeat it. If you set a height on a pressable, set 44 or more.

**4. `Text` is the kit's `Text`, not React Native's.** RN's `Text` lacks the
line height CJK needs. The two are indistinguishable in an English screenshot,
which is how a Japanese screen ends up with clipped descenders three releases
later.

## Subscribe to the narrowest theme hook

Three hooks, deliberately separate. Picking the widest one re-renders a
component on state it does not read.

| Hook               | Use in                                               |
| ------------------ | ---------------------------------------------------- |
| `useThemeTokens()` | any component that only reads colours, spacing, type |
| `useThemeMode()`   | only controls that read or change light/dark         |
| `useTheme()`       | app-level code that genuinely needs both             |

Build theme override objects outside render, or memoize them. An unstable
override object invalidates the whole token context on every render.

## Compose, do not configure

Sheet, Dialog, Select, Menu, and Tabs are compound components. Compose
`Root`/`Trigger`/`Content`/`Header`/`Body`/`Footer` rather than passing
`renderHeader` callbacks or arrays of config objects. Their shared context
exposes a stable `{ state, actions, meta }` contract — depend on that, not on
whether the state happens to be local or controlled.

Prefer an explicit `variant` / `size` / `layout` union over booleans that select
appearance. Keep booleans for genuine orthogonal state: `disabled`, `loading`,
`required`, `selected`.

## Pass testIDs

Components forward `testID`, and config-driven screens derive stable ids when
you omit one:

| Config                                                 | Derived `testID`                     |
| ------------------------------------------------------ | ------------------------------------ |
| form field with `key: "email"`                         | `form-field-email`                   |
| settings item with `id: "dark-mode"`                   | `settings-item-dark-mode`            |
| the same item inside a section with `id: "appearance"` | `settings-item-appearance-dark-mode` |

Prefer the derived id in tests over inventing a new one; set `testID`
explicitly only when the derived one would be ambiguous. Note the section
prefix — a settings item rendered through `SettingsSection` carries the section
id, so an id copied from a standalone example will not match.

## Before you call a screen done

- Checked in **both** colour modes, not just the one you were looking at.
- Checked with long English text **and** long CJK text.
- Every colour and gap traced to a token.
- Loading, empty, and error states exist — `LoadingView`, `EmptyState`,
  `ErrorView` are there so you do not invent three different ones.
- If it is a list: rows are virtualized and row props are stable.

## Changing the packages themselves

This skill is for _consuming_ the kit. If the task edits `packages/ui` or
`packages/kit-community` — adding a component, changing a public prop, renaming
a token — stop and follow `.agents/skills/osuki-ui-architecture/SKILL.md`
instead. Renaming a semantic or component token is a breaking change, because
consumers key their theme overrides on those names.
