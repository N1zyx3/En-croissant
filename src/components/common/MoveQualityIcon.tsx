import { Image, type ImageProps } from "@mantine/core";
import { MOVE_QUALITY_ICON, type MoveQuality } from "@/utils/moveIcons";

interface MoveQualityIconProps extends Omit<ImageProps, "src" | "alt"> {
    quality: MoveQuality;
    alt?: string;
}

export default function MoveQualityIcon({ quality, alt, ...props }: MoveQualityIconProps) {
    return (
        <Image
            src={MOVE_QUALITY_ICON[quality]}
            alt={alt ?? quality}
            fit="contain"
            {...props}
        />
    );
}
