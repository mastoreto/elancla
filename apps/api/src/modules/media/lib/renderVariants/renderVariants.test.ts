import { describe, expect, test } from "bun:test";
import sharp from "sharp";
import { readMediaFixture } from "../../../../../test/support/media";
import { renderVariants, variantWidthsFor } from "./renderVariants";

describe("variantWidthsFor", () => {
  test("never enlarges", () => {
    expect(variantWidthsFor(5000)).toEqual([480, 960, 1600]);
    expect(variantWidthsFor(1200)).toEqual([480, 960]);
  });

  test("an image smaller than the smallest step gets a single variant at its width", () => {
    expect(variantWidthsFor(64)).toEqual([64]);
  });
});

describe("renderVariants", () => {
  test("renders webp and avif per width and strips EXIF and GPS", async () => {
    const original = await readMediaFixture("photo-with-exif.jpg");
    expect((await sharp(original).metadata()).exif).toBeDefined();

    const variants = await renderVariants(original);
    expect(variants.map((v) => `${v.width}.${v.format}`)).toEqual([
      "480.webp",
      "480.avif",
      "960.webp",
      "960.avif",
    ]);
    for (const variant of variants) {
      expect((await sharp(variant.body).metadata()).exif).toBeUndefined();
    }
  });

  test("rejects bytes that are not an image", async () => {
    await expect(
      renderVariants(await readMediaFixture("page.html")),
    ).rejects.toThrow();
  });

  test("rejects a canvas over the pixel limit", async () => {
    const huge = await sharp({
      create: { width: 8000, height: 8000, channels: 3, background: "#fff" },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await expect(renderVariants(huge)).rejects.toThrow();
  });
});
