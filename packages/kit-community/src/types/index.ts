import { z } from "zod";
import type { IconName } from "@osuki-dev/ui";

/**
 * Base entity type - all entities must have an id
 */
export interface EntityBase {
	id: string;
}

/**
 * Field display variant for Osuki design system
 */
export type FieldVariant =
	| "primary" // Large, hero-style emphasis
	| "secondary" // Regular text
	| "muted" // Secondary text color
	| "primary" // Osuki red accent
	| "success" // Green
	| "warning" // Amber
	| "error"; // Red

/**
 * Field display type - determines UI component
 */
export type FieldType =
	| "text"
	| "number"
	| "date"
	| "datetime"
	| "boolean"
	| "tag"
	| "progress"
	| "currency"
	| "percent"
	| "link"
	| "image";

/**
 * Column configuration for list views
 */
export interface ColumnConfig<T extends EntityBase> {
	key: keyof T;
	label: string;
	type?: FieldType;
	variant?: FieldVariant;
	width?: "auto" | "flex" | number;
	sortable?: boolean;
	searchable?: boolean;
	format?: (value: unknown, item: T) => string;
	colorMap?: Record<string, FieldVariant>;
}

/**
 * Action button configuration
 */
export interface ActionConfig<T extends EntityBase> {
	id: string;
	label: string;
	icon?: IconName;
	variant?: "primary" | "secondary" | "ghost" | "destructive";
	onPress?: (item: T) => void;
	visible?: (item: T) => boolean;
}

/**
 * Section configuration for detail views
 */
export interface SectionConfig<T extends EntityBase> {
	id: string;
	title: string;
	fields: (keyof T)[];
	columns?: 1 | 2;
}

/**
 * Hero section configuration
 */
export interface HeroConfig<T extends EntityBase> {
	title: keyof T;
	subtitle?: keyof T;
	metric?: {
		value: keyof T;
		label: string;
		unit?: string;
	};
	icon?: IconName;
}

/**
 * List screen configuration
 */
export interface ListScreenConfig<T extends EntityBase> {
	title: string;
	icon?: IconName;
	columns: ColumnConfig<T>[];
	actions?: ActionConfig<T>[];
	hero?: {
		label: string;
		value: (items: T[]) => string | number;
	};
	searchFields?: (keyof T)[];
	sortable?: boolean;
	selectable?: boolean;
}

/**
 * Detail screen configuration
 */
export interface DetailScreenConfig<T extends EntityBase> {
	title: string;
	icon?: IconName;
	hero: HeroConfig<T>;
	sections: SectionConfig<T>[];
	actions?: ActionConfig<T>[];
	metadata?: {
		createdAt?: keyof T;
		updatedAt?: keyof T;
	};
}

/**
 * Dashboard widget types
 */
export type WidgetType =
	| "stat" // StatRow style
	| "progress" // SegmentedProgressBar
	| "hero" // Large number display
	| "list" // Mini list
	| "chart"; // Sparkline or bar chart

/**
 * Dashboard widget configuration
 */
export interface WidgetConfig<T = Record<string, unknown>> {
	id: string;
	title: string;
	type: WidgetType;
	data: T[] | (() => T[]);
	field?: keyof T;
	label?: string;
	unit?: string;
	format?: (value: unknown) => string;
	span?: 1 | 2 | 3 | 4;
}

/**
 * Dashboard screen configuration
 */
export interface DashboardScreenConfig {
	title: string;
	widgets: WidgetConfig[];
	refreshInterval?: number;
}

/**
 * Complete entity configuration
 */
export interface EntityConfig<T extends EntityBase> {
	name: string;
	schema: z.ZodType<T>;
	icon?: IconName;
	list?: ListScreenConfig<T>;
	detail?: DetailScreenConfig<T>;
}
