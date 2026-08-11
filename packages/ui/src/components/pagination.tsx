import React, { useMemo } from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export interface PaginationProps extends ViewProps {
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	disabled?: boolean;
	controls?: "adjacent" | "edges";
	label?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
	page,
	pageCount,
	onPageChange,
	disabled = false,
	controls = "edges",
	label,
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const safePageCount = Math.max(pageCount, 1);
	const currentPage = Math.min(Math.max(page, 1), safePageCount);
	const canGoBack = !disabled && currentPage > 1;
	const canGoForward = !disabled && currentPage < safePageCount;

	const containerStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			gap: theme.spacing.sm,
		}),
		[theme.spacing.sm],
	);

	const goToPage = (nextPage: number) => {
		const clamped = Math.min(Math.max(nextPage, 1), safePageCount);
		if (clamped === currentPage || disabled) return;
		haptics.feedback("selection");
		onPageChange(clamped);
	};

	return (
		<View style={[containerStyle, style]} testID={testID} {...props}>
			<View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
				{controls === "edges" && (
					<PaginationButton
						icon="ChevronsLeft"
						label="First page"
						disabled={!canGoBack}
						onPress={() => goToPage(1)}
						testID={testID ? `${testID}-first` : undefined}
					/>
				)}
				<PaginationButton
					icon="ChevronLeft"
					label="Previous page"
					disabled={!canGoBack}
					onPress={() => goToPage(currentPage - 1)}
					testID={testID ? `${testID}-previous` : undefined}
				/>
			</View>
			<View style={{ flex: 1, minWidth: 0, alignItems: "center" }}>
				<Text variant="caption" colorKey="textMuted" numberOfLines={1}>
					{label ? `${label} ` : ""}
					{currentPage} / {safePageCount}
				</Text>
			</View>
			<View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
				<PaginationButton
					icon="ChevronRight"
					label="Next page"
					disabled={!canGoForward}
					onPress={() => goToPage(currentPage + 1)}
					testID={testID ? `${testID}-next` : undefined}
				/>
				{controls === "edges" && (
					<PaginationButton
						icon="ChevronsRight"
						label="Last page"
						disabled={!canGoForward}
						onPress={() => goToPage(safePageCount)}
						testID={testID ? `${testID}-last` : undefined}
					/>
				)}
			</View>
		</View>
	);
};

interface PaginationButtonProps {
	icon: "ChevronLeft" | "ChevronRight" | "ChevronsLeft" | "ChevronsRight";
	label: string;
	disabled: boolean;
	onPress: () => void;
	testID?: string;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
	icon,
	label,
	disabled,
	onPress,
	testID,
}) => {
	const theme = useThemeTokens();

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onPress}
			style={{
				width: 44,
				height: 44,
				borderRadius: theme.radius.pill,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: theme.colors.surfaceRaised,
				opacity: disabled ? 0.42 : 1,
			}}
			testID={testID}
		>
			<Icon name={icon} size={18} color={theme.colors.textMuted} />
		</Pressable>
	);
};
