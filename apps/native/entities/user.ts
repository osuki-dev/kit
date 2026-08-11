import { z } from "zod";
import { defineEntity } from "@osuki-dev/kit-community";

export const UserSchema = z.object({
	id: z.string(),
	name: z.string().min(1).describe("Full Name"),
	email: z.string().email().describe("Email Address"),
	role: z.enum(["admin", "user", "guest"]).default("user").describe("User Role"),
	status: z.enum(["active", "inactive", "pending"]).default("active").describe("Account Status"),
	lastLogin: z.date().optional().describe("Last Login Date"),
	createdAt: z.date().describe("Created Date"),
	avatar: z.string().url().optional().describe("Avatar URL"),
	department: z.string().optional().describe("Department"),
	location: z.string().optional().describe("Location"),
});

export type User = z.infer<typeof UserSchema>;

export const UserEntity = defineEntity(UserSchema, {
	name: "User",
	icon: "User",

	list: {
		title: "USERS",
		icon: "Users",
		hero: {
			label: "TOTAL USERS",
			value: (items) => items.length,
		},
		columns: [
			{
				key: "name",
				label: "NAME",
				variant: "primary",
				sortable: true,
				searchable: true,
				width: "flex",
			},
			{ key: "email", label: "EMAIL", sortable: true, searchable: true, width: "flex" },
			{
				key: "role",
				label: "ROLE",
				type: "tag",
				width: 100,
				colorMap: { admin: "primary", user: "secondary", guest: "muted" },
			},
			{
				key: "status",
				label: "STATUS",
				type: "tag",
				width: 100,
				colorMap: { active: "success", pending: "warning", inactive: "error" },
			},
		],
		actions: [
			{ id: "edit", label: "EDIT", icon: "Pencil", variant: "secondary" },
			{ id: "delete", label: "DELETE", icon: "Trash", variant: "destructive" },
		],
		searchFields: ["name", "email"],
		sortable: true,
	},

	detail: {
		title: "USER DETAILS",
		icon: "User",
		hero: {
			title: "name",
			subtitle: "email",
		},
		sections: [
			{
				id: "basic",
				title: "BASIC INFORMATION",
				fields: ["name", "email", "department", "location"],
				columns: 2,
			},
			{ id: "account", title: "ACCOUNT SETTINGS", fields: ["role", "status"], columns: 2 },
		],
		actions: [
			{ id: "edit", label: "EDIT USER", variant: "primary" },
			{
				id: "deactivate",
				label: "DEACTIVATE",
				variant: "secondary",
				visible: (user) => user.status === "active",
			},
			{
				id: "activate",
				label: "ACTIVATE",
				variant: "secondary",
				visible: (user) => user.status !== "active",
			},
			{ id: "delete", label: "DELETE ACCOUNT", variant: "destructive" },
		],
		metadata: {
			createdAt: "createdAt",
		},
	},
});
