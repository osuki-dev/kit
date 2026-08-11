import { ErrorScreen } from "@osuki-dev/kit-community";
import type { ErrorScreenConfig } from "@osuki-dev/kit-community";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text, useTheme } from "@osuki-dev/ui";

export default function Errorproduct() {
	const { colors } = useTheme();
	const [errorType, setErrorType] = useState<ErrorScreenConfig["type"]>("404");
	const [statusText, setStatusText] = useState("Error state ready");

	const errorTypes: ErrorScreenConfig["type"][] = [
		"404",
		"500",
		"network",
		"permission",
		"generic",
	];

	return (
		<View style={{ flex: 1 }}>
			{/* Error Type Selector */}
			<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16, paddingTop: 60 }}>
				{errorTypes.map((type) => (
					<Button
						key={type}
						variant={errorType === type ? "primary" : "secondary"}
						onPress={() => {
							setErrorType(type);
							setStatusText(`Showing ${type.toUpperCase()} error`);
						}}
					>
						{type.toUpperCase()}
					</Button>
				))}
			</View>
			<View style={{ paddingHorizontal: 16 }}>
				<Text variant="caption" color={colors.textMuted} testID="error-state-status">
					{statusText}
				</Text>
			</View>

			{/* Error Screen */}
			<ErrorScreen
				config={{
					type: errorType,
					primaryAction: {
						label: "GO HOME",
						onPress: () => setStatusText("Home navigation requested"),
						testID: "error-state-go-home",
					},
					secondaryAction: {
						label: "TRY AGAIN",
						onPress: () => {
							setErrorType("generic");
							setStatusText("Retry completed");
						},
						testID: "error-state-try-again",
					},
				}}
			/>
		</View>
	);
}
