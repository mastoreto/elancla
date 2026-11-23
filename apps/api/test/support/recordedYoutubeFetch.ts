import path from "node:path";
import { VIDEO_PLATFORM_CONTRACT_IDS as IDS } from "../../src/core/platforms/videoPlatformContract";

const FIXTURES_DIR = path.resolve(import.meta.dir, "../fixtures/youtube");
export const RECORDED_YOUTUBE_API_KEY = "test-youtube-api-key";

const OLDER_UPLOAD_ID = "Ab3dEf5GhIj";
const uploadsOf = (channelId: string) => `UU${channelId.slice(2)}`;

/** `endpoint?param=value` of each request the adapter makes -> the response recorded for it. */
const RECORDED_RESPONSES: Record<string, string> = {
  [`videos?id=${IDS.publicVideoId}`]: "videos-public",
  [`videos?id=${IDS.privateVideoId}`]: "videos-private",
  [`videos?id=${IDS.missingVideoId}`]: "videos-missing",
  [`videos?id=${[IDS.secondVideoId, IDS.missingVideoId, IDS.publicVideoId, IDS.privateVideoId].join(",")}`]:
    "videos-batch",
  // Live check on the channel on air / on the channel with nothing on air.
  [`videos?id=${["Lv3aZ8qWx1C", IDS.publicVideoId, IDS.secondVideoId].join(",")}`]:
    "videos-live-check",
  [`videos?id=${[IDS.publicVideoId, IDS.privateVideoId, IDS.secondVideoId, OLDER_UPLOAD_ID].join(",")}`]:
    "videos-offline-check",
  [`playlistItems?playlistId=${uploadsOf(IDS.liveChannelId)}`]:
    "uploads-live-channel",
  [`playlistItems?playlistId=${uploadsOf(IDS.offlineChannelId)}`]: "uploads",
  // Paged listings: the first page has no token, the next one is asked with `&pageToken=`.
  [`playlistItems?playlistId=${IDS.playlistId}`]: "playlist-items-page-1",
  [`playlistItems?playlistId=${IDS.playlistId}&pageToken=CAMQAA`]:
    "playlist-items-page-2",
  [`playlists?channelId=${IDS.offlineChannelId}`]: "channel-playlists-page-1",
  [`playlists?channelId=${IDS.offlineChannelId}&pageToken=CAIQAA`]:
    "channel-playlists-page-2",
  [`playlists?id=${IDS.playlistId}`]: "playlist",
  [`playlists?id=${IDS.missingPlaylistId}`]: "playlist-missing",
};

const ROUTE_PARAMS = ["id", "playlistId", "channelId"] as const;

export interface RecordedYoutubeFetch {
  (input: string): Promise<Response>;
  /** URLs requested so far, to assert quota-relevant behavior. */
  requests: string[];
}

/**
 * A `fetch` that serves the YouTube Data API v3 responses recorded in `test/fixtures/youtube`.
 * It never touches the network: a request with no recorded response answers 404, so a new call in
 * the adapter fails the contract instead of silently going out.
 */
export function createRecordedYoutubeFetch(): RecordedYoutubeFetch {
  const requests: string[] = [];
  const recordedFetch = async (input: string): Promise<Response> => {
    requests.push(input);
    const url = new URL(input);
    if (url.searchParams.get("key") !== RECORDED_YOUTUBE_API_KEY) {
      return Response.json(
        { error: { code: 400, message: "API key not valid" } },
        { status: 400 },
      );
    }
    const endpoint = url.pathname.split("/").pop() ?? "";
    const param = ROUTE_PARAMS.find((name) => url.searchParams.has(name));
    const pageToken = url.searchParams.get("pageToken");
    const route = `${endpoint}?${param}=${param ? url.searchParams.get(param) : ""}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const fixture = RECORDED_RESPONSES[route];
    if (!fixture) {
      return Response.json(
        { error: { code: 404, message: `No recording for ${route}` } },
        { status: 404 },
      );
    }
    return new Response(Bun.file(path.join(FIXTURES_DIR, `${fixture}.json`)), {
      headers: { "Content-Type": "application/json" },
    });
  };
  return Object.assign(recordedFetch, { requests });
}
