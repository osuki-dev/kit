import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	View,
	type GestureResponderEvent,
	type StyleProp,
	type TextInputContentSizeChangeEvent,
	type TextInputKeyPressEvent,
	type TextInputProps,
	type TextStyle,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import {
	readStringFill,
	useResolvedSurfaceFill,
	useSurfaceDecorator,
	useThemeTokens,
	withoutStringFill,
	type SurfaceMeta,
} from "../theme";
import { TextField } from "../utils/text-field";
import { Icon } from "./icon";
import { Spinner } from "./spinner";
import { SurfaceDecoration } from "./surface-decoration";

export interface PromptInputState {
	value: string;
	focused: boolean;
}

export interface PromptInputActionHandlers {
	setValue: (value: string) => void;
	setFocused: (focused: boolean) => void;
	submit: () => void;
	clear: () => void;
}

export type PromptInputActionsType = PromptInputActionHandlers;

export interface PromptInputMeta {
	controlled: boolean;
	disabled: boolean;
	loading: boolean;
}

export interface PromptInputContextValue {
	state: PromptInputState;
	actions: PromptInputActionHandlers;
	meta: PromptInputMeta;
}

const PromptInputContext = createContext<PromptInputContextValue | undefined>(undefined);

export function usePromptInput(): PromptInputContextValue {
	const context = useContext(PromptInputContext);
	if (!context) {
		throw new Error("PromptInput subcomponents must be used within PromptInput.Root");
	}
	return context;
}

export interface PromptInputRootProps extends ViewProps {
	children?: ReactNode;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	onSubmit?: (value: string) => void;
	disabled?: boolean;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function PromptInputRoot({
	children,
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	onSubmit,
	disabled = false,
	loading = false,
	style,
	...props
}: PromptInputRootProps) {
	const theme = useThemeTokens();
	const decorator = useSurfaceDecorator();
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
	const [focused, setFocused] = useState(false);

	const controlled = controlledValue !== undefined;
	const value = controlled ? controlledValue : uncontrolledValue;

	const setValue = useCallback(
		(nextValue: string) => {
			if (!controlled) {
				setUncontrolledValue(nextValue);
			}
			onValueChange?.(nextValue);
		},
		[controlled, onValueChange],
	);

	const clear = useCallback(() => {
		setValue("");
	}, [setValue]);

	const submit = useCallback(() => {
		if (disabled || loading) return;
		const trimmed = value.trim();
		if (!trimmed) return;
		onSubmit?.(trimmed);
	}, [disabled, loading, onSubmit, value]);

	const fillOverride = readStringFill(style);
	const baseColor = fillOverride ?? theme.colors.surface;
	const surfaceMeta = useMemo<SurfaceMeta>(
		() => ({
			slot: "prompt.background",
			variant: "composer",
			baseColor,
			disabled,
			borderRadius: theme.radius.lg,
		}),
		[baseColor, disabled, theme.radius.lg],
	);
	const fill = useResolvedSurfaceFill(baseColor, surfaceMeta);

	const contextValue = useMemo<PromptInputContextValue>(
		() => ({
			state: { value, focused },
			actions: { setValue, setFocused, submit, clear },
			meta: { controlled, disabled, loading },
		}),
		[clear, controlled, disabled, focused, loading, setValue, submit, value],
	);

	return (
		<PromptInputContext.Provider value={contextValue}>
			<View
				style={[
					styles.root,
					{
						position: "relative",
						backgroundColor: fill,
						borderColor: focused ? theme.colors.borderStrong : theme.colors.border,
						borderRadius: theme.radius.lg,
						overflow: "hidden",
					},
					withoutStringFill(style),
				]}
				{...props}
			>
				{decorator?.renderDecoration ? (
					<View collapsable pointerEvents="none" style={StyleSheet.absoluteFill}>
						<SurfaceDecoration {...surfaceMeta} />
					</View>
				) : null}
				{children}
			</View>
		</PromptInputContext.Provider>
	);
}

export interface PromptInputTextareaProps extends Omit<
	TextInputProps,
	"value" | "onChangeText" | "multiline" | "style"
> {
	minRows?: number;
	maxRows?: number;
	minHeight?: number;
	maxHeight?: number;
	style?: StyleProp<TextStyle>;
}

export function PromptInputTextarea({
	minRows = 2,
	maxRows = 6,
	minHeight: explicitMinHeight,
	maxHeight: explicitMaxHeight,
	placeholder = "Ask anything or describe what to do...",
	style,
	onFocus,
	onBlur,
	onKeyPress,
	...props
}: PromptInputTextareaProps) {
	const theme = useThemeTokens();
	const { state, actions, meta } = usePromptInput();

	const calculatedMinHeight = explicitMinHeight ?? Math.max(36, minRows * 22);
	const calculatedMaxHeight = explicitMaxHeight ?? Math.max(calculatedMinHeight, maxRows * 22);

	const [inputHeight, setInputHeight] = useState(calculatedMinHeight);

	const handleContentSizeChange = useCallback(
		(event: TextInputContentSizeChangeEvent) => {
			const height = event.nativeEvent.contentSize.height;
			setInputHeight(Math.max(calculatedMinHeight, Math.min(calculatedMaxHeight, height)));
		},
		[calculatedMaxHeight, calculatedMinHeight],
	);

	const handleFocus: TextInputProps["onFocus"] = useCallback(
		(event) => {
			actions.setFocused(true);
			onFocus?.(event);
		},
		[actions, onFocus],
	);

	const handleBlur: TextInputProps["onBlur"] = useCallback(
		(event) => {
			actions.setFocused(false);
			onBlur?.(event);
		},
		[actions, onBlur],
	);

	const handleKeyPress = useCallback(
		(event: TextInputKeyPressEvent) => {
			onKeyPress?.(event);
			if (Platform.OS === "web") {
				const nativeEvent = event.nativeEvent as unknown as KeyboardEvent;
				if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
					nativeEvent.preventDefault?.();
					actions.submit();
				}
			}
		},
		[actions, onKeyPress],
	);

	return (
		<TextField
			editable={!meta.disabled}
			multiline
			value={state.value}
			onChangeText={actions.setValue}
			onContentSizeChange={handleContentSizeChange}
			onFocus={handleFocus}
			onBlur={handleBlur}
			onKeyPress={handleKeyPress}
			placeholder={placeholder}
			placeholderTextColor={theme.colors.textMuted}
			style={[
				styles.textarea,
				{
					color: theme.colors.text,
					minHeight: calculatedMinHeight,
					maxHeight: calculatedMaxHeight,
					height: inputHeight,
				},
				style,
			]}
			{...props}
		/>
	);
}

export interface PromptInputActionsProps {
	children?: ReactNode;
	style?: StyleProp<ViewStyle>;
}

export function PromptInputActions({ children, style }: PromptInputActionsProps) {
	return <View style={[styles.actions, style]}>{children}</View>;
}

export interface PromptInputAttachmentSlotProps {
	children?: ReactNode;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

export function PromptInputAttachmentSlot({
	children,
	onPress,
	style,
}: PromptInputAttachmentSlotProps) {
	const theme = useThemeTokens();
	const { meta } = usePromptInput();

	if (children !== undefined) {
		return <View style={[styles.attachmentSlot, style]}>{children}</View>;
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel="Add attachment"
			disabled={meta.disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.attachButton,
				{
					backgroundColor: pressed ? theme.colors.surfaceRaised : "transparent",
					borderRadius: theme.radius.sm,
				},
				style,
			]}
		>
			<Icon name="Paperclip" size={17} color={theme.colors.textMuted} />
		</Pressable>
	);
}

export interface PromptInputSubmitButtonProps {
	children?: ReactNode;
	allowEmpty?: boolean;
	onPress?: () => void;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function PromptInputSubmitButton({
	children,
	allowEmpty = false,
	onPress,
	disabled: explicitDisabled,
	style,
}: PromptInputSubmitButtonProps) {
	const theme = useThemeTokens();
	const { state, actions, meta } = usePromptInput();

	const isValueEmpty = !state.value.trim();
	const isDisabled =
		explicitDisabled ?? (meta.disabled || meta.loading || (!allowEmpty && isValueEmpty));

	const handlePress = useCallback(() => {
		if (isDisabled) return;
		if (onPress) {
			onPress();
		} else {
			actions.submit();
		}
	}, [actions, isDisabled, onPress]);

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel="Submit prompt"
			disabled={isDisabled}
			onPress={handlePress}
			style={({ pressed }) => [
				styles.submitButton,
				{
					backgroundColor: isDisabled
						? theme.colors.surfaceRaised
						: pressed
							? theme.colors.primarySubtle
							: theme.colors.primary,
					borderRadius: theme.radius.pill,
				},
				style,
			]}
		>
			{meta.loading ? (
				<Spinner
					size="sm"
					color={isDisabled ? theme.colors.textDisabled : theme.colors.onPrimary}
				/>
			) : (
				(children ?? (
					<Icon
						name="ArrowUp"
						size={16}
						color={isDisabled ? theme.colors.textDisabled : theme.colors.onPrimary}
					/>
				))
			)}
		</Pressable>
	);
}

export const PromptInput = Object.assign(PromptInputRoot, {
	Root: PromptInputRoot,
	Textarea: PromptInputTextarea,
	Actions: PromptInputActions,
	AttachmentSlot: PromptInputAttachmentSlot,
	SubmitButton: PromptInputSubmitButton,
});

const styles = StyleSheet.create({
	root: {
		borderWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 8,
		width: "100%",
	},
	textarea: {
		fontSize: 14,
		lineHeight: 20,
		paddingTop: 0,
		paddingBottom: 4,
		paddingHorizontal: 0,
		textAlignVertical: "top",
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 6,
		minHeight: 36,
	},
	attachmentSlot: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	attachButton: {
		width: 32,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	submitButton: {
		width: 32,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: "auto",
	},
});
