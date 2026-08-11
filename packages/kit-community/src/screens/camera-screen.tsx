import React from "react";
import { View, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

import { Screen, Text, Button, Icon, useTheme } from "@osuki-dev/ui";

export interface CameraScreenConfig {
	/** Camera mode */
	mode: "photo" | "video" | "scan";
	/** Flash enabled */
	flashEnabled?: boolean;
	/** Is recording (video mode) */
	isRecording?: boolean;
	/** Scan result (scan mode) */
	scanResult?: string;
	/** User-facing camera session state */
	statusText?: string;
}

export interface CameraScreenProps {
	config: CameraScreenConfig;
	/** Control handlers */
	onCapture?: () => void;
	onToggleFlash?: () => void;
	onSwitchCamera?: () => void;
	onOpenGallery?: () => void;
	onClose?: () => void;
	onScanComplete?: (result: string) => void;
	onModeChange?: (mode: CameraScreenConfig["mode"]) => void;
	testID?: string;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		viewfinder?: ViewStyle;
		controls?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		paddingTop: 48,
	},
	viewfinder: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	viewfinderFrame: {
		width: 280,
		height: 280,
		borderWidth: 2,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	corner: {
		position: "absolute",
		width: 40,
		height: 40,
		borderColor: "white",
	},
	cornerTL: {
		top: -2,
		left: -2,
		borderTopWidth: 4,
		borderLeftWidth: 4,
		borderTopLeftRadius: 16,
	},
	cornerTR: {
		top: -2,
		right: -2,
		borderTopWidth: 4,
		borderRightWidth: 4,
		borderTopRightRadius: 16,
	},
	cornerBL: {
		bottom: -2,
		left: -2,
		borderBottomWidth: 4,
		borderLeftWidth: 4,
		borderBottomLeftRadius: 16,
	},
	cornerBR: {
		bottom: -2,
		right: -2,
		borderBottomWidth: 4,
		borderRightWidth: 4,
		borderBottomRightRadius: 16,
	},
	scanLine: {
		position: "absolute",
		width: "90%",
		height: 2,
		backgroundColor: "white",
	},
	controls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 32,
		paddingBottom: 48,
	},
	controlButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.2)",
	},
	captureButton: {
		width: 72,
		height: 72,
		borderRadius: 36,
		borderWidth: 4,
		borderColor: "white",
		justifyContent: "center",
		alignItems: "center",
	},
	captureInner: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "white",
	},
	recordingInner: {
		width: 24,
		height: 24,
		borderRadius: 4,
		backgroundColor: "red",
	},
	modeSelector: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 24,
		marginBottom: 16,
	},
	modeButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
	scanResult: {
		position: "absolute",
		bottom: 120,
		left: 16,
		right: 16,
		padding: 16,
		borderRadius: 8,
		backgroundColor: "rgba(0,0,0,0.8)",
	},
	statusPanel: {
		position: "absolute",
		left: 16,
		right: 16,
		bottom: 210,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 999,
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.72)",
	},
});

/**
 * Camera/Scanner screen template
 *
 * Features:
 * - Photo capture mode
 * - Video recording mode
 * - QR/Barcode scanner mode
 * - Flash toggle
 * - Camera switch
 * - Viewfinder with scan overlay
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <CameraScreen
 *   config={{ mode: "scan" }}
 *   onScanComplete={(result) => handleScanResult(result)}
 * />
 * ```
 */
export function CameraScreen({
	config,
	onCapture,
	onToggleFlash,
	onSwitchCamera,
	onOpenGallery,
	onClose,
	onScanComplete,
	onModeChange,
	testID = "camera-screen",
	styleOverrides,
}: CameraScreenProps) {
	const { colors } = useTheme();

	const { mode, flashEnabled, isRecording, scanResult, statusText } = config;

	const modeLabels: Record<string, string> = {
		photo: "PHOTO",
		video: "VIDEO",
		scan: "SCAN",
	};

	return (
		<Screen style={[staticStyles.container, styleOverrides?.container || {}]} testID={testID}>
			{/* Header */}
			<View style={staticStyles.header}>
				<TouchableOpacity
					onPress={onClose}
					style={staticStyles.controlButton}
					testID={`${testID}-close`}
					accessibilityRole="button"
					accessibilityLabel="Close camera"
				>
					<Icon name="X" size={24} color="white" />
				</TouchableOpacity>

				{mode !== "scan" && (
					<TouchableOpacity
						onPress={onToggleFlash}
						style={staticStyles.controlButton}
						testID={`${testID}-flash`}
						accessibilityRole="button"
						accessibilityLabel={flashEnabled ? "Turn flash off" : "Turn flash on"}
					>
						<Icon name={flashEnabled ? "Zap" : "ZapOff"} size={24} color="white" />
					</TouchableOpacity>
				)}
			</View>

			{/* Mode Selector */}
			<View style={staticStyles.modeSelector}>
				{["photo", "video", "scan"].map((m) => (
					<TouchableOpacity
						key={m}
						style={staticStyles.modeButton}
						onPress={() => onModeChange?.(m as CameraScreenConfig["mode"])}
						testID={`${testID}-mode-${m}`}
						accessibilityRole="button"
						accessibilityState={{ selected: mode === m }}
						accessibilityLabel={`${modeLabels[m]} mode`}
					>
						<Text variant="label" color={mode === m ? "white" : colors.textDisabled}>
							{modeLabels[m]}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Viewfinder */}
			<View style={[staticStyles.viewfinder, styleOverrides?.viewfinder]}>
				<View
					style={[
						staticStyles.viewfinderFrame,
						{ borderColor: mode === "scan" ? colors.primary : "white" },
					]}
				>
					{/* Corner markers */}
					<View style={[staticStyles.corner, staticStyles.cornerTL]} />
					<View style={[staticStyles.corner, staticStyles.cornerTR]} />
					<View style={[staticStyles.corner, staticStyles.cornerBL]} />
					<View style={[staticStyles.corner, staticStyles.cornerBR]} />

					{/* Scan line animation */}
					{mode === "scan" && (
						<View style={[staticStyles.scanLine, { backgroundColor: colors.primary }]} />
					)}

					{/* Center hint */}
					{mode === "scan" && (
						<Text variant="caption" color={colors.textMuted} style={{ marginTop: 160 }}>
							Align QR code within frame
						</Text>
					)}
				</View>
			</View>

			{/* Scan Result */}
			{mode === "scan" && scanResult && (
				<View style={staticStyles.scanResult}>
					<Text variant="body" color="white">
						{scanResult}
					</Text>
					<Button
						variant="primary"
						onPress={() => onScanComplete?.(scanResult)}
						testID={`${testID}-open-link`}
					>
						OPEN LINK
					</Button>
				</View>
			)}

			{statusText ? (
				<View style={staticStyles.statusPanel} testID={`${testID}-status`}>
					<Text variant="caption" color="white">
						{statusText}
					</Text>
				</View>
			) : null}

			{/* Controls */}
			<View style={[staticStyles.controls, styleOverrides?.controls]}>
				<TouchableOpacity
					onPress={onSwitchCamera}
					style={staticStyles.controlButton}
					testID={`${testID}-switch`}
					accessibilityRole="button"
					accessibilityLabel="Switch camera"
				>
					<Icon name="SwitchCamera" size={24} color="white" />
				</TouchableOpacity>

				<TouchableOpacity
					onPress={onCapture}
					style={staticStyles.captureButton}
					testID={`${testID}-capture`}
					accessibilityRole="button"
					accessibilityLabel={mode === "video" && isRecording ? "Stop recording" : "Capture"}
				>
					<View
						style={[
							mode === "video" && isRecording
								? staticStyles.recordingInner
								: staticStyles.captureInner,
						]}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={onOpenGallery}
					style={[staticStyles.controlButton, { backgroundColor: "rgba(255,255,255,0.3)" }]}
					testID={`${testID}-gallery`}
					accessibilityRole="button"
					accessibilityLabel="Open gallery"
				>
					<Icon name="Image" size={24} color="white" />
				</TouchableOpacity>
			</View>
		</Screen>
	);
}
