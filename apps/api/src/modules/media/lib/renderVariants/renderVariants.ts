import type { MediaVariantDto } from "@ancla/contracts";
import sharp, { type Sharp } from "sharp";

export const VARIANT_WIDTHS = [480, 960, 1600] as const;
/** Guards against decompression bombs: a small file that declares a gigantic canvas. */
export const MAX_INPUT_PIXELS = 40_000_000;
const AVIF_EFFORT = 4;
const FORMATS: readonly MediaVariantDto["format"][] = ["webp", "avif"];
/** EXIF orientations 5 to 8 swap the sides of the picture. */
const FIRST_SIDEWAYS_ORIENTATION = 5;

export interface RenderedVariant {
  width: number;
  height: number;
  format: MediaVariantDto["format"];
  body: Uint8Array;
}

function openImage(bytes: Uint8Array): Sharp {
  // `rotate()` applies the EXIF orientation: the metadata is dropped from the output, so the
  // pixels must already be upright.
  return sharp(bytes, { limitInputPixels: MAX_INPUT_PIXELS }).rotate();
}

async function uprightWidth(bytes: Uint8Array): Promise<number> {
  const { width, height, orientation } = await sharp(bytes, {
    limitInputPixels: MAX_INPUT_PIXELS,
  }).metadata();
  const sideways = (orientation ?? 1) >= FIRST_SIDEWAYS_ORIENTATION;
  const side = sideways ? height : width;
  if (!side) throw new Error("The image has no readable dimensions");
  return side;
}

/** Widths to render: the standard ones that do not enlarge, or the original's own when smaller. */
export function variantWidthsFor(originalWidth: number): number[] {
  const fitting = VARIANT_WIDTHS.filter((width) => width <= originalWidth);
  return fitting.length > 0 ? fitting : [originalWidth];
}

/**
 * Renders the responsive variants (webp and avif per width) of an image. Metadata (EXIF, GPS)
 * is never copied: it is sharp's default. Throws when the bytes are not a readable image or exceed
 * the pixel limit.
 */
export async function renderVariants(
  bytes: Uint8Array,
): Promise<RenderedVariant[]> {
  const widths = variantWidthsFor(await uprightWidth(bytes));
  const rendered: RenderedVariant[] = [];
  for (const width of widths) {
    for (const format of FORMATS) {
      const resized = openImage(bytes).resize({
        width,
        withoutEnlargement: true,
      });
      const output =
        format === "webp"
          ? resized.webp()
          : resized.avif({ effort: AVIF_EFFORT });
      const { data, info } = await output.toBuffer({ resolveWithObject: true });
      rendered.push({
        width: info.width,
        height: info.height,
        format,
        body: new Uint8Array(data),
      });
    }
  }
  return rendered;
}
