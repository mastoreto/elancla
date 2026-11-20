import type { MediaFileDto } from "@ancla/contracts";
import Image from "next/image";
import { getChurchInitials } from "@/lib/church";
import { cn } from "@/lib/utils";
import { photoThumbnailUrl } from "../../utils/photoThumbnailUrl";

const SIZES = {
  sm: { box: cn("size-11 text-sm"), pixels: 44 },
  lg: { box: cn("size-24 text-2xl"), pixels: 96 },
} satisfies Record<string, { box: string; pixels: number }>;

const personAvatarWebsitePage = {
  container: cn(
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
    "bg-[var(--oro-50)] font-bold text-[var(--oro-texto)]",
  ),
  image: cn("object-cover"),
};

interface PersonAvatarProps {
  name: string;
  photo: MediaFileDto | null;
  size?: keyof typeof SIZES;
}

/** The person's photo, or their initials when there is none. */
export function PersonAvatar({ name, photo, size = "sm" }: PersonAvatarProps) {
  const url = photoThumbnailUrl(photo);
  return (
    <span className={cn(personAvatarWebsitePage.container, SIZES[size].box)}>
      {url ? (
        <Image
          alt={name}
          className={personAvatarWebsitePage.image}
          height={SIZES[size].pixels}
          src={url}
          unoptimized={true}
          width={SIZES[size].pixels}
        />
      ) : (
        <span aria-hidden="true">{getChurchInitials(name)}</span>
      )}
    </span>
  );
}
