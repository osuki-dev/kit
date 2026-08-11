import { Image as ExpoImage, type ImageProps as ExpoImageProps } from "expo-image";

type ImageContentFit = "cover" | "contain" | "fill" | "none" | "scale-down";
type ImageCachePolicy = "none" | "disk" | "memory" | "memory-disk";

export interface ImageProps extends ExpoImageProps {
	contentFit?: ImageContentFit;
	cachePolicy?: ImageCachePolicy;
	transition?: number;
}

export function Image({ contentFit, cachePolicy, transition, ...props }: ImageProps) {
	return (
		<ExpoImage
			{...props}
			contentFit={contentFit}
			cachePolicy={cachePolicy}
			transition={transition}
		/>
	);
}
