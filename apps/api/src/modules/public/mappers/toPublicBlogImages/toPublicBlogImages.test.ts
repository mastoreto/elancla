import { describe, expect, test } from "bun:test";
import { toPublicBlogImage, webpVariantsOf } from "./toPublicBlogImages";

const variants = [
  { width: 400, height: 300, format: "webp", key: "k/400.webp", size: 1 },
  { width: 1200, height: 900, format: "webp", key: "k/1200.webp", size: 1 },
  { width: 1200, height: 900, format: "avif", key: "k/1200.avif", size: 1 },
];

describe("blog images", () => {
  test("serves the widest webp variant", () => {
    expect(
      toPublicBlogImage({ status: "ready", variants }, "https://m"),
    ).toEqual({ url: "https://m/k/1200.webp", width: 1200, height: 900 });
    expect(
      webpVariantsOf({ status: "ready", variants }, "https://m"),
    ).toHaveLength(2);
  });

  test("a file that is pending, missing or has no variants shows nothing", () => {
    expect(
      toPublicBlogImage({ status: "pending", variants }, "https://m"),
    ).toBeNull();
    expect(toPublicBlogImage(undefined, "https://m")).toBeNull();
    expect(
      toPublicBlogImage({ status: "ready", variants: null }, "https://m"),
    ).toBeNull();
  });
});
