import { Platform, Pressable as ResponderPressable } from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";

/**
 * The Pressable the kit's press surfaces render.
 *
 * Android recognises presses natively: through React Native's responder system a
 * scrolled list can stop delivering presses. iOS keeps React Native's Pressable,
 * because react-native-gesture-handler 3.4 exposes its button to accessibility
 * twice there (the host view and the inner button both carry the label).
 */
export const PlatformPressable = (
	Platform.OS === "android" ? GesturePressable : ResponderPressable
) as typeof GesturePressable;
