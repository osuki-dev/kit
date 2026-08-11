import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { Pressable, View, type PressableProps, type TextStyle, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Button, type ButtonProps, type ButtonVariant } from "./button";
import { useHaptics } from "./haptics";
import { Icon, type IconName } from "./icon";
import { Modal, type ModalProps } from "./modal";
import { Text } from "./text";

export type DialogTone = "default" | "success" | "warning" | "danger";
export type DialogActionTone = "default" | "primary" | "destructive";

export interface DialogState {
	open: boolean;
}

export interface DialogActions {
	setOpen: (open: boolean) => void;
	open: () => void;
	close: () => void;
}

export interface DialogMeta {
	controlled: boolean;
	disabled: boolean;
	tone: DialogTone;
}

export interface DialogContextValue {
	state: DialogState;
	actions: DialogActions;
	meta: DialogMeta;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export interface DialogRootProps {
	children: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
	tone?: DialogTone;
}

export function DialogRoot({
	children,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	disabled = false,
	tone = "default",
}: DialogRootProps) {
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
	const openDialog = useCallback(() => setOpen(true), [setOpen]);
	const closeDialog = useCallback(() => setOpen(false), [setOpen]);
	const value = useMemo<DialogContextValue>(
		() => ({
			state: { open },
			actions: { setOpen, open: openDialog, close: closeDialog },
			meta: { controlled, disabled, tone },
		}),
		[closeDialog, controlled, disabled, open, openDialog, setOpen, tone],
	);

	return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function useDialog(): DialogContextValue {
	const context = useContext(DialogContext);
	if (!context) throw new Error("Dialog components must be used within Dialog.Root");
	return context;
}

export interface DialogTriggerProps extends PressableProps {
	children: ReactNode;
}

export function DialogTrigger({
	children,
	disabled,
	onPress,
	accessibilityState,
	...props
}: DialogTriggerProps) {
	const { state, actions, meta } = useDialog();
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

export interface DialogContentProps extends Omit<
	ModalProps,
	"visible" | "onClose" | "title" | "description" | "footer"
> {
	children: ReactNode;
}

export function DialogContent({ children, contentStyle, ...props }: DialogContentProps) {
	const theme = useThemeTokens();
	const { state, actions } = useDialog();
	return (
		<Modal
			visible={state.open}
			onClose={actions.close}
			contentStyle={{ gap: theme.spacing.lg, ...contentStyle }}
			{...props}
		>
			<View style={{ gap: theme.spacing.md }}>{children}</View>
		</Modal>
	);
}

export function DialogHeader({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return (
		<View
			style={[{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md }, style]}
			{...props}
		/>
	);
}

export interface DialogIconProps extends ViewProps {
	name?: IconName;
}

export function DialogIcon({ name, style, ...props }: DialogIconProps) {
	const theme = useThemeTokens();
	const { meta } = useDialog();
	const colors = dialogToneColors(meta.tone, theme.colors);
	return (
		<View
			style={[
				{
					width: 44,
					height: 44,
					borderRadius: theme.radius.pill,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: colors.background,
				},
				style,
			]}
			{...props}
		>
			<Icon name={name ?? defaultIcon(meta.tone)} size={21} color={colors.icon} />
		</View>
	);
}

export function DialogHeaderText({ style, ...props }: ViewProps) {
	const theme = useThemeTokens();
	return <View style={[{ flex: 1, minWidth: 0, gap: theme.spacing.xs }, style]} {...props} />;
}

export interface DialogTextProps {
	children: ReactNode;
	style?: TextStyle;
}

export function DialogTitle({ children, style }: DialogTextProps) {
	return (
		<Text variant="subheading" colorKey="text" selectable style={style}>
			{children}
		</Text>
	);
}

export function DialogDescription({ children, style }: DialogTextProps) {
	return (
		<Text variant="bodySmall" colorKey="textMuted" selectable style={style}>
			{children}
		</Text>
	);
}

export function DialogBody({ style, ...props }: ViewProps) {
	return <View style={[{ minWidth: 0 }, style]} {...props} />;
}

export interface DialogActionGroupProps extends ViewProps {
	layout?: "row" | "column";
}

export function DialogActionGroup({ layout = "row", style, ...props }: DialogActionGroupProps) {
	const theme = useThemeTokens();
	return (
		<View
			style={[
				{
					flexDirection: layout,
					gap: theme.spacing.sm,
					justifyContent: "flex-end",
				},
				style,
			]}
			{...props}
		/>
	);
}

export interface DialogButtonProps extends ButtonProps {
	onPress?: ButtonProps["onPress"];
}

export function DialogActionButton({
	onPress,
	variant = "secondary",
	...props
}: DialogButtonProps) {
	const haptics = useHaptics();
	return (
		<Button
			variant={variant}
			onPress={(event) => {
				haptics.feedback(variant === "destructive" ? "warning" : "selection");
				onPress?.(event);
			}}
			{...props}
		/>
	);
}

export function DialogClose({ onPress, variant = "secondary", ...props }: DialogButtonProps) {
	const haptics = useHaptics();
	const { actions } = useDialog();
	return (
		<Button
			variant={variant}
			onPress={(event) => {
				haptics.feedback(variant === "destructive" ? "warning" : "selection");
				onPress?.(event);
				if (!event.defaultPrevented) actions.close();
			}}
			{...props}
		/>
	);
}

export interface DialogAction {
	id: string;
	label: string;
	tone?: DialogActionTone;
	disabled?: boolean;
	dismissBehavior?: "close" | "keep-open";
	onPress?: () => void;
}

export interface DialogProps extends Omit<
	ModalProps,
	"title" | "description" | "children" | "footer"
> {
	title: string;
	message?: string;
	icon?: IconName;
	tone?: DialogTone;
	actions?: DialogAction[];
	children?: ReactNode;
	actionLayout?: "row" | "column";
}

function DialogFacade({
	visible,
	onClose,
	title,
	message,
	icon,
	tone = "default",
	actions = [{ id: "cancel", label: "Cancel", dismissBehavior: "close" }],
	children,
	actionLayout = "row",
	testID,
	...modalProps
}: DialogProps) {
	return (
		<DialogRoot open={visible} onOpenChange={(open) => !open && onClose()} tone={tone}>
			<DialogContent testID={testID} {...modalProps}>
				<DialogHeader>
					<DialogIcon name={icon} />
					<DialogHeaderText>
						<DialogTitle>{title}</DialogTitle>
						{message ? <DialogDescription>{message}</DialogDescription> : null}
					</DialogHeaderText>
				</DialogHeader>
				{children ? <DialogBody>{children}</DialogBody> : null}
				<DialogActionGroup layout={actionLayout}>
					{actions.map((action) => {
						const Action =
							action.dismissBehavior === "keep-open" ? DialogActionButton : DialogClose;
						return (
							<Action
								key={action.id}
								variant={actionVariant(action.tone)}
								disabled={action.disabled}
								onPress={action.onPress}
								testID={testID ? `${testID}-action-${action.id}` : undefined}
							>
								{action.label}
							</Action>
						);
					})}
				</DialogActionGroup>
			</DialogContent>
		</DialogRoot>
	);
}

function actionVariant(tone: DialogActionTone | undefined): ButtonVariant {
	if (tone === "primary") return "primary";
	if (tone === "destructive") return "destructive";
	return "secondary";
}

function defaultIcon(tone: DialogTone): IconName {
	if (tone === "success") return "CheckCircle2";
	if (tone === "warning") return "TriangleAlert";
	if (tone === "danger") return "CircleAlert";
	return "Info";
}

function dialogToneColors(tone: DialogTone, colors: ReturnType<typeof useThemeTokens>["colors"]) {
	if (tone === "success") return { icon: colors.success, background: colors.primarySubtle };
	if (tone === "warning") return { icon: colors.warning, background: colors.primarySubtle };
	if (tone === "danger") return { icon: colors.danger, background: colors.dangerSubtle };
	return { icon: colors.primary, background: colors.primarySubtle };
}

export const Dialog = Object.assign(DialogFacade, {
	Root: DialogRoot,
	Trigger: DialogTrigger,
	Content: DialogContent,
	Header: DialogHeader,
	Icon: DialogIcon,
	HeaderText: DialogHeaderText,
	Title: DialogTitle,
	Description: DialogDescription,
	Body: DialogBody,
	Actions: DialogActionGroup,
	Action: DialogActionButton,
	Close: DialogClose,
});
