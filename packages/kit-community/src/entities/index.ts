import { z } from "zod";
import type { EntityBase, EntityConfig, ListScreenConfig, DetailScreenConfig } from "../types";

/**
 * Define an entity with Zod schema and screen configurations
 *
 * @example
 * ```typescript
 * const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * const UserEntity = defineEntity(UserSchema, {
 *   name: 'User',
 *   icon: 'User',
 *   list: {
 *     title: 'USERS',
 *     columns: [
 *       { key: 'name', label: 'NAME', variant: 'primary' },
 *       { key: 'email', label: 'EMAIL' },
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
 * ```
 */
export function defineEntity<T extends EntityBase>(
	schema: z.ZodType<T>,
	config: Omit<EntityConfig<T>, "schema">,
): EntityConfig<T> {
	return {
		schema,
		...config,
	};
}

/**
 * Helper to create list screen configuration
 */
export function createListConfig<T extends EntityBase>(
	config: ListScreenConfig<T>,
): ListScreenConfig<T> {
	return config;
}

/**
 * Helper to create detail screen configuration
 */
export function createDetailConfig<T extends EntityBase>(
	config: DetailScreenConfig<T>,
): DetailScreenConfig<T> {
	return config;
}

/**
 * Type guard to check if an object matches entity schema
 */
export function validateEntity<T extends EntityBase>(
	schema: z.ZodType<T>,
	data: unknown,
): data is T {
	return schema.safeParse(data).success;
}

/**
 * Parse and validate entity data
 */
export function parseEntity<T extends EntityBase>(schema: z.ZodType<T>, data: unknown): T {
	return schema.parse(data);
}

/**
 * Get default values from schema (for form initialization)
 */
export function getEntityDefaults<T extends EntityBase>(schema: z.ZodType<T>): Partial<T> {
	// Zod v4 has improved default handling
	if (schema instanceof z.ZodObject) {
		const defaults: Record<string, unknown> = {};
		const shape = schema.shape;

		for (const [key, fieldSchema] of Object.entries(shape)) {
			if (fieldSchema instanceof z.ZodDefault) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				defaults[key] =
					(fieldSchema._def as { defaultValue?: () => unknown }).defaultValue?.() ?? null;
			} else if (fieldSchema instanceof z.ZodOptional) {
				defaults[key] = undefined;
			} else if (fieldSchema instanceof z.ZodBoolean) {
				defaults[key] = false;
			} else if (fieldSchema instanceof z.ZodNumber) {
				defaults[key] = 0;
			} else if (fieldSchema instanceof z.ZodString) {
				defaults[key] = "";
			} else if (fieldSchema instanceof z.ZodEnum) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const enumValues = (fieldSchema._def as unknown as { values: string[] }).values;
				if (Array.isArray(enumValues) && enumValues.length > 0) {
					defaults[key] = enumValues[0];
				}
			}
		}

		return defaults as Partial<T>;
	}

	return {};
}

export * from "../types";
