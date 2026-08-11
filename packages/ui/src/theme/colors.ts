export { osukiDarkColors as darkColors, osukiLightColors as lightColors } from "./tokens";
export type { Colors, ColorMode } from "./types";

import { osukiDarkColors, osukiLightColors } from "./tokens";
import type { ColorMode, Colors } from "./types";

export const getColors = (mode: ColorMode): Colors => {
	return mode === "dark" ? osukiDarkColors : osukiLightColors;
};
