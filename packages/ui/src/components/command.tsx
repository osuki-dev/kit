import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Text } from "./text";
import { useHaptics } from "./haptics";

export interface CommandState {
	query: string;
	matchCount: number;
	itemCount: number;
}

export interface CommandActions {
	setQuery: (query: string) => void;
	setMatch: (id: string, matched: boolean) => void;
	clearMatch: (id: string) => void;
}

export interface CommandMeta {
	disabled: boolean;
}

export interface CommandContextValue {
	state: CommandState;
	actions: CommandActions;
	meta: CommandMeta;
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommand(): CommandContextValue {
	const context = useContext(CommandContext);
	if (!context) {
		throw new Error("Command parts must be used within Command.Root");
	}
	return context;
}

function normalize(value: string) {
	return value.trim().toLocaleLowerCase();
}

export interface CommandRootProps extends ViewProps {
	children?: ReactNode;
	query?: string;
	defaultQuery?: string;
	onQueryChange?: (query: string) => void;
	disabled?: boolean;
}

export function CommandRoot({
	children,
	query: controlledQuery,
	defaultQuery = "",
	onQueryChange,
	disabled = false,
	style,
	...props
}: CommandRootProps) {
	const theme = useThemeTokens();
	const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery);
	const [matches, setMatches] = useState<Record<string, boolean>>({});
	const controlled = controlledQuery !== undefined;
	const query = controlled ? controlledQuery : uncontrolledQuery;

	const setQuery = useCallback(
		(next: string) => {
			if (!controlled) setUncontrolledQuery(next);
			onQueryChange?.(next);
		},
		[controlled, onQueryChange],
	);
	const setMatch = useCallback((id: string, matched: boolean) => {
		setMatches((current) => {
			if (current[id] === matched) return current;
			return { ...current, [id]: matched };
		});
	}, []);
	const clearMatch = useCallback((id: string) => {
		setMatches((current) => {
			if (!(id in current)) return current;
			const next = { ...current };
			delete next[id];
			return next;
		});
	}, []);

	const entries = Object.values(matches);
	let matchCount = 0;
	for (const matched of entries) {
		if (matched) matchCount += 1;
	}
	const itemCount = entries.length;
	const value = useMemo<CommandContextValue>(
		() => ({
			state: { query, itemCount, matchCount },
			actions: { setQuery, setMatch, clearMatch },
			meta: { disabled },
		}),
		[clearMatch, disabled, itemCount, matchCount, query, setMatch, setQuery],
	);

	return (
		<CommandContext.Provider value={value}>
			<View
				style={[
					styles.root,
					{
						backgroundColor: theme.colors.surface,
						borderColor: theme.colors.border,
						borderRadius: theme.radius.lg,
					},
					style,
				]}
				{...props}
			>
				{children}
			</View>
		</CommandContext.Provider>
	);
}

export function CommandInput({
	placeholder = "Search",
	autoFocus = false,
}: {
	placeholder?: string;
	autoFocus?: boolean;
}) {
	const theme = useThemeTokens();
	const { state, actions, meta } = useCommand();
	return (
		<View
			style={[styles.inputRow, { borderBottomColor: theme.colors.border, gap: theme.spacing.sm }]}
		>
			<Icon name="Search" size={16} color={theme.colors.textMuted} />
			<TextInput
				value={state.query}
				editable={!meta.disabled}
				autoFocus={autoFocus}
				placeholder={placeholder}
				placeholderTextColor={theme.colors.textDisabled}
				onChangeText={actions.setQuery}
				style={[styles.input, { color: theme.colors.text }]}
			/>
		</View>
	);
}

export function CommandList({ children, style, ...props }: ViewProps) {
	return (
		<ScrollView keyboardShouldPersistTaps="handled" style={style} {...props}>
			{children}
		</ScrollView>
	);
}

export function CommandEmpty({ children = "No results" }: { children?: ReactNode }) {
	const { state } = useCommand();
	if (state.itemCount === 0 || state.matchCount > 0) return null;
	return (
		<View style={styles.empty}>
			{typeof children === "string" ? (
				<Text variant="bodySmall" colorKey="textMuted">
					{children}
				</Text>
			) : (
				children
			)}
		</View>
	);
}

export interface CommandItemProps {
	value: string;
	keywords?: string;
	disabled?: boolean;
	onSelect?: (value: string) => void;
	children?: ReactNode;
}

export function CommandItem({
	value,
	keywords = "",
	disabled = false,
	onSelect,
	children,
}: CommandItemProps) {
	const theme = useThemeTokens();
	const haptics = useHaptics();
	const id = useId();
	const { state, actions, meta } = useCommand();
	const haystack = normalize(`${value} ${keywords}`);
	const query = normalize(state.query);
	const matched = query.length === 0 || haystack.includes(query);

	useEffect(() => {
		actions.setMatch(id, matched);
		return () => actions.clearMatch(id);
	}, [actions, id, matched]);

	if (!matched) return null;
	const isDisabled = disabled || meta.disabled;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled: isDisabled }}
			disabled={isDisabled}
			onPress={() => {
				haptics.feedback("selection");
				onSelect?.(value);
			}}
			style={({ pressed }) => [
				styles.item,
				{ minHeight: 44 },
				pressed && !isDisabled ? { backgroundColor: theme.colors.surfaceRaised } : null,
			]}
		>
			{typeof children === "string" ? <Text variant="body">{children}</Text> : children}
		</Pressable>
	);
}

export interface CommandOption {
	value: string;
	label: string;
	keywords?: string;
	disabled?: boolean;
}

export interface CommandProps extends CommandRootProps {
	options: CommandOption[];
	onSelect: (value: string) => void;
	placeholder?: string;
	empty?: ReactNode;
}

export function Command({ options, onSelect, placeholder, empty, ...props }: CommandProps) {
	return (
		<CommandRoot {...props}>
			<CommandInput placeholder={placeholder} />
			<CommandList>
				<CommandEmpty>{empty}</CommandEmpty>
				{options.map((option) => (
					<CommandItem
						key={option.value}
						value={option.value}
						keywords={`${option.label} ${option.keywords ?? ""}`}
						disabled={option.disabled}
						onSelect={onSelect}
					>
						{option.label}
					</CommandItem>
				))}
			</CommandList>
		</CommandRoot>
	);
}

Command.Root = CommandRoot;
Command.Input = CommandInput;
Command.List = CommandList;
Command.Empty = CommandEmpty;
Command.Item = CommandItem;

const styles = StyleSheet.create({
	root: {
		width: "100%",
		borderWidth: StyleSheet.hairlineWidth,
		overflow: "hidden",
	},
	inputRow: {
		minHeight: 44,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	input: {
		flex: 1,
		minWidth: 0,
		fontSize: 16,
		paddingVertical: 8,
	},
	item: {
		paddingHorizontal: 12,
		justifyContent: "center",
	},
	empty: {
		padding: 16,
	},
});
