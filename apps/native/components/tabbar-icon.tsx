import type { ColorValue } from "react-native";
import { Icon, type IconName } from "@osuki-dev/ui";

interface TabBarIconProps {
	name: IconName;
	color: ColorValue;
}

export const TabBarIcon = ({ name, color }: TabBarIconProps) => {
	return <Icon name={name} size={24} color={color} />;
};
