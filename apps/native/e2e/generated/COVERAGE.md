# Generated agent-device coverage

App ID: dev.osuki.kit
Metro URL: http://127.0.0.1:8081

## Pages

- home: / -> Osuki Market
- categories: /categories -> Categories
- search: /search -> RECENT SEARCHES
- bag: /bag -> YOUR CART IS EMPTY
- orders: /orders -> Orders
- users: /users -> Avery Chen
- user-detail: /users/1 -> Avery Chen
- account: /account -> APPEARANCE
- account-profile: /account-profile -> Sign in to view profile
- account-addresses: /account-addresses -> Sign in to manage addresses
- account-orders: /account-orders -> Sign in to view orders
- security: /security-screen -> SECURITY SCORE
- forms: /forms -> FORMS
- auth: /auth-screen -> Account
- flows: /flows -> FLOWS
- product: /product?id=the-inventory-not-tracked-snowboard -> The Inventory Not Tracked Snowboard
- cart: /cart -> YOUR CART IS EMPTY
- checkout: /checkout -> Your cart is empty
- order: /order -> TRACKING NUMBER
- article: /article -> The Art of Minimalist Design
- feed: /feed -> Sarah Chen
- player: /player -> Midnight City
- notifications: /notifications -> New message from Sarah
- calendar: /calendar -> Team Standup
- camera: /camera -> SCAN
- files: /files -> Design System
- error: /error-state -> ERROR STATE
- empty: /empty-state -> EMPTY STATE TYPE
- loading: /loading -> SPINNER SIZE
- welcome: /welcome -> Osuki Market
- tabbed: /tabbed -> OVERVIEW (2)
- bottom-nav: /bottom-nav -> BOTTOM NAV
- modal: /modal -> Modal
- component-e2e: /component-e2e -> COMPONENT E2E

## Components

- E2E COMPONENT Text
- E2E COMPONENT Button
- E2E COMPONENT PressableCard
- E2E COMPONENT Toggle
- E2E COMPONENT Checkbox
- E2E COMPONENT ListItem
- E2E COMPONENT DataTable
- E2E COMPONENT SegmentedControl
- E2E COMPONENT Tabs
- E2E COMPONENT Tag
- E2E COMPONENT Input
- E2E COMPONENT Select
- E2E COMPONENT DateInput
- E2E COMPONENT Dialog
- E2E COMPONENT Modal
- E2E COMPONENT Menu
- E2E COMPONENT OtpInput
- E2E COMPONENT ActionSheet
- E2E COMPONENT Sheet
- E2E COMPONENT Tooltip
- E2E COMPONENT Surface
- E2E COMPONENT Screen
- E2E COMPONENT ScrollScreen
- E2E COMPONENT Badge
- E2E COMPONENT Avatar
- E2E COMPONENT Icon
- E2E COMPONENT StatRow
- E2E COMPONENT SegmentedProgressBar
- E2E COMPONENT Toast
- E2E COMPONENT Spinner
- E2E COMPONENT Divider
- E2E COMPONENT Timeline
- E2E COMPONENT ResponsiveContainer
- E2E COMPONENT ResponsiveGrid
- E2E COMPONENT KeyboardAvoidingView
- E2E COMPONENT KeyboardStickyView
- E2E COMPONENT KeyboardToolbar
- E2E COMPONENT PressableScale
- E2E COMPONENT ChoiceRow
- E2E COMPONENT ChoiceList
- E2E COMPONENT InlineActivity

## Product Flows

- purchase-loop: product -> cart -> checkout -> order
- account-checkout-flow: sign in -> save profile -> choose default address -> checkout prefill
- account-signup-signout-flow: sign up -> account state -> sign out
- auth-validation: submit empty form -> field errors -> successful sign in
- notifications-interactions: filter unread -> mark all read -> empty state
- feed-interactions: like -> comment -> share -> bookmark -> load more
- files-interactions: sort -> grid -> folder navigation -> file selection
- forms-interactions: validation errors -> successful submit -> reset
- camera-interactions: scan open -> photo controls -> video recording -> close
- player-interactions: play -> next/previous -> shuffle/repeat/rate
- security-interactions: score actions -> auth toggles -> session revoke -> danger confirmation
- state-interactions: empty action -> error retry/home actions
- content-interactions: article share -> user detail actions
- search-interactions: recent query -> clear -> empty search
- calendar-interactions: view switch -> month navigation -> date select -> event details

## Component Test IDs

| Component               | Test ID                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Text                    | `e2e-component-screen-title`                                                                     |
| Button                  | `e2e-button-primary`                                                                             |
| Card                    | `e2e-card`                                                                                       |
| PressableCard           | `e2e-pressable-card`                                                                             |
| Toggle                  | `e2e-toggle`                                                                                     |
| Checkbox                | `e2e-checkbox`                                                                                   |
| ListItem                | `e2e-list-item, e2e-list-item-row`                                                               |
| DataTable               | `e2e-data-table, e2e-data-table-row-order-1001`                                                  |
| SegmentedControl        | `e2e-segmented-control`                                                                          |
| Tabs                    | `e2e-tabs, e2e-tabs-overview, e2e-tabs-orders`                                                   |
| Tag                     | `e2e-tag`                                                                                        |
| Input                   | `e2e-input`                                                                                      |
| Select                  | `e2e-select`                                                                                     |
| DateInput               | `e2e-date-input`                                                                                 |
| Dialog                  | `e2e-dialog-trigger, e2e-dialog-action-confirm`                                                  |
| Modal                   | `e2e-modal-trigger, e2e-modal, e2e-modal-close`                                                  |
| Menu                    | `e2e-menu`                                                                                       |
| OtpInput                | `e2e-otp-input`                                                                                  |
| ActionSheet             | `e2e-action-sheet-trigger, e2e-action-sheet`                                                     |
| Sheet                   | `e2e-sheet-trigger, e2e-sheet, e2e-sheet-close`                                                  |
| Tooltip                 | `e2e-tooltip`                                                                                    |
| Surface                 | `e2e-surface`                                                                                    |
| Screen                  | `e2e-screen`                                                                                     |
| ScrollScreen            | `e2e-scroll-screen`                                                                              |
| Badge                   | `e2e-badge-primary, e2e-badge-success`                                                           |
| Avatar                  | `e2e-avatar`                                                                                     |
| Icon                    | `e2e-icon`                                                                                       |
| StatRow                 | `e2e-stat-row`                                                                                   |
| SegmentedProgressBar    | `e2e-segmented-progress-bar`                                                                     |
| Toast                   | `e2e-toast-trigger`                                                                              |
| Spinner                 | `e2e-spinner-sm, e2e-spinner-md, e2e-spinner-lg`                                                 |
| Divider                 | `e2e-divider`                                                                                    |
| Timeline                | `e2e-timeline`                                                                                   |
| ResponsiveContainer     | `e2e-responsive-container`                                                                       |
| ResponsiveGrid          | `e2e-responsive-grid`                                                                            |
| KeyboardAwareScrollView | `e2e-keyboard-aware-scroll-view`                                                                 |
| KeyboardAvoidingView    | `e2e-keyboard-avoiding-view`                                                                     |
| KeyboardStickyView      | `e2e-keyboard-sticky-view`                                                                       |
| PressableScale          | `e2e-pressable-scale, e2e-pressable-scale-quiet, e2e-pressable-scale-disabled`                   |
| ChoiceRow               | `e2e-choice-row-plain, e2e-choice-row-loading, e2e-choice-row-disabled, e2e-choice-row-headline` |
| ChoiceList              | `e2e-choice-option-allow-once, e2e-choice-command-review`                                        |
| InlineActivity          | `e2e-inline-activity-sm, e2e-inline-activity-inactive, e2e-inline-activity-full`                 |
