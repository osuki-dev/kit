import React, { memo, useCallback, useMemo } from "react";
import {
	Platform,
	StyleSheet,
	View,
	type ViewProps,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import ExpoSegmentedControl from "@expo/ui/community/segmented-control";
import {
	readStringFill,
	useResolvedSurfaceFill,
	useSurfaceDecorator,
	useThemeTokens,
	withoutStringFill,
	type SurfaceMeta,
} from "../theme";
import { Text } from "./text";
import { useHaptics } from "./haptics";
import { PressableScale } from "./pressable-scale";
import { SurfaceDecoration } from "./surface-decoration";

export interface SegmentedControlOption {
	label: string;
	value: string;
	disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<ViewProps, "style"> {
	options: SegmentedControlOption[];
	value: string;
	onChange: (value: string) => void;
	variant?: "pill" | "rounded";
	style?: StyleProp<ViewStyle>;
}

/**
 * One track fill, then a selected chip.
 *
 * Unselected options stay clear, so the track is the only paint behind them.
 * Both colors go through the surface decorator once. A system control is used
 * on iOS only when nothing is decorating fills — that widget cannot take a
 * custom opacity.
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
	options,
	value,
	onChange,
	variant = "rounded",
	style,
	testID,
	...rest
}) => {
	const { colors, components, mode, radius, shadow, spacing } = useThemeTokens();
	const tokens = components.SegmentedControl;
	const decorator = useSurfaceDecorator();
	const { feedback } = useHaptics();
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);
	const hasDisabledOptions = options.some((option) => option.disabled);
	const trackBase = readStringFill(style) ?? colors[tokens.background];
	const selectedBase = colors[tokens.activeBackground];

	let trackRadius = radius[tokens.radius];
	let optionRadius = radius[tokens.optionRadius];
	if (variant === "pill") {
		trackRadius = radius.pill;
		optionRadius = radius.pill;
	}

	const trackMeta = useMemo<SurfaceMeta>(
		() => ({
			slot: "segmented.track",
			variant,
			baseColor: trackBase,
			borderRadius: trackRadius,
		}),
		[trackBase, trackRadius, variant],
	);
	const trackFill = useResolvedSurfaceFill(trackBase, trackMeta);
	// The track is painted once; the selection is an overlay on it, so a
	// decorator sees the fill underneath and can avoid multiplying itself.
	const selectedMeta = useMemo<SurfaceMeta>(
		() => ({
			slot: "segmented.selected",
			role: "overlay",
			over: trackFill,
			variant,
			baseColor: selectedBase,
			selected: true,
			borderRadius: optionRadius,
		}),
		[optionRadius, selectedBase, trackFill, variant],
	);
	const selectedFill = useResolvedSurfaceFill(selectedBase, selectedMeta);

	const select = useCallback(
		(next: string) => {
			feedback("selection");
			onChange(next);
		},
		[feedback, onChange],
	);

	const trackStyle = useMemo(() => {
		const next: ViewStyle = {
			height: tokens.height,
			padding: spacing[tokens.padding],
			borderRadius: trackRadius,
			backgroundColor: trackFill,
		};
		if (mode === "light") Object.assign(next, shadow.soft);
		return next;
	}, [mode, shadow.soft, spacing, tokens.height, tokens.padding, trackFill, trackRadius]);

	const decorated =
		decorator?.transformBackground !== undefined || decorator?.renderDecoration !== undefined;
	const useSystemControl = Platform.OS === "ios" && !hasDisabledOptions && !decorated;

	if (useSystemControl) {
		return (
			<View
				accessibilityRole="tablist"
				testID={testID}
				style={[styles.track, trackStyle, withoutStringFill(style)]}
				{...rest}
			>
				<ExpoSegmentedControl
					values={options.map((option) => option.label)}
					selectedIndex={selectedIndex}
					onChange={(event) => {
						const nextOption = options[event.nativeEvent.selectedSegmentIndex];
						if (nextOption) select(nextOption.value);
					}}
					tintColor={colors.primary}
					style={styles.systemControl}
					testID={testID ? `${testID}-native` : undefined}
				/>
			</View>
		);
	}

	let decoration: React.ReactNode = null;
	if (decorator?.renderDecoration) {
		decoration = (
			<View collapsable pointerEvents="none" style={styles.decoration}>
				<SurfaceDecoration {...trackMeta} />
			</View>
		);
	}

	return (
		<View
			accessibilityRole="tablist"
			testID={testID}
			style={[styles.track, trackStyle, withoutStringFill(style)]}
			{...rest}
		>
			{decoration}
			{options.map((option) => {
				const selected = option.value === value;
				const disabled = option.disabled ?? false;
				let fill = "transparent";
				if (selected) fill = selectedFill;
				return (
					<Segment
						key={option.value}
						value={option.value}
						label={option.label}
						selected={selected}
						disabled={disabled}
						fill={fill}
						radius={optionRadius}
						raised={selected && mode === "light"}
						shadow={shadow.pill}
						onSelect={select}
						testID={testID ? `${testID}-option-${option.value}` : undefined}
					/>
				);
			})}
		</View>
	);
};

interface SegmentProps {
	value: string;
	label: string;
	selected: boolean;
	disabled: boolean;
	fill: string;
	radius: number;
	raised: boolean;
	shadow: ViewStyle;
	onSelect: (value: string) => void;
	testID?: string;
}

const Segment = memo(function Segment({
	value,
	label,
	selected,
	disabled,
	fill,
	radius,
	raised,
	shadow,
	onSelect,
	testID,
}: SegmentProps) {
	const { colors, components, motion } = useThemeTokens();
	const handlePress = useCallback(() => {
		onSelect(value);
	}, [onSelect, value]);

	const tokens = components.SegmentedControl;
	let textColor = colors[tokens.inactiveForeground];
	if (selected) textColor = colors[tokens.activeForeground];

	const segmentStyle = useMemo<ViewStyle>(() => {
		const next: ViewStyle = {
			borderRadius: radius,
			backgroundColor: fill,
			opacity: disabled ? 0.4 : 1,
		};
		if (raised) Object.assign(next, shadow);
		return next;
	}, [disabled, fill, radius, raised, shadow]);

	// The press dips by `motion.press.segment` and holds still under reduce
	// motion. The selection haptic is played once, by the control, on select.
	return (
		<PressableScale
			accessibilityRole="tab"
			accessibilityLabel={label}
			accessibilityState={{ selected, disabled }}
			disabled={disabled}
			feedback="none"
			pressedScale={motion.press.segment}
			hitSlop={SEGMENT_HIT_SLOP}
			onPress={handlePress}
			style={[styles.segment, segmentStyle]}
			testID={testID}
		>
			<Text variant="label" color={textColor}>
				{label}
			</Text>
		</PressableScale>
	);
});

const styles = StyleSheet.create({
	track: {
		flexDirection: "row",
		overflow: "hidden",
	},
	segment: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		minWidth: 0,
	},
	systemControl: {
		flex: 1,
		minHeight: 36,
	},
	decoration: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	},
});

const SEGMENT_HIT_SLOP = { top: 4, bottom: 4 };
