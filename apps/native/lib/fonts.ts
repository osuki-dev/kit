import { NotoSans_400Regular } from "@expo-google-fonts/noto-sans/400Regular";
import { NotoSans_500Medium } from "@expo-google-fonts/noto-sans/500Medium";
import { NotoSans_700Bold } from "@expo-google-fonts/noto-sans/700Bold";
import { NotoSansJP_400Regular } from "@expo-google-fonts/noto-sans-jp/400Regular";
import { NotoSansJP_500Medium } from "@expo-google-fonts/noto-sans-jp/500Medium";
import { NotoSansJP_700Bold } from "@expo-google-fonts/noto-sans-jp/700Bold";
import { NotoSansSC_400Regular } from "@expo-google-fonts/noto-sans-sc/400Regular";
import { NotoSansSC_500Medium } from "@expo-google-fonts/noto-sans-sc/500Medium";
import { NotoSansSC_700Bold } from "@expo-google-fonts/noto-sans-sc/700Bold";
import type { FontRegistry, FontSourceMap } from "@osuki-dev/ui";

export const appFontSources: FontSourceMap = {
	NotoSans_400Regular,
	NotoSans_500Medium,
	NotoSans_700Bold,
	NotoSansJP_400Regular,
	NotoSansJP_500Medium,
	NotoSansJP_700Bold,
	NotoSansSC_400Regular,
	NotoSansSC_500Medium,
	NotoSansSC_700Bold,
};

export const appFontRegistry: FontRegistry = {
	display: {
		regular: "NotoSansJP_400Regular",
		medium: "NotoSansJP_500Medium",
		bold: "NotoSansJP_700Bold",
	},
	body: {
		regular: "NotoSansSC_400Regular",
		medium: "NotoSansSC_500Medium",
		bold: "NotoSansSC_700Bold",
	},
	label: {
		regular: "NotoSans_400Regular",
		medium: "NotoSans_500Medium",
		bold: "NotoSans_700Bold",
	},
};
