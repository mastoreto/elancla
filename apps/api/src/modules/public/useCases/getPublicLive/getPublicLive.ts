import type { PublicLiveDto } from "@ancla/contracts";
import {
  getVideoPlatform,
  PlatformRequestError,
} from "../../../../core/platforms";
import { createTtlCache, findYoutubeChannelId } from "../../../sermons";

const LIVE_TTL_MS = 60 * 1000;
/** A failed read is remembered far less than an answer: the platform may be back in seconds. */
const DEGRADED_TTL_MS = 15 * 1000;
const NOT_LIVE: PublicLiveDto = { live: false };

export interface PublicLiveResult {
  live: PublicLiveDto;
  /** The platform could not answer, so `live` is a guess ("not live") and must be kept briefly. */
  degraded: boolean;
}

/** The answer per organization: every visitor's poll shares one platform request a minute. */
const liveCache = createTtlCache<PublicLiveDto>(LIVE_TTL_MS);
/** Organizations whose last platform read failed, for `DEGRADED_TTL_MS`. */
const degradedCache = createTtlCache<PublicLiveDto>(DEGRADED_TTL_MS);

/** For tests: forget what was read from the platform. */
export const clearPublicLiveCache = (): void => {
  liveCache.clear();
  degradedCache.clear();
};

/**
 * Whether the church's channel is streaming. Without a platform (no `YOUTUBE_API_KEY`) or without
 * a configured channel there is nothing to ask: not live. A platform that cannot answer (quota,
 * network) also answers "not live" instead of an error, flagged `degraded` and remembered for 15
 * seconds only, so a quota failure does not read as "offline" for a whole minute and the web's
 * poller never sees an error.
 */
export async function getPublicLive(
  organizationId: string,
): Promise<PublicLiveResult> {
  const cached = liveCache.get(organizationId);
  if (cached) return { live: cached, degraded: false };
  const failed = degradedCache.get(organizationId);
  if (failed) return { live: failed, degraded: true };

  const platform = getVideoPlatform();
  const channelId = platform
    ? await findYoutubeChannelId(organizationId)
    : null;
  if (!platform || channelId === null)
    return { live: NOT_LIVE, degraded: false };

  try {
    const stream = await platform.getLiveStream(channelId);
    const answer: PublicLiveDto = stream
      ? { live: true, videoId: stream.videoId, title: stream.title }
      : NOT_LIVE;
    liveCache.set(organizationId, answer);
    return { live: answer, degraded: false };
  } catch (error) {
    if (!(error instanceof PlatformRequestError)) throw error;
    console.warn("Live status unavailable, answering not live", {
      organizationId,
      status: error.status,
      message: error.message,
    });
    degradedCache.set(organizationId, NOT_LIVE);
    return { live: NOT_LIVE, degraded: true };
  }
}
