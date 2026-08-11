import React from "react";
import { View, Image, type ViewStyle, type ImageSourcePropType } from "react-native";
import { useThemeTokens } from "../theme";
import { Text } from "./text";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
	/** Image source - URL string or require() */
	source?: ImageSourcePropType | string;
	/** Fallback initials when no image */
	initials?: string;
	/** Avatar size variant */
	size?: AvatarSize;
	/** Show online status indicator */
	isOnline?: boolean;
	/** Additional container styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

const sizeMap: Record<AvatarSize, number> = {
	xs: 24,
	sm: 32,
	md: 40,
	lg: 56,
	xl: 72,
};

const fontSizeMap: Record<AvatarSize, number> = {
	xs: 10,
	sm: 12,
	md: 14,
	lg: 18,
	xl: 24,
};

/**
 * Avatar component for user profile images
 *
 * Osuki Design Rules:
 * - Circular shape (50% radius)
 * - Monospace initials fallback
 * - Consistent sizing scale (24-72px)
 * - Optional online status indicator (bottom-right)
 * - Border for separation
 *
 * @example
 * ```tsx
 * <Avatar source="https://..." size="md" isOnline />
 * <Avatar initials="JD" size="lg" />
 * <Avatar source={require('./avatar.png')} size="xl" />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
	source,
	initials,
	size = "md",
	isOnline,
	style,
	testID,
}) => {
	const { colors } = useThemeTokens();

	const dimension = sizeMap[size];
	const fontSize = fontSizeMap[size];

	const containerStyle: ViewStyle = {
		width: dimension,
		height: dimension,
		borderRadius: dimension / 2, // Circle
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	};

	const statusIndicatorSize = Math.max(8, dimension * 0.25);
	const statusStyle: ViewStyle = {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: statusIndicatorSize,
		height: statusIndicatorSize,
		borderRadius: statusIndicatorSize / 2,
		backgroundColor: colors.success,
		borderWidth: 2,
		borderColor: colors.surface,
	};

	const renderContent = () => {
		if (source) {
			const imageSource = typeof source === "string" ? { uri: source } : source;
			return (
				<Image
					source={imageSource}
					style={{ width: dimension, height: dimension }}
					resizeMode="cover"
					testID={testID ? `${testID}-image` : undefined}
				/>
			);
		}

		if (initials) {
			return (
				<Text
					style={{
						fontSize,
						color: colors.text,
					}}
					weight="bold"
					transform="uppercase"
				>
					{initials.slice(0, 2).toUpperCase()}
				</Text>
			);
		}

		// Default placeholder
		return (
			<View
				style={{
					width: dimension * 0.4,
					height: dimension * 0.4,
					borderRadius: (dimension * 0.4) / 2,
					backgroundColor: colors.textDisabled,
				}}
			/>
		);
	};

	return (
		<View testID={testID} style={[containerStyle, style]}>
			{renderContent()}
			{isOnline && <View testID={testID ? `${testID}-status` : undefined} style={statusStyle} />}
		</View>
	);
};
