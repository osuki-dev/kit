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
	useWindowDimensions,
	View,
	type ModalProps,
	type PressableProps,
	type TextStyle,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";

export interface SheetState {
	open: boolean;
}

export interface SheetActions {
	setOpen: (open: boolean) => void;
	open: () => void;
	close: () => void;
}

export interface SheetMeta {
	controlled: boolean;
	disabled: boolean;
}

export interface SheetContextValue {
	state: SheetState;
	actions: SheetActions;
	meta: SheetMeta;
}

const SheetContext = createContext<SheetContextValue | undefined>(undefined);

export interface SheetRootProps {
	children: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
}

export function SheetRoot({
	children,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	disabled = false,
}: SheetRootProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const controlled = controlledOpen !== undefined;
	const open = controlledOpen ?? uncontrolledOpen;

	const setOpen = useCallback(
		(nextOpen: boolean) => {
			if (disabled && nextOpen) return;
			if (!controlled) setUncontrolledOpen(nextOpen);
			onOpenChange?.(nextOpen);
		},
		[controlled, disabled, onOpenChange],
	);
	const openSheet = useCallback(() => setOpen(true), [setOpen]);
	const closeSheet = useCallback(() => setOpen(false), [setOpen]);
	const value = useMemo<SheetContextValue>(
		() => ({
			state: { open },
			actions: { setOpen, open: openSheet, close: closeSheet },
			meta: { controlled, disabled },
		}),
		[closeSheet, controlled, disabled, open, openSheet, setOpen],
	);

	return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function useSheet(): SheetContextValue {
	const context = useContext(SheetContext);
	if (!context) throw new Error("Sheet components must be used within Sheet.Root");
	return context;
}

export interface SheetTriggerProps extends PressableProps {
	children: ReactNode;
}

export function SheetTrigger({
	children,
	disabled,
	onPress,
	accessibilityState,
	...props
}: SheetTriggerProps) {
	const { state, actions, meta } = useSheet();
	const isDisabled = meta.disabled || disabled === true;

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ ...accessibilityState, expanded: state.open, disabled: isDisabled }}
			disabled={isDisabled}
			onPress={(event) => {
				onPress?.(event);
				if (!event.defaultPrevented) actions.open();
			}}
			{...props}
		>
			{children}
		</Pressable>
	);
}

export interface SheetContentProps extends Omit<
	ModalProps,
	"visible" | "children" | "transparent" | "onRequestClose"
> {
	children: ReactNode;
	closeLabel?: string;
	contentStyle?: ViewStyle;
	maxHeight?: number | `${number}%`;
	bottomInset?: number;
}

export function SheetContent({
	children,
	closeLabel = "Close sheet",
	contentStyle,
	maxHeight,
	bottomInset,
	animationType = "none",
	...props
}: SheetContentProps) {
	const theme = useThemeTokens();
	const { state, actions } = useSheet();
	const insets = useSafeAreaInsets();
	const window = useWindowDimensions();
	const sheet = theme.components.Sheet;
	const sheetStyle = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			maxHeight:
				maxHeight ??
				Math.max(360, window.height - insets.top - theme.spacing[sheet.maxHeightOffset]),
			borderTopLeftRadius: theme.radius[sheet.radius],
			borderTopRightRadius: theme.radius[sheet.radius],
			paddingHorizontal: theme.spacing[sheet.paddingX],
			paddingTop: theme.spacing[sheet.paddingTop],
			paddingBottom: bottomInset ?? Math.max(insets.bottom, theme.spacing[sheet.paddingBottom]),
			gap: theme.spacing.md,
			backgroundColor: theme.colors[sheet.background],
			borderTopWidth: 1,
			borderColor: theme.colors.border,
		}),
		[
			bottomInset,
			insets.bottom,
			insets.top,
			maxHeight,
			sheet,
			theme.colors,
			theme.radius,
			theme.spacing,
			window.height,
		],
	);

	return (
		<Modal
			visible={state.open}
			transparent
			animationType={animationType}
			onRequestClose={actions.close}
			statusBarTranslucent
			navigationBarTranslucent
			{...props}
		>
			<Animated.View
				entering={FadeIn.duration(140)}
				exiting={FadeOut.duration(120)}
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					zIndex: 1000,
					elevation: 1000,
					justifyContent: "flex-end",
					backgroundColor: sheet.scrim,
				}}
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={closeLabel}
					onPress={actions.close}
					style={{ flex: 1 }}
				/>
				<Animated.View style={[{ zIndex: 1001, elevation: 1001 }, sheetStyle, contentStyle]}>
					{children}
				</Animated.View>
			</Animated.View>
		</Modal>
	);
}

export function SheetHandle(props: ViewProps) {
	const theme = useThemeTokens();
	const sheet = theme.components.Sheet;
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no"
			{...props}
			style={[
				{
					alignSelf: "center",
					width: 44,
					height: 4,
					borderRadius: theme.radius.pill,
					backgroundColor: theme.colors[sheet.handle],
				},
				props.style,
			]}
		/>
	);
}

export function SheetHeader({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return (
		<View
			style={[{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md }, style]}
			{...props}
		/>
	);
}

export function SheetHeaderText({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return <View style={[{ flex: 1, minWidth: 0, gap: theme.spacing.xs }, style]} {...props} />;
}

export interface SheetTitleProps {
	children: ReactNode;
	style?: TextStyle;
}

export function SheetTitle({ children, style }: SheetTitleProps) {
	return (
		<Text variant="subheading" style={style}>
			{children}
		</Text>
	);
}

export function SheetDescription({ children, style }: SheetTitleProps) {
	return (
		<Text variant="bodySmall" colorKey="textMuted" style={style}>
			{children}
		</Text>
	);
}

export function SheetBody({ style, ...props }: ViewProps) {
	return <View style={[{ minWidth: 0, flexShrink: 1 }, style]} {...props} />;
}

export function SheetFooter({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return <View style={[{ paddingTop: theme.spacing.sm }, style]} {...props} />;
}

export interface SheetCloseProps extends PressableProps {
	label?: string;
}

export function SheetClose({ label = "Close sheet", style, onPress, ...props }: SheetCloseProps) {
	const theme = useThemeTokens();
	const { actions } = useSheet();
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			onPress={(event) => {
				onPress?.(event);
				if (!event.defaultPrevented) actions.close();
			}}
			style={(state) => [
				{
					width: 44,
					height: 44,
					alignItems: "center",
					justifyContent: "center",
					borderRadius: theme.radius.pill,
					backgroundColor: state.pressed ? theme.colors.border : theme.colors.surfaceRaised,
				},
				typeof style === "function" ? style(state) : style,
			]}
			{...props}
		>
			<Icon name="X" size={18} color={theme.colors.textMuted} />
		</Pressable>
	);
}

export const Sheet = {
	Root: SheetRoot,
	Trigger: SheetTrigger,
	Content: SheetContent,
	Handle: SheetHandle,
	Header: SheetHeader,
	HeaderText: SheetHeaderText,
	Title: SheetTitle,
	Description: SheetDescription,
	Body: SheetBody,
	Footer: SheetFooter,
	Close: SheetClose,
} as const;

export interface BottomSheetProps extends Omit<SheetContentProps, "children"> {
	visible: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children?: ReactNode;
	footer?: ReactNode;
	bodyStyle?: ViewStyle;
}

export function BottomSheet({
	visible,
	onClose,
	title,
	description,
	children,
	footer,
	closeLabel = "Close sheet",
	bodyStyle,
	...contentProps
}: BottomSheetProps) {
	return (
		<SheetRoot open={visible} onOpenChange={(open) => !open && onClose()}>
			<SheetContent closeLabel={closeLabel} {...contentProps}>
				<SheetHandle />
				{title || description ? (
					<SheetHeader>
						<SheetHeaderText>
							{title ? <SheetTitle>{title}</SheetTitle> : null}
							{description ? <SheetDescription>{description}</SheetDescription> : null}
						</SheetHeaderText>
						<SheetClose label={closeLabel} />
					</SheetHeader>
				) : null}
				<SheetBody style={bodyStyle}>{children}</SheetBody>
				{footer ? <SheetFooter>{footer}</SheetFooter> : null}
			</SheetContent>
		</SheetRoot>
	);
}
