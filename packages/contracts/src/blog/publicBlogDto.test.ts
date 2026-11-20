import { describe, expect, test } from "bun:test";
import {
  publicBlogCoverDto,
  publicPostSummaryDto,
  publicSeriesItemDto,
  recordPostViewBody,
} from "./publicBlogDto";

describe("recordPostViewBody", () => {
  test("accepts an ip and a user agent, including an empty user agent", () => {
    expect(
      recordPostViewBody.safeParse({
        ip: "203.0.113.7",
        userAgent: "Mozilla/5.0",
      }).success,
    ).toBe(true);
    expect(
      recordPostViewBody.safeParse({ ip: "203.0.113.7", userAgent: "" })
        .success,
    ).toBe(true);
  });

  test("bounds the user agent to 512 and rejects extra keys", () => {
    expect(
      recordPostViewBody.safeParse({
        ip: "1.1.1.1",
        userAgent: "x".repeat(512),
      }).success,
    ).toBe(true);
    expect(
      recordPostViewBody.safeParse({
        ip: "1.1.1.1",
        userAgent: "x".repeat(513),
      }).success,
    ).toBe(false);
    expect(
      recordPostViewBody.safeParse({ ip: "", userAgent: "x" }).success,
    ).toBe(false);
    expect(
      recordPostViewBody.safeParse({ ip: "1.1.1.1", userAgent: "x", slug: "a" })
        .success,
    ).toBe(false);
  });
});

describe("public blog DTOs", () => {
  const summary = {
    slug: "esperar-bien",
    title: "Esperar bien",
    excerpt: "Extracto",
    locale: "es",
    urlDate: "2026-11-01",
    publishedAt: "2026-11-01T12:00:00.000Z",
    issue: 43,
    readingMinutes: 4,
    category: { slug: "guias", name: "Guías" },
    authorName: "Ana",
    tags: [],
    cover: { kind: "design", glyph: "anchor", tint: "paper" },
  };

  test("a summary is strict: an internal id is rejected", () => {
    expect(publicPostSummaryDto.safeParse(summary).success).toBe(true);
    expect(
      publicPostSummaryDto.safeParse({ ...summary, id: "x" }).success,
    ).toBe(false);
    expect(
      publicPostSummaryDto.safeParse({ ...summary, views: 3 }).success,
    ).toBe(false);
  });

  test("a scheduled series entry carries no slug", () => {
    const next = {
      order: 3,
      title: "Hebreos 7",
      slug: null,
      urlDate: null,
      publishedAt: "2026-12-01T12:00:00.000Z",
      readingMinutes: null,
      state: "next",
    };
    expect(publicSeriesItemDto.safeParse(next).success).toBe(true);
    expect(
      publicSeriesItemDto.safeParse({ ...next, state: "later" }).success,
    ).toBe(false);
  });

  test("a photo cover serves an image, never a media id", () => {
    const image = { url: "https://cdn/x.webp", width: 10, height: 10 };
    expect(
      publicBlogCoverDto.safeParse({ kind: "photo", alt: "A", image }).success,
    ).toBe(true);
    expect(
      publicBlogCoverDto.safeParse({ kind: "photo", alt: "A", mediaId: "x" })
        .success,
    ).toBe(false);
  });
});
