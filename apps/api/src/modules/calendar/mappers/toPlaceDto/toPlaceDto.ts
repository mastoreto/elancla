import type { PlaceDto } from "@ancla/contracts";
import type { PlaceRow } from "../../data";

export function toPlaceDto(row: PlaceRow): PlaceDto {
  return {
    id: row.id,
    address: row.address,
    mapsUrl: row.mapsUrl,
    order: row.order,
    version: row.version,
    translations: Object.fromEntries(
      row.translations.map(({ locale, name }) => [locale, { name }]),
    ),
  };
}
