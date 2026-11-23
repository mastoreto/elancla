import { describe, expect, test } from "bun:test";
import { toPlatformLinkFields, youtubeWatchUrl } from "./platformLinkFields";

describe("platformLinkFields", () => {
  test("builds the watch url", () => {
    expect(youtubeWatchUrl("abc")).toBe("https://www.youtube.com/watch?v=abc");
  });

  test("maps what the platform says and stamps the read", () => {
    const fetchedAt = new Date("2026-11-20T10:00:00Z");
    expect(
      toPlatformLinkFields(
        {
          id: "abc",
          title: "t",
          description: "d",
          thumbnailUrl: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
          durationSeconds: 60,
          publishedAt: "2026-11-15T15:30:12Z",
          viewCount: null,
        },
        fetchedAt,
      ),
    ).toEqual({
      thumbnailUrl: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
      durationSeconds: 60,
      platformPublishedAt: new Date("2026-11-15T15:30:12Z"),
      viewCount: null,
      fetchedAt,
    });
  });
});
