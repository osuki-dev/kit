import React from "react";
import * as LucideIcons from "lucide-react-native";
import { useThemeTokens } from "../theme";
import type { ColorValue } from "react-native";
import type { SvgProps } from "react-native-svg";

// Generate IconName type from Lucide exports
type IconComponents = typeof LucideIcons;
export type IconName = keyof IconComponents;

export interface IconProps extends Omit<SvgProps, "color"> {
	/** Lucide icon name (PascalCase: Home, Settings, LayoutGrid, etc.) */
	name: IconName;
	/** Icon size (width and height) - default 24 */
	size?: number;
	/** Icon color - defaults to theme text */
	color?: ColorValue;
	/** Stroke width - defaults to theme iconography.strokeWidth (1.5) */
	strokeWidth?: number;
}

/**
 * Icon component with Osuki design system styling
 *
 * Uses Lucide React Native icons with PascalCase names:
 * - Home, Settings, User, Search
 * - LayoutGrid, Menu, Info, Bell
 * - ChevronLeft, ChevronRight, ArrowUp, ArrowDown
 *
 * Automatically applies:
 * - Stroke width from theme (default 1.5px for monoline style)
 * - Color from theme tokens
 * - Size 24x24 as default
 *
 * @example
 * ```tsx
 * // Basic usage (PascalCase names)
 * <Icon name="Home" />
 * <Icon name="Settings" />
 * <Icon name="LayoutGrid" />
 *
 * // With custom size and color
 * <Icon name="Search" size={32} color={colors.primary} />
 *
 * // Navigation icon
 * <Icon name="Menu" size={28} />
 * ```
 */
export const Icon: React.FC<IconProps> = ({ name, size = 24, color, strokeWidth, ...svgProps }) => {
	const { colors, iconography } = useThemeTokens();
	const LucideIcon = LucideIcons[name] as React.ComponentType<SvgProps>;
	const resolvedColor = typeof color === "string" ? color : colors.text;

	if (!LucideIcon) {
		console.warn(
			`[@osuki-dev/ui] Unknown icon: ${String(name)}. Use PascalCase names like "Home", "Settings", "LayoutGrid"`,
		);
		return null;
	}

	return (
		<LucideIcon
			width={size}
			height={size}
			color={resolvedColor}
			strokeWidth={strokeWidth ?? iconography.strokeWidth}
			{...svgProps}
		/>
	);
};

// Re-export all Lucide icons for direct import if needed
export * from "lucide-react-native";
