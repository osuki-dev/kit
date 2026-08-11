import { LoadingScreen } from "@osuki-dev/kit-community";
import type { LoadingScreenConfig } from "@osuki-dev/kit-community";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text, useTheme } from "@osuki-dev/ui";

export default function Loadingproduct() {
	const [spinnerSize, setSpinnerSize] = useState<LoadingScreenConfig["spinnerSize"]>("md");
	const { colors } = useTheme();

	const sizes: Array<NonNullable<LoadingScreenConfig["spinnerSize"]>> = ["sm", "md", "lg"];

	return (
		<View style={{ flex: 1 }}>
			{/* Size Selector */}
			<View style={{ padding: 16, paddingTop: 60 }}>
				<Text variant="label" color={colors.textMuted} style={{ marginBottom: 8 }}>
					SPINNER SIZE
				</Text>
				<View style={{ flexDirection: "row", gap: 8 }}>
					{sizes.map((size) => (
						<Button
							key={size}
							variant={spinnerSize === size ? "primary" : "secondary"}
							onPress={() => setSpinnerSize(size)}
						>
							{size.toUpperCase()}
						</Button>
					))}
				</View>
			</View>

			{/* Loading Screen */}
			<LoadingScreen
				config={{
					message: "LOADING...",
					subMessage: "Please wait while we fetch your data",
					spinnerSize,
					showSpinner: true,
				}}
			/>
		</View>
	);
}
