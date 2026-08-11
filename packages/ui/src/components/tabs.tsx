import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { Pressable, View, type PressableProps, type ViewProps, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { useHaptics } from "./haptics";
import { Text } from "./text";

export type TabsVariant = "underline" | "pill";
export type TabsSize = "default" | "compact";

export interface TabsState {
	value: string;
}

export interface TabsActions {
	setValue: (value: string) => void;
}

export interface TabsMeta {
	controlled: boolean;
	variant: TabsVariant;
	size: TabsSize;
}

export interface TabsContextValue {
	state: TabsState;
	actions: TabsActions;
	meta: TabsMeta;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);
const TabsTriggerContext = createContext(false);

export interface TabsRootProps {
	children: ReactNode;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	variant?: TabsVariant;
	size?: TabsSize;
}

export function TabsRoot({
	children,
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	variant = "underline",
	size = "default",
}: TabsRootProps) {
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
	const controlled = controlledValue !== undefined;
	const value = controlledValue ?? uncontrolledValue;
	const setValue = useCallback(
		(nextValue: string) => {
			if (!controlled) setUncontrolledValue(nextValue);
			onValueChange?.(nextValue);
		},
		[controlled, onValueChange],
	);
	const contextValue = useMemo<TabsContextValue>(
		() => ({
			state: { value },
			actions: { setValue },
			meta: { controlled, variant, size },
		}),
		[controlled, setValue, size, value, variant],
	);
	return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
}

export function useTabs(): TabsContextValue {
	const context = useContext(TabsContext);
	if (!context) throw new Error("Tabs components must be used within Tabs.Root");
	return context;
}

export function TabsList({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	const { meta } = useTabs();
	const listStyle = useMemo<ViewStyle>(
		() => ({
			flexDirection: "row",
			alignItems: "center",
			gap: meta.variant === "pill" ? theme.spacing.xs : 0,
			borderBottomWidth: meta.variant === "underline" ? 1 : 0,
			borderBottomColor: theme.colors.border,
			backgroundColor: meta.variant === "pill" ? theme.colors.surfaceRaised : "transparent",
			borderRadius: meta.variant === "pill" ? theme.radius.pill : 0,
			padding: meta.variant === "pill" ? theme.spacing.xs : 0,
		}),
		[meta.variant, theme.colors, theme.radius.pill, theme.spacing.xs],
	);
	return <View accessibilityRole="tablist" style={[listStyle, style]} {...props} />;
}

export interface TabsTriggerProps extends Omit<PressableProps, "children"> {
	value: string;
	children: ReactNode;
	disabled?: boolean;
}

export function TabsTrigger({
	value,
	children,
	disabled = false,
	style,
	onPress,
	...props
}: TabsTriggerProps) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const { state, actions, meta } = useTabs();
	const selected = state.value === value;
	const triggerStyle = useMemo<ViewStyle>(
		() => ({
			minHeight: meta.size === "compact" ? 40 : 48,
			flex: 1,
			minWidth: 0,
			alignItems: "center",
			justifyContent: "center",
			flexDirection: "row",
			gap: theme.spacing.xs,
			paddingHorizontal: theme.spacing.sm,
			borderRadius: meta.variant === "pill" ? theme.radius.pill : 0,
			backgroundColor: meta.variant === "pill" && selected ? theme.colors.surface : "transparent",
			borderBottomWidth: meta.variant === "underline" && selected ? 2 : 0,
			borderBottomColor: theme.colors.primary,
			opacity: disabled ? 0.44 : 1,
		}),
		[disabled, meta, selected, theme.colors, theme.radius.pill, theme.spacing],
	);
	return (
		<Pressable
			accessibilityRole="tab"
			accessibilityState={{ selected, disabled }}
			disabled={disabled}
			onPress={(event) => {
				onPress?.(event);
				if (event.defaultPrevented) return;
				haptics.feedback("selection");
				actions.setValue(value);
			}}
			style={(state) => [
				triggerStyle,
				state.pressed && !disabled ? { opacity: 0.72 } : undefined,
				typeof style === "function" ? style(state) : style,
			]}
			{...props}
		>
			<TabsTriggerContext.Provider value={selected}>{children}</TabsTriggerContext.Provider>
		</Pressable>
	);
}

export interface TabsLabelProps {
	children: ReactNode;
}

export function TabsLabel({ children }: TabsLabelProps) {
	const theme = useThemeTokens();
	const selected = useContext(TabsTriggerContext);
	return (
		<Text
			variant="label"
			color={selected ? theme.colors.text : theme.colors.textMuted}
			transform="uppercase"
			numberOfLines={1}
			adjustsFontSizeToFit
			minimumFontScale={0.72}
		>
			{children}
		</Text>
	);
}

export interface TabsBadgeProps {
	children: ReactNode;
}

export function TabsBadge({ children }: TabsBadgeProps) {
	const theme = useThemeTokens();
	const selected = useContext(TabsTriggerContext);
	return (
		<View
			style={{
				minWidth: 18,
				height: 18,
				borderRadius: theme.radius.pill,
				paddingHorizontal: theme.spacing.xs,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: selected ? theme.colors.primary : theme.colors.borderStrong,
			}}
		>
			<Text variant="caption" colorKey="onPrimary" numberOfLines={1}>
				{children}
			</Text>
		</View>
	);
}

export interface TabOption {
	label: string;
	value: string;
	disabled?: boolean;
	badge?: string | number;
}

export interface TabsProps extends Omit<ViewProps, "style" | "children"> {
	options: TabOption[];
	value: string;
	onChange: (value: string) => void;
	variant?: TabsVariant;
	size?: TabsSize;
	style?: ViewStyle;
}

function TabsFacade({
	options,
	value,
	onChange,
	variant = "underline",
	size = "default",
	style,
	testID,
	...props
}: TabsProps) {
	return (
		<TabsRoot value={value} onValueChange={onChange} variant={variant} size={size}>
			<TabsList style={style} testID={testID} {...props}>
				{options.map((option) => (
					<TabsTrigger
						key={option.value}
						value={option.value}
						disabled={option.disabled}
						testID={testID ? `${testID}-tab-${option.value}` : undefined}
					>
						<TabsLabel>{option.label}</TabsLabel>
						{option.badge !== undefined ? <TabsBadge>{option.badge}</TabsBadge> : null}
					</TabsTrigger>
				))}
			</TabsList>
		</TabsRoot>
	);
}

export const Tabs = Object.assign(TabsFacade, {
	Root: TabsRoot,
	List: TabsList,
	Trigger: TabsTrigger,
	Label: TabsLabel,
	Badge: TabsBadge,
});
