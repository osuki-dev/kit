# Osuki Design Direction

Osuki UI and Kit should feel like a polished native product, not a generic component demo. The direction is **soft minimal with selective pill UI**: quiet surfaces, generous rhythm, tactile controls, and a memorable Osuki accent color used with restraint.

The default brand palette stays Osuki:

- `primary`: coral red
- `background`: warm off-white in light mode, deep orbit in dark mode
- `surface`: clean content surface
- `surfaceRaised`: subtle grouped surface
- `text`, `textMuted`, `border`, `borderStrong`: semantic neutrals

These colors must always come from theme tokens. Components and kit screens must not hardcode brand colors, because users should be able to replace the entire theme without editing component source.

## Product Feel

Osuki should feel:

- Soft, calm, and native
- Commercially usable, not decorative
- Dense enough for real products, but never cramped
- Warm and tactile without becoming cute
- Distinct from default Expo starter screens and generic AI templates

Avoid:

- Huge gradients, floating decorative blobs, and marketing-page composition inside the app
- Cards nested inside cards
- Heavy shadows
- Overusing one accent color everywhere
- Pure demo wording, placeholder flows, or non-interactive controls
- Hard geometric minimalism that feels cold or unfinished

## Visual Language

### Pill UI

Use pill shapes for controls that behave like actions, choices, filters, and navigation states:

- Primary and secondary buttons
- Filter chips
- Tags and badges
- Segmented controls
- Selected tab indicators
- Search fields when they are compact and action-oriented

Do not make every container a pill. Product cards, form groups, checkout panels, and settings sections should keep softer rounded rectangles with clear layout rhythm.

### Soft Minimal Surfaces

Use surface hierarchy instead of heavy shadow:

- Page background: `theme.colors.background`
- Main content surface: `theme.colors.surface`
- Grouped or inset surface: `theme.colors.surfaceRaised`
- Structure: `theme.colors.border`
- Emphasis: `theme.colors.borderStrong`

Cards should usually use light borders and stable spacing. Shadows are allowed only when there is a real native affordance such as a modal, sheet, or floating footer, and even then they should be restrained.

### Brand Color

The coral Osuki primary should be a signal, not wallpaper.

Use `primary` for:

- Primary CTA
- Active tab/segmented state
- Important status accent
- Small brand moments

Avoid using `primary` for:

- Every icon
- Every heading
- Large background areas
- Decorative gradients

## Token Strategy

The design system should stay token-first:

- Primitive tokens: raw palette, spacing, radius, typography, motion
- Semantic tokens: app meaning such as `background`, `surface`, `textMuted`, `primary`
- Component tokens: defaults for `Button`, `Card`, `Input`, `Surface`, `Text`, `Tag`, `Badge`, navigation, and commerce components
- Runtime theme: mode, resolved mode, storage adapter, navigation theme

Future refactors should expand component tokens instead of adding one-off style maps inside components.

Recommended component token additions:

- `Tag`: radius, padding, active/inactive colors
- `Badge`: size, radius, color variants
- `ListItem`: minHeight, inset, border, pressed state
- `TabBar`: height, icon size, active pill color, inactive color
- `ProductCard`: radius, image radius, title lines, price color
- `Checkout`: footer height, summary layout, step indicator tokens
- `Form`: field radius, helper/error colors, section spacing

## Shape System

Use radius intentionally:

- `pill`: buttons, chips, badges, selected nav states
- `lg`: product cards, checkout sections, account panels
- `md`: standard cards and grouped list containers
- `sm`: inputs and compact rows
- `xs`: tight utility surfaces only

The default direction should become:

- Buttons: `pill`
- Tags/badges: `pill`
- Inputs: `md` or `lg` depending on density
- Product cards: `lg`
- Settings/list rows: `md`
- Checkout/form sections: `lg`

## Typography

Typography should be CJK-friendly and native-app appropriate.

Rules:

- Use Noto Sans / Noto Sans SC / Noto Sans JP through the existing Expo font integration.
- Avoid viewport-based font scaling.
- Keep letter spacing at `0`.
- Use strong hierarchy through size, weight, spacing, and color rather than decorative styling.
- Product names may wrap to two lines; prices should never be squeezed or overlap.
- Compact UI should use compact type. Do not put hero-sized headings inside cards or dense controls.

## Motion

Motion should be soft and professional:

- Buttons: small scale/opacity feedback, no exaggerated bounce
- Cards: subtle press state, not dramatic lift
- Sheets/modals: smooth ease-out, slight opacity fade
- Lists: no heavy entrance animation for every row
- Checkout and form steps: short transition, clear state change

Use Reanimated for interactions that matter:

- Press states
- Tab indicator movement
- Segmented controls
- Sheet transitions
- Cart quantity changes
- Form validation feedback

Avoid animation that hides latency or makes testing brittle. Animation must not block taps or create invisible overlays.

## Component Direction

### Button

Target:

- Pill by default
- Stable height
- Large enough touch target on iOS and Android
- Clear disabled/loading state
- Optional icon slot
- No interaction layer that breaks Android touches

Variants:

- `primary`: filled coral
- `secondary`: transparent or soft surface with border
- `ghost`: no border, muted text
- `destructive`: danger color, restrained

### Input And Forms

Forms need to feel premium, not like plain examples.

Target:

- Clear label
- Helper text
- Friendly error message
- Error icon or subtle accent
- Focus state using `borderFocused`
- Validation feedback with small Reanimated transition
- Keyboard-aware spacing

Errors should explain what to fix, not just show `Invalid`.

### Card

Cards are for repeated items or framed tools, not page sections.

Target:

- Light border
- Soft radius
- Stable image aspect ratio
- No nested cards
- Press state through background/border change, not heavy shadow

### Tabs And Navigation

Use native tabs where possible. The selected tab should feel like a soft pill, but the tab bar should stay quiet.

Target:

- 4-5 clear product entries
- No drawer as primary navigation
- Detail pages use stack back behavior
- Tab bar does not appear to replace back navigation
- Primary app navigation should use one floating capsule dock, not separate bordered buttons
- The active tab can use a soft inner pill; inactive tabs should stay visually quiet
- The bottom dock should avoid heavy shadows, hard top borders, and large glassy effects unless the platform native API supplies them naturally
- Expo Router stack headers should use a soft pill title treatment on secondary pages
- Back actions should use a compact pill button, not a plain floating chevron
- Header pills should usually be borderless filled surfaces; use borders only when contrast is insufficient
- Header customization should live in `_layout.tsx` or shared header components, not inside every page
- Native toolbar APIs can be used for iOS-only enhancements, but the default header language must work on iOS and Android

### Product And Commerce

Product surfaces should feel like a real storefront:

- Real Shopify product data
- Graceful no-image fallback
- Cart quantity controls that work
- Checkout steps that actually advance
- Empty bag state with a useful action
- Order confirmation with realistic tracking details

Product images should be stable and inspectable. Do not use dark, blurred, or purely atmospheric imagery for core commerce content.

## Kit Screen Direction

Kit screens should be production templates, not demos.

Home:

- Product-first commerce entry
- Strong featured product or collection
- Clear browse/search/cart path

Explore:

- Search, filters, sort, refresh, load more
- Product cards with real states

Bag:

- Quantity controls
- Remove item
- Promo code interaction
- Clear totals

Checkout:

- Shipping, payment, review
- Friendly validation
- Stepper should be clear and tappable where appropriate
- Footer should not overlay content or block scrolling

Account:

- Actual selectable settings
- Theme/mode control
- Region/language/payment placeholders that open sheets or menus

Operations:

- If included, it should feel like a real merchant dashboard, not a disconnected demo list

## Customization Contract

Users should customize theme like this:

```tsx
<ThemeProvider
	theme={{
		colors: {
			primary: "#...",
			background: "#...",
		},
		components: {
			Button: {
				radius: "pill",
			},
		},
	}}
>
	<App />
</ThemeProvider>
```

Rules for maintainers:

- Use semantic colors only.
- Use component tokens for defaults.
- Keep local style overrides small and layout-focused.
- Do not import the Osuki brand package at runtime.
- Do not hardcode coral except in default token files.
- Every interactive component needs `testID` support.

## Refactor Plan

### Phase 1: Token Alignment

- Update motion comments and presets from mechanical to soft minimal.
- Add missing component tokens for `Tag`, `Badge`, `ListItem`, `TabBar`, `ProductCard`, `Form`, and `Checkout`.
- Keep current Osuki colors unchanged.
- Make radius usage consistent: pill for controls, `lg` for commerce sections.

### Phase 2: UI Primitives

- Refactor `Button` to support icon slots, loading, Android-safe touch behavior, and soft Reanimated feedback.
- Refactor `Input` with label/helper/error patterns.
- Refactor `Tag`, `Badge`, `SegmentedControl`, `Toggle`, and `ListItem` to use component tokens.
- Ensure all primitives expose stable `testID`.

### Phase 3: Kit Screens

- Product screen: stronger visual hierarchy, no empty image warnings, polished options area, sticky-safe CTA.
- Bag screen: cleaner totals, better empty state, quantity animation.
- Checkout screen: premium form fields, clearer stepper, friendly validation.
- Account/settings: sheets or menus for selectable rows.
- Explore/list screens: LegendList refresh/load-more states, skeletons, empty/error states.

### Phase 4: App Template Polish

- Remove remaining demo wording.
- Keep Shopify integration as the default real commerce example.
- Add README screenshots for home, product, bag, checkout, account.
- Run iOS and Android e2e purchase flow after each visual sweep.

## Quality Bar

Before marking a screen complete:

- No visible RN warnings or LogBox overlays
- No text overlap on iPhone-sized and Android Pixel-sized viewports
- No scroll gaps caused by fake sticky footers
- Every tappable control actually works
- Every key control has a testID
- Dark and light modes both look intentional
- Theme override changes primary color without breaking contrast
- iOS and Android e2e smoke pass for the affected flow
