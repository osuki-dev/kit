import { CalendarScreen } from "@osuki-dev/kit-community";
import type { CalendarScreenConfig } from "@osuki-dev/kit-community";
import { useState } from "react";

export default function Calendarproduct() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [view, setView] = useState<NonNullable<CalendarScreenConfig["view"]>>("month");
	const [statusText, setStatusText] = useState("Month view is ready.");

	const updateSelectedDate = (date: Date) => {
		setSelectedDate(date);
		setStatusText(
			`Selected ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
		);
	};

	const goToMonth = (direction: "previous" | "next") => {
		setCurrentDate((value) => {
			const next = new Date(value);
			next.setMonth(value.getMonth() + (direction === "next" ? 1 : -1));
			setStatusText(
				`Showing ${next.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
			);
			return next;
		});
	};

	const calendarConfig: CalendarScreenConfig = {
		currentDate,
		selectedDate,
		events: [
			{
				id: "1",
				title: "Team Standup",
				startTime: new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					selectedDate.getDate(),
					9,
					0,
				),
				endTime: new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					selectedDate.getDate(),
					9,
					30,
				),
				color: "#6366f1",
				onPress: () => setStatusText("Opened Team Standup details."),
			},
			{
				id: "2",
				title: "Design Review",
				startTime: new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					selectedDate.getDate(),
					14,
					0,
				),
				endTime: new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					selectedDate.getDate(),
					15,
					0,
				),
				color: "#ec4899",
				onPress: () => setStatusText("Opened Design Review details."),
			},
			{
				id: "3",
				title: "Client Meeting",
				startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 10, 0),
				endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 11, 0),
				onPress: () => setStatusText("Opened Client Meeting details."),
			},
		],
		view,
	};

	return (
		<CalendarScreen
			config={calendarConfig}
			statusText={statusText}
			onDateSelect={updateSelectedDate}
			onPreviousMonth={() => goToMonth("previous")}
			onNextMonth={() => goToMonth("next")}
			onViewChange={(nextView) => {
				setView(nextView);
				setStatusText(`${nextView[0]?.toUpperCase()}${nextView.slice(1)} view is active.`);
			}}
			testID="calendar-screen"
		/>
	);
}
