import { describe, expect, test } from "bun:test";
import { MAX_VIDEOS_PER_BATCH, type VideoPlatform } from "../types";

/**
 * The ids a backend must know about for the suite to run. A recorded-response adapter test serves
 * exactly these; a live check would need a channel that has them.
 */
export const VIDEO_PLATFORM_CONTRACT_IDS = {
  publicVideoId: "Xr2hP9vKq1M",
  /** A second public video, to prove batches keep the order asked for. */
  secondVideoId: "Sd7kJ4bTe-9",
  privateVideoId: "Pv8tR3nLw0Z",
  missingVideoId: "Mi5sSiNg_42",
  playlistId: "PLm4Zk8Qe2Vt7Hn0Ba5Rw3Ys6Ju9Cd1Fg",
  missingPlaylistId: "PLz9Yx8Wv7Ut6Ss5Rr4Qq3Pp2Oo1Nn0Mm",
  /**
   * `playlistId` as listed by `listPlaylistVideos`: public videos in playlist order, served in two
   * pages (a private video sits in the first one).
   */
  playlistVideoIds: [
    "Xr2hP9vKq1M",
    "Sd7kJ4bTe-9",
    "Ab3dEf5GhIj",
    "Qw8nBv3Cx6A",
  ],
  /**
   * The playlists `offlineChannelId` has, in the order listed (two pages); the first one is
   * `playlistId`.
   */
  channelPlaylistIds: [
    "PLm4Zk8Qe2Vt7Hn0Ba5Rw3Ys6Ju9Cd1Fg",
    "PLb7Nn2Kd5Xs8Fq1Hj4Lm6Pw9Rt0Vy3Za",
    "PLc2Wq5Er8Ty1Ui4Op7As0Df3Gh6Jk9Lz",
  ],
  /** A channel with a stream on air. */
  liveChannelId: "UCl1veCh4nnelAbcDefGhiJk",
  /** A channel with uploads (one of them private) and nothing on air. */
  offlineChannelId: "UCqQ0ff1ineCh4nnelXyZ_93",
} as const;

const IDS = VIDEO_PLATFORM_CONTRACT_IDS;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/**
 * Behavior every `VideoPlatform` must have. It receives a factory so any future adapter runs the
 * same suite; the backend behind it must serve `VIDEO_PLATFORM_CONTRACT_IDS`.
 */
export function runVideoPlatformContract(
  createPlatform: () => VideoPlatform,
): void {
  const platform = createPlatform();

  describe("VideoPlatform contract", () => {
    test("rejects ids and URLs that are not a video or a playlist", () => {
      for (const input of ["", "   ", "nope", "https://example.com/watch"]) {
        expect(platform.parseVideoId(input)).toBeNull();
        expect(platform.parsePlaylistId(input)).toBeNull();
      }
      expect(platform.parseVideoId(IDS.publicVideoId)).toBe(IDS.publicVideoId);
      expect(platform.parsePlaylistId(IDS.playlistId)).toBe(IDS.playlistId);
    });

    test("getVideo of a public video returns what the lookup needs", async () => {
      const video = await platform.getVideo(IDS.publicVideoId);
      if (typeof video === "string") throw new Error(`got ${video}`);
      expect(video.id).toBe(IDS.publicVideoId);
      expect(video.title.length).toBeGreaterThan(0);
      expect(typeof video.description).toBe("string");
      expect(video.publishedAt).toMatch(ISO_INSTANT);
      expect(Number.isInteger(video.durationSeconds)).toBe(true);
      expect(Number.isInteger(video.viewCount)).toBe(true);
      expect(video.thumbnailUrl).toStartWith("https://");
    });

    test("getVideo says private and not_found instead of throwing", async () => {
      expect(await platform.getVideo(IDS.privateVideoId)).toBe("private");
      expect(await platform.getVideo(IDS.missingVideoId)).toBe("not_found");
    });

    test("getVideos keeps the order asked for and omits missing and private videos", async () => {
      const videos = await platform.getVideos([
        IDS.secondVideoId,
        IDS.missingVideoId,
        IDS.publicVideoId,
        IDS.privateVideoId,
      ]);
      expect(videos.map((video) => video.id)).toEqual([
        IDS.secondVideoId,
        IDS.publicVideoId,
      ]);
    });

    test("getVideos of nothing is empty and of too many ids is refused", async () => {
      expect(await platform.getVideos([])).toEqual([]);
      const tooMany = Array.from(
        { length: MAX_VIDEOS_PER_BATCH + 1 },
        () => IDS.publicVideoId,
      );
      await expect(platform.getVideos(tooMany)).rejects.toThrow(RangeError);
    });

    test("listRecentUploads returns public uploads, newest first, up to max", async () => {
      const uploads = await platform.listRecentUploads(
        IDS.offlineChannelId,
        50,
      );
      expect(uploads.length).toBeGreaterThan(0);
      expect(uploads.map((upload) => upload.id)).not.toContain(
        IDS.privateVideoId,
      );
      const times = uploads.map((upload) => Date.parse(upload.publishedAt));
      expect(times).toEqual([...times].sort((a, b) => b - a));
      expect(uploads[0]?.title.length).toBeGreaterThan(0);

      const capped = await platform.listRecentUploads(IDS.offlineChannelId, 1);
      expect(capped).toHaveLength(1);
      expect(capped[0]?.id).toBe(uploads[0]?.id);
    });

    test("getPlaylist returns title, description and cover; a missing one is not_found", async () => {
      const playlist = await platform.getPlaylist(IDS.playlistId);
      if (playlist === "not_found") throw new Error("playlist not found");
      expect(playlist.id).toBe(IDS.playlistId);
      expect(playlist.title.length).toBeGreaterThan(0);
      expect(typeof playlist.description).toBe("string");
      expect(playlist.thumbnailUrl).toStartWith("https://");
      expect(await platform.getPlaylist(IDS.missingPlaylistId)).toBe(
        "not_found",
      );
    });

    test("listPlaylistVideos follows the pages, drops private videos and honours max", async () => {
      const videos = await platform.listPlaylistVideos(IDS.playlistId, 50);
      expect(videos.map((video) => video.id)).toEqual([
        ...IDS.playlistVideoIds,
      ]);
      expect(videos[0]?.title.length).toBeGreaterThan(0);
      expect(videos[0]?.publishedAt).toMatch(ISO_INSTANT);
      expect(videos[0]?.thumbnailUrl).toStartWith("https://");

      const capped = await platform.listPlaylistVideos(IDS.playlistId, 3);
      expect(capped.map((video) => video.id)).toEqual(
        IDS.playlistVideoIds.slice(0, 3),
      );
      expect(await platform.listPlaylistVideos(IDS.playlistId, 0)).toEqual([]);
    });

    test("listChannelPlaylists follows the pages and says how many videos each has", async () => {
      const playlists = await platform.listChannelPlaylists(
        IDS.offlineChannelId,
        50,
      );
      expect(playlists.map((playlist) => playlist.id)).toEqual([
        ...IDS.channelPlaylistIds,
      ]);
      expect(playlists[0]).toEqual({
        id: IDS.playlistId,
        title: "Firmes en la tormenta",
        videoCount: 5,
      });
      const capped = await platform.listChannelPlaylists(
        IDS.offlineChannelId,
        1,
      );
      expect(capped.map((playlist) => playlist.id)).toEqual([IDS.playlistId]);
      expect(await platform.listChannelPlaylists("@iglesia", 10)).toEqual([]);
    });

    test("getLiveStream returns the stream on air, and null when there is none", async () => {
      const live = await platform.getLiveStream(IDS.liveChannelId);
      expect(live?.videoId.length).toBeGreaterThan(0);
      expect(live?.title.length).toBeGreaterThan(0);
      expect(await platform.getLiveStream(IDS.offlineChannelId)).toBeNull();
    });
  });
}
