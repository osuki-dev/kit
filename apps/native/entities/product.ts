import { z } from "zod";
import { defineEntity } from "@osuki-dev/kit-community";

export const ProductSchema = z.object({
	id: z.string(),
	name: z.string().min(1).describe("Product Name"),
	sku: z.string().describe("Stock Keeping Unit"),
	price: z.number().positive().describe("Price in USD"),
	stock: z.number().int().min(0).describe("Current Stock"),
	maxStock: z.number().int().positive().describe("Maximum Stock Capacity"),
	category: z.enum(["electronics", "clothing", "food", "other"]).describe("Product Category"),
	status: z.enum(["in_stock", "low_stock", "out_of_stock"]).describe("Stock Status"),
	rating: z.number().min(0).max(5).optional().describe("Customer Rating"),
	createdAt: z.date().describe("Created Date"),
	updatedAt: z.date().describe("Updated Date"),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductEntity = defineEntity(ProductSchema, {
	name: "Product",
	icon: "Package",

	list: {
		title: "PRODUCTS",
		icon: "Package",
		hero: {
			label: "TOTAL PRODUCTS",
			value: (items) => items.length,
		},
		columns: [
			{
				key: "name",
				label: "PRODUCT",
				variant: "primary",
				sortable: true,
				searchable: true,
				width: "flex",
			},
			{ key: "sku", label: "SKU", width: 120 },
			{ key: "price", label: "PRICE", type: "currency", sortable: true, width: 100 },
			{
				key: "stock",
				label: "STOCK",
				type: "progress",
				width: 120,
				colorMap: { low_stock: "warning", out_of_stock: "error" },
			},
			{
				key: "status",
				label: "STATUS",
				type: "tag",
				width: 100,
				colorMap: { in_stock: "success", low_stock: "warning", out_of_stock: "error" },
			},
		],
		actions: [
			{ id: "view", label: "VIEW", icon: "Eye", variant: "secondary" },
			{ id: "edit", label: "EDIT", icon: "Pencil", variant: "secondary" },
			{ id: "delete", label: "DELETE", icon: "Trash", variant: "destructive" },
		],
		searchFields: ["name", "sku"],
		sortable: true,
	},

	detail: {
		title: "PRODUCT DETAILS",
		icon: "Package",
		hero: {
			title: "name",
			subtitle: "sku",
			metric: {
				value: "price",
				label: "PRICE",
				unit: "USD",
			},
		},
		sections: [
			{
				id: "basic",
				title: "PRODUCT INFORMATION",
				fields: ["name", "sku", "category"],
				columns: 1,
			},
			{ id: "inventory", title: "INVENTORY", fields: ["stock", "maxStock", "status"], columns: 2 },
			{ id: "metrics", title: "PERFORMANCE", fields: ["rating"], columns: 1 },
		],
		actions: [
			{ id: "edit", label: "EDIT PRODUCT", variant: "primary" },
			{
				id: "restock",
				label: "RESTOCK",
				variant: "secondary",
				visible: (product) => product.status !== "in_stock",
			},
			{ id: "delete", label: "DELETE PRODUCT", variant: "destructive" },
		],
		metadata: {
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		},
	},
});
