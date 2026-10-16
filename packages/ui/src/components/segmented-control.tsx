import React, { memo, useCallback, useMemo } from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	View,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import ExpoSegmentedControl from "@expo/ui/community/segmented-control";
import {
	readStringFill,
	useResolvedSurfaceFill,
	useSurfaceDecorator,
	useThemeTokens,
	withoutStringFill,
} from "../theme";
import { Text } from "./text";
import { useHaptics } from "./haptics";

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
	style?: ViewStyle;
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
	const { colors, mode, radius, shadow } = useThemeTokens();
	const decorator = useSurfaceDecorator();
	const { feedback } = useHaptics();
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);
	const hasDisabledOptions = options.some((option) => option.disabled);
	const trackBase = readStringFill(style) ?? colors.surfaceRaised;
	const selectedBase = colors.surface;

	let trackRadius = radius.lg;
	let optionRadius = radius.md;
	if (variant === "pill") {
		trackRadius = radius.pill;
		optionRadius = radius.pill;
	}

	const trackMeta = useMemo(
		() => ({
			slot: "segmented.track",
			variant,
			baseColor: trackBase,
			borderRadius: trackRadius,
		}),
		[trackBase, trackRadius, variant],
	);
	const selectedMeta = useMemo(
		() => ({
			slot: "segmented.selected",
			variant,
			baseColor: selectedBase,
			selected: true,
			borderRadius: optionRadius,
		}),
		[optionRadius, selectedBase, variant],
	);
	const trackFill = useResolvedSurfaceFill(trackBase, trackMeta);
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
			borderRadius: trackRadius,
			backgroundColor: trackFill,
		};
		if (mode === "light") Object.assign(next, shadow.soft);
		return next;
	}, [mode, shadow.soft, trackFill, trackRadius]);

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
				{decorator.renderDecoration(trackMeta)}
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
	const { colors } = useThemeTokens();
	const handlePress = useCallback(() => {
		onSelect(value);
	}, [onSelect, value]);

	let textColor = colors.textMuted;
	if (selected) textColor = colors.text;

	return (
		<Pressable
			accessibilityRole="tab"
			accessibilityLabel={label}
			accessibilityState={{ selected, disabled }}
			disabled={disabled}
			hitSlop={SEGMENT_HIT_SLOP}
			onPress={handlePress}
			style={({ pressed }) => {
				const next: ViewStyle = {
					borderRadius: radius,
					backgroundColor: fill,
					opacity: segmentOpacity(disabled, pressed),
				};
				if (raised) Object.assign(next, shadow);
				return [styles.segment, next];
			}}
			testID={testID}
		>
			<Text variant="label" color={textColor} transform="uppercase">
				{label}
			</Text>
		</Pressable>
	);
});

function segmentOpacity(disabled: boolean, pressed: boolean) {
	if (disabled) return 0.4;
	if (pressed) return 0.72;
	return 1;
}

const styles = StyleSheet.create({
	track: {
		flexDirection: "row",
		height: 44,
		padding: 4,
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
