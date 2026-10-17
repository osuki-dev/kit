import React from "react";
import { View, type ViewStyle } from "react-native";
import { useSurfaceDecorator, useSurfaceMeta, type SurfaceMeta } from "../theme";

const fill: ViewStyle = {
	position: "absolute",
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
};

export type SurfaceDecorationProps = SurfaceMeta;

/**
 * The decorator's artwork for one slot, as an absolute, non-interactive layer.
 *
 * Kit surfaces mount it themselves. Mount it directly to decorate a view the
 * kit does not own: place it first inside a positioned parent, and pass the
 * parent's `borderRadius` so the artwork is clipped to its corners. Renders
 * nothing when no decorator is mounted or it returns nothing for the slot.
 */
export function SurfaceDecoration(props: SurfaceDecorationProps) {
	const decorator = useSurfaceDecorator();
	const meta = useSurfaceMeta(props);
	const node = decorator?.renderDecoration?.(meta);
	if (node === null || node === undefined || node === false) return null;
	return (
		<View
			pointerEvents="none"
			accessible={false}
			importantForAccessibility="no-hide-descendants"
			style={[
				fill,
				meta.borderRadius !== undefined
					? { borderRadius: meta.borderRadius, overflow: "hidden" }
					: undefined,
			]}
		>
			{node}
		</View>
	);
}
