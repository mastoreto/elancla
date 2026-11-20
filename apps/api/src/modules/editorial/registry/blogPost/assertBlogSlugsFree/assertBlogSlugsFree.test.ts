import { describe, expect, test } from "bun:test";
import { blogSlugsOf, findTakenSlug } from "./assertBlogSlugsFree";

const snapshotOf = (slugs: Record<string, string>) => ({
  translations: Object.fromEntries(
    Object.entries(slugs).map(([locale, slug]) => [locale, { slug }]),
  ),
});

describe("findTakenSlug", () => {
  test("returns the slug another post already uses", () => {
    expect(
      findTakenSlug(
        ["uno", "two"],
        [snapshotOf({ es: "otro" }), snapshotOf({ en: "two" })],
      ),
    ).toBe("two");
  });

  test("a slug in another language of another post also clashes", () => {
    expect(findTakenSlug(["hope"], [snapshotOf({ es: "x", en: "hope" })])).toBe(
      "hope",
    );
  });

  test("free slugs and no other posts are fine", () => {
    expect(findTakenSlug(["a"], [snapshotOf({ es: "b" })])).toBeUndefined();
    expect(findTakenSlug(["a"], [])).toBeUndefined();
  });

  test("blogSlugsOf lists the slugs of every language", () => {
    expect(blogSlugsOf(snapshotOf({ es: "a", en: "b" }))).toEqual(["a", "b"]);
  });
});
