import { describe, expect, test } from "bun:test";
import { platformLookupBody } from "../platforms";
import { publicLiveDto } from "./publicSermonDto";
import { createSermonBody } from "./sermonDto";
import {
  importSeriesBody,
  updateSermonSeriesBody,
  upsertSermonSeriesBody,
} from "./sermonSeriesDto";

const ID = "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b";
const translations = {
  es: { title: "Romanos", slug: "romanos", description: null, tags: [] },
};

describe("createSermonBody", () => {
  test("accepts a video alone, with a series or with a new series", () => {
    expect(createSermonBody.safeParse({ video: "dQw4w9WgXcQ" }).success).toBe(
      true,
    );
    expect(
      createSermonBody.safeParse({ video: "dQw4w9WgXcQ", seriesId: ID })
        .success,
    ).toBe(true);
    expect(
      createSermonBody.safeParse({
        video: "https://youtu.be/dQw4w9WgXcQ",
        newSeriesTitle: "Romanos",
      }).success,
    ).toBe(true);
  });

  test("rejects both series options, an empty video and unknown keys", () => {
    expect(
      createSermonBody.safeParse({
        video: "x",
        seriesId: ID,
        newSeriesTitle: "Romanos",
      }).success,
    ).toBe(false);
    expect(createSermonBody.safeParse({ video: "  " }).success).toBe(false);
    expect(createSermonBody.safeParse({ video: "x", title: "y" }).success).toBe(
      false,
    );
  });
});

describe("sermon series bodies", () => {
  test("upsert fills the defaults and needs one language", () => {
    const parsed = upsertSermonSeriesBody.parse({ translations });
    expect(parsed).toMatchObject({
      coverMediaId: null,
      plannedCount: null,
      order: 0,
    });
    expect(upsertSermonSeriesBody.safeParse({ translations: {} }).success).toBe(
      false,
    );
  });

  test("the playlist id is not editable", () => {
    expect(
      upsertSermonSeriesBody.safeParse({
        translations,
        youtubePlaylistId: "PL123",
      }).success,
    ).toBe(false);
  });

  test("update needs the version", () => {
    expect(updateSermonSeriesBody.safeParse({ translations }).success).toBe(
      false,
    );
    expect(
      updateSermonSeriesBody.safeParse({ translations, version: 1 }).success,
    ).toBe(true);
  });

  test("import takes a playlist", () => {
    expect(importSeriesBody.safeParse({ playlist: "PLabc" }).success).toBe(
      true,
    );
    expect(importSeriesBody.safeParse({ playlist: "" }).success).toBe(false);
  });
});

describe("platformLookupBody", () => {
  test("knows what the video is for", () => {
    expect(
      platformLookupBody.safeParse({ input: "x", for: "sermon" }).success,
    ).toBe(true);
    expect(
      platformLookupBody.safeParse({ input: "x", for: "podcast-episode" })
        .success,
    ).toBe(true);
    expect(
      platformLookupBody.safeParse({ input: "x", for: "blog" }).success,
    ).toBe(false);
  });
});

describe("publicLiveDto", () => {
  test("is either off or on with a video", () => {
    expect(publicLiveDto.safeParse({ live: false }).success).toBe(true);
    expect(
      publicLiveDto.safeParse({ live: true, videoId: "abc", title: "Culto" })
        .success,
    ).toBe(true);
  });

  test("rejects an incomplete or mixed answer", () => {
    expect(publicLiveDto.safeParse({ live: true }).success).toBe(false);
    expect(
      publicLiveDto.safeParse({ live: false, videoId: "abc" }).success,
    ).toBe(false);
  });
});
