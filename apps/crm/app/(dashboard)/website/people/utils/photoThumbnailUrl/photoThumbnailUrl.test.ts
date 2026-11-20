import { describe, expect, test } from "bun:test";
import type { MediaFileDto } from "@ancla/contracts";
import { photoThumbnailUrl } from "./photoThumbnailUrl";

function photoWith(variants: MediaFileDto["variants"]): MediaFileDto {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    purpose: "contentImage",
    status: "ready",
    contentType: "image/jpeg",
    size: 1,
    originalName: "ana.jpg",
    variants,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("photoThumbnailUrl", () => {
  test("is null without a photo or without webp variants", () => {
    expect(photoThumbnailUrl(null)).toBeNull();
    expect(photoThumbnailUrl(photoWith([]))).toBeNull();
  });

  test("picks the narrowest webp variant", () => {
    const photo = photoWith([
      { width: 1200, format: "webp", url: "https://cdn.example.org/1200.webp" },
      { width: 400, format: "webp", url: "https://cdn.example.org/400.webp" },
      { width: 100, format: "avif", url: "https://cdn.example.org/100.avif" },
    ]);
    expect(photoThumbnailUrl(photo)).toBe("https://cdn.example.org/400.webp");
  });
});
