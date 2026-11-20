import type { PersonContext, PublicPersonDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { CONTEXT_TO_DB } from "../../../people";
import {
  findOrganizationLocales,
  findVisiblePeopleInContext,
} from "../../data";
import { resolvePublicLocale } from "../../domain";
import { toPublicPersonDto } from "../../mappers";

/**
 * The visible people of a context, by role order and then name. Texts that are not translated
 * come in the organization's default language.
 */
export async function getPublicPeople(input: {
  organizationId: string;
  context: PersonContext;
  requestedLocale: string | undefined;
}): Promise<PublicPersonDto[]> {
  const { organizationId, context, requestedLocale } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const rows = await findVisiblePeopleInContext({
    organizationId,
    context: CONTEXT_TO_DB[context],
    locales: [locale, defaultLocale],
  });
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  const orderOf = (row: (typeof rows)[number]): number =>
    row.roles[0]?.order ?? 0;
  return rows
    .sort((a, b) => orderOf(a) - orderOf(b) || a.name.localeCompare(b.name))
    .map((row) =>
      toPublicPersonDto(row, { locale, defaultLocale }, publicBaseUrl),
    );
}
