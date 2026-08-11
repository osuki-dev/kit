/**
 * @osuki-dev/ui
 *
 * Osuki UI/UX Design System
 *
 * A CJK-friendly Expo UI toolkit shaped around the Osuki brand tokens.
 *
 * Brand-colored, typographically steady, information-dense without clutter.
 * Dark and light mode with equal rigor.
 *
 * ## Fonts
 *
 * The default theme uses the platform system font. Apps may load any font with
 * `FontLoader` and map its loaded family names to semantic theme roles.
 *
 * ## Quick Start
 *
 * ```tsx
 * import { FontLoader, ThemeProvider } from '@osuki-dev/ui';
 *
 * export default function App() {
 *   return (
 *     <FontLoader fonts={appFonts}>
 *       <ThemeProvider defaultMode="dark">
 *         <YourApp />
 *       </ThemeProvider>
 *     </FontLoader>
 *   );
 * }
 * ```
 *
 * ## Expo Font Plugin
 *
 * ```bash
 * npx expo install expo-font
 * ```
 *
 * @packageDocumentation
 */

// Theme
export * from "./theme";

// Components
export * from "./components";

// Fonts
export * from "./fonts";

// Navigation (React Navigation theme integration)
export * from "./navigation";
