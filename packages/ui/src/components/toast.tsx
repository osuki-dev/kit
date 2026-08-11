import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeOutUp, Layout } from "react-native-reanimated";
import { useThemeTokens, type ColorToken } from "../theme";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type ToastVariant = "info" | "success" | "warning" | "danger";
export type ToastPlacement = "top" | "bottom";

export interface ToastOptions {
	variant?: ToastVariant;
	title?: string;
	message: string;
	durationMs?: number;
	action?: {
		label: string;
		onPress: () => void;
	};
}

export interface ToastItem extends Required<Pick<ToastOptions, "variant" | "durationMs">> {
	id: string;
	title?: string;
	message: string;
	action?: ToastOptions["action"];
}

export interface ToastController {
	showToast: (toast: ToastOptions) => string;
	dismissToast: (id: string) => void;
	clearToasts: () => void;
}

export interface ToastProviderProps {
	children: ReactNode;
	placement?: ToastPlacement;
	maxToasts?: number;
	defaultDurationMs?: number;
}

const ToastContext = createContext<ToastController | undefined>(undefined);

interface ToastStore {
	controller: ToastController;
	getSnapshot: () => ToastItem[];
	subscribe: (listener: () => void) => () => void;
	updateOptions: (options: { maxToasts: number; defaultDurationMs: number }) => void;
	destroy: () => void;
}

function createToastStore(initialOptions: {
	maxToasts: number;
	defaultDurationMs: number;
}): ToastStore {
	let snapshot: ToastItem[] = [];
	let options = initialOptions;
	let counter = 0;
	const listeners = new Set<() => void>();
	const timeouts = new Map<string, ReturnType<typeof setTimeout>>();
	const emit = () => listeners.forEach((listener) => listener());
	const setSnapshot = (next: ToastItem[]) => {
		if (Object.is(snapshot, next)) return;
		snapshot = next;
		emit();
	};
	const dismissToast = (id: string) => {
		const timeout = timeouts.get(id);
		if (timeout) clearTimeout(timeout);
		timeouts.delete(id);
		const next = snapshot.filter((toast) => toast.id !== id);
		if (next.length !== snapshot.length) setSnapshot(next);
	};
	const clearToasts = () => {
		for (const timeout of timeouts.values()) clearTimeout(timeout);
		timeouts.clear();
		if (snapshot.length > 0) setSnapshot([]);
	};
	const showToast = (toast: ToastOptions) => {
		const id = `toast-${Date.now()}-${counter++}`;
		const durationMs = toast.durationMs ?? options.defaultDurationMs;
		const nextToast: ToastItem = {
			id,
			variant: toast.variant ?? "info",
			title: toast.title,
			message: toast.message,
			action: toast.action,
			durationMs,
		};
		const next = [nextToast, ...snapshot];
		for (const removed of next.slice(options.maxToasts)) {
			const timeout = timeouts.get(removed.id);
			if (timeout) clearTimeout(timeout);
			timeouts.delete(removed.id);
		}
		setSnapshot(next.slice(0, options.maxToasts));
		if (durationMs > 0)
			timeouts.set(
				id,
				setTimeout(() => dismissToast(id), durationMs),
			);
		return id;
	};
	return {
		controller: { showToast, dismissToast, clearToasts },
		getSnapshot: () => snapshot,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		updateOptions: (nextOptions) => {
			options = nextOptions;
		},
		destroy: () => {
			clearToasts();
			listeners.clear();
		},
	};
}

const toastTokens: Record<
	ToastVariant,
	{ icon: IconName; foreground: ColorToken; background: ColorToken }
> = {
	info: { icon: "Info", foreground: "info", background: "surface" },
	success: { icon: "CircleCheck", foreground: "success", background: "surface" },
	warning: { icon: "TriangleAlert", foreground: "warning", background: "surface" },
	danger: { icon: "CircleAlert", foreground: "danger", background: "surface" },
};

export const ToastProvider: React.FC<ToastProviderProps> = ({
	children,
	placement = "top",
	maxToasts = 3,
	defaultDurationMs = 3600,
}) => {
	const storeRef = useRef<ToastStore | null>(null);
	if (!storeRef.current) storeRef.current = createToastStore({ maxToasts, defaultDurationMs });
	const store = storeRef.current;
	store.updateOptions({ maxToasts, defaultDurationMs });

	useEffect(() => {
		return () => store.destroy();
	}, [store]);

	return (
		<ToastContext.Provider value={store.controller}>
			{children}
			<ToastViewport store={store} placement={placement} />
		</ToastContext.Provider>
	);
};

export function useToast(): ToastController {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used within a ToastProvider");
	return context;
}

interface ToastViewportProps {
	store: ToastStore;
	placement: ToastPlacement;
}

const ToastViewport: React.FC<ToastViewportProps> = ({ store, placement }) => {
	const theme = useThemeTokens();
	const insets = useSafeAreaInsets();
	const toasts = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
	const verticalOffset =
		placement === "top" ? insets.top + theme.spacing.md : insets.bottom + theme.spacing.md;

	const viewportStyle = useMemo<ViewStyle>(
		() => ({
			position: "absolute",
			left: theme.spacing.md,
			right: theme.spacing.md,
			...(placement === "top" ? { top: verticalOffset } : { bottom: verticalOffset }),
			gap: theme.spacing.sm,
			zIndex: 1000,
		}),
		[placement, theme.spacing, verticalOffset],
	);

	if (toasts.length === 0) return null;

	return (
		<View pointerEvents="box-none" style={viewportStyle}>
			{toasts.map((toast) => (
				<ToastCard key={toast.id} toast={toast} onDismiss={store.controller.dismissToast} />
			))}
		</View>
	);
};

interface ToastCardProps {
	toast: ToastItem;
	onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
	const theme = useThemeTokens();
	const tokens = toastTokens[toast.variant];

	return (
		<Animated.View
			entering={FadeInDown.duration(180)}
			exiting={FadeOutUp.duration(140)}
			layout={Layout.springify().damping(24).stiffness(280)}
			style={{
				width: "100%",
				flexDirection: "row",
				alignItems: "flex-start",
				gap: theme.spacing.sm,
				padding: theme.spacing.md,
				borderRadius: theme.radius.lg,
				backgroundColor: theme.colors[tokens.background],
				borderWidth: 1,
				borderColor: theme.colors.border,
				...(theme.mode === "light" ? theme.shadow.soft : {}),
			}}
		>
			<View style={{ paddingTop: 2 }}>
				<Icon name={tokens.icon} size={18} color={theme.colors[tokens.foreground]} />
			</View>
			<View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
				{toast.title && (
					<Text variant="bodySmall" weight="bold">
						{toast.title}
					</Text>
				)}
				<Text variant="bodySmall" colorKey="textMuted">
					{toast.message}
				</Text>
				{toast.action && (
					<Pressable
						accessibilityRole="button"
						onPress={toast.action.onPress}
						style={{ alignSelf: "flex-start", paddingTop: theme.spacing.xs }}
					>
						<Text variant="label" colorKey="primary">
							{toast.action.label}
						</Text>
					</Pressable>
				)}
			</View>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Dismiss notification"
				onPress={() => onDismiss(toast.id)}
				hitSlop={10}
				style={{
					width: 44,
					height: 44,
					alignItems: "center",
					justifyContent: "center",
					borderRadius: theme.radius.pill,
				}}
			>
				<Icon name="X" size={16} color={theme.colors.textMuted} />
			</Pressable>
		</Animated.View>
	);
};
