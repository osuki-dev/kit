import React, { useRef } from "react";
import { ScrollView, type ScrollViewInstance, type ScrollViewProps } from "react-native";

export interface MessageScrollerProps extends ScrollViewProps {
	/** Keep the latest message in view until the reader scrolls away. */
	follow?: boolean;
}

/**
 * A conversation scroller. It stays pinned to the latest message while the
 * reader is already at the bottom, and leaves history alone once they move up.
 */
export function MessageScroller({
	follow = true,
	onScroll,
	onContentSizeChange,
	scrollEventThrottle = 32,
	children,
	...props
}: MessageScrollerProps) {
	const ref = useRef<ScrollViewInstance>(null);
	const pinned = useRef(true);

	return (
		<ScrollView
			ref={ref}
			scrollEventThrottle={scrollEventThrottle}
			onScroll={(event) => {
				onScroll?.(event);
				const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
				const distance = contentSize.height - layoutMeasurement.height - contentOffset.y;
				pinned.current = distance < 48;
			}}
			onContentSizeChange={(width, height) => {
				onContentSizeChange?.(width, height);
				if (!follow || !pinned.current) return;
				ref.current?.scrollToEnd({ animated: false });
			}}
			{...props}
		>
			{children}
		</ScrollView>
	);
}
