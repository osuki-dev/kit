import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

import {
	Screen,
	Card,
	Text,
	Icon,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

export interface CalendarEvent {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	color?: string;
	onPress?: () => void;
}

export interface CalendarScreenConfig {
	/** Current month */
	currentDate: Date;
	/** Selected date */
	selectedDate?: Date;
	/** Events for the month */
	events: CalendarEvent[];
	/** View mode */
	view?: "month" | "week" | "day";
}

export interface CalendarScreenProps {
	config: CalendarScreenConfig;
	/** Date selection handler */
	onDateSelect?: (date: Date) => void;
	/** Month navigation */
	onPreviousMonth?: () => void;
	onNextMonth?: () => void;
	/** View change */
	onViewChange?: (view: "month" | "week" | "day") => void;
	/** Optional visible status for user feedback after calendar interactions */
	statusText?: string;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		header?: ViewStyle;
		calendarGrid?: ViewStyle;
		dayCell?: ViewStyle;
		eventList?: ViewStyle;
	};
	/** Root test id used to derive stable child ids */
	testID?: string;
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	monthTitle: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	navButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
	viewToggle: {
		flexDirection: "row",
		gap: 8,
	},
	viewButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 4,
		borderWidth: 1,
	},
	weekDaysHeader: {
		flexDirection: "row",
		marginBottom: 8,
	},
	weekDay: {
		flex: 1,
		textAlign: "center",
		paddingVertical: 8,
	},
	calendarGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	dayCell: {
		width: "14.28%",
		aspectRatio: 1,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 0.5,
		padding: 4,
	},
	dayNumber: {
		fontSize: 14,
	},
	eventIndicator: {
		width: 4,
		height: 4,
		borderRadius: 2,
		marginTop: 2,
	},
	selectedEvents: {
		marginTop: 24,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	eventCard: {
		flexDirection: "row",
		gap: 12,
		padding: 12,
		marginBottom: 8,
		borderLeftWidth: 3,
	},
	eventTime: {
		width: 60,
	},
});

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Calendar screen template
 *
 * Features:
 * - Month view with day grid
 * - Week day headers
 * - Event indicators
 * - Selected day events list
 * - Month navigation
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <CalendarScreen
 *   config={{
 *     currentDate: new Date(),
 *     selectedDate: new Date(),
 *     events: [{ id: "1", title: "Meeting", startTime: new Date() }],
 *   }}
 * />
 * ```
 */
export function CalendarScreen({
	config,
	onDateSelect,
	onPreviousMonth,
	onNextMonth,
	onViewChange,
	statusText,
	styleOverrides,
	testID = "calendar",
}: CalendarScreenProps) {
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const { currentDate, selectedDate, events, view = "month" } = config;

	const [currentView, setCurrentView] = useState(view);

	// Get days in month
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDayOfMonth = new Date(year, month, 1).getDay();

	// Generate calendar days
	const calendarDays: Array<{
		date: number;
		isCurrentMonth: boolean;
		isToday: boolean;
		isSelected: boolean;
		events: CalendarEvent[];
	}> = [];

	// Previous month days
	const prevMonthDays = new Date(year, month, 0).getDate();
	for (let i = firstDayOfMonth - 1; i >= 0; i--) {
		calendarDays.push({
			date: prevMonthDays - i,
			isCurrentMonth: false,
			isToday: false,
			isSelected: false,
			events: [],
		});
	}

	// Current month days
	const today = new Date();
	for (let i = 1; i <= daysInMonth; i++) {
		const date = new Date(year, month, i);
		const isToday =
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear();

		const isSelected = selectedDate
			? date.getDate() === selectedDate.getDate() &&
				date.getMonth() === selectedDate.getMonth() &&
				date.getFullYear() === selectedDate.getFullYear()
			: false;

		const dayEvents = events.filter(
			(event) =>
				event.startTime.getDate() === i &&
				event.startTime.getMonth() === month &&
				event.startTime.getFullYear() === year,
		);

		calendarDays.push({
			date: i,
			isCurrentMonth: true,
			isToday,
			isSelected,
			events: dayEvents,
		});
	}

	// Next month days to fill grid
	const remainingDays = 42 - calendarDays.length;
	for (let i = 1; i <= remainingDays; i++) {
		calendarDays.push({
			date: i,
			isCurrentMonth: false,
			isToday: false,
			isSelected: false,
			events: [],
		});
	}

	// Selected date events
	const selectedEvents = selectedDate
		? events.filter(
				(event) =>
					event.startTime.getDate() === selectedDate.getDate() &&
					event.startTime.getMonth() === selectedDate.getMonth() &&
					event.startTime.getFullYear() === selectedDate.getFullYear(),
			)
		: [];

	return (
		<Screen style={staticStyles.container}>
			<ScrollView style={staticStyles.scrollView} showsVerticalScrollIndicator={false}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 800 }}
					horizontalPadding={pagePadding}
				>
					<View style={{ marginTop: spacing["lg"] }}>
						{/* Header */}
						<View style={[staticStyles.header, styleOverrides?.header]} testID={`${testID}-header`}>
							<View style={staticStyles.monthTitle}>
								<TouchableOpacity
									onPress={onPreviousMonth}
									testID={`${testID}-previous-month`}
									accessibilityLabel="Previous month"
								>
									<Icon name="ChevronLeft" size={24} color={colors.text} />
								</TouchableOpacity>

								<Text variant="heading" color={colors.text} testID={`${testID}-month-title`}>
									{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
								</Text>

								<TouchableOpacity
									onPress={onNextMonth}
									testID={`${testID}-next-month`}
									accessibilityLabel="Next month"
								>
									<Icon name="ChevronRight" size={24} color={colors.text} />
								</TouchableOpacity>
							</View>

							<View style={staticStyles.viewToggle}>
								{["month", "week", "day"].map((v) => (
									<TouchableOpacity
										key={v}
										testID={`${testID}-view-${v}`}
										onPress={() => {
											setCurrentView(v as any);
											onViewChange?.(v as any);
										}}
										style={[
											{
												borderColor: currentView === v ? colors.text : colors.border,
												backgroundColor: currentView === v ? colors.surfaceRaised : "transparent",
											},
										]}
									>
										<Text
											variant="caption"
											color={currentView === v ? colors.text : colors.textMuted}
											transform="uppercase"
										>
											{v}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{statusText ? (
							<Card
								variant="raised"
								padding="sm"
								style={{ marginBottom: spacing["md"] }}
								testID={`${testID}-status-card`}
								accessibilityLabel={statusText}
							>
								<Text variant="caption" color={colors.textMuted} testID={`${testID}-status`}>
									{statusText}
								</Text>
							</Card>
						) : null}

						{/* Week Days Header */}
						<View style={staticStyles.weekDaysHeader}>
							{weekDays.map((day) => (
								<Text
									key={day}
									variant="caption"
									color={colors.textMuted}
									style={staticStyles.weekDay}
								>
									{day}
								</Text>
							))}
						</View>

						{/* Calendar Grid */}
						<View style={[staticStyles.calendarGrid, styleOverrides?.calendarGrid]}>
							{calendarDays.map((day, index) => (
								<TouchableOpacity
									key={index}
									onPress={() => onDateSelect?.(new Date(year, month, day.date))}
									testID={
										day.isCurrentMonth
											? `${testID}-day-${String(day.date).padStart(2, "0")}`
											: undefined
									}
									accessibilityLabel={
										day.isCurrentMonth
											? `Select ${currentDate.toLocaleDateString("en-US", { month: "long" })} ${
													day.date
												}`
											: undefined
									}
									style={[
										staticStyles.dayCell,
										{
											borderColor: colors.border,
											backgroundColor: day.isSelected
												? colors.text
												: day.isToday
													? colors.surfaceRaised
													: "transparent",
											opacity: day.isCurrentMonth ? 1 : 0.3,
										},
										styleOverrides?.dayCell,
									]}
								>
									<Text
										style={[
											staticStyles.dayNumber,
											{
												color: day.isSelected ? colors.background : colors.text,
											},
										]}
									>
										{day.date}
									</Text>
									{day.events.length > 0 && (
										<View
											style={[
												staticStyles.eventIndicator,
												{ backgroundColor: day.events[0]?.color || colors.primary },
											]}
										/>
									)}
								</TouchableOpacity>
							))}
						</View>

						{/* Selected Date Events */}
						{selectedDate && selectedEvents.length > 0 && (
							<View style={[staticStyles.selectedEvents, styleOverrides?.eventList]}>
								<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
									EVENTS FOR {selectedDate.toLocaleDateString()}
								</Text>

								{selectedEvents.map((event) => (
									<TouchableOpacity
										key={event.id}
										onPress={event.onPress}
										testID={`${testID}-event-${event.id}`}
									>
										<Card
											variant="raised"
											border="subtle"
											style={[
												staticStyles.eventCard,
												{ borderLeftColor: event.color || colors.primary },
											]}
										>
											<View style={staticStyles.eventTime}>
												<Text variant="caption" color={colors.textMuted}>
													{event.startTime.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</Text>
											</View>

											<View style={{ flex: 1 }}>
												<Text variant="body" color={colors.text}>
													{event.title}
												</Text>
												<Text variant="caption" color={colors.textMuted}>
													{event.startTime.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}{" "}
													-{" "}
													{event.endTime.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</Text>
											</View>
										</Card>
									</TouchableOpacity>
								))}
							</View>
						)}

						<View style={{ height: spacing["4xl"] }} />
					</View>
				</ResponsiveContainer>
			</ScrollView>
		</Screen>
	);
}
