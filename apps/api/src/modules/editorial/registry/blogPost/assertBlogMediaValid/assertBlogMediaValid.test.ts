import { describe, expect, test } from "bun:test";
import { collectBlogMediaIds } from "./assertBlogMediaValid";

const A = "0190a000-0000-7000-8000-000000000001";
const B = "0190a000-0000-7000-8000-000000000002";
const C = "0190a000-0000-7000-8000-000000000003";

const figure = (mediaId: string) => ({ type: "figure", attrs: { mediaId } });
const translation = (...ids: string[]) => ({
  body: { type: "doc", content: ids.map(figure) },
});

describe("collectBlogMediaIds", () => {
  test("gathers the cover photo and the figures of every language, once each", () => {
    const ids = collectBlogMediaIds({
      cover: { kind: "photo", mediaId: A, alt: "" },
      translations: { es: translation(B, C), en: translation(B) },
    });
    expect(ids.sort()).toEqual([A, B, C]);
  });

  test("a design cover and a body without figures reference nothing", () => {
    expect(
      collectBlogMediaIds({
        cover: { kind: "design", glyph: "anchor", tint: "paper" },
        translations: { es: translation() },
      }),
    ).toEqual([]);
  });
});
