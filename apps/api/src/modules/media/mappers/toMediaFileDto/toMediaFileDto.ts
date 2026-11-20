import type { MediaFileDto } from "@ancla/contracts";
import type { MediaFile } from "@ancla/db";
import { buildMediaVariantUrls } from "../buildMediaVariantUrls";

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
    variants: buildMediaVariantUrls(row.variants, publicBaseUrl).map(
      ({ width, format, url }) => ({ width, format, url }),
    ),
    createdAt: row.createdAt.toISOString(),
  };
}
