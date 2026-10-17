import React, { type ReactNode } from "react";
import { Pressable, StyleSheet, View, type PressableProps, type ViewProps } from "react-native";
import { useThemeTokens } from "../theme";
import { Icon } from "./icon";
import { Spinner } from "./spinner";
import { Text } from "./text";

export type AttachmentStatus = "idle" | "uploading" | "ready" | "error";

export interface AttachmentRootProps extends ViewProps {
	children?: ReactNode;
	status?: AttachmentStatus;
}

export function AttachmentRoot({
	children,
	status = "ready",
	style,
	...props
}: AttachmentRootProps) {
	const theme = useThemeTokens();
	let borderColor = theme.colors.border;
	if (status === "error") borderColor = theme.colors.danger;
	return (
		<View
			style={[
				styles.root,
				{
					borderColor,
					borderRadius: theme.radius.lg,
					backgroundColor: theme.colors.surface,
					gap: theme.spacing.sm,
					padding: theme.spacing.sm,
				},
				style,
			]}
			{...props}
		>
			{children}
		</View>
	);
}

export function AttachmentPreview({ children }: { children?: ReactNode }) {
	const theme = useThemeTokens();
	return (
		<View
			style={[
				styles.preview,
				{ backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.md },
			]}
		>
			{children ?? <Icon name="Paperclip" size={18} color={theme.colors.textMuted} />}
		</View>
	);
}

export function AttachmentBody({ children }: { children?: ReactNode }) {
	return <View style={styles.body}>{children}</View>;
}

export function AttachmentTitle({ children }: { children?: ReactNode }) {
	return (
		<Text variant="body" numberOfLines={1}>
			{children}
		</Text>
	);
}

export function AttachmentDescription({ children }: { children?: ReactNode }) {
	return (
		<Text variant="caption" colorKey="textMuted" numberOfLines={1}>
			{children}
		</Text>
	);
}

export function AttachmentStatusIcon({ status = "ready" }: { status?: AttachmentStatus }) {
	const theme = useThemeTokens();
	if (status === "uploading") return <Spinner size="sm" color={theme.colors.textMuted} />;
	if (status === "error") return <Icon name="CircleAlert" size={18} color={theme.colors.danger} />;
	if (status === "ready") return <Icon name="Check" size={18} color={theme.colors.success} />;
	return null;
}

export function AttachmentRemove({
	accessibilityLabel = "Remove attachment",
	...props
}: PressableProps) {
	const theme = useThemeTokens();
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			hitSlop={8}
			style={styles.remove}
			{...props}
		>
			<Icon name="X" size={16} color={theme.colors.textMuted} />
		</Pressable>
	);
}

export interface AttachmentProps extends AttachmentRootProps {
	title: string;
	description?: string;
	onRemove?: () => void;
}

export function Attachment({
	title,
	description,
	status = "ready",
	onRemove,
	children,
	...props
}: AttachmentProps) {
	return (
		<AttachmentRoot status={status} {...props}>
			<AttachmentPreview>{children}</AttachmentPreview>
			<AttachmentBody>
				<AttachmentTitle>{title}</AttachmentTitle>
				{description ? <AttachmentDescription>{description}</AttachmentDescription> : null}
			</AttachmentBody>
			<AttachmentStatusIcon status={status} />
			{onRemove ? <AttachmentRemove onPress={onRemove} /> : null}
		</AttachmentRoot>
	);
}

Attachment.Root = AttachmentRoot;
Attachment.Preview = AttachmentPreview;
Attachment.Body = AttachmentBody;
Attachment.Title = AttachmentTitle;
Attachment.Description = AttachmentDescription;
Attachment.Status = AttachmentStatusIcon;
Attachment.Remove = AttachmentRemove;

const styles = StyleSheet.create({
	root: {
		width: "100%",
		minHeight: 56,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
	},
	preview: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	body: {
		flex: 1,
		minWidth: 0,
		gap: 2,
	},
	remove: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
	},
});
