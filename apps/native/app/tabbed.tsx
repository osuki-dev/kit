import { TabbedScreen } from "@osuki-dev/kit-community";
import { View, Text } from "react-native";
import { useTheme } from "@osuki-dev/ui";

export default function Tabbedproduct() {
	const { colors } = useTheme();

	return (
		<TabbedScreen
			config={{
				tabs: [
					{
						id: "overview",
						label: "Overview",
						content: (
							<View style={{ padding: 16, gap: 12 }}>
								<Text style={{ color: colors.text, fontSize: 16 }}>
									Welcome to the Overview tab
								</Text>
								<Text style={{ color: colors.textMuted }}>
									This is the main dashboard view with summary information.
								</Text>
							</View>
						),
						badge: 2,
					},
					{
						id: "details",
						label: "Details",
						content: (
							<View style={{ padding: 16, gap: 12 }}>
								<Text style={{ color: colors.text, fontSize: 16 }}>Detailed Information</Text>
								<Text style={{ color: colors.textMuted }}>
									Here you can find comprehensive details and specifications.
								</Text>
							</View>
						),
					},
					{
						id: "settings",
						label: "Settings",
						content: (
							<View style={{ padding: 16, gap: 12 }}>
								<Text style={{ color: colors.text, fontSize: 16 }}>Configuration Options</Text>
								<Text style={{ color: colors.textMuted }}>
									Customize your experience with these settings.
								</Text>
							</View>
						),
					},
				],
				activeTabId: "overview",
			}}
		/>
	);
}
