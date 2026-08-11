import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ShopifyStorefrontAdapter } from "./shopify-storefront-adapter";
import { OsukiRepository } from "./repository";
import type { AccountDataAdapter, OsukiDataAdapter } from "./types";

type DataContextValue = {
	repository: OsukiRepository;
	ready: boolean;
	version: number;
	refresh(): void;
};

const DataContext = createContext<DataContextValue | null>(null);

export function OsukiDataProvider({
	children,
	adapter,
	accountAdapter,
}: {
	children: React.ReactNode;
	adapter?: OsukiDataAdapter;
	accountAdapter?: AccountDataAdapter;
}) {
	const repository = useMemo(
		() => new OsukiRepository(adapter ?? new ShopifyStorefrontAdapter({ accountAdapter })),
		[accountAdapter, adapter],
	);
	const mountedRef = useRef(false);
	const [ready, setReady] = useState(false);
	const [version, setVersion] = useState(0);

	useEffect(() => {
		let mounted = true;
		mountedRef.current = true;

		repository
			.init()
			.then(() => {
				if (mounted) {
					setReady(true);
					setVersion((value) => value + 1);
				}
			})
			.catch((error) => {
				console.error("Failed to initialize Osuki data layer", error);
				if (mounted) setReady(true);
			});

		return () => {
			mounted = false;
			mountedRef.current = false;
		};
	}, [repository]);

	const refresh = useCallback(() => {
		if (!mountedRef.current) return;
		setVersion((value) => value + 1);
	}, []);

	const value = useMemo(
		() => ({ repository, ready, version, refresh }),
		[repository, ready, version, refresh],
	);

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
	const value = React.use(DataContext);
	if (!value) {
		throw new Error("useDataContext must be used inside OsukiDataProvider");
	}
	return value;
}
