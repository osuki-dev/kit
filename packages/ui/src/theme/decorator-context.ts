import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useThemeTokens } from "./theme-provider";
import type { ResolvedThemeMode } from "./types";

/**
 * Every slot a kit component paints through the decorator. A slot names a
 * fill, so an app's decorator keys its policy on it: renaming one is a
 * breaking change, like renaming a token. `docs/theme.md` lists each slot
 * with its role.
 */
export const SURFACE_SLOTS = [
	"screens.page",
	"surfaces.surface",
	"surfaces.raised",
	"cards.decoration",
	"buttons.primary.background",
	"buttons.secondary.background",
	"buttons.ghost.background",
	"buttons.destructive.background",
	"inputs.background",
	"inputs.search",
	"inputs.error",
	"prompt.background",
	"tabs.track",
	"tabs.selected",
	"tabs.badge",
	"segmented.track",
	"segmented.selected",
	"toggles.track",
	"tags.background",
	"badges.background",
	"skeleton.fill",
	"empty.icon",
	"alerts.info",
	"alerts.success",
	"alerts.warning",
	"alerts.danger",
	"code.default",
	"code.diff",
	"code.terminal",
	"code.compact",
	"sheets.background",
	"menus.trigger",
	"dialogs.background",
	"sheets.action",
	"popovers.background",
	"tooltips.background",
	"toasts.background",
	"selects.trigger",
	"rows.background",
] as const;

export type KitSurfaceSlot = (typeof SURFACE_SLOTS)[number];

/**
 * Register the slots your own surfaces paint, so `SurfaceSlot` keeps checking
 * them at compile time:
 *
 * ```ts
 * declare module "@osuki-dev/ui" {
 *   interface SurfaceSlotRegistry {
 *     "composer.dock": true;
 *   }
 * }
 * ```
 */
// oxlint-disable-next-line typescript/no-empty-interface -- augmented by consumers
export interface SurfaceSlotRegistry {}

export type SurfaceSlot = KitSurfaceSlot | Extract<keyof SurfaceSlotRegistry, string>;

/**
 * What a fill is for, so one decorator policy can treat them differently:
 *
 * - `surface`: a plane that carries content (a card, a field, a track).
 * - `overlay`: a fill drawn on top of another fill (a selected segment over
 *   its track). `over` is the resolved fill underneath, so a translucent
 *   policy can avoid multiplying itself.
 * - `mark`: a small fill that carries meaning by its colour (a badge, a
 *   toggle track, a selection pill) and usually stays opaque.
 */
export type SurfaceRole = "surface" | "overlay" | "mark";

export interface SurfaceMeta {
	slot?: SurfaceSlot;
	role?: SurfaceRole;
	/** For an `overlay`: the resolved fill it is drawn over. */
	over?: string;
	/** The resolved theme mode. Filled in by the kit; callers may omit it. */
	mode?: ResolvedThemeMode;
	variant?: string;
	baseColor: string;
	disabled?: boolean;
	selected?: boolean;
	borderRadius?: number;
}

export interface SurfaceDecoratorContextValue {
	/**
	 * Maps a fill, for example to apply an opacity. Treat it as a pure function
	 * of `(baseColor, meta)`: components memoize its result on the function's
	 * identity, so create a new function when anything it reads changes, such
	 * as a slider value. `transparent` is never passed in.
	 */
	transformBackground?: (baseColor: string, meta: SurfaceMeta) => string;
	/** Paints artwork behind a slot. Return `null` to paint nothing. */
	renderDecoration?: (meta: SurfaceMeta) => ReactNode;
}

export const SurfaceDecoratorContext = createContext<SurfaceDecoratorContextValue | null>(null);

export interface SurfaceDecoratorProviderProps extends SurfaceDecoratorContextValue {
	children: ReactNode;
}

export function SurfaceDecoratorProvider({
	children,
	transformBackground,
	renderDecoration,
}: SurfaceDecoratorProviderProps) {
	const value = useMemo<SurfaceDecoratorContextValue>(
		() => ({
			transformBackground,
			renderDecoration,
		}),
		[transformBackground, renderDecoration],
	);

	return React.createElement(SurfaceDecoratorContext.Provider, { value }, children);
}

export function useSurfaceDecorator(): SurfaceDecoratorContextValue | null {
	return useContext(SurfaceDecoratorContext);
}

/** Pure: the fill for one surface, passed through the transform once. */
export function resolveSurfaceFill(
	baseColor: string,
	meta: SurfaceMeta,
	transform: SurfaceDecoratorContextValue["transformBackground"],
): string {
	if (!transform || baseColor === "transparent") return baseColor;
	return transform(baseColor, meta);
}

/** The meta a decorator sees: the caller's, with the role and mode filled in. */
export function useSurfaceMeta(meta: SurfaceMeta): SurfaceMeta {
	const { mode } = useThemeTokens();
	const {
		slot,
		role = "surface",
		over,
		variant,
		baseColor,
		disabled,
		selected,
		borderRadius,
	} = meta;
	// Keyed on the fields, so a caller that builds the meta inline still gets
	// one stable object per distinct surface.
	return useMemo(
		() => ({ slot, role, over, mode, variant, baseColor, disabled, selected, borderRadius }),
		[slot, role, over, mode, variant, baseColor, disabled, selected, borderRadius],
	);
}

/**
 * The fill a surface should paint: the token, passed through the decorator once.
 * `transparent` is left alone so an empty layer cannot become a second wash.
 */
export function useResolvedSurfaceFill(baseColor: string, meta: SurfaceMeta): string {
	const decorator = useSurfaceDecorator();
	const transform = decorator?.transformBackground;
	const fullMeta = useSurfaceMeta(meta);
	return useMemo(
		() => resolveSurfaceFill(baseColor, fullMeta, transform),
		[baseColor, fullMeta, transform],
	);
}
