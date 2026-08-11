import { DetailScreen } from "@osuki-dev/kit-community";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { UserEntity, type User } from "@/entities/user";

// Sample data (in real app, fetch by id)
const sampleUsers: User[] = [
	{
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		role: "admin",
		status: "active",
		lastLogin: new Date("2025-01-15"),
		createdAt: new Date("2024-01-01"),
		department: "Engineering",
		location: "New York",
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		role: "user",
		status: "active",
		lastLogin: new Date("2025-01-14"),
		createdAt: new Date("2024-02-15"),
		department: "Design",
		location: "San Francisco",
	},
];

export default function UserDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const [users, setUsers] = useState(sampleUsers);
	const [statusText, setStatusText] = useState("Profile ready");

	// In real app, fetch user by id
	const user = users.find((u) => u.id === id);

	if (!user) {
		return null; // Or show error screen
	}

	const handleBackPress = () => {
		router.back();
	};

	const handleActionPress = (action: string, user: User) => {
		if (action === "deactivate") {
			setUsers((items) =>
				items.map((item) => (item.id === user.id ? { ...item, status: "inactive" } : item)),
			);
			setStatusText(`${user.name} deactivated`);
			return;
		}

		if (action === "activate") {
			setUsers((items) =>
				items.map((item) => (item.id === user.id ? { ...item, status: "active" } : item)),
			);
			setStatusText(`${user.name} activated`);
			return;
		}

		if (action === "delete") {
			setUsers((items) =>
				items.map((item) => (item.id === user.id ? { ...item, status: "pending" } : item)),
			);
			setStatusText(`${user.name} scheduled for review`);
			return;
		}

		setStatusText(`Editing ${user.name}`);
	};

	return (
		<DetailScreen
			entity={UserEntity}
			data={user}
			onBackPress={handleBackPress}
			onActionPress={handleActionPress}
			statusText={statusText}
			testID="user-detail"
		/>
	);
}
