import {
  type PersonProfileDto,
  type PersonRoleDto,
  personStatsDto,
} from "@ancla/contracts";
import { toMediaFileDto } from "../../../media";
import type { PersonRow } from "../../data";
import { EDITABLE_CONTEXT_FROM_DB } from "../../domain";

/** `publicBaseUrl` is injected: the mapper does not read the environment. */
const titlesOf = (
  translations: PersonRow["roles"][number]["translations"],
): PersonRoleDto["translations"] =>
  Object.fromEntries(
    translations.map(({ locale, title, stats }) => [
      locale,
      { title, stats: personStatsDto.parse(stats) },
    ]),
  );

const byOrder = (
  a: PersonRow["roles"][number],
  b: PersonRow["roles"][number],
): number => a.order - b.order || a.context.localeCompare(b.context);

export function toPersonProfileDto(
  row: PersonRow,
  publicBaseUrl: string,
): PersonProfileDto {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo ? toMediaFileDto(row.photo, publicBaseUrl) : null,
    userId: row.userId,
    translations: Object.fromEntries(
      row.translations.map(({ locale, bio }) => [locale, { bio }]),
    ),
    roles: [...row.roles].sort(byOrder).flatMap((role) => {
      const context = EDITABLE_CONTEXT_FROM_DB[role.context];
      if (!context) return [];
      return [
        {
          context,
          visible: role.visible,
          order: role.order,
          translations: titlesOf(role.translations),
        },
      ];
    }),
    ministryRoles: [...row.roles]
      .filter(
        (role) =>
          role.context === "MINISTRY_LEADER" && role.ministryId !== null,
      )
      .sort(byOrder)
      .map((role) => ({
        ministryId: role.ministryId as string,
        ministryName: role.ministry?.name ?? "",
        visible: role.visible,
        order: role.order,
        translations: titlesOf(role.translations),
      })),
  };
}
