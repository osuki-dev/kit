import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export type AccordionType = "single" | "multiple";

export interface AccordionState {
	openValues: string[];
}

export interface AccordionActions {
	toggle: (value: string) => void;
}

export interface AccordionMeta {
	type: AccordionType;
	disabled: boolean;
}

export interface AccordionContextValue {
	state: AccordionState;
	actions: AccordionActions;
	meta: AccordionMeta;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string | null>(null);

export function useAccordion(): AccordionContextValue {
	const context = useContext(AccordionContext);
	if (!context) {
		throw new Error("Accordion parts must be used within Accordion.Root");
	}
	return context;
}

export interface AccordionRootProps extends ViewProps {
	children?: ReactNode;
	type?: AccordionType;
	value?: string | string[];
	defaultValue?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	disabled?: boolean;
}

function toList(value: string | string[] | undefined): string[] {
	if (value === undefined) return [];
	if (Array.isArray(value)) return value;
	if (value.length === 0) return [];
	return [value];
}

export function AccordionRoot({
	children,
	type = "single",
	value: controlledValue,
	defaultValue,
	onValueChange,
	disabled = false,
	style,
	...props
}: AccordionRootProps) {
	const theme = useThemeTokens();
	const [uncontrolled, setUncontrolled] = useState(() => toList(defaultValue));
	const controlled = controlledValue !== undefined;
	const openValues = controlled ? toList(controlledValue) : uncontrolled;

	const toggle = useCallback(
		(item: string) => {
			if (disabled) return;
			const selected = openValues.includes(item);
			let next: string[];
			if (type === "multiple") {
				next = selected ? openValues.filter((entry) => entry !== item) : [...openValues, item];
			} else if (selected) {
				next = [];
			} else {
				next = [item];
			}
			if (!controlled) setUncontrolled(next);
			if (type === "multiple") {
				onValueChange?.(next);
				return;
			}
			onValueChange?.(next[0] ?? "");
		},
		[controlled, disabled, onValueChange, openValues, type],
	);

	const value = useMemo<AccordionContextValue>(
		() => ({
			state: { openValues },
			actions: { toggle },
			meta: { type, disabled },
		}),
		[disabled, openValues, toggle, type],
	);

	return (
		<AccordionContext.Provider value={value}>
			<View style={[styles.root, { borderColor: theme.colors.border }, style]} {...props}>
				{children}
			</View>
		</AccordionContext.Provider>
	);
}

export interface AccordionItemProps extends ViewProps {
	value: string;
	children?: ReactNode;
	disabled?: boolean;
}

const AccordionItemDisabled = createContext(false);

export function AccordionItem({ value, disabled = false, children, style, ...props }: AccordionItemProps) {
	const theme = useThemeTokens();
	return (
		<AccordionItemContext.Provider value={value}>
			<AccordionItemDisabled.Provider value={disabled}>
				<View style={[styles.item, { borderBottomColor: theme.colors.border }, style]} {...props}>
					{children}
				</View>
			</AccordionItemDisabled.Provider>
		</AccordionItemContext.Provider>
	);
}

export function AccordionTrigger({ children }: { children?: ReactNode }) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const item = useContext(AccordionItemContext);
	const itemDisabled = useContext(AccordionItemDisabled);
	const { state, actions, meta } = useAccordion();
	if (!item) {
		throw new Error("Accordion.Trigger must be used within Accordion.Item");
	}
	const open = state.openValues.includes(item);
	const disabled = meta.disabled || itemDisabled;
	let rotation = "0deg";
	if (open) rotation = "180deg";
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ expanded: open, disabled }}
			disabled={disabled}
			onPress={() => {
				haptics.feedback("selection");
				actions.toggle(item);
			}}
			style={({ pressed }) => [
				styles.trigger,
				pressed && !disabled ? { backgroundColor: theme.colors.surfaceRaised } : null,
			]}
		>
			<View style={styles.triggerLabel}>
				{typeof children === "string" ? (
					<Text variant="body" colorKey="text">
						{children}
					</Text>
				) : (
					children
				)}
			</View>
			<View style={{ transform: [{ rotate: rotation }] }}>
				<Icon name="ChevronDown" size={18} color={theme.colors.textMuted} />
			</View>
		</Pressable>
	);
}

export function AccordionContent({ children, style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	const item = useContext(AccordionItemContext);
	const { state } = useAccordion();
	if (!item || !state.openValues.includes(item)) return null;
	return (
		<View style={[styles.content, { paddingBottom: theme.spacing.md }, style]} {...props}>
			{children}
		</View>
	);
}

export const Accordion = Object.assign(AccordionRoot, {
	Root: AccordionRoot,
	Item: AccordionItem,
	Trigger: AccordionTrigger,
	Content: AccordionContent,
});

const styles = StyleSheet.create({
	root: {
		width: "100%",
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	item: {
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	trigger: {
		minHeight: 48,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	triggerLabel: {
		flex: 1,
		minWidth: 0,
	},
	content: {
		paddingBottom: 12,
	},
});
