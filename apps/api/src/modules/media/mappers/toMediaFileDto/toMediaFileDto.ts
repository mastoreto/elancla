import type { MediaFileDto } from "@ancla/contracts";
import type { MediaFile } from "@ancla/db";
import { parseStoredVariants } from "../../domain";

/** `publicBaseUrl` is injected: the mapper does not read the environment. */
export function toMediaFileDto(
  row: MediaFile,
  publicBaseUrl: string,
): MediaFileDto {
  return {
    id: row.id,
    purpose: row.purpose,
    status: row.status,
    contentType: row.contentType,
    size: row.size,
    originalName: row.originalName,
    variants: parseStoredVariants(row.variants).map((variant) => ({
      width: variant.width,
      format: variant.format,
      url: `${publicBaseUrl}/${variant.key}`,
    })),
    createdAt: row.createdAt.toISOString(),
  };
}
