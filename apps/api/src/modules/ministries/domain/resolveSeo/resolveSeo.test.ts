import { describe, expect, test } from "bun:test";
import { resolveSeo } from "./resolveSeo";

const texts = { name: "Alabanza", tagline: "Cantar con entendimiento" };
const image = (url: string) => ({ url, width: 100, height: 50 });

describe("resolveSeo", () => {
  test("falls back to the name, the tagline and the cover", () => {
    expect(
      resolveSeo(texts, { social: undefined, cover: image("cover") }),
    ).toEqual({
      title: "Alabanza",
      description: "Cantar con entendimiento",
      image: image("cover"),
    });
  });

  test("the own SEO texts and the social image win", () => {
    expect(
      resolveSeo(
        { ...texts, seoTitle: "SEO", seoDescription: "Desc" },
        { social: image("social"), cover: image("cover") },
      ),
    ).toEqual({ title: "SEO", description: "Desc", image: image("social") });
  });

  test("no images at all leaves the image out", () => {
    expect(
      resolveSeo(texts, { social: undefined, cover: undefined }).image,
    ).toBeUndefined();
  });
});
