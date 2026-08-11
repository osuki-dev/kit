# iOS Design Audit

This audit tracks the iOS-first polish pass for Osuki Market and the shared
`@osuki-dev/ui` / `@osuki-dev/kit-community` primitives. The goal is a coherent soft
minimal product surface, not a generic component catalog.

## Current Direction

- Keep Osuki coral as the primary action color, not as decoration.
- Use pill shapes for actions, selected states, filters, search, and compact
  navigation.
- Use rounded rectangles for cards, forms, checkout panels, and settings groups.
- Prefer surface hierarchy and subtle borders over heavy shadows.
- Prefer platform-native controls when they provide better accessibility,
  motion, and expected iOS behavior.

## Official Expo Notes

- Expo SDK 56 documents `expo-router/unstable-native-tabs` as the platform-native
  tab layout API.
- Expo UI provides native SwiftUI / Jetpack Compose controls and universal
  drop-in primitives, including Button, Switch, TextInput, Picker, List, and
  FieldGroup.
- Native tabs are the right target for the primary app shell. Custom tabs are
  acceptable only when the product intentionally needs a custom visual language
  that cannot be expressed with system tabs.

## Findings

### Navigation

- The app now uses `expo-router/unstable-native-tabs` for the primary shell.
- The previous custom pill tab bar looked on-brand, but it could not fully match
  iOS 26 native tab behavior, native minimize behavior, or platform
  accessibility.
- Stack detail pages now mostly use consistent pill back/title chrome, but search
  still feels more custom than native.

Decision:

- Keep the primary `(tabs)` layout on `expo-router/unstable-native-tabs`.
- Re-check iOS and Android screenshots after every app-shell change because tab
  safe-area behavior is now system-owned.

### Switches And Settings Rows

- Settings rows are now full-row press targets after removing marquee text from
  row labels and values.
- Switch should keep its native thumb, sizing, motion, and tactile feel, but its
  active track must follow Osuki theme tokens instead of platform green.
- Expo UI controls are preferred when they can preserve the design token contract.
  If a primitive cannot accept theme colors yet, keep the token-driven wrapper.
- Toggle previously wrapped the native control in an accessible View. The visual
  control was fine, but the wrapper should not present itself as a second switch
  in the accessibility tree.

Decision:

- `Toggle` should expose a stable wrapper for layout and test IDs, while the
  actual platform switch owns the switch behavior.
- Toggle rows should keep using a token-colored native Switch; row-level behavior
  can be improved only when it does not fight the system control.

### Shadows

- `theme.shadow.soft` and `theme.shadow.pill` are intentionally subtle.
- Light mode is generally coherent.
- Dark mode still has a few areas where shadow/glow is visually expensive:
  sheet surfaces, nested raised cards, and local non-token shadows.
- Several local styles still use legacy `shadowOpacity`, `shadowRadius`, and
  `elevation`; these should be reduced or moved to theme tokens.

Decision:

- Use shadows only for floating chrome and sheets.
- Cards inside page content should rely on `surface`, `surfaceRaised`, border,
  and spacing.
- Remove local legacy shadow values unless they are required for Android fallback.

### Buttons

- Primary buttons should be reserved for irreversible or forward-progress actions:
  add to cart, checkout, continue payment, place order, save, sign in.
- Secondary buttons should be used for non-destructive alternatives:
  continue shopping, addresses, cancel, shop more.
- Ghost buttons should be low-emphasis toolbar or sheet actions only.
- Native Expo UI Button is worth evaluating for isolated platform-specific
  surfaces, but the design system Button should remain token-driven so users can
  replace the theme consistently.

Decision:

- Do not replace every Button with Expo UI Button blindly.
- Keep `@osuki-dev/ui` Button as the public contract; consider a native-backed
  Button implementation behind the same API later.

### Text And Layout

- Product names may wrap to two lines in product cards, but compact settings
  values should stay one line.
- Marquee text is useful for product titles and identifiers, but it should not be
  used inside pressable settings rows because it owns tap behavior.
- Account and stack pages had duplicated safe-area / inset handling; the account
  secondary pages are now fixed.

Decision:

- Use marquee only on content that benefits from tap-to-reveal, not on rows where
  the row itself is the primary interaction.
- Keep secondary stack pages explicit about scroll insets.

### Authentication Boundaries

Pages that should require account access in the product app:

- Account profile
- Addresses
- Account order history
- Checkout address prefill and saved-address management

Current state:

- These pages show sign-in CTAs when the local account adapter is not
  authenticated.
- A real account integration replaces the account side of the data layer behind
  `AccountDataAdapter` and leaves the UI unchanged. Never place client secrets,
  Admin API tokens, or private Storefront tokens in the app bundle; token
  handling belongs behind a backend the app owns.

## Priority Fix List

1. Audit dark-mode settings rows after the Toggle wrapper cleanup.
2. Remove remaining local legacy shadows or map them to theme tokens.
3. Decide which app-specific buttons should stay primary versus secondary.
4. Review search header against native iOS search affordances.
5. Run iOS page screenshots for Shop, Product, Cart, Checkout, Orders, Account,
   Search, Profile, Addresses, and Settings sheets.
6. Repeat the same visual pass on Android after iOS is stable.

## Acceptance Criteria

- No double-shadow or clipped-shadow artifacts in light or dark mode.
- No text overlap or accidental truncation in CJK locales.
- Every selectable row is tappable across the full row.
- Primary actions are visually consistent and not overused.
- Native platform controls are used where they clearly improve the product.
- Theme overrides still update UI and kit surfaces without source edits.
