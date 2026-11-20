import type { MediaVariantDto } from "@ancla/contracts";
import { parseStoredVariants } from "../../domain";

export interface MediaVariantUrl {
  url: string;
  width: number;
  height: number;
  format: MediaVariantDto["format"];
}

/**
 * Public URLs of the stored variants of a file (the `variants` JSON column). `publicBaseUrl` is
 * injected: the mapper does not read the environment.
 */
export function buildMediaVariantUrls(
  storedVariants: unknown,
  publicBaseUrl: string,
): MediaVariantUrl[] {
  return parseStoredVariants(storedVariants).map((variant) => ({
    url: `${publicBaseUrl}/${variant.key}`,
    width: variant.width,
    height: variant.height,
    format: variant.format,
  }));
}
