import { describe, expect, test } from "bun:test";
import { toPublicBlogBody } from "./toPublicBlogBody";

const MEDIA_READY = "0197f1a0-0000-7000-8000-000000000001";
const MEDIA_MISSING = "0197f1a0-0000-7000-8000-000000000002";
const image = { url: "https://m/k.webp", width: 800, height: 600 };
const figure = (mediaId: string) => ({
  type: "figure",
  attrs: { mediaId, alt: "Foto", aspect: "wide" },
});
const paragraph = {
  type: "paragraph",
  content: [{ type: "text", text: "Hola" }],
};

describe("toPublicBlogBody", () => {
  test("replaces the media id of a figure by its image and keeps the other blocks", () => {
    const body = toPublicBlogBody(
      { type: "doc", content: [paragraph, figure(MEDIA_READY)] },
      new Map([[MEDIA_READY, image]]),
    );
    expect(body.content).toEqual([
      paragraph,
      { type: "figure", attrs: { image, alt: "Foto", aspect: "wide" } },
    ]);
  });

  test("leaves out a figure whose image is not ready", () => {
    const body = toPublicBlogBody(
      { type: "doc", content: [figure(MEDIA_MISSING), paragraph] },
      new Map(),
    );
    expect(body.content).toEqual([paragraph]);
  });

  test("rejects a stored body that is not a valid document", () => {
    expect(() =>
      toPublicBlogBody(
        { type: "doc", content: [{ type: "script" }] },
        new Map(),
      ),
    ).toThrow();
  });
});
