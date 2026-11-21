import type { MinistryCategoryDto } from "@ancla/contracts";
import type { MinistryCategoryRow } from "../../data";

export function toMinistryCategoryDto(
  row: MinistryCategoryRow,
): MinistryCategoryDto {
  return {
    id: row.id,
    order: row.order,
    version: row.version,
    translations: Object.fromEntries(
      row.translations.map(({ locale, name }) => [locale, { name }]),
    ),
  };
}
