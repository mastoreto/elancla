import { describe, expect, test } from "bun:test";
import {
  parseYoutubePlaylistId,
  parseYoutubeVideoId,
} from "./parseYoutubeInput";

const ID = "Xr2hP9vKq1M";
const PLAYLIST = "PLm4Zk8Qe2Vt7Hn0Ba5Rw3Ys6Ju9Cd1Fg";

describe("parseYoutubeVideoId", () => {
  test("accepts a bare id and every URL shape", () => {
    for (const input of [
      ID,
      `  ${ID}  `,
      `https://www.youtube.com/watch?v=${ID}`,
      `https://youtube.com/watch?v=${ID}&t=42s&list=${PLAYLIST}`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://youtu.be/${ID}?si=abc`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/live/${ID}?feature=share`,
    ]) {
      expect(parseYoutubeVideoId(input)).toBe(ID);
    }
  });

  test("rejects everything else", () => {
    for (const input of [
      "",
      "   ",
      "not a video",
      "short",
      `${ID}x`,
      "https://www.youtube.com/watch?v=tooshort",
      "https://www.youtube.com/watch",
      "https://www.youtube.com/channel/UCh1LiveCh4nnelAbcDefGh",
      `https://evil.example/watch?v=${ID}`,
      `https://youtube.com.evil.example/watch?v=${ID}`,
      `ftp://youtu.be/${ID}`,
      `javascript:alert(1)//${ID}`,
    ]) {
      expect(parseYoutubeVideoId(input)).toBeNull();
    }
  });
});

describe("parseYoutubePlaylistId", () => {
  test("accepts a bare id and a URL with `list`", () => {
    expect(parseYoutubePlaylistId(PLAYLIST)).toBe(PLAYLIST);
    expect(
      parseYoutubePlaylistId(
        `https://www.youtube.com/playlist?list=${PLAYLIST}`,
      ),
    ).toBe(PLAYLIST);
    expect(
      parseYoutubePlaylistId(
        `https://www.youtube.com/watch?v=${ID}&list=${PLAYLIST}`,
      ),
    ).toBe(PLAYLIST);
  });

  test("rejects video ids, foreign hosts and garbage", () => {
    for (const input of [
      "",
      ID,
      "https://www.youtube.com/playlist",
      `https://evil.example/playlist?list=${PLAYLIST}`,
      "https://www.youtube.com/playlist?list=short",
    ]) {
      expect(parseYoutubePlaylistId(input)).toBeNull();
    }
  });
});
