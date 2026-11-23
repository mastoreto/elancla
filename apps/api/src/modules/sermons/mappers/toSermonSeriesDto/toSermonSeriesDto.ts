import type { SermonSeriesDto } from "@ancla/contracts";
import { toMediaFileDto } from "../../../media";
import type { SeriesRow } from "../../data";
import type { SeriesSummary } from "../../domain";

/** `publicBaseUrl` is injected: the mapper does not read the environment. */
export function toSermonSeriesDto(
  row: SeriesRow,
  summary: SeriesSummary | undefined,
  publicBaseUrl: string,
): SermonSeriesDto {
  return {
    id: row.id,
    version: row.version,
    order: row.order,
    plannedCount: row.plannedCount,
    youtubePlaylistId: row.youtubePlaylistId,
    cover: row.coverMedia
      ? toMediaFileDto(row.coverMedia, publicBaseUrl)
      : null,
    sermonCount: summary?.sermonCount ?? 0,
    firstPreachedOn: summary?.firstPreachedOn ?? null,
    lastPreachedOn: summary?.lastPreachedOn ?? null,
    translations: Object.fromEntries(
      row.translations.map(({ locale, title, slug, description, tags }) => [
        locale,
        { title, slug, description, tags },
      ]),
    ),
  };
}
