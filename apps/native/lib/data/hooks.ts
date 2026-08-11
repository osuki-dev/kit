import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useDataContext } from "./data-provider";
import type {
	AccountAddress,
	AccountProfile,
	AccountSession,
	CartItemRecord,
	CreateOrderInput,
	OrderWithItems,
	UserRecord,
} from "./types";

function useMountedRef() {
	const mountedRef = useRef(false);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	return mountedRef;
}

export function useProducts(params: { limit?: number; query?: string } = {}) {
	const { repository, ready } = useDataContext();
	const limit = params.limit ?? 12;

	const query = useInfiniteQuery({
		queryKey: ["products", limit, params.query ?? ""],
		enabled: ready,
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			repository.listProducts({ limit, offset: pageParam, query: params.query }),
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined;
			return pages.reduce((sum, page) => sum + page.length, 0);
		},
	});

	const refresh = useCallback(async () => {
		await query.refetch();
	}, [query]);

	const loadMore = useCallback(async () => {
		if (!query.hasNextPage || query.isFetchingNextPage) return;
		await query.fetchNextPage();
	}, [query]);

	const items = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

	return {
		items,
		loading: query.isLoading,
		refreshing: query.isRefetching,
		loadingMore: query.isFetchingNextPage,
		hasMore: Boolean(query.hasNextPage),
		refresh,
		loadMore,
	};
}

export function useProduct(id: string) {
	const { repository, ready } = useDataContext();
	const query = useQuery({
		queryKey: ["product", id],
		enabled: ready && Boolean(id),
		queryFn: () => repository.getProduct(id),
	});

	return query.data ?? null;
}

export function useCart() {
	const { repository, ready, refresh, version } = useDataContext();
	const mountedRef = useMountedRef();
	const [items, setItems] = useState<CartItemRecord[]>([]);
	const [loading, setLoading] = useState(true);

	const reload = useCallback(async () => {
		const next = await repository.listCartItems();
		if (!mountedRef.current) return;
		setItems(next);
	}, [mountedRef, repository]);

	useEffect(() => {
		if (!ready) return;
		let active = true;
		setLoading(true);
		reload().finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [ready, reload, version]);

	const setQuantity = useCallback(
		async (productId: string, quantity: number) => {
			await repository.setCartQuantity(productId, quantity);
			refresh();
		},
		[refresh, repository],
	);

	const remove = useCallback(
		async (productId: string) => {
			await repository.removeCartItem(productId);
			refresh();
		},
		[refresh, repository],
	);

	const add = useCallback(
		async (productId: string, quantity = 1) => {
			await repository.addToCart(productId, quantity);
			refresh();
		},
		[refresh, repository],
	);

	return { items, loading, setQuantity, remove, add, refresh: reload };
}

export function useUsers(params: { limit?: number; query?: string } = {}) {
	const { repository, ready, version } = useDataContext();
	const mountedRef = useMountedRef();
	const [items, setItems] = useState<UserRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const limit = params.limit ?? 20;

	const load = useCallback(
		async (offset = 0) => {
			const next = await repository.listUsers({ limit, offset, query: params.query });
			if (!mountedRef.current) return;
			setHasMore(next.length >= limit);
			setItems((current) => (offset === 0 ? next : [...current, ...next]));
		},
		[mountedRef, repository, limit, params.query],
	);

	useEffect(() => {
		if (!ready) return;
		let active = true;
		setLoading(true);
		load(0).finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [ready, version, load]);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		await load(0);
		if (!mountedRef.current) return;
		setRefreshing(false);
	}, [load, mountedRef]);

	const loadMore = useCallback(async () => {
		if (loadingMore || !hasMore) return;
		setLoadingMore(true);
		await load(items.length);
		if (!mountedRef.current) return;
		setLoadingMore(false);
	}, [hasMore, items.length, load, loadingMore, mountedRef]);

	return { items, loading, refreshing, loadingMore, hasMore, refresh, loadMore };
}

export function useAccount() {
	const { repository, ready, refresh, version } = useDataContext();
	const mountedRef = useMountedRef();
	const [session, setSession] = useState<AccountSession>({ status: "guest" });
	const [profile, setProfile] = useState<AccountProfile | null>(null);
	const [addresses, setAddresses] = useState<AccountAddress[]>([]);
	const [loading, setLoading] = useState(true);

	const reload = useCallback(async () => {
		const nextSession = await repository.getAccountSession();
		const [nextProfile, nextAddresses] =
			nextSession.status === "authenticated"
				? await Promise.all([repository.getAccountProfile(), repository.listAccountAddresses()])
				: [null, []];

		if (!mountedRef.current) return;
		setSession(nextSession);
		setProfile(nextProfile);
		setAddresses(nextAddresses);
	}, [mountedRef, repository]);

	useEffect(() => {
		if (!ready) return;
		let active = true;
		setLoading(true);
		reload().finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [ready, reload, version]);

	const signIn = useCallback(
		async (email: string, password: string) => {
			await repository.signIn({ email, password });
			await reload();
			refresh();
		},
		[refresh, reload, repository],
	);

	const signUp = useCallback(
		async (name: string, email: string, password: string) => {
			await repository.signUp({ name, email, password });
			await reload();
			refresh();
		},
		[refresh, reload, repository],
	);

	const signOut = useCallback(async () => {
		await repository.signOut();
		await reload();
		refresh();
	}, [refresh, reload, repository]);

	const updateProfile = useCallback(
		async (input: Parameters<typeof repository.updateAccountProfile>[0]) => {
			await repository.updateAccountProfile(input);
			await reload();
			refresh();
		},
		[refresh, reload, repository],
	);

	const setDefaultAddress = useCallback(
		async (addressId: string) => {
			await repository.setDefaultAccountAddress(addressId);
			await reload();
			refresh();
		},
		[refresh, reload, repository],
	);

	const addAddress = useCallback(
		async (input: Parameters<typeof repository.addAccountAddress>[0]) => {
			await repository.addAccountAddress(input);
			await reload();
			refresh();
		},
		[refresh, reload, repository],
	);

	const updateAddress = useCallback(
		async (addressId: string, input: Parameters<typeof repository.updateAccountAddress>[1]) => {
			await repository.updateAccountAddress(addressId, input);
			await reload();
			refresh();
		},
		[refresh, reload, repository],
	);

	const removeAddress = useCallback(
		async (addressId: string) => {
			await repository.removeAccountAddress(addressId);
			await reload();
			refresh();
		},
		[refresh, reload, repository],
	);

	return {
		session,
		profile,
		addresses,
		loading,
		signedIn: session.status === "authenticated",
		signIn,
		signUp,
		signOut,
		updateProfile,
		addAddress,
		updateAddress,
		removeAddress,
		setDefaultAddress,
		refresh: reload,
	};
}

export function useAccountOrders() {
	const { repository, ready, version } = useDataContext();
	const mountedRef = useMountedRef();
	const [orders, setOrders] = useState<OrderWithItems[]>([]);
	const [loading, setLoading] = useState(true);

	const reload = useCallback(async () => {
		const next = await repository.listAccountOrders({ limit: 20 });
		if (!mountedRef.current) return;
		setOrders(next);
	}, [mountedRef, repository]);

	useEffect(() => {
		if (!ready) return;
		let active = true;
		setLoading(true);
		reload().finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [ready, reload, version]);

	return { orders, latestOrder: orders[0] ?? null, loading, refresh: reload };
}

export function useOrders() {
	const { repository, ready, refresh, version } = useDataContext();
	const mountedRef = useMountedRef();
	const [latestOrder, setLatestOrder] = useState<OrderWithItems | null>(null);
	const [loading, setLoading] = useState(true);

	const reload = useCallback(async () => {
		const order = await repository.getLatestOrder();
		if (!mountedRef.current) return;
		setLatestOrder(order);
	}, [mountedRef, repository]);

	useEffect(() => {
		if (!ready) return;
		let active = true;
		setLoading(true);
		reload().finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [ready, reload, version]);

	const createFromCart = useCallback(
		async (input?: CreateOrderInput) => {
			const order = await repository.createOrderFromCart(input);
			if (!mountedRef.current) return order;
			setLatestOrder(order);
			refresh();
			return order;
		},
		[mountedRef, refresh, repository],
	);

	return { latestOrder, loading, createFromCart, refresh: reload };
}

export function useSettings() {
	const { repository, ready, refresh, version } = useDataContext();
	const mountedRef = useMountedRef();
	const [settings, setSettings] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!ready) return;
		let active = true;
		repository.listSettings().then((nextSettings) => {
			if (active && mountedRef.current) setSettings(nextSettings);
		});
		return () => {
			active = false;
		};
	}, [mountedRef, ready, repository, version]);

	const setSetting = useCallback(
		async (key: string, value: string | boolean | number) => {
			await repository.updateSetting({ key, value });
			refresh();
		},
		[refresh, repository],
	);

	return { settings, setSetting };
}
