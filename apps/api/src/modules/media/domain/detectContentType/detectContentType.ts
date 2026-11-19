const ASCII = new TextDecoder("latin1");

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const AVIF_BRANDS = new Set(["avif", "avis"]);
const FTYP_BOX_START = 4;
const FTYP_MAJOR_BRAND_START = 8;
const FTYP_BRAND_LENGTH = 4;
const FTYP_BRANDS_END = 32;

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return ASCII.decode(bytes.subarray(start, end));
}

/** AVIF is an ISO-BMFF file: `ftyp` box whose major or compatible brands include avif. */
function isAvif(bytes: Uint8Array): boolean {
  if (ascii(bytes, FTYP_BOX_START, FTYP_MAJOR_BRAND_START) !== "ftyp") {
    return false;
  }
  for (
    let start = FTYP_MAJOR_BRAND_START;
    start + FTYP_BRAND_LENGTH <= Math.min(bytes.length, FTYP_BRANDS_END);
    start += FTYP_BRAND_LENGTH
  ) {
    if (AVIF_BRANDS.has(ascii(bytes, start, start + FTYP_BRAND_LENGTH))) {
      return true;
    }
  }
  return false;
}

/**
 * The content type the bytes really are, from their signature, or `null` when they are not one of
 * the allowlisted formats (HTML, SVG, ZIP and everything else). Only the formats of
 * `MEDIA_PURPOSES` are recognized: five signatures do not justify a dependency.
 */
export function detectContentType(bytes: Uint8Array): string | null {
  if (startsWith(bytes, JPEG_SIGNATURE)) return "image/jpeg";
  if (startsWith(bytes, PNG_SIGNATURE)) return "image/png";
  if (ascii(bytes, 0, 5) === "%PDF-") return "application/pdf";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (isAvif(bytes)) return "image/avif";
  return null;
}
