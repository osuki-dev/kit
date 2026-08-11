import { useMemo, useState } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { ProductScreen } from "@osuki-dev/kit-community";
import type { ProductScreenConfig } from "@osuki-dev/kit-community";
import { Screen, Card, Icon, Spinner, Text, useTheme } from "@osuki-dev/ui";

import { useCart, useProduct, useProducts } from "@/lib/data";

export default function ProductScreenRoute() {
	const params = useLocalSearchParams<{ id?: string }>();
	const { colors, spacing } = useTheme();
	const { items } = useProducts({ limit: 6 });
	const { add } = useCart();
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedVariant, setSelectedVariant] = useState("black");
	const [favorited, setFavorited] = useState(false);
	const requestedProduct = useProduct(params.id ?? items[0]?.id ?? "");
	const product = requestedProduct ?? items[0];
	const recommendations = items.filter((item) => item.id !== product?.id).slice(0, 3);

	const config = useMemo<ProductScreenConfig | null>(() => {
		if (!product) return null;

		return {
			name: product.name,
			description: product.description,
			images: [product.image, ...recommendations.map((item) => item.image)].filter(Boolean),
			price: product.price,
			originalPrice: product.originalPrice,
			currency: "$",
			rating: product.rating,
			reviewCount: product.reviews,
			inStock: product.stock > 0,
			stockCount: product.stock,
			tags: ["BESTSELLER", product.category.toUpperCase()],
			specs: [
				{ name: "Variant", value: product.variant },
				{ name: "Availability", value: "Ships today" },
				{ name: "Returns", value: "30 days" },
				{ name: "Warranty", value: "2 years" },
			],
			sellingPoints: [
				{
					icon: "Truck",
					title: "Fast delivery",
					description: "Ships today with tracking updates.",
				},
				{
					icon: "RefreshCcw",
					title: "Easy returns",
					description: "30-day return window on eligible items.",
				},
				{
					icon: "ShieldCheck",
					title: "Secure checkout",
					description: "Protected payment and saved cart support.",
				},
			],
			variants: [
				{
					id: "black",
					name: "Midnight Black",
					available: true,
					selected: selectedVariant === "black",
				},
				{ id: "silver", name: "Silver", available: true, selected: selectedVariant === "silver" },
				{ id: "blue", name: "Navy Blue", available: false, selected: selectedVariant === "blue" },
			],
			recommendations: recommendations.map((item) => ({
				id: item.id,
				name: item.name,
				price: item.price,
				image: item.image,
				onPress: () => {
					setSelectedImageIndex(0);
					router.push({ pathname: "/product", params: { id: item.id } });
				},
			})),
			primaryAction: {
				label: "ADD TO CART",
				testID: "product-add-to-cart",
				onPress: async () => {
					await add(product.id, 1);
					router.push("/bag");
				},
			},
			secondaryActions: [
				{
					icon: favorited ? "HeartOff" : "Heart",
					label: favorited ? "Saved" : "Wishlist",
					onPress: () => setFavorited((value) => !value),
				},
				{ icon: "ShoppingCart", label: "Cart", onPress: () => router.push("/bag") },
			],
		};
	}, [add, favorited, product, recommendations, selectedVariant]);

	if (!config) {
		return (
			<Screen>
				<View style={{ flex: 1, padding: spacing["lg"], justifyContent: "center" }}>
					<Card
						variant="flat"
						border="subtle"
						padding="lg"
						style={{ alignItems: "center", gap: spacing["md"] }}
					>
						<View
							style={{
								width: 56,
								height: 56,
								borderRadius: 999,
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: colors.surfaceRaised,
							}}
						>
							<Icon name="Package" size={24} color={colors.textMuted} />
						</View>
						<Spinner size="md" color={colors.primary} testID="product-loading" />
						<Text variant="label" color={colors.text}>
							LOADING PRODUCT
						</Text>
						<Text variant="caption" color={colors.textMuted} style={{ textAlign: "center" }}>
							Fetching the latest storefront details.
						</Text>
					</Card>
				</View>
			</Screen>
		);
	}

	return (
		<>
			<Stack.Screen options={{ title: product?.name ?? "Product" }} />
			<ProductScreen
				config={config}
				selectedImageIndex={selectedImageIndex}
				onImageSelect={setSelectedImageIndex}
				onVariantSelect={setSelectedVariant}
			/>
		</>
	);
}
