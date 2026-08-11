import { useRef, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";

import {
	Screen,
	Card,
	Text,
	Button,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

import { FormField, type FieldConfig } from "@osuki-dev/kit-community";

import { Container } from "@/components/container";

export default function FormsPage() {
	const { colors, spacing } = useTheme();
	const { isMobile, pagePadding } = useResponsiveTheme();
	const scrollRef = useRef<ScrollViewType>(null);

	const [formState, setFormState] = useState({
		// Basic text inputs
		username: "",
		email: "",
		password: "",
		bio: "",

		// Specialized inputs
		phone: "",
		website: "",
		searchQuery: "",
		favoriteColor: "#D71921",

		// Numbers
		age: 25,
		satisfaction: 75,
		rating: 4,

		// Boolean
		notifications: true,
		newsletter: false,

		// Selection
		role: "user",
		department: "engineering",
		skills: ["react", "typescript"],
		interests: ["design", "tech"],

		// Date
		birthDate: "",
		meetingTime: "",

		// Files
		attachment: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [submitMessage, setSubmitMessage] = useState<string | null>(null);

	const updateField = (key: string, value: unknown) => {
		setFormState((s) => ({ ...s, [key]: value }));
		setSubmitMessage(null);
		if (errors[key]) {
			setErrors((e) => ({ ...e, [key]: "" }));
		}
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formState.username.trim()) {
			newErrors.username = "Enter a username so teammates can recognize this profile.";
		}
		if (!formState.email.trim()) {
			newErrors.email = "Add an email address for account notifications.";
		}
		if (formState.email && !formState.email.includes("@")) {
			newErrors.email = "Use a valid email address, for example name@example.com.";
		}
		if (!formState.phone.trim()) {
			newErrors.phone = "Add a phone number for delivery or account recovery.";
		}
		setErrors(newErrors);
		setSubmitMessage(
			Object.keys(newErrors).length > 0 ? "Review the highlighted fields before submitting." : null,
		);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (validate()) {
			setSubmitMessage(
				`Profile saved for ${formState.username.trim()} · ${formState.email.trim()}`,
			);
		}
	};

	const handleReset = () => {
		setFormState({
			username: "",
			email: "",
			password: "",
			bio: "",
			phone: "",
			website: "",
			searchQuery: "",
			favoriteColor: "#D71921",
			age: 25,
			satisfaction: 75,
			rating: 4,
			notifications: true,
			newsletter: false,
			role: "user",
			department: "engineering",
			skills: [],
			interests: [],
			birthDate: "",
			meetingTime: "",
			attachment: "",
		});
		setErrors({});
		setSubmitMessage("Form reset.");
	};

	// Form field configurations
	const basicFields: FieldConfig[] = [
		{
			key: "username",
			label: "USERNAME",
			type: "text",
			required: true,
			placeholder: "Enter username",
		},
		{
			key: "email",
			label: "EMAIL",
			type: "email",
			required: true,
			placeholder: "email@example.com",
		},
		{
			key: "phone",
			label: "PHONE",
			type: "phone",
			required: true,
			placeholder: "+1 (555) 000-0000",
		},
		{
			key: "attachment",
			label: "ATTACHMENT",
			type: "file",
			helper: "Attach a profile brief or supporting document.",
		},
		{
			key: "password",
			label: "PASSWORD",
			type: "password",
			placeholder: "••••••••",
			helper: "At least 8 characters",
		},
		{
			key: "bio",
			label: "BIO",
			type: "textarea",
			placeholder: "Tell us about yourself...",
			rows: 4,
		},
	];

	const specializedFields: FieldConfig[] = [
		{
			key: "website",
			label: "WEBSITE",
			type: "url",
			placeholder: "https://example.com",
		},
		{
			key: "searchQuery",
			label: "SEARCH",
			type: "search",
			placeholder: "Search products...",
		},
		{
			key: "favoriteColor",
			label: "FAVORITE COLOR",
			type: "color",
			helper: "Enter a hex color code",
		},
	];

	const numberFields: FieldConfig[] = [
		{
			key: "age",
			label: "AGE",
			type: "number",
			min: 18,
			max: 120,
			placeholder: "25",
		},
		{
			key: "satisfaction",
			label: "SATISFACTION LEVEL",
			type: "slider",
			min: 0,
			max: 100,
			showValue: true,
			valueLabel: "%",
		},
		{
			key: "rating",
			label: "RATING",
			type: "rating",
			max: 5,
		},
	];

	const booleanFields: FieldConfig[] = [
		{
			key: "notifications",
			label: "ENABLE NOTIFICATIONS",
			type: "toggle",
		},
		{
			key: "newsletter",
			label: "SUBSCRIBE TO NEWSLETTER",
			type: "boolean",
		},
	];

	const selectionFields: FieldConfig[] = [
		{
			key: "role",
			label: "ROLE",
			type: "segmented",
			options: [
				{ label: "ADMIN", value: "admin" },
				{ label: "USER", value: "user" },
				{ label: "GUEST", value: "guest" },
			],
		},
		{
			key: "department",
			label: "DEPARTMENT",
			type: "select",
			options: [
				{ label: "Engineering", value: "engineering" },
				{ label: "Design", value: "design" },
				{ label: "Marketing", value: "marketing" },
				{ label: "Sales", value: "sales" },
			],
			placeholder: "Select department",
		},
		{
			key: "skills",
			label: "SKILLS",
			type: "chips",
			options: [
				{ label: "React", value: "react" },
				{ label: "TypeScript", value: "typescript" },
				{ label: "Node.js", value: "nodejs" },
				{ label: "Python", value: "python" },
				{ label: "Design", value: "design" },
			],
		},
		{
			key: "interests",
			label: "INTERESTS",
			type: "tags",
			options: [
				{ label: "Technology", value: "tech" },
				{ label: "Design", value: "design" },
				{ label: "Business", value: "business" },
				{ label: "Science", value: "science" },
				{ label: "Art", value: "art" },
			],
		},
	];

	const dateFields: FieldConfig[] = [
		{
			key: "birthDate",
			label: "BIRTH DATE",
			type: "date",
			placeholder: "YYYY-MM-DD",
		},
		{
			key: "meetingTime",
			label: "MEETING TIME",
			type: "time",
			placeholder: "HH:MM",
		},
	];

	const handleBrowse = (field: FieldConfig) => {
		if (field.key !== "attachment") return;
		updateField(field.key, "osuki-profile-brief.pdf");
		setSubmitMessage("Attachment selected: osuki-profile-brief.pdf");
	};

	const renderSection = (title: string, fields: FieldConfig[]) => (
		<View style={[styles.section, { marginTop: spacing["lg"] }]}>
			<Text variant="label" colorKey="textMuted" style={styles.sectionLabel}>
				{title}
			</Text>
			<Card variant="raised" border="subtle" padding="lg" style={styles.card}>
				{fields.map((field, index) => (
					<View key={field.key}>
						<FormField
							config={field}
							value={formState[field.key as keyof typeof formState]}
							onChange={(value) => updateField(field.key, value)}
							onBrowse={handleBrowse}
							error={errors[field.key]}
							touched={!!errors[field.key]}
						/>
						{index < fields.length - 1 && <View style={{ height: spacing["md"] }} />}
					</View>
				))}
			</Card>
		</View>
	);

	return (
		<Container>
			<Screen>
				<ScrollView
					ref={scrollRef}
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					contentInsetAdjustmentBehavior="never"
				>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 480, lg: 560 }}
						horizontalPadding={pagePadding}
						alignment="center"
					>
						{/* Header */}
						<View style={[styles.header, { marginTop: spacing["md"] }]}>
							<Text variant="heading" colorKey="text">
								Forms
							</Text>
							<Text variant="body" colorKey="textMuted">
								Build reliable account, checkout, and preference forms.
							</Text>
						</View>

						{/* Form Sections */}
						{renderSection("BASIC INPUTS", basicFields)}
						{renderSection("SPECIALIZED INPUTS", specializedFields)}
						{renderSection("NUMBERS & RATINGS", numberFields)}
						{renderSection("TOGGLES & BOOLEANS", booleanFields)}
						{renderSection("SELECTION", selectionFields)}
						{renderSection("DATE & TIME", dateFields)}
					</ResponsiveContainer>
				</ScrollView>
				<View style={[styles.actionBar, { backgroundColor: colors.background }]}>
					<ResponsiveContainer
						maxWidth={{ xs: "100%", md: 480, lg: 560 }}
						horizontalPadding={pagePadding}
						alignment="center"
					>
						{submitMessage ? (
							<Card
								variant="raised"
								border="subtle"
								padding="md"
								style={styles.statusCard}
								testID="forms-submit-status"
							>
								<Text
									variant="bodySmall"
									colorKey={Object.keys(errors).length > 0 ? "danger" : "success"}
								>
									{submitMessage}
								</Text>
							</Card>
						) : null}
						<View style={[styles.buttonRow, { gap: spacing["sm"] }]}>
							<Button
								variant="secondary"
								style={{ flex: isMobile ? 1 : undefined }}
								onPress={handleReset}
								testID="forms-reset-button"
							>
								RESET
							</Button>
							<Button
								variant="primary"
								style={{ flex: isMobile ? 1 : undefined }}
								onPress={handleSubmit}
								testID="forms-submit-button"
							>
								SUBMIT
							</Button>
						</View>
					</ResponsiveContainer>
				</View>
			</Screen>
		</Container>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingTop: 16,
		paddingBottom: 24,
	},
	header: {
		alignItems: "center",
		marginBottom: 8,
	},
	section: {
		width: "100%",
	},
	sectionLabel: {
		marginBottom: 8,
	},
	card: {
		width: "100%",
	},
	statusCard: {
		width: "100%",
		marginBottom: 12,
	},
	actionBar: {
		paddingTop: 12,
		paddingBottom: 12,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
});
