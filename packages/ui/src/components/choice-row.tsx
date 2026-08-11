import React, { useMemo } from "react";
import { View, type ViewStyle } from "react-native";
import { useThemeTokens, type SpacingToken } from "../theme";
import { Icon, type IconName } from "./icon";
import { PressableCard } from "./pressable-card";
import { Spinner } from "./spinner";
import { Stack } from "./stack";
import { Tag, type TagVariant } from "./tag";
import { Text } from "./text";
import type { CardBorder } from "./card";

/**
 * How the label reads.
 *
 * `"plain"` is an answer the user picks verbatim, so it wraps rather than
 * truncates. `"headline"` names something that the lines under it describe, so
 * it is set bold and kept to one line.
 */
export type ChoiceRowEmphasis = "plain" | "headline";

export interface ChoiceRowProps {
	/** The choice itself, worded the way the user will read it back. */
	label: string;
	/** One line under the label: what picking this does. */
	description?: string;
	/** Inline continuation of the label, such as syntax still to be typed. */
	hint?: string;
	/** Leading glyph. Replaced by a spinner while this row is `loading`. */
	icon?: IconName;
	/** Glyph color; defaults to the muted text color. */
	iconColor?: string;
	/** Trailing metadata, such as a default marker or a provenance mark. */
	tag?: string;
	/** Trailing tag variant. */
	tagVariant?: TagVariant;
	/** Label typography and truncation. */
	emphasis?: ChoiceRowEmphasis;
	/** Border treatment of the row card. */
	border?: CardBorder;
	/** This row's answer is in flight: the leading slot becomes a spinner. */
	loading?: boolean;
	/** The row cannot be picked, because it or the list around it is locked. */
	disabled?: boolean;
	/** Callback when the row is picked. */
	onPress: () => void;
	/** Screen-reader phrasing; defaults to the label. */
	accessibilityLabel?: string;
	/** Stable test identifier for automation */
	testID?: string;
}

const CHOICE_GLYPH_SIZE = 16;

/**
 * ChoiceRow presents one option in a list the user picks from: a permission
 * answer, a slash command, a file to mention.
 *
 * `ListItem` is the near-miss it exists to replace. That one is a navigation
 * row -- 52px tall, one line of title, an uppercased subtitle -- and answers
 * are neither tall nor uppercase. A choice is dense, wraps when it has to, and
 * can be in flight on its own while the rest of the list waits.
 *
 * Osuki Design Rules:
 * - Leading glyph slot is 16px and holds either a glyph or a spinner, so a row
 *   entering flight does not resize
 * - The label is content, never paraphrased or transformed
 * - A locked row dims as a whole; only the answering row spins
 *
 * @example
 * ```tsx
 * <ChoiceRow
 *   icon="Check"
 *   label="Yes, allow this once"
 *   tag="DEFAULT"
 *   loading={answering}
 *   disabled={busy}
 *   onPress={answer}
 * />
 *
 * <ChoiceRow
 *   emphasis="headline"
 *   label="/review"
 *   hint="[instructions]"
 *   description="Review the working tree"
 *   tag="workspace"
 *   border="none"
 *   onPress={insert}
 * />
 * ```
 */
export const ChoiceRow: React.FC<ChoiceRowProps> = ({
	label,
	description,
	hint,
	icon,
	iconColor,
	tag,
	tagVariant = "pill",
	emphasis = "plain",
	border = "subtle",
	loading = false,
	disabled = false,
	onPress,
	accessibilityLabel,
	testID,
}) => {
	const theme = useThemeTokens();

	const bodyStyle = useMemo<ViewStyle>(() => ({ flex: 1, minWidth: 0, gap: 1 }), []);

	const labelColor = disabled ? "textDisabled" : "text";
	const supportColor = disabled ? "textDisabled" : "textMuted";

	const labelText = (
		<Text
			variant="bodySmall"
			weight={emphasis === "headline" ? "bold" : undefined}
			colorKey={labelColor}
			numberOfLines={emphasis === "headline" ? 1 : 2}
		>
			{label}
		</Text>
	);

	return (
		<PressableCard
			variant="flat"
			border={border}
			radius="sm"
			padding="xs"
			disabled={disabled}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			testID={testID}
		>
			<Stack direction="horizontal" gap="sm" align="center">
				{loading ? (
					<Spinner size="sm" color={theme.colors.primary} />
				) : icon ? (
					<Icon name={icon} size={CHOICE_GLYPH_SIZE} color={iconColor ?? theme.colors.textMuted} />
				) : null}

				<View style={bodyStyle}>
					{hint ? (
						<Stack direction="horizontal" gap="xs" align="baseline">
							{labelText}
							{/* What the user still has to type is drawn the way a
							    placeholder is: present, clearly not content. */}
							<Text variant="caption" colorKey={supportColor} numberOfLines={1}>
								{hint}
							</Text>
						</Stack>
					) : (
						labelText
					)}
					{description ? (
						<Text variant="caption" colorKey={supportColor} numberOfLines={1}>
							{description}
						</Text>
					) : null}
				</View>

				{tag ? <Tag variant={tagVariant}>{tag}</Tag> : null}
			</Stack>
		</PressableCard>
	);
};

export interface ChoiceItem {
	/** Stable list key, and the suffix of the row's generated test id. */
	id: string;
	label: string;
	description?: string;
	hint?: string;
	icon?: IconName;
	iconColor?: string;
	tag?: string;
	tagVariant?: TagVariant;
	/** Screen-reader phrasing for this row; defaults to its label. */
	accessibilityLabel?: string;
}

export interface ChoiceListProps {
	/** Options in the order they should be read; already filtered and ranked. */
	items: readonly ChoiceItem[];
	/** Callback when an option is picked. */
	onSelect: (item: ChoiceItem) => void;
	/**
	 * The option whose answer is in flight. That row spins and the whole list
	 * locks, because a second answer to the same question is not a thing the
	 * user can mean.
	 */
	loadingId?: string | null;
	/** Locks every row without singling one out. */
	disabled?: boolean;
	/** Label typography and truncation, applied to every row. */
	emphasis?: ChoiceRowEmphasis;
	/** Border treatment applied to every row. */
	border?: CardBorder;
	/** Gap between rows. */
	gap?: SpacingToken | number;
	/** Row test ids are `${testIDPrefix}-${item.id}`. */
	testIDPrefix?: string;
	/** Additional container styles */
	style?: ViewStyle;
}

/**
 * ChoiceList draws a set of `ChoiceRow`s and owns the one piece of state they
 * share: which of them, if any, is answering.
 *
 * @example
 * ```tsx
 * <ChoiceList
 *   items={options}
 *   loadingId={answeringId}
 *   onSelect={answer}
 *   testIDPrefix="approval-option"
 * />
 * ```
 */
export const ChoiceList: React.FC<ChoiceListProps> = ({
	items,
	onSelect,
	loadingId = null,
	disabled = false,
	emphasis,
	border,
	gap = "xs",
	testIDPrefix,
	style,
}) => {
	const locked = disabled || loadingId !== null;

	return (
		<Stack gap={gap} style={style}>
			{items.map((item) => (
				<ChoiceRow
					key={item.id}
					label={item.label}
					description={item.description}
					hint={item.hint}
					icon={item.icon}
					iconColor={item.iconColor}
					tag={item.tag}
					tagVariant={item.tagVariant}
					emphasis={emphasis}
					border={border}
					loading={loadingId === item.id}
					disabled={locked}
					onPress={() => onSelect(item)}
					accessibilityLabel={item.accessibilityLabel}
					testID={testIDPrefix ? `${testIDPrefix}-${item.id}` : undefined}
				/>
			))}
		</Stack>
	);
};
