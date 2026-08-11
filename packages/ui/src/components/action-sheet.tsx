import React from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { useThemeTokens } from "../theme";
import { Sheet, type BottomSheetProps } from "./bottom-sheet";
import { type IconName } from "./icon";
import { Text } from "./text";
import { SheetListItem } from "./sheet-list-item";

export type ActionSheetTone = "default" | "destructive";

export interface ActionSheetAction {
	id: string;
	label: string;
	description?: string;
	icon?: IconName;
	tone?: ActionSheetTone;
	disabled?: boolean;
}

export interface ActionSheetProps extends Omit<
	BottomSheetProps,
	"children" | "footer" | "contentStyle"
> {
	actions: ActionSheetAction[];
	onAction: (action: ActionSheetAction) => void;
	cancelLabel?: string;
	actionStyle?: ViewStyle;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
	actions,
	onAction,
	onClose,
	cancelLabel = "Cancel",
	actionStyle,
	testID,
	...sheetProps
}) => {
	const theme = useThemeTokens();
	const {
		visible,
		title,
		description,
		closeLabel,
		maxHeight,
		bottomInset,
		bodyStyle,
		...contentProps
	} = sheetProps;

	const handleAction = (action: ActionSheetAction) => {
		if (action.disabled) return;
		onAction(action);
		onClose();
	};

	return (
		<Sheet.Root open={visible} onOpenChange={(open) => !open && onClose()}>
			<Sheet.Content
				closeLabel={closeLabel}
				maxHeight={maxHeight}
				bottomInset={bottomInset}
				testID={testID}
				{...contentProps}
			>
				<Sheet.Handle />
				{title || description ? (
					<Sheet.Header>
						<Sheet.HeaderText>
							{title ? <Sheet.Title>{title}</Sheet.Title> : null}
							{description ? <Sheet.Description>{description}</Sheet.Description> : null}
						</Sheet.HeaderText>
						<Sheet.Close label={closeLabel} />
					</Sheet.Header>
				) : null}
				<Sheet.Body style={bodyStyle}>
					<ScrollView showsVerticalScrollIndicator={false}>
						<View
							style={{ gap: theme.spacing.xs }}
							testID={testID ? `${testID}-actions` : undefined}
						>
							{actions.map((action) => (
								<SheetListItem
									key={action.id}
									label={action.label}
									description={action.description}
									icon={action.icon}
									disabled={action.disabled}
									tone={action.tone}
									variant="raised"
									onPress={() => handleAction(action)}
									style={actionStyle}
									testID={testID ? `${testID}-action-${action.id}` : undefined}
								/>
							))}
						</View>
					</ScrollView>
				</Sheet.Body>
				<Sheet.Footer>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={cancelLabel}
						onPress={onClose}
						style={{
							minHeight: 48,
							alignItems: "center",
							justifyContent: "center",
							borderRadius: theme.radius.md,
							backgroundColor: theme.colors.surface,
							borderWidth: 1,
							borderColor: theme.colors.border,
							marginTop: theme.spacing.sm,
						}}
						testID={testID ? `${testID}-cancel` : undefined}
					>
						<Text variant="button" colorKey="text">
							{cancelLabel}
						</Text>
					</Pressable>
				</Sheet.Footer>
			</Sheet.Content>
		</Sheet.Root>
	);
};
