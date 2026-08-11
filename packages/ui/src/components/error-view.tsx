import React from "react";
import { type ViewProps } from "react-native";
import { EmptyState } from "./empty-state";

export interface ErrorViewProps extends ViewProps {
	title?: string;
	message?: string;
	retryLabel?: string;
	onRetry?: () => void;
	size?: "default" | "compact";
}

export const ErrorView: React.FC<ErrorViewProps> = ({
	title = "Something went wrong",
	message = "Please try again in a moment.",
	retryLabel = "Retry",
	onRetry,
	size,
	...props
}) => {
	return (
		<EmptyState
			icon="CircleAlert"
			title={title}
			message={message}
			actionLabel={onRetry ? retryLabel : undefined}
			onAction={onRetry}
			size={size}
			{...props}
		/>
	);
};
