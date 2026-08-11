# Components

This file answers one question: which component do I reach for. It is grouped
by the job you are trying to do, not alphabetically, because you almost never
arrive knowing the name — you arrive knowing that a row has to be tappable, or
that a screen has nothing to show yet.

Every name below is exported from the package root:

```tsx
import { Button, Screen, Text } from "@osuki-dev/ui";
```

Props listed are the ones you will actually pass. Most components also spread
the underlying React Native props (`ViewProps`, `PressableProps`,
`TextInputProps`), so `testID`, `accessibilityLabel` and `style` are almost
always available even when not listed.

---

## Text and content

The things a screen is made of before it is made of interactions.

| Component     | What it solves                                                                                                                               | Main props                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Text`        | Every string on screen. Carries the CJK-safe line height and the type scale, so a Japanese screen and an English screen stay the same shape. | `variant`, `colorKey`, `color`, `weight`, `transform`, `overflowMode`, `numberOfLines` |
| `Icon`        | A Lucide glyph at the theme's stroke width and default colour, instead of each call site guessing.                                           | `name` (PascalCase, e.g. `"Search"`), `size`, `color`, `strokeWidth`                   |
| `Image`       | Remote or bundled image with caching and a fade-in, so lists do not flash white on scroll. Wraps `expo-image`.                               | `source`, `contentFit`, `cachePolicy`, `transition`                                    |
| `Avatar`      | A person or entity, with initials as the fallback when there is no picture.                                                                  | `source`, `initials`, `size`, `isOnline`                                               |
| `AvatarGroup` | Several avatars overlapped, with a `+N` overflow chip past `max`.                                                                            | `items`, `max`, `size`, `overlap`                                                      |
| `Tag`         | A short classifying word attached to something else — a status, a category, a provenance mark.                                               | `children` (string), `variant`, `onPress`, `disabled`                                  |
| `Badge`       | A count, or a bare dot, sitting on top of something. Not for classification; for "there is something new here".                              | `children` (number or string), `variant`, `display`                                    |
| `Divider`     | A hairline between items when a gap is not enough and a card is too much.                                                                    | `variant`, `thickness`                                                                 |

`Text` variants, in the order they appear in the type scale: `hero` (72),
`display` (48), `dataLarge` (36), `heading` (24), `subheading` (18), `body`
(16), `data` (16), `bodySmall` (14), `caption` (12), `label` (11, uppercased),
`button` (13, uppercased). See [theme.md](./theme.md) for the full table.

---

## Layout and screens

Structure. These decide where things sit; they do not decide what things look
like.

| Component             | What it solves                                                                                                      | Main props                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Screen`              | The root of a screen that does not scroll. Fills the window, paints the page background, applies safe-area insets.  | `variant`, `safeArea`                                                                                                                   |
| `ScrollScreen`        | The root of a screen that does scroll. Owns the `ScrollView` so you do not end up with two of them nested.          | `variant`, `safeArea`, plus `ScrollView` props                                                                                          |
| `Surface`             | A box painted at one of three elevation levels. The building block under `Screen` and `Card`.                       | `variant` (`page`, `surface`, `raised`)                                                                                                 |
| `Card`                | A static content container with token radius and padding.                                                           | `variant`, `border`, `radius`, `padding`                                                                                                |
| `Stack`               | A row or column with a token gap, instead of margins scattered across children. The default layout tool.            | `direction`, `gap`, `align`, `justify`, `flow`, `widthMode`                                                                             |
| `Section`             | A titled block of a screen, with an optional trailing action and footer.                                            | `title`, `description`, `action`, `footer`, `gap`, `padding`, `separator`                                                               |
| `ResponsiveContainer` | Caps reading width and pads it per breakpoint, so a phone layout does not become a 1200pt line of text on a tablet. | `maxWidth`, `horizontalPadding`, `verticalPadding`, `alignment`, `widthMode`                                                            |
| `ResponsiveGrid`      | Equal columns whose count changes per breakpoint.                                                                   | `columns`, `gap`, `rowGap`, `columnGap`, `flow`                                                                                         |
| `TopBar`              | A screen title bar with a back affordance and icon actions, for screens that do not use the navigator header.       | `title`, `subtitle`, `onBack`, `actions`, `leading`, `trailing`, `safeArea`, `elevation`                                                |
| `Toolbar`             | A row of icon actions with labels for screen readers.                                                               | `actions`, `label`, `variant`, `density`                                                                                                |
| `Tabs`                | Switching between sibling sections of the same screen.                                                              | `options`, `value`, `onChange`, `variant`, `size` — or compose `Tabs.Root` / `Tabs.List` / `Tabs.Trigger` / `Tabs.Label` / `Tabs.Badge` |
| `Pagination`          | Page-at-a-time navigation for results too long to scroll.                                                           | `page`, `pageCount`, `onPageChange`, `controls`, `label`                                                                                |

Note: `Stack` is also the name of Expo Router's navigator. If a file needs both,
alias one of them at the import.

---

## Form input

Everything that produces a value. All of them are controlled: you hold the
value, they tell you when it should change.

| Component          | What it solves                                                                                                                                  | Main props                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `FieldGroup`       | Label, description, helper text, error and required marker around any control — including your own. Use it instead of hand-rolling a label row. | `label`, `description`, `helper`, `error`, `required`, `disabled`, `children`                       |
| `Input`            | Single-line text, with the label and error states already wired.                                                                                | `label`, `value`, `onChangeText`, `variant`, `size`, `error`, `helper`, plus `TextInputProps`       |
| `Textarea`         | Multi-line text that grows between a row floor and ceiling.                                                                                     | `label`, `value`, `onChangeText`, `minRows`, `maxRows`, `error`, `helper`                           |
| `SearchInput`      | A filter field with the leading glyph and the clear button already there.                                                                       | `value`, `onChangeText`, `onClear`, `placeholder`                                                   |
| `Select`           | Picking one option out of a list, presented as a bottom sheet rather than a platform picker.                                                    | `options`, `value`, `onChange`, `label`, `placeholder`, `helper`, `error`, `required`, `sheetTitle` |
| `Menu`             | Picking one option out of a list when the trigger is a button rather than a field. Same sheet, different affordance.                            | `items`, `onSelect`, `selectedId`, `label`, `triggerLabel`, `placeholder`, `sheetTitle`             |
| `DateInput`        | A date, a time, or both, without importing a picker library per platform.                                                                       | `mode`, `value` (ISO string), `onChange`, `label`, `helper`, `error`, `applyLabel`, `todayLabel`    |
| `RadioGroup`       | One choice out of a few, all visible at once.                                                                                                   | `options`, `value`, `onChange`, `label`, `error`, `direction`, `size`                               |
| `SegmentedControl` | One choice out of two to four, as a compact switch rather than a list.                                                                          | `options`, `value`, `onChange`, `variant`                                                           |
| `Checkbox`         | One independent boolean inside a row you lay out yourself.                                                                                      | `checked`, `onToggle`, `size`, `disabled`                                                           |
| `Toggle`           | One boolean that takes effect immediately, as a switch.                                                                                         | `value`, `onValueChange`, `disabled`                                                                |
| `Stepper`          | A small integer the user nudges rather than types — quantity, count, servings.                                                                  | `value`, `onChange`, `min`, `max`, `step`, `label`, `formatValue`                                   |
| `OtpInput`         | A one-time code, one cell per digit, with paste and autofill behaving.                                                                          | `value`, `length`, `onChange`, `onComplete`, `label`, `error`                                       |

`Select` and `Menu` both take `disabled` on individual options, so a temporarily
unavailable choice can stay visible instead of disappearing.

---

## Actions

Things that are tappable, and rows whose whole point is to be tapped.

| Component        | What it solves                                                                                                                                                           | Main props                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `Button`         | Committing. Four variants that mean four different things: `primary` (the one action), `secondary` (an alternative), `ghost` (low-stakes), `destructive` (irreversible). | `variant`, `children` (string), `onPress`, `disabled`, `loading`, `loadingLabel`, `leftIcon`, `rightIcon` |
| `ListItem`       | A row in a list: leading icon, title, subtitle, trailing content, optional separator.                                                                                    | `icon`, `title`, `subtitle`, `trailing`, `separator`, `onPress`, `disabled`                               |
| `ChoiceRow`      | A row that answers a question, and can be individually in flight — the icon becomes a spinner while its answer is pending.                                               | `label`, `description`, `hint`, `icon`, `tag`, `emphasis`, `loading`, `disabled`, `onPress`               |
| `ChoiceList`     | A whole list of `ChoiceRow`. Passing `loadingId` spins one row and locks the rest, because a second answer to the same question is not a thing the user can mean.        | `items`, `onSelect`, `loadingId`, `disabled`, `emphasis`, `border`, `gap`                                 |
| `SheetListItem`  | A row sized and padded for the inside of a sheet, with a selected state and a destructive tone.                                                                          | `label`, `description`, `icon`, `selected`, `tone`, `variant`, `onPress`                                  |
| `PressableCard`  | A whole card that is one tap target, with the press feedback already correct.                                                                                            | `onPress`, `children`, `variant`, `border`, `radius`, `padding`, `disabled`                               |
| `PressableScale` | Adding a press dip and a haptic to something that is otherwise not a kit component.                                                                                      | `pressedScale`, `feedback`, `children`                                                                    |

`Button` takes a string child, not an element. If you need an icon, use
`leftIcon` / `rightIcon`, which take an `IconName`.

---

## Overlays

Things that sit on top of the screen and take the interaction until dismissed.

Each of these exists in two forms: a **composable** namespace, where you write
the layout and the kit owns visibility, focus, accessibility and motion, and a
**convenience** component that composes the common shape for you. Reach for the
convenience form first; drop to the composable form when the content stops
being a title, a body and a footer. See
[conventions.md](./conventions.md#composable-versus-convenience) for where the
line is.

| Component     | What it solves                                                                                                                                                                                                                                       | Main props                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `BottomSheet` | The common sheet: handle, title, description, scrollable body, footer.                                                                                                                                                                               | `visible`, `onClose`, `title`, `description`, `footer`, `children`, `maxHeight`, `bottomInset`, `bodyStyle`                                |
| `Sheet`       | The same sheet, taken apart. `Sheet.Root` / `Trigger` / `Content` / `Handle` / `Header` / `HeaderText` / `Title` / `Description` / `Body` / `Footer` / `Close`.                                                                                      | `Sheet.Root`: `open`, `defaultOpen`, `onOpenChange`, `disabled`. `Sheet.Content`: `maxHeight`, `bottomInset`, `contentStyle`, `closeLabel` |
| `ActionSheet` | A list of actions on a sheet, with a cancel row, for "what do you want to do with this".                                                                                                                                                             | `visible`, `onClose`, `title`, `description`, `actions`, `onAction`, `cancelLabel`                                                         |
| `Modal`       | A centred overlay for content that is not a decision. Callable directly, or composed via `Modal.Root` / `Trigger` / `Content` / `Header` / `HeaderText` / `Title` / `Description` / `Body` / `Footer` / `Close`.                                     | `visible`, `onClose`, `title`, `description`, `footer`, `children`, `closeLabel`                                                           |
| `Dialog`      | A decision, with a tone that colours the icon: `default`, `success`, `warning`, `danger`. Composed via `Dialog.Root` / `Trigger` / `Content` / `Header` / `Icon` / `HeaderText` / `Title` / `Description` / `Body` / `Actions` / `Action` / `Close`. | `visible`, `onClose`, `title`, `message`, `icon`, `tone`, `actions`, `actionLayout`                                                        |
| `Tooltip`     | One sentence of help attached to a control, without a screen of its own.                                                                                                                                                                             | `content`, `children`, `title`, `placement`, `visible`, `onVisibleChange`, `defaultVisible`, `disabled`                                    |

`Sheet` is the one namespace that is **not** callable on its own — there is no
`<Sheet />`. Use `BottomSheet` for the convenience form. `Modal`, `Dialog` and
`Tabs` are callable and namespaced at the same time.

Dialog actions carry `dismissBehavior`: `"close"` (the default) closes the
dialog after `onPress`, `"keep-open"` leaves it open, which is what you want
when the action starts an async operation you are about to report on.

---

## Status and feedback

Telling the user what is happening, in descending order of how much of the
screen it occupies.

| Component                    | What it solves                                                                                                                                                | Main props                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `LoadingView`                | A whole section is waiting on a first load. Centred spinner with a caption.                                                                                   | `label`, `size` (`default` / `compact`)                                                                               |
| `Skeleton`                   | A whole section is waiting, and you know the shape it will be. Better than a spinner whenever the layout is predictable.                                      | `variant` (`text` / `rect` / `circle`), `width`, `height`, `lines`, `gap`, `motion`                                   |
| `Spinner`                    | A bare indeterminate indicator, for when you are composing the surrounding layout yourself.                                                                   | `size`, `color`                                                                                                       |
| `InlineActivity`             | A spinner and a caption on one row that does not change height or width when the spinner stops — so a row that reports both states never makes the list jump. | `label`, `active`, `size`, `color`, `spinnerColor`, `gap`, `lines`, `widthMode`                                       |
| `EmptyState`                 | There is nothing here, and here is the one thing to do about it.                                                                                              | `icon`, `title`, `message`, `actionLabel`, `onAction`, `size`                                                         |
| `ErrorView`                  | The request failed, and here is retry.                                                                                                                        | `title`, `message`, `retryLabel`, `onRetry`, `size`                                                                   |
| `Alert`                      | A condition that stays on the screen and belongs to a place on it. Inline, not floating.                                                                      | `variant` (`info` / `success` / `warning` / `danger`), `title`, `message`, `icon`, `action`                           |
| `ToastProvider` + `useToast` | A condition that does not belong to a place on the screen and should go away by itself.                                                                       | Provider: `placement`, `maxToasts`, `defaultDurationMs`. `showToast({ variant, title, message, durationMs, action })` |
| `ProgressBar`                | Continuous, determinate progress toward a known end.                                                                                                          | `value`, `max`, `label`, `valueDisplay`, `tone`, `size`, `shape`                                                      |
| `SegmentedProgressBar`       | Stepped or quota progress, including the case where the value has gone past the maximum (`status="overflow"`).                                                | `value`, `max`, `segments`, `status`, `valueDisplay`, `label`, `size`                                                 |

The dividing line between `Alert` and a toast: an alert describes the screen it
is on and stays; a toast describes something that just happened and leaves.

---

## Data display

Showing numbers and records that the user reads more than they tap.

| Component    | What it solves                                                                                                                                                      | Main props                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataRow`    | A label-and-value row for settings and detail screens, with optional description and trailing slot. Accepts `onPress` when the row leads somewhere.                 | `label`, `value`, `description`, `leadingIcon`, `trailing`, `separator`, `size`                                                                         |
| `StatRow`    | A single statistic with a unit, a status colour and a trend arrow.                                                                                                  | `label`, `value`, `unit`, `status`, `trend`, `size`                                                                                                     |
| `MetricCard` | The same statistic when it deserves its own card — dashboards, summary grids.                                                                                       | `label`, `value`, `unit`, `description`, `icon`, `tone`, `trend`, `footer`                                                                              |
| `DataTable`  | Typed columns over an array of rows, with sorting, row selection, an empty state and a loading state built in. Switches between a plain and a virtualised renderer. | `columns`, `data`, `getRowId`, `sort`, `onSortChange`, `onRowPress`, `selectedRowIds`, `density`, `renderMode`, `loading`, `emptyTitle`, `emptyMessage` |
| `Timeline`   | Ordered events with a status per entry: `pending`, `active`, `completed`.                                                                                           | `items`, `size`                                                                                                                                         |

`DataTable` requires `getRowId` — there is no implicit index key, because index
keys are how a sorted table starts animating the wrong rows.

---

## Keyboard

Thin wrappers over `react-native-keyboard-controller`, re-exported so an app has
one keyboard strategy instead of two libraries disagreeing. Props pass through
unchanged; only `KeyboardToolbar` adds theming. All of them require
`KeyboardProvider` from that package to be mounted — see
[getting-started.md](./getting-started.md#optional-providers).

| Component                 | What it solves                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `KeyboardAvoidingView`    | Moves content out from under the keyboard.                                                          |
| `KeyboardAwareScrollView` | Scrolls the focused field into view. Defaults to `bottomOffset={50}` and `extraKeyboardSpace={20}`. |
| `KeyboardStickyView`      | Pins content to the keyboard's top edge.                                                            |
| `KeyboardToolbar`         | Themed previous / next / done bar above the keyboard.                                               |

---

## Providers and hooks

| Export                                                    | What it solves                                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeProvider`                                           | Supplies tokens and colour mode. Required. Props: `mode`, `defaultMode`, `theme`, `storageAdapter`, `storageKey`.                  |
| `FontLoader`                                              | Loads app-owned font files before the theme maps them onto roles. Props: `fonts`, `fallback`.                                      |
| `ToastProvider`                                           | Required before `useToast()`.                                                                                                      |
| `HapticsProvider`                                         | Opts the whole app into haptics once. Props: `enabled`, `feedback`.                                                                |
| `useThemeTokens()`                                        | Tokens only. The hook to use inside a component, because it does not re-render on mode-action identity changes.                    |
| `useThemeMode()`                                          | `{ mode, resolvedMode, setMode, toggleMode }`.                                                                                     |
| `useTheme()`                                              | Both of the above merged. For settings screens and app shells.                                                                     |
| `useResponsiveTheme()`                                    | `{ breakpoint, isMobile, isTablet, isDesktop, isLandscape, containerMaxWidth, pagePadding, gridColumns, gap, formMaxWidth, ... }`. |
| `useToast()`                                              | `{ showToast, dismissToast, clearToasts }`.                                                                                        |
| `useHaptics()`                                            | `{ enabled, feedback }`. A no-op without a provider, so components may call it unconditionally.                                    |
| `useTabs()` / `useModal()` / `useDialog()` / `useSheet()` | The state of the surrounding composable namespace, for custom parts you write yourself. Each returns `{ state, actions, meta }`.   |
| `useNavigationTheme()`                                    | React Navigation theme and screen options derived from the current tokens. Requires `expo-router`.                                 |

---

## Where to go next

- [patterns.md](./patterns.md) — these components assembled into whole screens.
- [theme.md](./theme.md) — what `variant` and `tone` actually resolve to.
- [conventions.md](./conventions.md) — the rules that decide between two
  components that both work.
