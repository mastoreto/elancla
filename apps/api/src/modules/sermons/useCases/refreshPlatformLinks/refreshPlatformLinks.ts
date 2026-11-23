import { db } from "@ancla/db";
import {
  getVideoPlatform,
  MAX_VIDEOS_PER_BATCH,
  PlatformRequestError,
} from "../../../../core/platforms";
import { listYoutubeLinkBatch, updatePlatformLinkFields } from "../../data";
import { PlatformUnavailableError, toPlatformLinkFields } from "../../domain";

/**
 * Refreshes what YouTube says (cover, duration, views, original date) about every YouTube link of
 * every organization, in batches of `MAX_VIDEOS_PER_BATCH` videos per request (1 quota unit each).
 * A video the platform no longer returns (private, removed) keeps its last known data. Each batch
 * is written as it arrives, so a failure midway keeps what was done and the next run goes on.
 * Without a platform (no `YOUTUBE_API_KEY`) there is nothing to refresh. Returns how many links
 * were rewritten. No audit entry: it is a metric read, not a change of anyone's data.
 */
export async function refreshPlatformLinks(
  now: Date = new Date(),
): Promise<number> {
  const platform = getVideoPlatform();
  if (!platform) return 0;
  let refreshed = 0;
  let afterId: string | null = null;
  try {
    for (;;) {
      const batch = await listYoutubeLinkBatch(afterId, MAX_VIDEOS_PER_BATCH);
      const last = batch.at(-1);
      if (!last) return refreshed;
      afterId = last.id;

      const videos = await platform.getVideos([
        ...new Set(batch.map((link) => link.externalId)),
      ]);
      const byId = new Map(videos.map((video) => [video.id, video]));
      for (const link of batch) {
        const video = byId.get(link.externalId);
        if (!video) continue;
        await updatePlatformLinkFields(
          db,
          link.id,
          toPlatformLinkFields(video, now),
        );
        refreshed += 1;
      }
    }
  } catch (error) {
    if (error instanceof PlatformRequestError) {
      throw new PlatformUnavailableError();
    }
    throw error;
  }
}
