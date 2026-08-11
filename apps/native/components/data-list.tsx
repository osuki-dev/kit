import React from "react";
import {
	ActivityIndicator,
	FlatList,
	Platform,
	RefreshControl,
	View,
	type StyleProp,
	type ScrollViewProps,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	type ViewStyle,
} from "react-native";
import { LegendList, type LegendListRenderItemProps } from "@legendapp/list/react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Text, useTheme } from "@osuki-dev/ui";

type DataListProps<T> = {
	data: T[];
	renderItem: (props: LegendListRenderItemProps<T>) => React.ReactElement | null;
	keyExtractor: (item: T, index: number) => string;
	refreshing?: boolean;
	loadingMore?: boolean;
	hasMore?: boolean;
	emptyTitle?: string;
	emptyDescription?: string;
	ListHeaderComponent?: React.ReactElement | null;
	contentContainerStyle?: StyleProp<ViewStyle>;
	onRefresh?: () => void | Promise<void>;
	onLoadMore?: () => void | Promise<void>;
	onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
	contentInsetAdjustmentBehavior?: ScrollViewProps["contentInsetAdjustmentBehavior"];
	testID?: string;
};

export function DataList<T>({
	data,
	renderItem,
	keyExtractor,
	refreshing = false,
	loadingMore = false,
	hasMore = false,
	emptyTitle = "Nothing here yet",
	emptyDescription = "Pull to refresh or adjust your filters.",
	ListHeaderComponent,
	contentContainerStyle,
	onRefresh,
	onLoadMore,
	onScroll,
	contentInsetAdjustmentBehavior = "automatic",
	testID,
}: DataListProps<T>) {
	const { colors, spacing } = useTheme();
	const sharedProps = {
		testID,
		data,
		renderItem,
		keyExtractor,
		onEndReached: hasMore ? onLoadMore : undefined,
		onEndReachedThreshold: 0.65,
		onScroll,
		scrollEventThrottle: 16,
		showsVerticalScrollIndicator: false,
		ListHeaderComponent,
		refreshControl: onRefresh ? (
			<RefreshControl
				refreshing={refreshing}
				onRefresh={onRefresh}
				tintColor={colors.primary}
				colors={[colors.primary]}
			/>
		) : undefined,
		contentContainerStyle: [
			{
				paddingBottom: spacing["4xl"],
				gap: spacing["md"],
			},
			contentContainerStyle,
		],
		ListEmptyComponent: (
			<Animated.View
				entering={FadeIn.duration(180)}
				style={{
					alignItems: "center",
					justifyContent: "center",
					paddingVertical: spacing["4xl"],
					paddingHorizontal: spacing["xl"],
					gap: spacing["xs"],
				}}
			>
				<Text variant="heading" colorKey="text">
					{emptyTitle}
				</Text>
				<Text variant="body" colorKey="textMuted" style={{ textAlign: "center" }}>
					{emptyDescription}
				</Text>
			</Animated.View>
		),
		ListFooterComponent: loadingMore ? (
			<View style={{ paddingVertical: spacing["lg"] }}>
				<ActivityIndicator color={colors.primary} />
			</View>
		) : null,
	};

	if (Platform.OS === "web") {
		return (
			<FlatList
				{...sharedProps}
				renderItem={(props) => renderItem(props as unknown as LegendListRenderItemProps<T>)}
			/>
		);
	}

	return (
		<LegendList
			{...sharedProps}
			recycleItems
			contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
		/>
	);
}
