import { useState } from "react";
import { View } from "react-native";
import {
	Accordion,
	Attachment,
	Bubble,
	Button,
	ButtonGroup,
	Calendar,
	Collapsible,
	Combobox,
	Field,
	InputGroup,
	Message,
	MessageScroller,
	Popover,
	Text,
	type CalendarRange,
} from "@osuki-dev/ui";

const OPTIONS = [
	{ value: "overview", label: "Overview" },
	{ value: "tokens", label: "Tokens" },
	{ value: "engine", label: "Engine" },
];

export function CompositionGallery() {
	const [choice, setChoice] = useState("tokens");
	const [open, setOpen] = useState(false);
	const [day, setDay] = useState<string | CalendarRange>("");
	return (
		<View style={{ gap: 16 }}>
			<Text variant="heading">Composition</Text>
			<Text variant="caption" colorKey="textMuted">
				Fold, pop over, search, group, pick a date, attach a file, and show a message. These stay
				generic so any app can compose them.
			</Text>

			<Accordion type="single" defaultValue="surface">
				<Accordion.Item value="surface">
					<Accordion.Trigger>Surface fills</Accordion.Trigger>
					<Accordion.Content>
						<Text variant="bodySmall" colorKey="textMuted">
							One provider changes opacity for every control. Screens do not wrap each one.
						</Text>
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="type">
					<Accordion.Trigger>Type</Accordion.Trigger>
					<Accordion.Content>
						<Text variant="bodySmall" colorKey="textMuted">
							Labels, captions, and body stay on the same type scale.
						</Text>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion>

			<Collapsible>
				<Collapsible.Trigger>
					<Text variant="body">More detail</Text>
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Text variant="bodySmall" colorKey="textMuted">
						A single disclosure, without turning it into an accordion.
					</Text>
				</Collapsible.Content>
			</Collapsible>

			<Popover.Root open={open} onOpenChange={setOpen}>
				<Popover.Trigger>
					<Text variant="body">Open popover</Text>
				</Popover.Trigger>
				<Popover.Content>
					<Text variant="body">Anchored to the trigger. It is not a full sheet.</Text>
				</Popover.Content>
			</Popover.Root>

			<Combobox options={OPTIONS} value={choice} onChange={setChoice} placeholder="Choose a section" />

			<Field.Root required>
				<Field.Label>Weight</Field.Label>
				<Field.Description>Shown beside the value, not inside the control.</Field.Description>
				<InputGroup.Root>
					<InputGroup.Addon>kg</InputGroup.Addon>
					<InputGroup.Input placeholder="0" />
				</InputGroup.Root>
			</Field.Root>

			<ButtonGroup>
				<Button variant="secondary">Edit</Button>
				<Button variant="secondary">Duplicate</Button>
				<Button variant="secondary">Share</Button>
			</ButtonGroup>

			<Calendar
				mode="single"
				value={typeof day === "string" ? day : undefined}
				onChange={(next) => {
					if (typeof next === "string") setDay(next);
				}}
			/>

			<Attachment title="notes.txt" description="Ready" status="ready" />

			<MessageScroller style={{ maxHeight: 160 }}>
				<Message.Root align="start">
					<Message.Author>Ada</Message.Author>
					<Bubble>The track paints once.</Bubble>
				</Message.Root>
				<Message.Root align="end">
					<Bubble>And the reply stays on the end.</Bubble>
					<Message.Time>12:04</Message.Time>
				</Message.Root>
			</MessageScroller>
		</View>
	);
}
