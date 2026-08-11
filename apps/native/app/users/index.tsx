import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Screen, Card, Text, Tag, useTheme, ResponsiveContainer } from "@osuki-dev/ui";

import { Container } from "@/components/container";
import { DataList } from "@/components/data-list";
import { useUsers, type UserRecord } from "@/lib/data";

function initials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function UserRow({ item, index }: { item: UserRecord; index: number }) {
	const { colors, spacing } = useTheme();

	return (
		<Animated.View entering={FadeInUp.duration(200).delay(Math.min(index, 8) * 24)}>
			<Pressable
				onPress={() => router.push({ pathname: "/users/[id]", params: { id: item.id } })}
				style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
				testID={`user-row-${item.id}`}
			>
				<Card variant="raised" border="subtle" padding="md">
					<View style={[styles.row, { gap: spacing["md"] }]}>
						<View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}>
							<Text variant="label" colorKey="text">
								{initials(item.name)}
							</Text>
						</View>
						<View style={styles.content}>
							<View style={styles.titleRow}>
								<Text variant="body" colorKey="text" style={styles.name}>
									{item.name}
								</Text>
								<Tag variant={item.status === "active" ? "active" : "default"}>{item.status}</Tag>
							</View>
							<Text variant="caption" colorKey="textMuted">
								{item.email}
							</Text>
							<View style={styles.metaRow}>
								<Text variant="caption" colorKey="textDisabled">
									{item.department ?? "General"}
								</Text>
								<Text variant="caption" colorKey="textDisabled">
									{item.location ?? "Remote"}
								</Text>
							</View>
						</View>
					</View>
				</Card>
			</Pressable>
		</Animated.View>
	);
}

function UsersHeader({ count }: { count: number }) {
	return (
		<View style={styles.header}>
			<Text variant="display" colorKey="text">
				Team
			</Text>
			<Text variant="body" colorKey="textMuted">
				Client profiles, loyalty signals, and service context for the operations team.
			</Text>
			<Text variant="label" colorKey="textDisabled">
				{count} MEMBERS
			</Text>
		</View>
	);
}

export default function UsersList() {
	const { items, refreshing, loadingMore, hasMore, refresh, loadMore } = useUsers({ limit: 3 });

	return (
		<Container>
			<Screen>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 760, lg: 980 }}
					horizontalPadding={{ xs: 16, md: 24, lg: 32 }}
					style={styles.container}
				>
					<DataList
						testID="users-list"
						data={items}
						keyExtractor={(item) => item.id}
						renderItem={({ item, index }) => <UserRow item={item} index={index} />}
						refreshing={refreshing}
						loadingMore={loadingMore}
						hasMore={hasMore}
						onRefresh={refresh}
						onLoadMore={loadMore}
						ListHeaderComponent={<UsersHeader count={items.length} />}
						contentContainerStyle={{ paddingTop: 18 }}
						emptyTitle="No users"
						emptyDescription="The shared data adapter did not return team members."
					/>
				</ResponsiveContainer>
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		gap: 8,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 54,
		height: 54,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		flex: 1,
		gap: 5,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
	},
	name: {
		flex: 1,
	},
	metaRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
	},
});
