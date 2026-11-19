import { describe, expect, test } from "bun:test";
import { readMediaFixture } from "../../../../../test/support/media";
import { detectContentType } from "./detectContentType";

const ascii = (text: string): number[] =>
  [...text].map((char) => char.charCodeAt(0));
const padded = (bytes: number[]): Uint8Array =>
  Uint8Array.from([...bytes, ...new Array(32).fill(0)]);

describe("detectContentType", () => {
  test("recognizes JPEG, PNG and PDF from the real fixtures", async () => {
    expect(
      detectContentType(await readMediaFixture("photo-with-exif.jpg")),
    ).toBe("image/jpeg");
    expect(detectContentType(await readMediaFixture("tiny.png"))).toBe(
      "image/png",
    );
    expect(detectContentType(await readMediaFixture("document.pdf"))).toBe(
      "application/pdf",
    );
  });

  test("recognizes WebP by its RIFF container", () => {
    const bytes = padded([...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")]);
    expect(detectContentType(bytes)).toBe("image/webp");
  });

  test("a RIFF file that is not WebP is not an image of ours", () => {
    const wave = padded([...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE")]);
    expect(detectContentType(wave)).toBeNull();
  });

  test("recognizes AVIF by the avif major brand and by a compatible brand", () => {
    const major = padded([0, 0, 0, 24, ...ascii("ftyp"), ...ascii("avif")]);
    const compatible = padded([
      0,
      0,
      0,
      24,
      ...ascii("ftyp"),
      ...ascii("mif1"),
      0,
      0,
      0,
      0,
      ...ascii("avif"),
    ]);
    expect(detectContentType(major)).toBe("image/avif");
    expect(detectContentType(compatible)).toBe("image/avif");
  });

  test("an ISO-BMFF file of another brand (MP4) is not AVIF", () => {
    const mp4 = padded([0, 0, 0, 24, ...ascii("ftyp"), ...ascii("isom")]);
    expect(detectContentType(mp4)).toBeNull();
  });

  test("HTML, SVG, ZIP and empty input are rejected", async () => {
    expect(detectContentType(await readMediaFixture("page.html"))).toBeNull();
    expect(
      detectContentType(
        new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'),
      ),
    ).toBeNull();
    expect(
      detectContentType(Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 0, 0])),
    ).toBeNull();
    expect(detectContentType(new Uint8Array())).toBeNull();
  });
});
