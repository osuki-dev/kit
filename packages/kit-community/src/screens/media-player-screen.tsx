import React from "react";
import { View, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

import {
	Screen,
	Text,
	Icon,
	ResponsiveContainer,
	useTheme,
	useResponsiveTheme,
} from "@osuki-dev/ui";
import type { IconName } from "@osuki-dev/ui";

export interface MediaPlayerScreenConfig {
	/** Media title */
	title: string;
	/** Artist/Author name */
	artist?: string;
	/** Album/Collection */
	album?: string;
	/** Cover image URL */
	coverImage?: string;
	/** Duration in seconds */
	duration: number;
	/** Current playback position */
	currentTime?: number;
	/** Is playing */
	isPlaying?: boolean;
	/** Media type */
	type?: "audio" | "video";
	/** Playback rate */
	playbackRate?: number;
	/** Is shuffle enabled */
	isShuffle?: boolean;
	/** Repeat mode */
	repeatMode?: "none" | "all" | "one";
	/** User-facing playback status */
	statusText?: string;
}

export interface MediaPlayerScreenProps {
	config: MediaPlayerScreenConfig;
	/** Playback control handlers */
	onPlayPause?: () => void;
	onSeek?: (time: number) => void;
	onNext?: () => void;
	onPrevious?: () => void;
	onShuffleToggle?: () => void;
	onRepeatToggle?: () => void;
	onPlaybackRateChange?: (rate: number) => void;
	testID?: string;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		coverSection?: ViewStyle;
		controlsSection?: ViewStyle;
		progressSection?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	coverSection: {
		alignItems: "center",
		marginBottom: 32,
	},
	coverPlaceholder: {
		width: 280,
		height: 280,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	infoSection: {
		alignItems: "center",
		gap: 8,
		marginBottom: 32,
	},
	progressSection: {
		width: "100%",
		paddingHorizontal: 16,
		marginBottom: 24,
	},
	progressBar: {
		width: "100%",
		height: 4,
		backgroundColor: "transparent",
		borderRadius: 2,
		marginBottom: 8,
	},
	progressFill: {
		height: "100%",
		borderRadius: 2,
	},
	timeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	controlsSection: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 24,
		marginBottom: 32,
	},
	controlButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	playButton: {
		width: 72,
		height: 72,
		borderRadius: 36,
		justifyContent: "center",
		alignItems: "center",
	},
	secondaryControls: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 24,
	},
	secondaryButton: {
		padding: 8,
	},
	statusPanel: {
		minHeight: 34,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
});

/**
 * Media player screen template
 *
 * Features:
 * - Cover image display
 * - Track info (title, artist, album)
 * - Progress bar with time display
 * - Playback controls (play/pause, next, previous)
 * - Secondary controls (shuffle, repeat, playback rate)
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <MediaPlayerScreen
 *   config={{
 *     title: "Bohemian Rhapsody",
 *     artist: "Queen",
 *     duration: 354,
 *     currentTime: 120,
 *     isPlaying: true,
 *   }}
 *   onPlayPause={() => {}}
 *   onSeek={(time) => {}}
 * />
 * ```
 */
export function MediaPlayerScreen({
	config,
	onPlayPause,
	onNext,
	onPrevious,
	onShuffleToggle,
	onRepeatToggle,
	onPlaybackRateChange,
	testID = "media-player",
	styleOverrides,
}: MediaPlayerScreenProps) {
	const { colors, spacing, mode, shadow } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const {
		title,
		artist,
		album,
		duration,
		currentTime = 0,
		isPlaying = false,
		isShuffle = false,
		repeatMode = "none",
		playbackRate = 1,
		statusText,
	} = config;

	const progress = currentTime / duration;
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const repeatIcons: Record<string, IconName> = {
		none: "Repeat",
		all: "Repeat",
		one: "Repeat1",
	} as const;

	return (
		<Screen style={staticStyles.container} testID={testID}>
			<ResponsiveContainer
				maxWidth={{ xs: "100%", md: 480, lg: 560 }}
				horizontalPadding={pagePadding}
				alignment="center"
				style={{ flex: 1 }}
			>
				<View style={[staticStyles.content, { paddingTop: spacing["3xl"] }]}>
					{/* Cover Image */}
					<View style={[staticStyles.coverSection, styleOverrides?.coverSection]}>
						<View
							style={[staticStyles.coverPlaceholder, { backgroundColor: colors.surfaceRaised }]}
						>
							<Icon name="Music" size={64} color={colors.textDisabled} />
						</View>
					</View>

					{/* Track Info */}
					<View style={staticStyles.infoSection}>
						<Text
							variant="heading"
							color={colors.text}
							style={{ textAlign: "center" }}
							testID={`${testID}-title`}
						>
							{title}
						</Text>
						{artist && (
							<Text variant="body" color={colors.textMuted} testID={`${testID}-artist`}>
								{artist}
							</Text>
						)}
						{album && (
							<Text variant="caption" color={colors.textDisabled} testID={`${testID}-album`}>
								{album}
							</Text>
						)}
					</View>

					<View
						style={[staticStyles.statusPanel, { backgroundColor: colors.surfaceRaised }]}
						testID={`${testID}-status`}
					>
						<Text variant="caption" color={colors.textMuted}>
							{statusText ?? (isPlaying ? "Playing" : "Paused")}
						</Text>
					</View>

					{/* Progress Bar */}
					<View style={[staticStyles.progressSection, styleOverrides?.progressSection]}>
						<View style={[staticStyles.progressBar, { backgroundColor: colors.border }]}>
							<View
								style={[
									staticStyles.progressFill,
									{ width: `${progress * 100}%`, backgroundColor: colors.text },
								]}
							/>
						</View>
						<View style={staticStyles.timeRow}>
							<Text variant="caption" color={colors.textMuted}>
								{formatTime(currentTime)}
							</Text>
							<Text variant="caption" color={colors.textMuted}>
								{formatTime(duration)}
							</Text>
						</View>
					</View>

					{/* Playback Controls */}
					<View style={[staticStyles.controlsSection, styleOverrides?.controlsSection]}>
						<TouchableOpacity
							onPress={onPrevious}
							testID={`${testID}-previous`}
							accessibilityRole="button"
							accessibilityLabel="Previous track"
							style={[
								staticStyles.controlButton,
								{
									backgroundColor: colors.surfaceRaised,
									...(mode === "light" ? shadow.pill : {}),
								},
							]}
						>
							<Icon name="SkipBack" size={24} color={colors.text} />
						</TouchableOpacity>

						<TouchableOpacity
							onPress={onPlayPause}
							testID={`${testID}-play-pause`}
							accessibilityRole="button"
							accessibilityLabel={isPlaying ? "Pause" : "Play"}
							style={[
								staticStyles.playButton,
								{
									backgroundColor: colors.surface,
									...(mode === "light" ? shadow.soft : {}),
								},
							]}
						>
							<Icon name={isPlaying ? "Pause" : "Play"} size={32} color={colors.text} />
						</TouchableOpacity>

						<TouchableOpacity
							onPress={onNext}
							testID={`${testID}-next`}
							accessibilityRole="button"
							accessibilityLabel="Next track"
							style={[
								staticStyles.controlButton,
								{
									backgroundColor: colors.surfaceRaised,
									...(mode === "light" ? shadow.pill : {}),
								},
							]}
						>
							<Icon name="SkipForward" size={24} color={colors.text} />
						</TouchableOpacity>
					</View>

					{/* Secondary Controls */}
					<View style={staticStyles.secondaryControls}>
						<TouchableOpacity
							onPress={onShuffleToggle}
							style={staticStyles.secondaryButton}
							testID={`${testID}-shuffle`}
							accessibilityRole="button"
							accessibilityLabel={isShuffle ? "Disable shuffle" : "Enable shuffle"}
						>
							<Icon name="Shuffle" size={20} color={isShuffle ? colors.text : colors.textMuted} />
						</TouchableOpacity>

						<TouchableOpacity
							onPress={onRepeatToggle}
							style={staticStyles.secondaryButton}
							testID={`${testID}-repeat`}
							accessibilityRole="button"
							accessibilityLabel={`Repeat ${repeatMode}`}
						>
							<Icon
								name={repeatIcons[repeatMode]!}
								size={20}
								color={repeatMode !== "none" ? colors.text : colors.textMuted}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => {
								const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
								const nextIndex = (rates.indexOf(playbackRate!) + 1) % rates.length;
								onPlaybackRateChange?.(rates[nextIndex]!);
							}}
							style={staticStyles.secondaryButton}
							testID={`${testID}-rate`}
							accessibilityRole="button"
							accessibilityLabel="Change playback rate"
						>
							<Text variant="caption" color={colors.textMuted}>
								{playbackRate}x
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ResponsiveContainer>
		</Screen>
	);
}
