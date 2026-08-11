/**
 * @osuki-dev/kit-community
 *
 * Osuki Design System - Application Kit
 *
 * Schema-driven UI components for rapid application development.
 * Built with Zod v4 for type-safe entity definitions.
 *
 * ## Quick Start
 *
 * ```typescript
 * // 1. Define entity with Zod
 * const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string().email(),
 *   status: z.enum(['active', 'inactive']),
 * });
 *
 * // 2. Configure screens
 * const UserEntity = defineEntity(UserSchema, {
 *   name: 'User',
 *   icon: 'User',
 *   list: {
 *     title: 'USERS',
 *     columns: [
 *       { key: 'name', label: 'NAME', variant: 'primary' },
 *       { key: 'email', label: 'EMAIL' },
 *       { key: 'status', label: 'STATUS', type: 'tag' },
 *     ],
 *   },
 *   detail: {
 *     title: 'USER DETAILS',
 *     hero: { title: 'name' },
 *     sections: [
 *       { id: 'basic', title: 'BASIC INFO', fields: ['name', 'email'] },
 *     ],
 *   },
 * });
 *
 * // 3. Render screen
 * <ListScreen entity={UserEntity} data={users} />
 * ```
 *
 * @packageDocumentation
 */

// Screens
export * from "./screens";

// Components
export * from "./components";

// Hooks
export * from "./hooks";

// Entity definitions
export * from "./entities";

// Composable app modules
export * from "./modules";

// Types
export * from "./types";

// i18n
export * from "./i18n";

// Utils
export * from "./utils/styles";
