import { describe, expect, test } from "bun:test";
import type { VideoInfo } from "../../../../core/platforms";
import { buildSermonDraft } from "./buildSermonDraft";

const video: VideoInfo = {
  id: "Xr2hP9vKq1M",
  title: "La fe que permanece | Serie Firmes en la tormenta",
  description: "Mensaje del domingo sobre Hebreos 11.",
  thumbnailUrl: "https://i.ytimg.com/vi/Xr2hP9vKq1M/hqdefault.jpg",
  durationSeconds: 3723,
  publishedAt: "2026-11-16T01:30:00Z",
  viewCount: 10,
};

describe("buildSermonDraft", () => {
  test("preloads the default language and the date in the church's zone", () => {
    const draft = buildSermonDraft({
      video,
      locale: "es",
      timezone: "America/Montevideo",
    });
    expect(draft.translations).toEqual({
      es: {
        title: video.title,
        slug: "la-fe-que-permanece-serie-firmes-en-la-tormenta",
        summary: "Mensaje del domingo sobre Hebreos 11.",
        tags: [],
      },
    });
    // 01:30 UTC of the 16th is still the 15th in Montevideo.
    expect(draft.preachedOn).toBe("2026-11-15");
    expect(draft.seriesId).toBeUndefined();
    expect(draft.featured).toBe(false);
  });

  test("fits long titles and descriptions into the limits and drops an empty summary", () => {
    const long = buildSermonDraft({
      video: { ...video, title: "T".repeat(300), description: "D".repeat(900) },
      locale: "es",
      timezone: "UTC",
    });
    expect(long.translations.es?.title.length).toBe(140);
    expect(long.translations.es?.summary?.length).toBe(500);

    const empty = buildSermonDraft({
      video: { ...video, description: "  " },
      locale: "es",
      timezone: "UTC",
    });
    expect(empty.translations.es?.summary).toBeUndefined();
  });

  test("takes the next free slug when the title's one is already in use", () => {
    const draft = buildSermonDraft({
      video,
      locale: "es",
      timezone: "UTC",
      takenSlugs: new Set(["la-fe-que-permanece-serie-firmes-en-la-tormenta"]),
    });
    expect(draft.translations.es?.slug).toBe(
      "la-fe-que-permanece-serie-firmes-en-la-tormenta-2",
    );
  });

  test("puts the sermon in its series at the given position", () => {
    const draft = buildSermonDraft({
      video,
      locale: "es",
      timezone: "UTC",
      series: { id: "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b", order: 3 },
    });
    expect(draft).toMatchObject({
      seriesId: "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b",
      seriesOrder: 3,
    });
  });
});
