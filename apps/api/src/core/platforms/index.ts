// `runVideoPlatformContract` is not re-exported here on purpose: it imports `bun:test`.
export {
  createYoutubePlatform,
  type FetchLike,
  type YoutubePlatformConfig,
} from "./createYoutubePlatform";
export {
  getVideoPlatform,
  setVideoPlatformForTests,
} from "./getVideoPlatform";
export { PlatformRequestError } from "./PlatformRequestError";
export {
  type LiveStream,
  MAX_VIDEOS_PER_BATCH,
  type PlaylistInfo,
  type VideoInfo,
  type VideoLookupFailure,
  type VideoPlatform,
  type VideoSummary,
} from "./types";
