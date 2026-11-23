import { describe, expect, test } from "bun:test";
import { toPublicSermonCover } from "./toPublicSermonCover";

const image = { url: "https://cdn.test/a.webp", width: 800, height: 450 };

describe("toPublicSermonCover", () => {
  test("the own cover replaces the thumbnail of the platform", () => {
    expect(
      toPublicSermonCover({
        ownImages: [image],
        thumbnailUrl: "https://yt/t.jpg",
      }),
    ).toEqual({ kind: "image", images: [image] });
  });

  test("without an own ready cover it uses the thumbnail", () => {
    expect(
      toPublicSermonCover({ ownImages: [], thumbnailUrl: "https://yt/t.jpg" }),
    ).toEqual({ kind: "thumbnail", url: "https://yt/t.jpg" });
    expect(
      toPublicSermonCover({
        ownImages: undefined,
        thumbnailUrl: "https://yt/t.jpg",
      }),
    ).toEqual({ kind: "thumbnail", url: "https://yt/t.jpg" });
  });

  test("is null when there is neither", () => {
    expect(
      toPublicSermonCover({ ownImages: undefined, thumbnailUrl: null }),
    ).toBeNull();
  });
});
