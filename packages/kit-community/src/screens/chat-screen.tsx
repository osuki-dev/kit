import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Text,
	Icon,
	Tag,
	resolveFontStyle,
	useTheme,
	useResponsiveTheme,
	KeyboardAvoidingView,
} from "@osuki-dev/ui";

export interface ChatMessage {
	id: string;
	text: string;
	sender: "user" | "other";
	timestamp: Date;
	avatar?: string;
	status?: "sent" | "delivered" | "read";
}

export interface ChatUser {
	id: string;
	name: string;
	avatar?: string;
	status?: "online" | "offline" | "away";
	lastSeen?: Date;
}

export interface ChatScreenConfig {
	/** Current user info */
	currentUser: ChatUser;
	/** Other participant */
	otherUser: ChatUser;
	/** Chat messages */
	messages: ChatMessage[];
	/** Is typing indicator */
	isTyping?: boolean;
	/** Quick reply suggestions */
	quickReplies?: string[];
}

export interface ChatScreenProps {
	config: ChatScreenConfig;
	/** Message input value */
	inputValue: string;
	/** Input change handler */
	onInputChange: (text: string) => void;
	/** Send message handler */
	onSend: () => void;
	/** Message press handler */
	onMessagePress?: (message: ChatMessage) => void;
	/** Back button handler */
	onBack?: () => void;
	/** Loading state */
	isLoading?: boolean;
}

/**
 * Chat screen template
 *
 * Features:
 * - Chat header with user info
 * - Message bubbles (sent/received)
 * - Input area with send button
 * - Typing indicator
 * - Quick reply suggestions
 *
 * @example
 * ```tsx
 * <ChatScreen
 *   config={{
 *     currentUser: { id: '1', name: 'Me' },
 *     otherUser: { id: '2', name: 'John', status: 'online' },
 *     messages: [
 *       { id: '1', text: 'Hello!', sender: 'other', timestamp: new Date() },
 *       { id: '2', text: 'Hi there!', sender: 'user', timestamp: new Date() },
 *     ],
 *   }}
 *   inputValue={input}
 *   onInputChange={setInput}
 *   onSend={handleSend}
 * />
 * ```
 */
export const ChatScreen: React.FC<ChatScreenProps> = ({
	config,
	inputValue,
	onInputChange,
	onSend,
	onMessagePress,
	onBack,
	isLoading,
}) => {
	const insets = useSafeAreaInsets();
	const { colors, fonts, spacing, typeStyles } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const scrollViewRef = React.useRef<ScrollView>(null);

	// Scroll to bottom when messages change
	React.useEffect(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, [config.messages]);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	if (isLoading) {
		return (
			<Screen>
				<View style={[styles.loadingContainer, { paddingTop: insets.top + spacing["4xl"] }]}>
					<Text variant="caption" color={colors.textMuted}>
						[LOADING...]
					</Text>
				</View>
			</Screen>
		);
	}

	return (
		<Screen>
			{/* Header */}
			<View
				style={[
					styles.header,
					{
						paddingTop: insets.top + spacing["md"],
						paddingHorizontal: pagePadding,
						borderBottomColor: colors.border,
					},
				]}
			>
				<View style={styles.headerContent}>
					{onBack && (
						<TouchableOpacity onPress={onBack} style={styles.backButton}>
							<Icon name="ChevronLeft" size={24} color={colors.text} />
						</TouchableOpacity>
					)}

					{/* Other User Info */}
					<View style={styles.userInfo}>
						{config.otherUser.avatar ? (
							<Image source={{ uri: config.otherUser.avatar }} style={styles.avatar} />
						) : (
							<View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceRaised }]}>
								<Icon name="User" size={20} color={colors.textDisabled} />
							</View>
						)}
						<View style={styles.userText}>
							<Text variant="body" color={colors.text}>
								{config.otherUser.name}
							</Text>
							{config.otherUser.status && (
								<Text variant="caption" color={colors.textMuted}>
									{config.otherUser.status === "online"
										? "● ONLINE"
										: config.otherUser.status.toUpperCase()}
								</Text>
							)}
						</View>
					</View>
				</View>
			</View>

			{/* Messages */}
			<ScrollView
				ref={scrollViewRef}
				style={styles.messagesContainer}
				contentContainerStyle={{ padding: spacing["md"] }}
				showsVerticalScrollIndicator={false}
			>
				{config.messages.map((message, _index) => {
					const isUser = message.sender === "user";
					const showAvatar = !isUser && message.avatar;

					return (
						<View
							key={message.id}
							style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowOther]}
						>
							{/* Avatar for received messages */}
							{!isUser && (
								<View style={styles.avatarWrapper}>
									{showAvatar ? (
										<Image source={{ uri: message.avatar }} style={styles.messageAvatar} />
									) : (
										<View
											style={[
												styles.messageAvatarPlaceholder,
												{ backgroundColor: colors.surfaceRaised },
											]}
										>
											<Icon name="User" size={14} color={colors.textDisabled} />
										</View>
									)}
								</View>
							)}

							{/* Message Bubble */}
							<TouchableOpacity
								onPress={() => onMessagePress?.(message)}
								style={[
									styles.messageBubble,
									isUser
										? [styles.messageBubbleUser, { backgroundColor: colors.text }]
										: [styles.messageBubbleOther, { backgroundColor: colors.surfaceRaised }],
								]}
							>
								<Text variant="body" color={isUser ? colors.background : colors.text}>
									{message.text}
								</Text>
								<View style={styles.messageMeta}>
									<Text variant="caption" color={isUser ? colors.textDisabled : colors.textMuted}>
										{formatTime(message.timestamp)}
									</Text>
									{isUser && message.status && (
										<Text variant="caption" color={colors.textDisabled}>
											{message.status === "read"
												? " ✓✓"
												: message.status === "delivered"
													? " ✓"
													: ""}
										</Text>
									)}
								</View>
							</TouchableOpacity>
						</View>
					);
				})}

				{/* Typing Indicator */}
				{config.isTyping && (
					<View style={[styles.typingRow, { marginTop: spacing["sm"] }]}>
						<View style={[styles.typingBubble, { backgroundColor: colors.surfaceRaised }]}>
							<Text variant="caption" color={colors.textMuted}>
								●●●
							</Text>
						</View>
					</View>
				)}
			</ScrollView>

			{/* Quick Replies */}
			{config.quickReplies && config.quickReplies.length > 0 && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.quickRepliesContainer}
					contentContainerStyle={{ paddingHorizontal: spacing["md"], gap: spacing["sm"] }}
				>
					{config.quickReplies.map((reply, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => {
								onInputChange(reply);
								onSend();
							}}
						>
							<Tag variant="pill">{reply}</Tag>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}

			{/* Input Area */}
			<KeyboardAvoidingView
				style={[
					styles.inputContainer,
					{
						paddingBottom: insets.bottom + spacing["md"],
						paddingHorizontal: pagePadding,
						borderTopColor: colors.border,
					},
				]}
			>
				<View
					style={[
						styles.inputWrapper,
						{
							backgroundColor: colors.surfaceRaised,
							borderColor: colors.border,
						},
					]}
				>
					<TextInput
						style={[
							styles.input,
							{
								color: colors.text,
								...resolveFontStyle(fonts, typeStyles.body.fontFamily, "regular"),
							},
						]}
						value={inputValue}
						onChangeText={onInputChange}
						placeholder="Type a message..."
						placeholderTextColor={colors.textDisabled}
						multiline
						numberOfLines={4}
					/>
					<TouchableOpacity
						onPress={onSend}
						disabled={!inputValue.trim()}
						style={[styles.sendButton, { opacity: inputValue.trim() ? 1 : 0.5 }]}
					>
						<Icon
							name="Send"
							size={20}
							color={inputValue.trim() ? colors.text : colors.textDisabled}
						/>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</Screen>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		alignItems: "center",
	},
	header: {
		borderBottomWidth: 1,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
	},
	backButton: {
		marginRight: 12,
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	avatarPlaceholder: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	userText: {
		marginLeft: 12,
	},
	messagesContainer: {
		flex: 1,
	},
	messageRow: {
		flexDirection: "row",
		marginBottom: 16,
		alignItems: "flex-end",
	},
	messageRowUser: {
		justifyContent: "flex-end",
	},
	messageRowOther: {
		justifyContent: "flex-start",
	},
	avatarWrapper: {
		marginRight: 8,
	},
	messageAvatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
	},
	messageAvatarPlaceholder: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	messageBubble: {
		maxWidth: "70%",
		padding: 12,
		borderRadius: 16,
	},
	messageBubbleUser: {
		borderBottomRightRadius: 4,
	},
	messageBubbleOther: {
		borderBottomLeftRadius: 4,
	},
	messageMeta: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 4,
		gap: 4,
	},
	typingRow: {
		flexDirection: "row",
		justifyContent: "flex-start",
	},
	typingBubble: {
		padding: 12,
		borderRadius: 16,
		borderBottomLeftRadius: 4,
	},
	quickRepliesContainer: {
		maxHeight: 50,
		paddingVertical: 8,
	},
	inputContainer: {
		borderTopWidth: 1,
		paddingTop: 12,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 24,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	input: {
		flex: 1,
		fontSize: 16,
		maxHeight: 100,
		paddingVertical: 8,
	},
	sendButton: {
		marginLeft: 12,
		padding: 4,
	},
});
