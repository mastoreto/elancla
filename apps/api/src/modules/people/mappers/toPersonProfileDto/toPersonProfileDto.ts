import type { PersonProfileDto } from "@ancla/contracts";
import { toMediaFileDto } from "../../../media";
import type { PersonRow } from "../../data";
import { CONTEXT_FROM_DB } from "../../domain";

/** `publicBaseUrl` is injected: the mapper does not read the environment. */
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
    roles: [...row.roles]
      .sort((a, b) => a.order - b.order || a.context.localeCompare(b.context))
      .map((role) => ({
        context: CONTEXT_FROM_DB[role.context],
        visible: role.visible,
        order: role.order,
        translations: Object.fromEntries(
          role.translations.map(({ locale, title }) => [locale, { title }]),
        ),
      })),
  };
}
