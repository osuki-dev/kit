import React, { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Avatar, type AvatarProps, type AvatarSize } from "./avatar";
import { Text } from "./text";

export interface AvatarGroupItem extends Pick<AvatarProps, "source" | "initials" | "isOnline"> {
	id: string;
	label?: string;
}

export interface AvatarGroupProps extends ViewProps {
	items: AvatarGroupItem[];
	max?: number;
	size?: AvatarSize;
	overlap?: number;
}

const avatarSizeMap: Record<AvatarSize, number> = {
	xs: 24,
	sm: 32,
	md: 40,
	lg: 56,
	xl: 72,
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
	items,
	max = 4,
	size = "md",
	overlap,
	style,
	testID,
	...props
}) => {
	const theme = useThemeTokens();
	const visibleItems = items.slice(0, max);
	const remainingCount = Math.max(items.length - visibleItems.length, 0);
	const dimension = avatarSizeMap[size];
	const resolvedOverlap = overlap ?? Math.round(dimension * 0.28);

	const containerStyle = useMemo<ViewStyle>(
		() => ({ flexDirection: "row", alignItems: "center" }),
		[],
	);

	return (
		<View
			accessibilityRole="summary"
			accessibilityLabel={`${items.length} people`}
			style={[containerStyle, style]}
			testID={testID}
			{...props}
		>
			{visibleItems.map((item, index) => (
				<View
					key={item.id}
					style={{
						marginLeft: index === 0 ? 0 : -resolvedOverlap,
						borderRadius: dimension / 2,
						borderWidth: 2,
						borderColor: theme.colors.surface,
					}}
				>
					<Avatar
						source={item.source}
						initials={item.initials}
						isOnline={item.isOnline}
						size={size}
						testID={testID ? `${testID}-avatar-${item.id}` : undefined}
					/>
				</View>
			))}
			{remainingCount > 0 && (
				<View
					style={{
						width: dimension,
						height: dimension,
						marginLeft: -resolvedOverlap,
						borderRadius: dimension / 2,
						borderWidth: 2,
						borderColor: theme.colors.surface,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: theme.colors.surfaceRaised,
					}}
					testID={testID ? `${testID}-remaining` : undefined}
				>
					<Text variant="caption" colorKey="textMuted">
						+{remainingCount}
					</Text>
				</View>
			)}
		</View>
	);
};
