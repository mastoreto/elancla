import {
  getVideoPlatform,
  PlatformRequestError,
  type VideoPlatform,
} from "../../../../core/platforms";
import { PlatformUnavailableError } from "../../domain";

/**
 * Runs `work` against the video platform. With no platform configured (no `YOUTUBE_API_KEY`), or
 * when the platform cannot answer (quota, network), the caller gets 503 `platform_unavailable`:
 * it is the server's situation, not a mistake of the request.
 */
export async function withVideoPlatform<Result>(
  work: (platform: VideoPlatform) => Promise<Result>,
): Promise<Result> {
  const platform = getVideoPlatform();
  if (!platform) throw new PlatformUnavailableError();
  try {
    return await work(platform);
  } catch (error) {
    if (error instanceof PlatformRequestError) {
      throw new PlatformUnavailableError();
    }
    throw error;
  }
}
