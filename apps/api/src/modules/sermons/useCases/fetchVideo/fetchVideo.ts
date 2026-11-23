import type { VideoInfo } from "../../../../core/platforms";
import {
  InvalidVideoIdError,
  VideoNotFoundError,
  VideoPrivateError,
} from "../../domain";
import { withVideoPlatform } from "../withVideoPlatform";

/**
 * Reads what the platform says about a pasted video (URL or id). The failures are the ones the
 * editor can act on: 422 `invalid_video_id`, 404 `video_not_found`, 422 `video_private`; and 503
 * `platform_unavailable` when there is no platform to ask.
 */
export function fetchVideo(input: string): Promise<VideoInfo> {
  return withVideoPlatform(async (platform) => {
    const videoId = platform.parseVideoId(input);
    if (videoId === null) throw new InvalidVideoIdError();
    const video = await platform.getVideo(videoId);
    if (video === "not_found") throw new VideoNotFoundError();
    if (video === "private") throw new VideoPrivateError();
    return video;
  });
}
