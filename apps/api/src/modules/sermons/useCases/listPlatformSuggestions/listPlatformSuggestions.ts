import type { PlatformSuggestionListDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../core/context";
import type { VideoSummary } from "../../../../core/platforms";
import { findLinkedVideoIds, findYoutubeChannelId } from "../../data";
import { createTtlCache } from "../../domain";
import { withVideoPlatform } from "../withVideoPlatform";

const SUGGESTIONS_MAX = 50;
const SUGGESTIONS_TTL_MS = 10 * 60 * 1000;

/** Uploads of the channel by organization and channel; what is already linked is filtered per call. */
const uploadsCache = createTtlCache<VideoSummary[]>(SUGGESTIONS_TTL_MS);

/** For tests: forget what was read from the platform. */
export const clearPlatformSuggestionsCache = (): void => uploadsCache.clear();

/**
 * The latest uploads of the church's channel that are not linked yet, to choose from when
 * pasting is not needed. It creates nothing. The uploads are cached 10 minutes per organization
 * (quota); the filter against `PlatformLink` runs on every call, so a video linked a second ago
 * stops being offered. Without a configured channel there is nothing to suggest.
 */
export async function listPlatformSuggestions(
  ctx: AuthenticatedContext,
): Promise<PlatformSuggestionListDto> {
  return withVideoPlatform(async (platform) => {
    const channelId = await findYoutubeChannelId(ctx.organizationId);
    if (channelId === null) return { items: [] };

    const cacheKey = `${ctx.organizationId}:${channelId}`;
    let uploads = uploadsCache.get(cacheKey);
    if (!uploads) {
      uploads = await platform.listRecentUploads(channelId, SUGGESTIONS_MAX);
      uploadsCache.set(cacheKey, uploads);
    }
    const linked = await findLinkedVideoIds(
      ctx.organizationId,
      uploads.map((upload) => upload.id),
    );
    return {
      items: uploads
        .filter((upload) => !linked.has(upload.id))
        .map(({ id, title, thumbnailUrl, publishedAt }) => ({
          externalId: id,
          title,
          thumbnailUrl,
          publishedAt: new Date(publishedAt).toISOString(),
        })),
    };
  });
}
