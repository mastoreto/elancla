import type { PublicLiveDto } from "@ancla/contracts";
import {
  getVideoPlatform,
  PlatformRequestError,
} from "../../../../core/platforms";
import {
  createTtlCache,
  findYoutubeChannelId,
  PlatformUnavailableError,
} from "../../../sermons";

const LIVE_TTL_MS = 60 * 1000;
const NOT_LIVE: PublicLiveDto = { live: false };

/** The answer per organization: every visitor's poll shares one platform request a minute. */
const liveCache = createTtlCache<PublicLiveDto>(LIVE_TTL_MS);

/** For tests: forget what was read from the platform. */
export const clearPublicLiveCache = (): void => liveCache.clear();

/**
 * Whether the church's channel is streaming. Without a platform (no `YOUTUBE_API_KEY`) or without
 * a configured channel there is nothing to ask: not live. A platform that cannot answer is a 503
 * (nothing is cached), so a quota failure is never remembered as "offline".
 */
export async function getPublicLive(
  organizationId: string,
): Promise<PublicLiveDto> {
  const cached = liveCache.get(organizationId);
  if (cached) return cached;

  const platform = getVideoPlatform();
  const channelId = platform
    ? await findYoutubeChannelId(organizationId)
    : null;
  if (!platform || channelId === null) return NOT_LIVE;

  try {
    const stream = await platform.getLiveStream(channelId);
    const answer: PublicLiveDto = stream
      ? { live: true, videoId: stream.videoId, title: stream.title }
      : NOT_LIVE;
    liveCache.set(organizationId, answer);
    return answer;
  } catch (error) {
    if (error instanceof PlatformRequestError) {
      throw new PlatformUnavailableError();
    }
    throw error;
  }
}
