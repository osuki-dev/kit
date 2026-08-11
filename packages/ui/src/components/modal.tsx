import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	Modal as RNModal,
	Pressable,
	View,
	type ModalProps as RNModalProps,
	type PressableProps,
	type TextStyle,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";

export interface ModalState {
	open: boolean;
}

export interface ModalActions {
	setOpen: (open: boolean) => void;
	open: () => void;
	close: () => void;
}

export interface ModalMeta {
	controlled: boolean;
	disabled: boolean;
}

export interface ModalContextValue {
	state: ModalState;
	actions: ModalActions;
	meta: ModalMeta;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export interface ModalRootProps {
	children: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
}

export function ModalRoot({
	children,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	disabled = false,
}: ModalRootProps) {
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
	const openModal = useCallback(() => setOpen(true), [setOpen]);
	const closeModal = useCallback(() => setOpen(false), [setOpen]);
	const value = useMemo<ModalContextValue>(
		() => ({
			state: { open },
			actions: { setOpen, open: openModal, close: closeModal },
			meta: { controlled, disabled },
		}),
		[closeModal, controlled, disabled, open, openModal, setOpen],
	);
	return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal(): ModalContextValue {
	const context = useContext(ModalContext);
	if (!context) throw new Error("Modal components must be used within Modal.Root");
	return context;
}

export interface ModalTriggerProps extends PressableProps {
	children: ReactNode;
}

export function ModalTrigger({
	children,
	disabled,
	onPress,
	accessibilityState,
	...props
}: ModalTriggerProps) {
	const { state, actions, meta } = useModal();
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

export interface ModalContentProps extends Omit<
	RNModalProps,
	"visible" | "children" | "transparent" | "onRequestClose"
> {
	children: ReactNode;
	closeLabel?: string;
	contentStyle?: ViewStyle;
}

export function ModalContent({
	children,
	closeLabel = "Close",
	contentStyle,
	animationType = "none",
	...props
}: ModalContentProps) {
	const theme = useThemeTokens();
	const { state, actions } = useModal();
	const contentStyles = useMemo<ViewStyle>(
		() => ({
			width: "100%",
			maxWidth: 440,
			borderRadius: theme.radius.lg,
			padding: theme.spacing.lg,
			gap: theme.spacing.md,
			backgroundColor: theme.colors.surface,
			borderWidth: 1,
			borderColor: theme.colors.border,
			...(theme.mode === "light" ? theme.shadow.soft : {}),
		}),
		[theme.colors, theme.mode, theme.radius.lg, theme.shadow.soft, theme.spacing],
	);
	return (
		<RNModal
			visible={state.open}
			transparent
			animationType={animationType}
			onRequestClose={actions.close}
			statusBarTranslucent
			{...props}
		>
			<Animated.View
				entering={FadeIn.duration(160)}
				exiting={FadeOut.duration(120)}
				style={{
					flex: 1,
					backgroundColor: theme.components.Sheet.scrim,
					padding: theme.spacing.md,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={closeLabel}
					onPress={actions.close}
					style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
				/>
				<Animated.View entering={FadeInDown.duration(180)} style={[contentStyles, contentStyle]}>
					{children}
				</Animated.View>
			</Animated.View>
		</RNModal>
	);
}

export function ModalHeader({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return (
		<View
			style={[{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md }, style]}
			{...props}
		/>
	);
}

export function ModalHeaderText({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return <View style={[{ flex: 1, minWidth: 0, gap: theme.spacing.xs }, style]} {...props} />;
}

export interface ModalTextProps {
	children: ReactNode;
	style?: TextStyle;
}

export function ModalTitle({ children, style }: ModalTextProps) {
	return (
		<Text variant="subheading" style={style}>
			{children}
		</Text>
	);
}

export function ModalDescription({ children, style }: ModalTextProps) {
	return (
		<Text variant="bodySmall" colorKey="textMuted" style={style}>
			{children}
		</Text>
	);
}

export function ModalBody({ style, ...props }: ViewProps) {
	return <View style={[{ minWidth: 0 }, style]} {...props} />;
}

export function ModalFooter({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return <View style={[{ paddingTop: theme.spacing.sm }, style]} {...props} />;
}

export interface ModalCloseProps extends PressableProps {
	label?: string;
}

export function ModalClose({ label = "Close", style, onPress, ...props }: ModalCloseProps) {
	const theme = useThemeTokens();
	const { actions } = useModal();
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

export interface ModalProps extends Omit<ModalContentProps, "children"> {
	visible: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children?: ReactNode;
	footer?: ReactNode;
}

function ModalFacade({
	visible,
	onClose,
	title,
	description,
	children,
	footer,
	closeLabel = "Close",
	...contentProps
}: ModalProps) {
	return (
		<ModalRoot open={visible} onOpenChange={(open) => !open && onClose()}>
			<ModalContent closeLabel={closeLabel} {...contentProps}>
				<ModalHeader>
					<ModalHeaderText>
						{title ? <ModalTitle>{title}</ModalTitle> : null}
						{description ? <ModalDescription>{description}</ModalDescription> : null}
					</ModalHeaderText>
					<ModalClose label={closeLabel} />
				</ModalHeader>
				{children ? <ModalBody>{children}</ModalBody> : null}
				{footer ? <ModalFooter>{footer}</ModalFooter> : null}
			</ModalContent>
		</ModalRoot>
	);
}

export const Modal = Object.assign(ModalFacade, {
	Root: ModalRoot,
	Trigger: ModalTrigger,
	Content: ModalContent,
	Header: ModalHeader,
	HeaderText: ModalHeaderText,
	Title: ModalTitle,
	Description: ModalDescription,
	Body: ModalBody,
	Footer: ModalFooter,
	Close: ModalClose,
});
