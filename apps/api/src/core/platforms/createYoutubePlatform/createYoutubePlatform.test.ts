import { describe, expect, test } from "bun:test";
import {
  createRecordedYoutubeFetch,
  RECORDED_YOUTUBE_API_KEY,
} from "../../../../test/support/recordedYoutubeFetch";
import { PlatformRequestError } from "../PlatformRequestError";
import {
  VIDEO_PLATFORM_CONTRACT_IDS as IDS,
  runVideoPlatformContract,
} from "../videoPlatformContract";
import { createYoutubePlatform } from "./createYoutubePlatform";

const recordedFetch = createRecordedYoutubeFetch();
const createPlatform = () =>
  createYoutubePlatform({
    apiKey: RECORDED_YOUTUBE_API_KEY,
    fetch: recordedFetch,
  });

runVideoPlatformContract(createPlatform);

describe("createYoutubePlatform", () => {
  test("maps a public video: duration in seconds, views, best thumbnail, ISO date", async () => {
    expect(await createPlatform().getVideo(IDS.publicVideoId)).toEqual({
      id: IDS.publicVideoId,
      title: "La fe que permanece | Serie Firmes en la tormenta",
      description:
        "Mensaje del domingo sobre Hebreos 11.\n\nSuscríbete y activa la campana.\nwww.elancla.example",
      thumbnailUrl: `https://i.ytimg.com/vi/${IDS.publicVideoId}/maxresdefault.jpg`,
      durationSeconds: 3723,
      publishedAt: "2026-11-15T15:30:12Z",
      viewCount: 1523,
    });
  });

  test("falls back to a smaller thumbnail when there is no maxres", async () => {
    const batch = await createPlatform().getVideos([
      IDS.secondVideoId,
      IDS.missingVideoId,
      IDS.publicVideoId,
      IDS.privateVideoId,
    ]);
    expect(batch[0]?.thumbnailUrl).toBe(
      `https://i.ytimg.com/vi/${IDS.secondVideoId}/sddefault.jpg`,
    );
    expect(batch[0]?.durationSeconds).toBe(48 * 60 + 17);
  });

  test("a series cover comes from the playlist", async () => {
    expect(await createPlatform().getPlaylist(IDS.playlistId)).toEqual({
      id: IDS.playlistId,
      title: "Firmes en la tormenta",
      description: "Serie sobre la fe en tiempos difíciles.",
      thumbnailUrl: `https://i.ytimg.com/vi/${IDS.publicVideoId}/maxresdefault.jpg`,
    });
  });

  test("live detection costs two cheap calls and never uses search", async () => {
    const countingFetch = createRecordedYoutubeFetch();
    const platform = createYoutubePlatform({
      apiKey: RECORDED_YOUTUBE_API_KEY,
      fetch: countingFetch,
    });
    const live = await platform.getLiveStream(IDS.liveChannelId);
    expect(live).toEqual({
      videoId: "Lv3aZ8qWx1C",
      title: "EN VIVO | Culto de domingo",
    });
    const endpoints = countingFetch.requests.map((url) =>
      new URL(url).pathname.split("/").pop(),
    );
    expect(endpoints).toEqual(["playlistItems", "videos"]);
  });

  test("a channel id that is not one never reaches the platform", async () => {
    const countingFetch = createRecordedYoutubeFetch();
    const platform = createYoutubePlatform({
      apiKey: RECORDED_YOUTUBE_API_KEY,
      fetch: countingFetch,
    });
    expect(await platform.getLiveStream("@iglesia")).toBeNull();
    expect(await platform.listRecentUploads("@iglesia", 10)).toEqual([]);
    expect(countingFetch.requests).toEqual([]);
  });

  test("a rejected key or an exhausted quota throws PlatformRequestError with the status", async () => {
    const platform = createYoutubePlatform({
      apiKey: "wrong-key",
      fetch: recordedFetch,
    });
    const failure = await platform
      .getVideo(IDS.publicVideoId)
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(PlatformRequestError);
    expect((failure as PlatformRequestError).status).toBe(400);

    const quota = createYoutubePlatform({
      apiKey: "any",
      fetch: async () =>
        Response.json({ error: { code: 403 } }, { status: 403 }),
    });
    await expect(quota.getVideo(IDS.publicVideoId)).rejects.toMatchObject({
      status: 403,
    });
  });

  test("a network failure throws PlatformRequestError without a status", async () => {
    const platform = createYoutubePlatform({
      apiKey: "any",
      fetch: async () => {
        throw new Error("socket hang up");
      },
    });
    await expect(platform.getVideo(IDS.publicVideoId)).rejects.toMatchObject({
      name: "PlatformRequestError",
      status: null,
    });
  });
});
