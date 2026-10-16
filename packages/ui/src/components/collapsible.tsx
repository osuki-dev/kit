import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { Pressable, View, type PressableProps, type ViewProps } from "react-native";
import { useHaptics } from "./haptics";

export interface CollapsibleState {
	open: boolean;
}

export interface CollapsibleActions {
	setOpen: (open: boolean) => void;
	toggle: () => void;
}

export interface CollapsibleMeta {
	controlled: boolean;
	disabled: boolean;
}

export interface CollapsibleContextValue {
	state: CollapsibleState;
	actions: CollapsibleActions;
	meta: CollapsibleMeta;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function useCollapsible(): CollapsibleContextValue {
	const context = useContext(CollapsibleContext);
	if (!context) {
		throw new Error("Collapsible parts must be used within Collapsible.Root");
	}
	return context;
}

export interface CollapsibleRootProps extends ViewProps {
	children?: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
}

export function CollapsibleRoot({
	children,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	disabled = false,
	...props
}: CollapsibleRootProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const controlled = controlledOpen !== undefined;
	const open = controlled ? controlledOpen : uncontrolledOpen;
	const setOpen = useCallback(
		(next: boolean) => {
			if (!controlled) setUncontrolledOpen(next);
			onOpenChange?.(next);
		},
		[controlled, onOpenChange],
	);
	const toggle = useCallback(() => {
		if (disabled) return;
		setOpen(!open);
	}, [disabled, open, setOpen]);
	const value = useMemo<CollapsibleContextValue>(
		() => ({
			state: { open },
			actions: { setOpen, toggle },
			meta: { controlled, disabled },
		}),
		[controlled, disabled, open, setOpen, toggle],
	);
	return (
		<CollapsibleContext.Provider value={value}>
			<View {...props}>{children}</View>
		</CollapsibleContext.Provider>
	);
}

export interface CollapsibleTriggerProps extends Omit<PressableProps, "onPress"> {
	children?: ReactNode;
}

export function CollapsibleTrigger({ children, disabled, ...props }: CollapsibleTriggerProps) {
	const { state, actions, meta } = useCollapsible();
	const haptics = useHaptics();
	const isDisabled = disabled || meta.disabled;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ expanded: state.open, disabled: isDisabled }}
			disabled={isDisabled}
			onPress={() => {
				haptics.feedback("selection");
				actions.toggle();
			}}
			{...props}
		>
			{children}
		</Pressable>
	);
}

export function CollapsibleContent({ children, ...props }: ViewProps) {
	const { state } = useCollapsible();
	if (!state.open) return null;
	return <View {...props}>{children}</View>;
}

export const Collapsible = Object.assign(CollapsibleRoot, {
	Root: CollapsibleRoot,
	Trigger: CollapsibleTrigger,
	Content: CollapsibleContent,
});
