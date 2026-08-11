import { MediaPlayerScreen } from "@osuki-dev/kit-community";
import type { MediaPlayerScreenConfig } from "@osuki-dev/kit-community";
import { useState } from "react";

const tracks = [
	{
		title: "Midnight City",
		artist: "M83",
		album: "Hurry Up, We're Dreaming",
		duration: 243,
	},
	{
		title: "Digital Love",
		artist: "Daft Punk",
		album: "Discovery",
		duration: 301,
	},
	{
		title: "Sweet Disposition",
		artist: "The Temper Trap",
		album: "Conditions",
		duration: 232,
	},
];

export default function Playerproduct() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [trackIndex, setTrackIndex] = useState(0);
	const [currentTime, setCurrentTime] = useState(120);
	const [isShuffle, setIsShuffle] = useState(false);
	const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");
	const [playbackRate, setPlaybackRate] = useState(1);
	const [statusText, setStatusText] = useState("Paused");
	const currentTrack = tracks[trackIndex]!;

	const moveTrack = (direction: 1 | -1) => {
		setTrackIndex((index) => {
			const nextIndex = (index + direction + tracks.length) % tracks.length;
			const nextTrack = tracks[nextIndex]!;
			setCurrentTime(0);
			setIsPlaying(true);
			setStatusText(`Playing ${nextTrack.title}`);
			return nextIndex;
		});
	};

	const playerConfig: MediaPlayerScreenConfig = {
		title: currentTrack.title,
		artist: currentTrack.artist,
		album: currentTrack.album,
		duration: currentTrack.duration,
		currentTime,
		isPlaying,
		isShuffle,
		repeatMode,
		playbackRate,
		statusText,
	};

	return (
		<MediaPlayerScreen
			config={playerConfig}
			onPlayPause={() => {
				setIsPlaying((playing) => {
					const nextPlaying = !playing;
					setStatusText(nextPlaying ? `Playing ${currentTrack.title}` : "Paused");
					return nextPlaying;
				});
			}}
			onSeek={(time) => {
				setCurrentTime(time);
				setStatusText(`Seeked to ${Math.round(time)} seconds`);
			}}
			onNext={() => moveTrack(1)}
			onPrevious={() => moveTrack(-1)}
			onShuffleToggle={() => {
				setIsShuffle((shuffle) => {
					const nextShuffle = !shuffle;
					setStatusText(nextShuffle ? "Shuffle on" : "Shuffle off");
					return nextShuffle;
				});
			}}
			onRepeatToggle={() => {
				const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
				const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
				const nextMode = modes[nextIndex]!;
				setRepeatMode(nextMode);
				setStatusText(nextMode === "none" ? "Repeat off" : `Repeat ${nextMode}`);
			}}
			onPlaybackRateChange={(rate) => {
				setPlaybackRate(rate);
				setStatusText(`Playback speed ${rate}x`);
			}}
		/>
	);
}
