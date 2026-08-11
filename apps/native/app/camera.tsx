import { CameraScreen } from "@osuki-dev/kit-community";
import type { CameraScreenConfig } from "@osuki-dev/kit-community";
import { useState } from "react";

export default function Cameraproduct() {
	const [mode, setMode] = useState<CameraScreenConfig["mode"]>("scan");
	const [flashEnabled, setFlashEnabled] = useState(false);
	const [, setFacing] = useState<"rear" | "front">("rear");
	const [, setCaptureCount] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [statusText, setStatusText] = useState("Scanner ready");
	const scanResult = "https://osuki.dev/product/hydrogen";

	const handleModeChange = (nextMode: CameraScreenConfig["mode"]) => {
		setMode(nextMode);
		setStatusText(
			nextMode === "scan"
				? "Scanner ready"
				: nextMode === "photo"
					? "Photo mode ready"
					: "Video mode ready",
		);
	};

	const handleCapture = () => {
		if (mode === "video") {
			setIsRecording((recording) => {
				const nextRecording = !recording;
				setStatusText(nextRecording ? "Recording started" : "Recording saved");
				return nextRecording;
			});
			return;
		}

		if (mode === "scan") {
			setStatusText("Scan frame captured");
			return;
		}

		setCaptureCount((count) => {
			const nextCount = count + 1;
			setStatusText(`Captured photo ${nextCount}`);
			return nextCount;
		});
	};

	const handleSwitchCamera = () => {
		setFacing((current) => {
			const next = current === "rear" ? "front" : "rear";
			setStatusText(`Using ${next} camera`);
			return next;
		});
	};

	return (
		<CameraScreen
			config={{
				mode,
				flashEnabled,
				isRecording,
				scanResult: mode === "scan" ? scanResult : undefined,
				statusText,
			}}
			onCapture={handleCapture}
			onToggleFlash={() => {
				setFlashEnabled((enabled) => {
					const nextEnabled = !enabled;
					setStatusText(nextEnabled ? "Flash on" : "Flash off");
					return nextEnabled;
				});
			}}
			onSwitchCamera={handleSwitchCamera}
			onOpenGallery={() => setStatusText("Gallery opened")}
			onClose={() => setStatusText("Camera paused")}
			onScanComplete={(result) => setStatusText(`Opened ${result}`)}
			onModeChange={handleModeChange}
		/>
	);
}
