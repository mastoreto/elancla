import { describe, expect, test } from "bun:test";
import {
  BLOG_COVER_GLYPHS,
  BLOG_COVER_TINTS,
  blogCoverSchema,
} from "./blogCover";

const MEDIA_ID = "0197f1a0-0000-7000-8000-000000000001";

describe("blogCoverSchema", () => {
  test("accepts a photo and a design cover", () => {
    expect(
      blogCoverSchema.safeParse({
        kind: "photo",
        mediaId: MEDIA_ID,
        alt: "Un ancla",
      }).success,
    ).toBe(true);
    expect(
      blogCoverSchema.safeParse({
        kind: "design",
        glyph: BLOG_COVER_GLYPHS[0],
        tint: BLOG_COVER_TINTS[0],
      }).success,
    ).toBe(true);
  });

  test("rejects a hex tint, an unknown glyph and mixed shapes", () => {
    expect(
      blogCoverSchema.safeParse({
        kind: "design",
        glyph: "anchor",
        tint: "#efebe3",
      }).success,
    ).toBe(false);
    expect(
      blogCoverSchema.safeParse({ kind: "design", glyph: "FE", tint: "paper" })
        .success,
    ).toBe(false);
    expect(
      blogCoverSchema.safeParse({
        kind: "design",
        glyph: "anchor",
        tint: "paper",
        mediaId: MEDIA_ID,
      }).success,
    ).toBe(false);
  });

  test("rejects a photo without a valid media id", () => {
    expect(
      blogCoverSchema.safeParse({ kind: "photo", mediaId: "x", alt: "" })
        .success,
    ).toBe(false);
  });
});
