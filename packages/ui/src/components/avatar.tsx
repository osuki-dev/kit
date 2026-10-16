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
export function AvatarRoot({
	size = "md",
	style,
	testID,
	children,
}: {
	size?: AvatarSize;
	style?: ViewStyle;
	testID?: string;
	children?: React.ReactNode;
}) {
	const { colors } = useThemeTokens();

	const dimension = sizeMap[size];

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

	return (
		<View testID={testID} style={[containerStyle, style]}>
			{children}
		</View>
	);
}

export function AvatarImage({
	source,
	size = "md",
	testID,
}: {
	source: ImageSourcePropType | string;
	size?: AvatarSize;
	testID?: string;
}) {
	const dimension = sizeMap[size];
	const imageSource = typeof source === "string" ? { uri: source } : source;
	return (
		<Image
			source={imageSource}
			style={{ width: dimension, height: dimension }}
			resizeMode="cover"
			testID={testID}
		/>
	);
}

export function AvatarFallback({
	initials,
	size = "md",
}: {
	initials?: string;
	size?: AvatarSize;
}) {
	const { colors } = useThemeTokens();
	const dimension = sizeMap[size];
	if (!initials) {
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
	}
	return (
		<Text style={{ fontSize: fontSizeMap[size], color: colors.text }} weight="bold" transform="uppercase">
			{initials.slice(0, 2).toUpperCase()}
		</Text>
	);
}

export function AvatarStatus({ testID, size = "md" }: { testID?: string; size?: AvatarSize }) {
	const { colors } = useThemeTokens();
	const dimension = sizeMap[size];
	const statusIndicatorSize = Math.max(8, dimension * 0.25);
	return (
		<View
			testID={testID}
			style={{
				position: "absolute",
				bottom: 0,
				right: 0,
				width: statusIndicatorSize,
				height: statusIndicatorSize,
				borderRadius: statusIndicatorSize / 2,
				backgroundColor: colors.success,
				borderWidth: 2,
				borderColor: colors.surface,
			}}
		/>
	);
}

function AvatarFacade({ source, initials, size = "md", isOnline, style, testID }: AvatarProps) {
	let face: React.ReactNode = <AvatarFallback size={size} />;
	if (source) face = <AvatarImage source={source} size={size} testID={testID ? `${testID}-image` : undefined} />;
	else if (initials) face = <AvatarFallback initials={initials} size={size} />;
	return (
		<AvatarRoot size={size} style={style} testID={testID}>
			{face}
			{isOnline ? <AvatarStatus size={size} testID={testID ? `${testID}-status` : undefined} /> : null}
		</AvatarRoot>
	);
}

export const Avatar = Object.assign(AvatarFacade, {
	Root: AvatarRoot,
	Image: AvatarImage,
	Fallback: AvatarFallback,
	Status: AvatarStatus,
});
