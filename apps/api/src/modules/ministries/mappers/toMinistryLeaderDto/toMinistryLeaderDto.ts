import type { MinistryLeaderDto } from "@ancla/contracts";
import type { MinistryLeaderRow } from "../../data";

export function toMinistryLeaderDto(row: MinistryLeaderRow): MinistryLeaderDto {
  return {
    personProfileId: row.personProfileId,
    name: row.personProfile.name,
    visible: row.visible,
    order: row.order,
    translations: Object.fromEntries(
      row.translations.map(({ locale, title }) => [locale, { title }]),
    ),
  };
}
