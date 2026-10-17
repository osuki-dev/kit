import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export type CalendarMode = "single" | "range";
export type CalendarWeekStart = 0 | 1;

export interface CalendarRange {
	start?: string;
	end?: string;
}

export interface CalendarProps extends ViewProps {
	mode?: CalendarMode;
	value?: string | CalendarRange;
	onChange?: (value: string | CalendarRange) => void;
	weekStartsOn?: CalendarWeekStart;
	month?: string;
	onMonthChange?: (month: string) => void;
}

const WEEKDAYS_SUNDAY = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_MONDAY = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function pad(value: number) {
	return String(value).padStart(2, "0");
}

export function toCalendarKey(year: number, month: number, day: number) {
	return `${year}-${pad(month)}-${pad(day)}`;
}

function parseMonth(month: string) {
	const [yearText, monthText] = month.split("-");
	const year = Number(yearText);
	const monthIndex = Number(monthText);
	if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() + 1 };
	}
	return { year, month: monthIndex };
}

function shiftMonth(month: string, delta: number) {
	const parsed = parseMonth(month);
	const date = new Date(parsed.year, parsed.month - 1 + delta, 1);
	return toCalendarKey(date.getFullYear(), date.getMonth() + 1, 1).slice(0, 7);
}

function daysInMonth(year: number, month: number) {
	return new Date(year, month, 0).getDate();
}

function rangeBounds(value: CalendarRange | undefined) {
	if (!value?.start) return { from: undefined, to: undefined };
	if (!value.end) return { from: value.start, to: value.start };
	if (value.start <= value.end) return { from: value.start, to: value.end };
	return { from: value.end, to: value.start };
}

export function Calendar({
	mode = "single",
	value,
	onChange,
	weekStartsOn = 0,
	month: controlledMonth,
	onMonthChange,
	style,
	...props
}: CalendarProps) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const today = new Date();
	const todayKey = toCalendarKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
	const initialMonth = todayKey.slice(0, 7);
	const [uncontrolledMonth, setUncontrolledMonth] = useState(initialMonth);
	const month = controlledMonth ?? uncontrolledMonth;
	const parsed = parseMonth(month);
	const labels = weekStartsOn === 1 ? WEEKDAYS_MONDAY : WEEKDAYS_SUNDAY;

	const cells = useMemo(() => {
		const count = daysInMonth(parsed.year, parsed.month);
		const firstWeekday = new Date(parsed.year, parsed.month - 1, 1).getDay();
		const leading = (firstWeekday - weekStartsOn + 7) % 7;
		const slots: Array<string | null> = [];
		for (let index = 0; index < leading; index += 1) slots.push(null);
		for (let day = 1; day <= count; day += 1) {
			slots.push(toCalendarKey(parsed.year, parsed.month, day));
		}
		return slots;
	}, [parsed.month, parsed.year, weekStartsOn]);

	const selected = typeof value === "string" ? value : undefined;
	const bounds = rangeBounds(typeof value === "string" ? undefined : value);

	const setMonth = (next: string) => {
		if (!controlledMonth) setUncontrolledMonth(next);
		onMonthChange?.(next);
	};

	const selectDay = (day: string) => {
		haptics.feedback("selection");
		if (mode === "single") {
			onChange?.(day);
			return;
		}
		const current = typeof value === "string" ? undefined : value;
		if (!current?.start || current.end) {
			onChange?.({ start: day, end: undefined });
			return;
		}
		if (day < current.start) {
			onChange?.({ start: day, end: current.start });
			return;
		}
		onChange?.({ start: current.start, end: day });
	};

	const title = new Date(parsed.year, parsed.month - 1, 1).toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	});

	return (
		<View style={[styles.root, style]} {...props}>
			<View style={styles.header}>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Previous month"
					onPress={() => setMonth(shiftMonth(month, -1))}
					style={styles.nav}
				>
					<Icon name="ChevronLeft" size={18} color={theme.colors.text} />
				</Pressable>
				<Text variant="body" weight="medium">
					{title}
				</Text>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Next month"
					onPress={() => setMonth(shiftMonth(month, 1))}
					style={styles.nav}
				>
					<Icon name="ChevronRight" size={18} color={theme.colors.text} />
				</Pressable>
			</View>
			<View style={styles.week}>
				{labels.map((label) => (
					<Text key={label} variant="caption" colorKey="textMuted" style={styles.weekday}>
						{label}
					</Text>
				))}
			</View>
			<View style={styles.grid}>
				{cells.map((day, index) => {
					if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
					const isSelected =
						mode === "single" ? day === selected : day === bounds.from || day === bounds.to;
					const inSpan =
						mode === "range" && bounds.from && bounds.to && day >= bounds.from && day <= bounds.to;
					let background = "transparent";
					let color = theme.colors.text;
					if (isSelected) {
						background = theme.colors.primary;
						color = theme.colors.onPrimary;
					} else if (inSpan) {
						background = theme.colors.primarySubtle;
					}
					const isToday = day === todayKey;
					return (
						<Pressable
							key={day}
							accessibilityRole="button"
							accessibilityState={{ selected: Boolean(isSelected) }}
							onPress={() => selectDay(day)}
							style={styles.cell}
						>
							<View
								style={[
									styles.day,
									{ backgroundColor: background },
									isToday && !isSelected
										? { borderColor: theme.colors.primary, borderWidth: StyleSheet.hairlineWidth }
										: null,
								]}
							>
								<Text variant="bodySmall" color={color}>
									{Number(day.slice(-2))}
								</Text>
							</View>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		width: "100%",
		gap: 8,
	},
	header: {
		minHeight: 44,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	nav: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
	},
	week: {
		flexDirection: "row",
	},
	weekday: {
		flex: 1,
		textAlign: "center",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	cell: {
		width: `${100 / 7}%`,
		aspectRatio: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	day: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
});
