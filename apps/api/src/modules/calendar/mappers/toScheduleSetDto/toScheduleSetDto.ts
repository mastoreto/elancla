import type { ScheduleSetDto } from "@ancla/contracts";
import type { ScheduleSetRow } from "../../data";
import { formatDateOnly } from "../../domain";

const dateOrNull = (value: Date | null): string | null =>
  value === null ? null : formatDateOnly(value);

export function toScheduleSetDto(row: ScheduleSetRow): ScheduleSetDto {
  return {
    id: row.id,
    validFrom: dateOrNull(row.validFrom),
    validTo: dateOrNull(row.validTo),
    isDefault: row.isDefault,
    forcedActive: row.forcedActive,
    order: row.order,
    version: row.version,
    translations: Object.fromEntries(
      row.translations.map(({ locale, name }) => [locale, { name }]),
    ),
  };
}
