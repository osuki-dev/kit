import { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import {
	Screen,
	TopBar,
	Text,
	Card,
	Badge,
	Icon,
	PromptInput,
	CodeBlock,
	Reasoning,
	ToolCall,
	Trace,
	useTheme,
	useToast,
} from "@osuki-dev/ui";

const PROMPT_SUGGESTIONS = [
	"Refactor authentication to use WebAuthn passkeys",
	"Analyze bundle overhead for Yoga zero-runtime layout",
	"Add 8-direction Nano Icon resolver to ThemeProvider",
];

export default function AIElementsScreen() {
	const { colors, mode, toggleMode } = useTheme();
	const { showToast } = useToast();

	const [promptValue, setPromptValue] = useState(PROMPT_SUGGESTIONS[0]);
	const [promptLoading, setPromptLoading] = useState(false);
	const [codeBlockMode, setCodeBlockMode] = useState<"diff" | "terminal" | "compact">("diff");

	const handlePromptSubmit = useCallback(
		(text: string) => {
			if (!text.trim()) return;
			setPromptLoading(true);
			showToast({
				title: "Agent Dispatched",
				message: `Planning execution: "${text.slice(0, 32)}..."`,
				variant: "info",
			});
			setTimeout(() => {
				setPromptLoading(false);
			}, 1200);
		},
		[showToast],
	);

	return (
		<Screen style={[styles.screen, { backgroundColor: colors.background }]}>
			<TopBar
				title="2026-10 AI Elements"
				subtitle="shadcn-Inspired Agent-Native UI Primitives"
				actions={[
					{
						icon: mode === "dark" ? "Sun" : "Moon",
						onPress: toggleMode,
						label: "Toggle Theme",
					},
				]}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Header Banner */}
				<Card variant="raised" border="subtle" padding="md" style={styles.bannerCard}>
					<View style={styles.bannerBadgeRow}>
						<Badge variant="primary" display="label">
							2026-10 SPEC
						</Badge>
						<Text variant="caption" colorKey="textMuted">
							Agent-Native UI Primitives
						</Text>
					</View>
					<Text variant="heading" colorKey="text" style={{ marginTop: 4 }}>
						shadcn-Inspired AI Components
					</Text>
					<Text variant="bodySmall" colorKey="textMuted" style={{ marginTop: 4, lineHeight: 19 }}>
						Streaming thought reasoning, multi-line composer, code diffs, tool invocation cards, and
						trace execution trees.
					</Text>
				</Card>

				{/* 1. PromptInput */}
				<View style={styles.section}>
					<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
						1. PROMPT INPUT (MULTI-LINE COMPOSER)
					</Text>
					<PromptInput.Root
						value={promptValue}
						onValueChange={setPromptValue}
						onSubmit={handlePromptSubmit}
						loading={promptLoading}
					>
						<PromptInput.Textarea placeholder="Ask an AI agent or request a refactor..." />
						<PromptInput.Actions>
							<PromptInput.AttachmentSlot>
								<View
									style={[
										styles.attachmentPill,
										{ backgroundColor: colors.surfaceRaised, borderColor: colors.border },
									]}
								>
									<Icon name="Paperclip" size={13} color={colors.primary} />
									<Text
										variant="caption"
										colorKey="text"
										style={{ fontWeight: "600", fontSize: 11 }}
									>
										package.json
									</Text>
								</View>
							</PromptInput.AttachmentSlot>
							<PromptInput.SubmitButton />
						</PromptInput.Actions>
					</PromptInput.Root>

					{/* Suggestion Chips */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.chipRow}
					>
						{PROMPT_SUGGESTIONS.map((sugg, i) => (
							<Pressable
								key={i}
								onPress={() => setPromptValue(sugg)}
								style={[
									styles.suggestionChip,
									{ backgroundColor: colors.surface, borderColor: colors.border },
								]}
							>
								<Icon name="Sparkles" size={12} color={colors.primary} />
								<Text variant="caption" colorKey="text" style={{ fontSize: 11, fontWeight: "500" }}>
									{sugg.length > 36 ? `${sugg.slice(0, 36)}...` : sugg}
								</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>

				{/* 2. CodeBlock */}
				<View style={styles.section}>
					<View style={styles.rowBetween}>
						<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
							2. CODE BLOCK MODES
						</Text>
						<Badge variant="default" display="label">
							{codeBlockMode.toUpperCase()}
						</Badge>
					</View>

					{/* Mode Switcher Segment */}
					<View
						style={[
							styles.modeBar,
							{ backgroundColor: colors.surfaceRaised, borderColor: colors.border },
						]}
					>
						{(["diff", "terminal", "compact"] as const).map((m) => {
							const active = codeBlockMode === m;
							return (
								<Pressable
									key={m}
									onPress={() => setCodeBlockMode(m)}
									style={[
										styles.modeTab,
										{
											backgroundColor: active ? colors.primary : "transparent",
										},
									]}
								>
									<Text
										variant="caption"
										style={{
											color: active ? colors.onPrimary : colors.textMuted,
											fontWeight: active ? "700" : "500",
											fontSize: 11,
										}}
									>
										{m.toUpperCase()}
									</Text>
								</Pressable>
							);
						})}
					</View>

					<CodeBlock.Root variant={codeBlockMode}>
						<CodeBlock.Header>
							<CodeBlock.Title>packages/ui/src/components/button.tsx</CodeBlock.Title>
							<CodeBlock.Actions>
								<CodeBlock.CopyButton
									onCopy={() => {
										showToast({
											title: "Code Copied",
											message: "Button snippet copied to clipboard",
											variant: "success",
										});
									}}
								/>
							</CodeBlock.Actions>
						</CodeBlock.Header>
						<CodeBlock.Content>
							{codeBlockMode === "diff" ? (
								<>
									<CodeBlock.Line type="delete" lineNumber={1}>
										- export function Button(props: ButtonProps)
									</CodeBlock.Line>
									<CodeBlock.Line type="add" lineNumber={1}>
										+ export const Button = Object.assign(ButtonRoot, {"{"}
									</CodeBlock.Line>
									<CodeBlock.Line type="add" lineNumber={2}>
										+ Background: ButtonBackground,
									</CodeBlock.Line>
									<CodeBlock.Line type="add" lineNumber={3}>
										+ Label: ButtonLabel,
									</CodeBlock.Line>
									<CodeBlock.Line type="add" lineNumber={4}>
										+ Icon: ButtonIcon,
									</CodeBlock.Line>
									<CodeBlock.Line type="add" lineNumber={5}>
										+ {"}"});
									</CodeBlock.Line>
								</>
							) : (
								<>
									<CodeBlock.Line type="normal" lineNumber={1}>
										$ bun run check:ci
									</CodeBlock.Line>
									<CodeBlock.Line type="normal" lineNumber={2}>
										PASS (77 components, 10 turbo tasks in 380ms)
									</CodeBlock.Line>
								</>
							)}
						</CodeBlock.Content>
					</CodeBlock.Root>
				</View>

				{/* 3. Reasoning */}
				<View style={styles.section}>
					<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
						3. REASONING (STREAMING THOUGHT INSPECTOR)
					</Text>
					<Reasoning.Root durationSeconds={2.8} defaultOpen={true}>
						<Reasoning.Trigger />
						<Reasoning.Content>
							The user wants a dedicated new app for showcasing UI and Kit components. We maintain
							clean separation from commerce/store logic and provide live playgrounds for AI
							elements, Vercel decorators, and Nano Icons.
						</Reasoning.Content>
					</Reasoning.Root>
				</View>

				{/* 4. ToolCall */}
				<View style={styles.section}>
					<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
						4. TOOL CALL (COLLAPSIBLE PARAMETERS & RESULTS)
					</Text>
					<ToolCall.Root status="success" name="run_command">
						<ToolCall.Header>
							<ToolCall.Name />
							<ToolCall.Status />
						</ToolCall.Header>
						<ToolCall.Payload label="Parameters">
							{'CommandLine: "bun run check"\nCwd: "apps/showcase"'}
						</ToolCall.Payload>
						<ToolCall.Result label="Result">
							0 warnings and 0 errors across 254 files (FULL TURBO)
						</ToolCall.Result>
					</ToolCall.Root>
				</View>

				{/* 5. Trace */}
				<View style={styles.section}>
					<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
						5. TRACE (EXECUTION FLOW TREE)
					</Text>
					<Trace.Root>
						<Trace.Item status="success" defaultExpanded={true}>
							<Trace.Header>
								<Trace.Title>read_file: /packages/ui/src/ai-elements.tsx</Trace.Title>
								<Trace.Badge>14ms</Trace.Badge>
							</Trace.Header>
							<Trace.Content>Read 450 lines of agentic components specification.</Trace.Content>
						</Trace.Item>
						<Trace.Item status="success" defaultExpanded={true}>
							<Trace.Header>
								<Trace.Title>compile_layout: Yoga Engine Layout</Trace.Title>
								<Trace.Badge>38ms</Trace.Badge>
							</Trace.Header>
							<Trace.Content>
								Calculated flexbox layout tree with zero runtime JS overhead.
							</Trace.Content>
						</Trace.Item>
						<Trace.Item status="running" defaultExpanded={true}>
							<Trace.Header>
								<Trace.Title>benchmark: Native Viewport Rendering</Trace.Title>
								<Trace.Badge>Active</Trace.Badge>
							</Trace.Header>
							<Trace.Content>
								Profiling 60 FPS frame synchronization on Android emulator.
							</Trace.Content>
						</Trace.Item>
					</Trace.Root>
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		gap: 20,
	},
	bannerCard: {
		borderRadius: 16,
	},
	bannerBadgeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},
	section: {
		gap: 10,
	},
	sectionLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	attachmentPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 8,
		borderWidth: 1,
	},
	chipRow: {
		gap: 8,
		marginTop: 8,
	},
	suggestionChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 16,
		borderWidth: 1,
	},
	modeBar: {
		flexDirection: "row",
		padding: 4,
		borderRadius: 10,
		borderWidth: 1,
		gap: 4,
	},
	modeTab: {
		flex: 1,
		paddingVertical: 6,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 7,
	},
});
