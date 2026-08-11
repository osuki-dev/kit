import { useEffect, useMemo, useState } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { SearchScreen, type SearchScreenConfig } from "@osuki-dev/kit-community";

import { SearchHeaderInput } from "@/components/search-header-input";
import { useProducts } from "@/lib/data";

const initialRecentSearches = ["snowboard", "gift", "accessory"];
const trendingSearches = ["winter gear", "portable tech", "daily carry", "limited drops"];

export default function SearchRoute() {
	const params = useLocalSearchParams<{ q?: string }>();
	const initialQuery = typeof params.q === "string" ? params.q : "";
	const [query, setQuery] = useState(initialQuery);
	const [recentSearches, setRecentSearches] = useState(initialRecentSearches);
	const { items, loading } = useProducts({ limit: 20, query: query.trim() || undefined });

	useEffect(() => {
		if (typeof params.q !== "string") return;
		setQuery(params.q);
	}, [params.q]);

	const commitSearch = (nextQuery = query) => {
		const normalized = nextQuery.trim();
		if (!normalized) return;
		setRecentSearches((items) =>
			[
				normalized,
				...items.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
			].slice(0, 5),
		);
	};

	const config = useMemo<SearchScreenConfig>(
		() => ({
			query,
			results: query.trim()
				? items.map((product) => ({
						id: product.id,
						title: product.name,
						subtitle: `${product.category} · $${product.price}`,
						description: product.description,
						tag: product.stock > 0 ? "Available" : "Sold out",
						icon: "ShoppingBag",
						onPress: () => router.push({ pathname: "/product", params: { id: product.id } }),
					}))
				: [],
			recentSearches,
			trendingSearches,
			totalCount: query.trim() ? items.length : undefined,
			isLoading: loading,
			emptyMessage: "No matching products found.",
		}),
		[items, loading, query, recentSearches],
	);

	const selectSearch = (nextQuery: string) => {
		setQuery(nextQuery);
		commitSearch(nextQuery);
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: () => (
						<SearchHeaderInput
							value={query}
							onChangeText={setQuery}
							onSubmit={() => commitSearch()}
							onClear={() => setQuery("")}
						/>
					),
				}}
			/>
			<SearchScreen
				config={config}
				onQueryChange={setQuery}
				onSearch={() => commitSearch()}
				onClear={() => setQuery("")}
				onRecentSearchSelect={selectSearch}
				onResultPress={(result) => router.push({ pathname: "/product", params: { id: result.id } })}
				hideHeader
			/>
		</>
	);
}
