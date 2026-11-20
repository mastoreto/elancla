import { describe, expect, test } from "bun:test";
import { coverMediaId, figureMediaIds } from "./blogMediaIds";

describe("blogMediaIds", () => {
  test("a photo cover has one media file and a design cover none", () => {
    expect(coverMediaId({ kind: "photo", mediaId: "m1", alt: "" })).toEqual([
      "m1",
    ]);
    expect(
      coverMediaId({ kind: "design", glyph: "anchor", tint: "paper" }),
    ).toEqual([]);
  });

  test("lists the figures of the body and ignores other blocks", () => {
    expect(
      figureMediaIds({
        content: [
          { type: "paragraph" },
          { type: "figure", attrs: { mediaId: "m1" } },
          { type: "figure", attrs: {} },
          { type: "figure", attrs: { mediaId: "m2" } },
        ],
      }),
    ).toEqual(["m1", "m2"]);
  });
});
