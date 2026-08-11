# UI Components

This document tracks the exported primitives in `@osuki-dev/ui`.

## Actions

- `Button`: primary action control. `variant` selects
  `"primary" | "secondary" | "ghost" | "destructive"`; `loading` is an
  orthogonal state and does not change the variant.

## Forms

- `Input`: single-line text input.
- `Textarea`: multi-line text input for notes, descriptions, support messages,
  and profile content.
- `SearchInput`: search-specific input with leading icon, clear action, and
  stable empty state.
- `Select`: bottom-sheet backed option picker for mobile forms and settings.
- `DateInput`: date, time, and datetime field with a bottom-sheet editing flow.
- `Menu`: triggered option/action menu for sort, filter, view, and overflow
  controls.
- `Checkbox`: multi-select control.
- `RadioGroup`: single-select choice list with optional descriptions.
- `OtpInput`: one-time-code entry cells for auth and verification flows.
- `Stepper`: numeric increment/decrement control.
- `FieldGroup`: shared label, helper, required, and error wrapper.
- `Toggle`: binary control.
- `SegmentedControl`: compact choice between a small set of options.
- `Tabs`: compound page or section switching with underline and pill variants.
  Compose `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Label`, and optional
  `Tabs.Badge`; shared context exposes stable `state`, `actions`, and `meta`.

## Feedback

- `Alert`: inline status message for info, success, warning, and danger states.
- `ToastProvider` and `useToast`: app-level transient notification queue. Mount
  one provider inside the app theme and safe-area roots; only its viewport
  subscribes to queue updates.
- `Skeleton`: loading placeholder with explicit `motion="pulse" | "static"`.
- `Spinner`: indeterminate loading.
- `InlineActivity`: one-line busy row -- a small spinner and a caption naming
  what is being waited on. It belongs inside content that is already on screen;
  `LoadingView` owns the case where a whole section has nothing to show yet. The
  caption survives `active={false}`, and an inert box of the spinner's exact
  size survives with it, so a row that reports both states keeps its height and
  its width instead of sliding its caption left when the work ends.
- `LoadingView`: full-section loading state with label.
- `EmptyState`: reusable no-data state with icon, copy, and optional action.
- `ErrorView`: reusable failure state with optional retry action.
- `Badge` and `Tag`: compact metadata and status labels; Badge uses the explicit
  `display="label" | "dot"` presentation.
- `ProgressBar`: continuous progress indicator with explicit `valueDisplay` and
  `shape` variants.

## Overlays

- `Modal`: compound centered overlay with stable `state`, `actions`, and `meta`.
  Compose `Modal.Root`, `Modal.Trigger`, `Modal.Content`, semantic header/body/footer
  primitives, and `Modal.Close`.
- `Dialog`: compound decision primitives with shared `state`, `actions`, and
  `meta`. Compose `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`,
  `Dialog.Actions`, and explicit `Dialog.Action` or `Dialog.Close` buttons.
- `Sheet`: compound bottom-overlay primitives with shared `state`, `actions`, and
  `meta`. Compose `Sheet.Root`, `Sheet.Trigger`, `Sheet.Content`, `Sheet.Body`,
  and optional header/footer primitives for reusable product flows.
- `BottomSheet`: convenience composition for mobile-first actions and forms. Use
  `maxHeight`, `bodyStyle`, and `bottomInset` for sheet sizing and safe-area
  tuning instead of overriding the sheet container from product code.
- `ActionSheet`: bottom-sheet backed list of contextual actions.
- `Tooltip`: compact contextual help for icon buttons and dense controls.

## Layout And Display

- `Surface`: visual background container only.
- `Screen`: full-screen layout owner with explicit safe-area modes.
- `ScrollScreen`: full-screen scroll owner with explicit safe-area modes.
- `Card`, `PressableCard`: use explicit `border="none" | "subtle"` variants.
- `PressableScale`: press affordance for surfaces that are not cards -- header
  buttons, tiles, keys, product-drawn rows. `pressedScale` tunes the dip per
  target size and `feedback` selects the haptic or `"none"`; the haptic itself
  comes from `HapticsProvider`, never from the component.
- `Stack`: wrapping and width use explicit `flow` and `widthMode` layout variants.
- `Section`: section padding and separators use explicit variants.
- `ResponsiveContainer`, `ResponsiveGrid`: alignment, width, and flow are
  explicit layout modes.
- `TopBar`
- `ListItem`: separators use `separator="none" | "bottom"`.
- `ChoiceRow`, `ChoiceList`: rows the user picks from -- permission answers,
  commands, files. Denser than `ListItem`, which is a navigation row with an
  uppercased subtitle. `emphasis="plain" | "headline"` selects whether the label
  wraps or reads as a headline over supporting lines; `ChoiceList` owns the one
  shared state, `loadingId`, which spins that row and locks the rest.
- `DataRow`, `Divider`, `StatRow`
- `DataTable`: static and virtualized ownership is selected with `renderMode`.
- `SegmentedProgressBar`: numeric output uses the explicit `valueDisplay` variant.
- `Timeline`: items use one `pending`, `active`, or `completed` status; density is
  selected with the explicit `size` variant.
- `Pagination`: `controls="adjacent" | "edges"` selects its navigation set.
- `MetricCard`
- `Avatar`, `AvatarGroup`, `Image`, `Icon`
- `Text`: uses explicit `transform`, `overflowMode`, and `marqueePlayback` modes.
- `Toolbar`

## Keyboard

Thin wrappers over `react-native-keyboard-controller`, re-exported so consumers
get one keyboard strategy instead of mixing libraries. Props pass through
unchanged; only `KeyboardToolbar` adds theming.

- `KeyboardAvoidingView`: moves content out from under the keyboard.
- `KeyboardAwareScrollView`: scrolls the focused field into view.
- `KeyboardStickyView`: pins content to the top edge of the keyboard, for
  submit bars and composer actions.
- `KeyboardToolbar`: accessory bar above the keyboard with previous/next/done
  controls. Colors resolve from theme tokens rather than consumer styles.

## Platform Feedback

- `HapticsProvider` and `useHaptics`: app-level haptic feedback. Feedback is
  **off unless `enabled` is set**, so a host app opts in once rather than each
  component guessing. `feedback(kind)` accepts
  `"selection" | "light" | "medium" | "success" | "warning" | "error"`; without
  a provider the controller is a no-op, so components can call it
  unconditionally.

## Boundary

Components here must be reusable across products. Product-specific examples,
checkout flows, Shopify behavior, and license-aware download surfaces belong in
`kit-community` or paid app source.
