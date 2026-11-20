import type { CategoryDto } from "@ancla/contracts";
import type { CategoryRow } from "../../data";

export function toCategoryDto(row: CategoryRow): CategoryDto {
  return {
    id: row.id,
    order: row.order,
    version: row.version,
    translations: Object.fromEntries(
      row.translations.map(({ locale, name, slug }) => [
        locale,
        { name, slug },
      ]),
    ),
  };
}
