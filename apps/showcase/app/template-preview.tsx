import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, TopBar, Text, Card, Button, useTheme } from "@osuki-dev/ui";
import {
	DashboardScreen,
	ProfileScreen,
	ChatScreen,
	SecurityScreen,
	SettingsScreen,
	OnboardingScreen,
	type ChatMessage,
} from "@osuki-dev/kit-community";

export default function TemplatePreviewScreen() {
	const params = useLocalSearchParams<{ templateId?: string; title?: string }>();
	const router = useRouter();
	const { colors } = useTheme();

	const templateId = params.templateId ?? "dashboard";
	const title = params.title ?? "Template Preview";

	// Chat state
	const [chatInput, setChatInput] = useState("");
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
		{
			id: "1",
			text: "Hello! Welcome to the Osuki Kit 2.0.0 Showcase.",
			sender: "other",
			timestamp: new Date(),
		},
		{
			id: "2",
			text: "The new UI architecture features zero-runtime CSS overhead and pure Yoga layout.",
			sender: "other",
			timestamp: new Date(),
		},
	]);

	const renderTemplateContent = () => {
		switch (templateId) {
			case "dashboard":
				return (
					<DashboardScreen
						config={{
							title: "EXECUTIVE DASHBOARD",
							widgets: [
								{
									id: "m1",
									title: "ACTIVE WORKERS",
									type: "hero",
									data: () => [{ label: "WORKERS", value: "64" }],
									field: "value",
									unit: "PODS",
								},
								{
									id: "m2",
									title: "TURBO THROUGHPUT",
									type: "stat",
									data: [{ label: "THROUGHPUT", value: 99.8 }],
									field: "value",
								},
								{
									id: "m3",
									title: "CACHE EFFICIENCY",
									type: "progress",
									data: [{ label: "CACHE", value: 94 }],
									field: "value",
								},
							],
						}}
					/>
				);

			case "profile":
				return (
					<ProfileScreen
						config={{
							name: "Alex Vance",
							title: "Principal Design Technologist",
							bio: "Building zero-runtime native design systems, Vercel composition patterns, and AI agents.",
							tags: ["Design Systems", "React Native", "AI Elements", "Yoga Layout"],
							stats: [
								{ label: "PRIMITIVES", value: 77 },
								{ label: "TEMPLATES", value: 12 },
								{ label: "COMMITS", value: "3.2k" },
							],
							info: [
								{ label: "ORGANIZATION", value: "@osuki-dev" },
								{ label: "ARCHITECTURE", value: "v2.0.0 Native" },
							],
						}}
					/>
				);

			case "chat":
				return (
					<ChatScreen
						config={{
							currentUser: { id: "user", name: "You" },
							otherUser: { id: "agent", name: "Kit Agent", status: "online" },
							messages: chatMessages,
							quickReplies: ["Run Benchmark", "Toggle Dark Mode", "Export Bundle"],
						}}
						inputValue={chatInput}
						onInputChange={setChatInput}
						onSend={() => {
							if (!chatInput.trim()) return;
							setChatMessages((prev) => [
								...prev,
								{
									id: String(Date.now()),
									text: chatInput,
									sender: "user",
									timestamp: new Date(),
								},
							]);
							setChatInput("");
						}}
					/>
				);

			case "security":
				return (
					<SecurityScreen
						title="SECURITY SETTINGS"
						sections={[
							{
								id: "biometrics",
								title: "BIOMETRIC AUTHENTICATION",
								items: [
									{
										id: "face-id",
										label: "Biometric Passkey",
										description: "Hardware secure enclave enabled",
										type: "biometric",
										value: true,
										onToggle: () => {},
									},
								],
							},
							{
								id: "sessions",
								title: "ACTIVE HARDWARE SESSIONS",
								items: [
									{
										id: "s1",
										label: "Android Emulator 5562",
										description: "Current session - Android 16 SwiftShader",
										type: "session",
										value: "ACTIVE",
									},
								],
							},
						]}
					/>
				);

			case "settings":
				return (
					<SettingsScreen
						sections={[
							{
								id: "network",
								title: "RUNTIME & NETWORK",
								items: [
									{
										id: "offline-cache",
										label: "Offline SQLite Cache",
										type: "toggle",
										value: true,
										onToggle: () => {},
									},
								],
							},
						]}
					/>
				);

			case "onboarding":
				return (
					<OnboardingScreen
						steps={[
							{
								id: "1",
								title: "Welcome to Kit 2.0.0",
								description:
									"A complete overhaul designed for maximum rendering speed and agentic UI.",
							},
							{
								id: "2",
								title: "77 Native Primitives",
								description:
									"Zero runtime CSS overhead, accessible keyboard navigation, and theme decorators.",
							},
						]}
						onComplete={() => router.back()}
					/>
				);

			default:
				return (
					<ScrollView contentContainerStyle={styles.fallbackContent}>
						<Card variant="raised" border="subtle" padding="md" style={styles.card}>
							<Text variant="heading" colorKey="text">
								{title}
							</Text>
							<Text variant="body" colorKey="textMuted" style={{ marginTop: 8 }}>
								This is an interactive instance of the `{templateId}` template from
								`@osuki-dev/kit-community`. It connects to schema-driven validation, native Yoga
								layouts, and reactive data stores.
							</Text>
							<Button variant="primary" style={{ marginTop: 16 }} onPress={() => router.back()}>
								Return to Templates
							</Button>
						</Card>
					</ScrollView>
				);
		}
	};

	return (
		<Screen style={[styles.screen, { backgroundColor: colors.background }]}>
			<TopBar title={title} onBack={() => router.back()} />
			<View style={styles.content}>{renderTemplateContent()}</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	fallbackContent: {
		padding: 16,
	},
	card: {
		borderRadius: 16,
	},
});
