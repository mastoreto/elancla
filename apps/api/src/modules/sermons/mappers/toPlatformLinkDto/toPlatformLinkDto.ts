import type { PlatformLinkDto } from "@ancla/contracts";
import type { PlatformLinkRow } from "../../data";

const PLATFORM_NAMES = {
  YOUTUBE: "youtube",
  SPOTIFY: "spotify",
  APPLE_PODCASTS: "apple_podcasts",
} as const satisfies Record<
  PlatformLinkRow["platform"],
  PlatformLinkDto["platform"]
>;

export function toPlatformLinkDto(row: PlatformLinkRow): PlatformLinkDto {
  return {
    id: row.id,
    platform: PLATFORM_NAMES[row.platform],
    externalId: row.externalId,
    url: row.url,
    thumbnailUrl: row.thumbnailUrl,
    durationSeconds: row.durationSeconds,
    platformPublishedAt: row.platformPublishedAt?.toISOString() ?? null,
    viewCount: row.viewCount,
    fetchedAt: row.fetchedAt?.toISOString() ?? null,
  };
}
