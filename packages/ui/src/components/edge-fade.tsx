import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { withAlpha } from "../utils/color";

export type EdgeFadeSide = "top" | "bottom" | "left" | "right";

export interface EdgeFadeProps {
	/** Which boundary edge to fade: "top" | "bottom" | "left" | "right" */
	edge: EdgeFadeSide;
	/** Surface color to fade into */
	color: string;
	/** Extent / thickness of the gradient fade in points. Defaults to 24 */
	size?: number;
	/** Additional styling */
	style?: StyleProp<ViewStyle>;
	/** Stable test identifier */
	testID?: string;
}

/**
 * EdgeFade component
 *
 * Renders a soft gradient edge indicator for scroll regions using native
 * CSS linear-gradient background.
 */
export const EdgeFade: React.FC<EdgeFadeProps> = ({
	edge,
	color,
	size = 24,
	style,
	testID,
}) => {
	const horizontal = edge === "left" || edge === "right";
	const direction = horizontal ? "to right" : "to bottom";
	const isOpening = edge === "top" || edge === "left";

	const gradient = isOpening
		? `linear-gradient(${direction}, ${withAlpha(color, 0.9)} 0%, ${withAlpha(color, 0.68)} 42%, ${withAlpha(color, 0.24)} 72%, ${withAlpha(color, 0)} 100%)`
		: `linear-gradient(${direction}, ${withAlpha(color, 0)} 0%, ${withAlpha(color, 0.24)} 28%, ${withAlpha(color, 0.68)} 58%, ${withAlpha(color, 0.9)} 100%)`;

	const edgeStyle: ViewStyle = horizontal
		? {
				position: "absolute",
				top: 0,
				bottom: 0,
				width: size,
				...(edge === "left" ? { left: 0 } : { right: 0 }),
			}
		: {
				position: "absolute",
				left: 0,
				right: 0,
				height: size,
				...(edge === "top" ? { top: 0 } : { bottom: 0 }),
			};

	return (
		<View
			testID={testID}
			pointerEvents="none"
			style={[edgeStyle, style, { experimental_backgroundImage: gradient } as ViewStyle]}
		/>
	);
};
