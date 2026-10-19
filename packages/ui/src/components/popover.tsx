import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	Modal,
	Pressable,
	StyleSheet,
	View,
	useWindowDimensions,
	type PressableProps,
	type ViewProps,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useResolvedSurfaceFill, useThemeTokens } from "../theme";

export interface PopoverAnchor {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface PopoverState {
	open: boolean;
	anchor: PopoverAnchor | null;
}

export interface PopoverActions {
	openAt: (anchor: PopoverAnchor) => void;
	close: () => void;
}

export interface PopoverMeta {
	controlled: boolean;
}

export interface PopoverContextValue {
	state: PopoverState;
	actions: PopoverActions;
	meta: PopoverMeta;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopover(): PopoverContextValue {
	const context = useContext(PopoverContext);
	if (!context) {
		throw new Error("Popover parts must be used within Popover.Root");
	}
	return context;
}

export interface PopoverRootProps {
	children?: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function PopoverRoot({
	children,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
}: PopoverRootProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);
	const controlled = controlledOpen !== undefined;
	const open = controlled ? controlledOpen : uncontrolledOpen;

	const openAt = useCallback(
		(nextAnchor: PopoverAnchor) => {
			setAnchor(nextAnchor);
			if (!controlled) setUncontrolledOpen(true);
			onOpenChange?.(true);
		},
		[controlled, onOpenChange],
	);
	const close = useCallback(() => {
		if (!controlled) setUncontrolledOpen(false);
		onOpenChange?.(false);
	}, [controlled, onOpenChange]);

	const value = useMemo<PopoverContextValue>(
		() => ({
			state: { open, anchor },
			actions: { openAt, close },
			meta: { controlled },
		}),
		[anchor, close, controlled, open, openAt],
	);

	return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export function PopoverTrigger({ children, disabled, ...props }: PressableProps) {
	const { actions } = usePopover();
	return (
		<Pressable
			accessibilityRole="button"
			disabled={disabled}
			{...props}
			onPress={(event) => {
				props.onPress?.(event);
				const target = event.currentTarget as unknown as {
					measureInWindow?: (
						callback: (x: number, y: number, width: number, height: number) => void,
					) => void;
				};
				target.measureInWindow?.((x, y, width, height) => {
					actions.openAt({ x, y, width, height });
				});
			}}
		>
			{children}
		</Pressable>
	);
}

export interface PopoverContentProps extends ViewProps {
	children?: ReactNode;
	width?: number;
}

export function PopoverContent({ children, width = 280, style, ...props }: PopoverContentProps) {
	const theme = useThemeTokens();
	const popoverFill = useResolvedSurfaceFill(theme.colors.surface, {
		slot: "popovers.background",
		baseColor: theme.colors.surface,
	});
	const { state, actions } = usePopover();
	const window = useWindowDimensions();
	if (!state.open || !state.anchor) return null;

	const anchor = state.anchor;
	let top = anchor.y + anchor.height + theme.spacing.xs;
	const estimatedHeight = 220;
	if (top + estimatedHeight > window.height - theme.spacing.md) {
		top = Math.max(theme.spacing.md, anchor.y - estimatedHeight - theme.spacing.xs);
	}
	let left = anchor.x;
	if (left + width > window.width - theme.spacing.md) {
		left = window.width - theme.spacing.md - width;
	}
	if (left < theme.spacing.md) left = theme.spacing.md;

	return (
		<Modal
			transparent
			visible
			animationType="fade"
			onRequestClose={actions.close}
			statusBarTranslucent
		>
			{/* Android draws a Modal in its own window, which needs its own gesture root. */}
			<GestureHandlerRootView style={{ flex: 1 }}>
				<View style={styles.backdrop}>
					<Pressable style={StyleSheet.absoluteFill} onPress={actions.close} />
					<View
						style={[
							styles.content,
							{
								top,
								left,
								width,
								backgroundColor: popoverFill,
								borderColor: theme.colors.border,
								borderRadius: theme.radius.lg,
							},
							style,
						]}
						{...props}
					>
						{children}
					</View>
				</View>
			</GestureHandlerRootView>
		</Modal>
	);
}

export const Popover = Object.assign(PopoverRoot, {
	Root: PopoverRoot,
	Trigger: PopoverTrigger,
	Content: PopoverContent,
});

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
	},
	content: {
		position: "absolute",
		borderWidth: StyleSheet.hairlineWidth,
		padding: 12,
		maxWidth: "100%",
	},
});
