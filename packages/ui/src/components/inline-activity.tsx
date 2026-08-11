import React, { useMemo } from "react";
import { View, type TextStyle, type ViewStyle } from "react-native";
import { useThemeTokens, type SpacingToken } from "../theme";
import { Spinner } from "./spinner";
import { spinnerSizes, type SpinnerSize } from "./spinner-size";
import { Text } from "./text";

export interface InlineActivityProps {
	/** What the app is doing, in the user's words. */
	label: string;
	/**
	 * Whether work is in flight. When false the spinner stops and disappears but
	 * the caption stays where it was: the row keeps both its height and the
	 * width of the spinner's slot, so a row that reports both states does not
	 * jump in either direction.
	 */
	active?: boolean;
	/** Spinner size. */
	size?: SpinnerSize;
	/** Color for the caption, and for the spinner unless `spinnerColor` is set. */
	color?: string;
	/** Spinner color, when it should read louder than the caption. */
	spinnerColor?: string;
	/** Gap between spinner and caption. */
	gap?: SpacingToken | number;
	/** Caption line clamp; omit to let the caption wrap freely. */
	lines?: number;
	/** `"full"` lets the caption take the remaining width and wrap. */
	widthMode?: "content" | "full";
	/** Additional container styles */
	style?: ViewStyle;
	/** Stable test identifier for automation */
	testID?: string;
}

/**
 * InlineActivity is the one-line busy row: a small spinner and a caption
 * saying what is being waited on.
 *
 * `LoadingView` owns the other case, where a whole section has nothing to show
 * yet. This one sits inside content that is already on screen -- above a
 * composer, inside a transcript, under a header -- so it stays on one line and
 * never centers itself.
 *
 * Osuki Design Rules:
 * - Always captioned: a bare spinner does not say what is slow
 * - The caption survives `active={false}`, so the row keeps its height, and an
 *   empty box of the spinner's exact size survives with it, so the row keeps
 *   its width and the caption does not slide left when the work ends
 * - Muted by default; a busy row is not the loudest thing on screen
 *
 * @example
 * ```tsx
 * <InlineActivity label="Waiting for uploads to finish…" />
 *
 * // A status line that keeps its text when the work ends
 * <InlineActivity
 *   active={part.spinner}
 *   label={part.text}
 *   widthMode="full"
 *   lines={2}
 * />
 * ```
 */
export const InlineActivity: React.FC<InlineActivityProps> = ({
	label,
	active = true,
	size = "sm",
	color,
	spinnerColor,
	gap = "sm",
	lines,
	widthMode = "content",
	style,
	testID,
}) => {
	const theme = useThemeTokens();
	const resolvedGap = typeof gap === "number" ? gap : theme.spacing[gap];
	const captionColor = color ?? theme.colors.textMuted;

	const containerStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: "row",
			alignItems: "center",
			gap: resolvedGap,
		}),
		[resolvedGap],
	);

	const captionStyle = useMemo<TextStyle>(
		() => (widthMode === "full" ? { flex: 1, minWidth: 0 } : {}),
		[widthMode],
	);

	// The row is a flex row with a gap, so an unmounted spinner takes its own
	// width and the gap after it with it, and the caption slides left by that
	// much the moment the work ends. Holding the spinner's exact box open keeps
	// the caption's x position identical in both states. It is an empty View
	// rather than a faded Spinner because a spinner that keeps turning behind
	// zero opacity both lies about the state and pays for a frame loop nobody
	// sees; it is hidden from assistive tech and from touches because it is a
	// measurement, not content.
	const placeholderStyle = useMemo<ViewStyle>(
		() => ({ width: spinnerSizes[size], height: spinnerSizes[size] }),
		[size],
	);

	return (
		<View testID={testID} style={[containerStyle, style]}>
			{active ? (
				<Spinner size={size} color={spinnerColor ?? captionColor} />
			) : (
				<View
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
					pointerEvents="none"
					style={placeholderStyle}
					testID={testID ? `${testID}-placeholder` : undefined}
				/>
			)}
			<Text variant="caption" color={captionColor} numberOfLines={lines} style={captionStyle}>
				{label}
			</Text>
		</View>
	);
};
