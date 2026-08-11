import { Image } from "react-native";

const toUri = (asset: number) => {
	const resolveAssetSource = Image.resolveAssetSource;
	if (typeof resolveAssetSource !== "function") return "";
	return resolveAssetSource(asset)?.uri ?? "";
};

export const catalogAssets = {
	headphones: toUri(require("../assets/catalog/headphones.jpg")),
	workspace: toUri(require("../assets/catalog/workspace.jpg")),
	cafe: toUri(require("../assets/catalog/cafe.jpg")),
	speaker: toUri(require("../assets/catalog/speaker.jpg")),
	chargingDock: toUri(require("../assets/catalog/charging-dock.jpg")),
};
