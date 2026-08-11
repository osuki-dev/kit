import React from "react";
import { View, StyleSheet } from "react-native";

import { Text, Button, Icon, useTheme } from "@osuki-dev/ui";

export interface Session {
	id: string;
	device: string;
	browser: string;
	location: string;
	lastActive: string;
	isCurrent: boolean;
}

export interface SessionListProps {
	sessions: Session[];
	onLogout?: (sessionId: string) => void;
	onLogoutAll?: () => void;
	/** Stable test identifier for automation */
	testID?: string;
}

// Static styles
const staticStyles = StyleSheet.create({
	sessionItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	sessionInfo: {
		flex: 1,
	},
	deviceRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	actionsContainer: {
		marginTop: 16,
		alignItems: "center",
	},
});

/**
 * Active sessions list component
 *
 * Shows all logged-in devices with option to logout
 */
export const SessionList: React.FC<SessionListProps> = ({
	sessions,
	onLogout,
	onLogoutAll,
	testID = "session-list",
}) => {
	const { colors, spacing } = useTheme();

	// Dynamic spacing
	const layoutSpacing = {
		itemPadding: spacing["sm"],
		itemGap: spacing["xs"],
		iconMargin: spacing["sm"],
		rowGap: spacing["2xs"],
		dividerMargin: spacing["xs"],
	};

	return (
		<View testID={testID}>
			{sessions.map((session, index) => (
				<View key={session.id} testID={`${testID}-item-${session.id}`}>
					<View style={[staticStyles.sessionItem, { paddingVertical: layoutSpacing.itemPadding }]}>
						<View style={[staticStyles.sessionInfo, { gap: layoutSpacing.rowGap }]}>
							<View style={[staticStyles.deviceRow, { gap: layoutSpacing.iconMargin }]}>
								<Icon
									name={session.device.includes("Mobile") ? "Smartphone" : "Monitor"}
									size={18}
									color={colors.textMuted}
								/>
								<Text variant="body" color={colors.text}>
									{session.device}
								</Text>
								{session.isCurrent && (
									<Text variant="caption" color={colors.success}>
										(CURRENT)
									</Text>
								)}
							</View>

							<Text variant="caption" color={colors.textMuted}>
								{session.browser} • {session.location}
							</Text>

							<Text variant="caption" color={colors.textDisabled}>
								Last active: {session.lastActive}
							</Text>
						</View>

						{!session.isCurrent && (
							<Button
								testID={`${testID}-logout-${session.id}`}
								variant="ghost"
								onPress={() => onLogout?.(session.id)}
							>
								LOGOUT
							</Button>
						)}
					</View>

					{index < sessions.length - 1 && (
						<View
							style={{
								height: 1,
								backgroundColor: "transparent",
								marginVertical: layoutSpacing.dividerMargin,
							}}
						/>
					)}
				</View>
			))}

			{sessions.length > 1 && (
				<View style={[staticStyles.actionsContainer, { marginTop: spacing["md"] }]}>
					<Button testID={`${testID}-logout-all`} variant="destructive" onPress={onLogoutAll}>
						LOGOUT ALL DEVICES
					</Button>
				</View>
			)}
		</View>
	);
};
