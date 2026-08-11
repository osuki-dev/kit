# Conventions

This file answers one question: what makes a diff wrong even though it renders.
It is written to be used as a review checklist, by a person or by an agent.

Each rule states the rule, then why it exists — because a rule whose reason is
missing gets worked around the first time it is inconvenient.

---

## 1. Colour comes from tokens

**Never** write a colour literal in application code. No hex, no `rgba()`, no
named CSS colour.

```tsx
// wrong
<View style={{ backgroundColor: "#F6F7F9" }} />
<Text style={{ color: "#667085" }}>Updated</Text>

// right
const { colors } = useThemeTokens();
<View style={{ backgroundColor: colors.surfaceRaised }} />
<Text colorKey="textMuted">Updated</Text>
```

A hex value only misbehaves in the colour mode you are not currently looking at,
so it survives review, survives QA, and ships. The token is the only thing that
knows both modes.

For `Text`, prefer `colorKey` over `color`. `colorKey` takes the token name, so
the reviewer can see the semantic role rather than a resolved value.

The one legitimate exception: a colour that is data, not design — a
user-selected label colour, a brand hex fetched from an API. Pass it through as
data, do not hard-code it.

**Grep for it:** `#[0-9a-fA-F]{3,8}` and `rgba?\(` outside `src/theme/`.

---

## 2. Spacing and radius come from tokens

`theme.spacing.md`, not `16`. `theme.radius.lg`, not `16`.

```tsx
// wrong
<View style={{ padding: 16, gap: 8, borderRadius: 12 }} />

// right
const { spacing, radius } = useThemeTokens();
<View style={{ padding: spacing.md, gap: spacing.sm, borderRadius: radius.md }} />

// better — no style object at all
<Stack direction="vertical" gap="sm" />
```

The scale is what makes a screen assembled from six independent components read
as one screen. A raw `13` in one place is invisible; forty of them is why the
app looks unfinished and nobody can say why.

Components that take a gap (`Stack`, `Section`, `ChoiceList`, `InlineActivity`)
accept the token name directly. Use the name.

**Grep for it:** `padding:\s*\d`, `margin\w*:\s*\d`, `gap:\s*\d`,
`borderRadius:\s*\d` in application code.

---

## 3. Anything tappable is at least 44pt

The kit's own controls enforce it — `Button` is 44 tall, `ListItem` and
`SheetListItem` sit at a 52pt minimum, `TopBar` actions are 44pt squares.
Layouts around them can still defeat it.

- Do not set a `height` below 44 on a pressable.
- Do not wrap a small icon in a bare `Pressable`. Wrap it in `PressableScale`
  with padding that brings the target to 44, or use `Toolbar`, whose actions are
  44pt at the default density and 40pt at `density="compact"` — reserve compact
  for a dense secondary toolbar, not for primary navigation.
- An icon that is 20pt is fine. Its _target_ is what has to be 44.

**Grep for it:** `height:\s*(1\d|2\d|3\d|4[0-3])\b` near `Pressable`,
`TouchableOpacity`, `onPress`.

---

## 4. Text is `Text` from this kit

Import `Text` from `@osuki-dev/ui`. Never from `react-native`.

```tsx
// wrong
import { Text, View } from "react-native";

// right
import { Text } from "@osuki-dev/ui";
import { View } from "react-native";
```

React Native's `Text` does not carry the line height CJK needs, and the two are
indistinguishable in an English screenshot. This is how a Japanese screen ends
up with clipped descenders three releases after the change that caused it.

The same applies to typography: use `variant`, not `fontSize`. If a size you
need is not in the scale, the answer is almost always a different variant, not a
literal.

**Grep for it:** `import\s*\{[^}]*\bText\b[^}]*\}\s*from\s*["']react-native["']`.

---

## 5. Composable versus convenience

`Modal`, `Dialog`, `Sheet` and `Tabs` each exist twice: as a convenience
component that composes the common shape, and as a namespace of parts.

Use the **convenience** form when the content is the shape the component already
assumes:

- `BottomSheet` — handle, title, description, body, footer
- `Dialog` — icon, title, message, a row of actions
- `Modal` — title, description, body, footer
- `Tabs` — a flat list of `{ label, value }`

Drop to the **composable** form when any of these is true:

- The header needs something other than text — a tag beside the title, an
  avatar, a trailing control.
- The body and the footer need to know about each other, for example a footer
  button whose label depends on a selection in the body.
- You need a part the convenience form does not expose, such as `Tabs.Badge` on
  some triggers but not others.
- The open state is driven by a trigger inside the tree, in which case
  `Sheet.Trigger` / `Modal.Trigger` / `Dialog.Trigger` saves you a `useState`.

Do not drop to the composable form merely to change padding or a colour. That is
what theme overrides are for — see [theme.md](./theme.md#overriding-the-theme).

Two mechanical notes:

- `Sheet` has no callable form. `<Sheet />` does not exist; the convenience
  component is `BottomSheet`, and the root is always `Sheet.Root`.
- `Modal`, `Dialog` and `Tabs` are callable _and_ namespaced, so `<Dialog />`
  and `<Dialog.Root>` are both valid and mean different things.

---

## 6. Every async surface handles four states

Loading, error, empty, and data. Not three. A screen that renders an empty list
where the request actually failed is a bug report you will never receive,
because the user assumes there is nothing there.

The order is fixed: `loading` → `error` → `empty` → `data`. See
[patterns.md](./patterns.md#4-the-loading--empty--error-switch) for the shared
helper.

Choosing the loading indicator:

| Situation                                             | Use                                        |
| ----------------------------------------------------- | ------------------------------------------ |
| You know the shape the content will take              | `Skeleton`                                 |
| You do not, or the section is small                   | `LoadingView`                              |
| A row must report busy and idle without changing size | `InlineActivity`                           |
| A button is committing                                | `Button` with `loading` and `loadingLabel` |

Empty states get a specific title and, where there is one, an action. "No data"
is not a title.

---

## 7. Inline conditions are `Alert`; transient ones are toasts

`Alert` belongs to a place on the screen and stays there — a form-level
validation summary, a banner about a degraded feature. It scrolls with the
content it describes.

A toast describes something that just happened and leaves — saved, copied,
failed to send. Raise it with `useToast().showToast(...)`, never by rendering a
floating `Alert` yourself.

If the user has to act on it, it is not a toast. Toasts can be missed.

---

## 8. Controls are controlled

Every input in the kit takes a value and a change handler. Hold the state; do
not read it back out of a ref.

`Select`, `Menu` and `RadioGroup` take `disabled` on individual options. Disable
an unavailable choice rather than filtering it out — a choice that disappears
makes the user think they misremembered it.

Validation lives in one expression. Derive the error text and the disabled state
from the same source, so they cannot drift:

```tsx
const error = value.trim() ? undefined : "Required.";
<Input value={value} onChangeText={setValue} error={touched ? error : undefined} />
<Button onPress={submit} disabled={Boolean(error)}>Save</Button>
```

---

## 9. One screen root, one scroller

A screen starts with `Screen` or `ScrollScreen`, not both, and not a bare
`View`. `ScrollScreen` owns the `ScrollView`; do not nest another vertical
scroller inside it, and do not put a `FlatList` inside it.

Safe-area insets are `safeArea` on the screen root. Do not call
`useSafeAreaInsets()` and apply padding by hand unless the screen root cannot do
it for you.

---

## 10. Icons are `IconName`, not strings

`Icon`, and every prop that takes an icon (`Button.leftIcon`, `ListItem.icon`,
`TopBar` actions, `Alert.icon`, `EmptyState.icon`, `MetricCard.icon`,
`Timeline` items) take an `IconName` — a PascalCase Lucide name, checked by the
compiler.

```tsx
<Icon name="Search" />        // right
<Icon name="search" />        // does not compile
```

If you are choosing an icon that does not obviously exist, check it compiles
before you write the rest of the screen. An unknown name logs a warning and
renders nothing at runtime.

---

## 11. Icon-only controls need labels

Anything whose only content is a glyph needs an accessible name.

- `Toolbar` and `TopBar` actions require `label` — it is not optional in the
  type, so this one is enforced.
- `Sheet.Trigger`, `Modal.Trigger`, `Dialog.Trigger` spread `PressableProps`;
  pass `accessibilityLabel` when the child is an icon.
- `SearchInput` takes `clearAccessibilityLabel`.
- Sheets and modals take `closeLabel`.

These props also exist so the app can be localised. A hard-coded English string
inside a component would not be.

---

## 12. Haptics go through the provider

Call `useHaptics().feedback(kind)`. Do not import a haptics library into a
component.

```tsx
const haptics = useHaptics();
haptics.feedback("selection");
```

The controller is a no-op without `HapticsProvider`, and the provider is off
unless `enabled` is set, so the host app opts in once instead of every component
guessing. A component that calls `expo-haptics` directly cannot be turned off.

---

## 13. One keyboard strategy

Use the kit's `KeyboardAvoidingView`, `KeyboardAwareScrollView`,
`KeyboardStickyView` and `KeyboardToolbar`. Do not import React Native's
`KeyboardAvoidingView` alongside them, and do not add a second keyboard library.

They are thin re-exports of `react-native-keyboard-controller` so that the app
has exactly one implementation. Mixing two produces layouts that are correct on
one platform and off by the toolbar height on the other.

---

## 14. Import from the package root

```tsx
import { Button, Text } from "@osuki-dev/ui"; // right
import { Button } from "@osuki-dev/ui/components"; // fine, documented entry
import { Button } from "@osuki-dev/ui/src/components/button"; // wrong
```

Documented entry points are `.`, `./theme`, `./components` and `./fonts`.
Anything deeper is an internal path that changes without a major version.

---

## 15. `style` adjusts, it does not re-skin

Most components spread `style`. Use it for position and size — margin, flex,
width, alignment. Do not use it to change what the component _is_: its
background, its border colour, its font.

```tsx
// fine
<Card style={{ marginTop: spacing.lg, flex: 1 }} />

// not fine — this is a theme change wearing a style prop
<Card style={{ backgroundColor: "#111827", borderRadius: 2 }} />
```

If two screens need cards that look different, that is either a `variant` that
already exists or a theme override. It is never a local style object, because
the next card will not match it.

---

## 16. Keys are identity, not position

`DataTable` requires `getRowId`. `ChoiceList` items require `id`. `Timeline`,
`Menu`, `ActionSheet` and `Toolbar` actions require `id`. Supply the real
identifier, never the array index — an index key is how a sorted or filtered
list starts animating the wrong rows.

---

## Review checklist

Run down this list against a diff. Anything unchecked is a change request.

- [ ] No colour literals. Colours come from `useThemeTokens().colors` or `colorKey`.
- [ ] No numeric spacing, padding, gap or radius. Tokens or `Stack` / `Section`.
- [ ] No pressable shorter than 44pt.
- [ ] `Text` imported from `@osuki-dev/ui`, never `react-native`.
- [ ] Typography via `variant`, not `fontSize` / `fontWeight` literals.
- [ ] Convenience component used unless the composable form is actually needed.
- [ ] Loading, error, empty and data all handled on every async surface.
- [ ] Empty states have a specific title, and an action where one exists.
- [ ] Toasts for transient events, `Alert` for standing conditions.
- [ ] Inputs controlled; error text and disabled state derived from one expression.
- [ ] Exactly one `Screen` or `ScrollScreen` per screen, one vertical scroller.
- [ ] Icon names are valid `IconName` values.
- [ ] Icon-only controls carry `accessibilityLabel`, `label` or `closeLabel`.
- [ ] Haptics via `useHaptics()`, not a direct library call.
- [ ] Keyboard handling via the kit's four components only.
- [ ] Imports from `@osuki-dev/ui` or a documented subpath.
- [ ] `style` used for layout only, not to restyle a component.
- [ ] List keys are stable identifiers, not indexes.

---

## Where to go next

- [components.md](./components.md) — the catalogue.
- [patterns.md](./patterns.md) — these rules applied to whole screens.
- [theme.md](./theme.md) — how to change what a component looks like, correctly.
