import React, { createContext, useContext, useMemo, type ReactNode } from "react";

export interface SurfaceMeta {
	slot?: string;
	variant?: string;
	baseColor: string;
	disabled?: boolean;
	selected?: boolean;
	borderRadius?: number;
}

export interface SurfaceDecoratorContextValue {
	transformBackground?: (baseColor: string, meta: SurfaceMeta) => string;
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

/**
 * High-performance, zero-runtime overhead in-memory LRU cache.
 */
export class LRUCache<K, V> {
	private readonly capacity: number;
	private readonly cache = new Map<K, V>();

	constructor(capacity = 256) {
		this.capacity = capacity;
	}

	get(key: K): V | undefined {
		const value = this.cache.get(key);
		if (value === undefined) return undefined;
		// Refresh key position for LRU
		this.cache.delete(key);
		this.cache.set(key, value);
		return value;
	}

	set(key: K, value: V): void {
		if (this.cache.has(key)) {
			this.cache.delete(key);
		} else if (this.cache.size >= this.capacity) {
			const oldestKey = this.cache.keys().next().value;
			if (oldestKey !== undefined) {
				this.cache.delete(oldestKey);
			}
		}
		this.cache.set(key, value);
	}

	has(key: K): boolean {
		return this.cache.has(key);
	}

	clear(): void {
		this.cache.clear();
	}

	get size(): number {
		return this.cache.size;
	}
}

/**
 * Shared color contrast / fill cache.
 */
export const surfaceColorCache = new LRUCache<string, string>(512);

const transformIds = new WeakMap<(baseColor: string, meta: SurfaceMeta) => string, number>();
let nextTransformId = 1;

function transformCacheId(transform: (baseColor: string, meta: SurfaceMeta) => string): number {
	const existing = transformIds.get(transform);
	if (existing !== undefined) return existing;
	const id = nextTransformId;
	nextTransformId += 1;
	transformIds.set(transform, id);
	return id;
}

/**
 * Helper to retrieve or compute a transformed background color using the LRU cache.
 * The transform function is part of the key, so two decorators cannot share a result.
 */
export function getCachedTransformedColor(
	baseColor: string,
	meta: SurfaceMeta,
	transform?: (baseColor: string, meta: SurfaceMeta) => string,
): string {
	if (!transform) return baseColor;
	const cacheKey = `${transformCacheId(transform)}|${baseColor}|${meta.slot ?? ""}|${meta.variant ?? ""}|${meta.disabled ? 1 : 0}|${meta.selected ? 1 : 0}|${meta.borderRadius ?? ""}`;
	const cached = surfaceColorCache.get(cacheKey);
	if (cached !== undefined) return cached;
	const computed = transform(baseColor, meta);
	surfaceColorCache.set(cacheKey, computed);
	return computed;
}

/**
 * The fill a surface should paint: the token, passed through the decorator once.
 * `transparent` is left alone so an empty layer cannot become a second wash.
 */
export function useResolvedSurfaceFill(baseColor: string, meta: SurfaceMeta): string {
	const decorator = useSurfaceDecorator();
	const transform = decorator?.transformBackground;
	return useMemo(() => {
		if (!transform || baseColor === "transparent") return baseColor;
		return getCachedTransformedColor(baseColor, meta, transform);
	}, [baseColor, meta, transform]);
}
