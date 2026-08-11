import { useMemo, useState } from "react";
import { router } from "expo-router";

import { CartScreen } from "@osuki-dev/kit-community";
import type { CartScreenConfig } from "@osuki-dev/kit-community";

import { useCart } from "@/lib/data";
import { useTabChromeScreen } from "@/components/tab-chrome-context";

const cartEmptyArtwork = require("../../assets/commerce/osuki-cart-empty.jpg");

export default function CartRoute() {
	const { items, setQuantity, remove } = useCart();
	const [promo, setPromo] = useState<CartScreenConfig["discount"]>();
	const [promoMessage, setPromoMessage] = useState<CartScreenConfig["promoMessage"]>();
	const handleChromeScroll = useTabChromeScreen("Cart");

	const config = useMemo<CartScreenConfig>(
		() => ({
			items: items.map((item) => ({
				id: item.id,
				name: item.name,
				price: item.price,
				quantity: item.quantity,
				variant: item.variant,
				image: item.image,
				maxQuantity: item.stock,
			})),
			currency: "$",
			shipping: 10,
			taxRate: 0.08,
			freeShippingThreshold: 500,
			discount: promo,
			promoMessage,
			emptyArtwork: cartEmptyArtwork,
			primaryAction: {
				label: "CHECKOUT",
				testID: "cart-checkout",
				onPress: () => router.push("/checkout"),
			},
			secondaryAction: {
				label: "CONTINUE SHOPPING",
				onPress: () => router.push("/"),
			},
		}),
		[items, promo, promoMessage],
	);

	const applyPromoCode = (code: string) => {
		const normalized = code.trim().toUpperCase();
		if (normalized !== "OSUKI20") {
			setPromo(undefined);
			setPromoMessage({
				type: "error",
				text: "Promo code was not recognized.",
			});
			return;
		}

		setPromo({
			code: normalized,
			type: "percentage",
			amount: 20,
		});
		setPromoMessage({
			type: "success",
			text: "OSUKI20 applied for 20% off.",
		});
	};

	return (
		<CartScreen
			config={config}
			onQuantityChange={setQuantity}
			onRemoveItem={remove}
			onApplyPromoCode={applyPromoCode}
			onScroll={handleChromeScroll}
		/>
	);
}
