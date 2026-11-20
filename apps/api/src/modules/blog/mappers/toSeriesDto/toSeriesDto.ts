import type { SeriesDto } from "@ancla/contracts";
import type { SeriesRow } from "../../data";

export function toSeriesDto(row: SeriesRow): SeriesDto {
  return {
    id: row.id,
    version: row.version,
    translations: Object.fromEntries(
      row.translations.map(({ locale, name, slug, description }) => [
        locale,
        { name, slug, description },
      ]),
    ),
  };
}
