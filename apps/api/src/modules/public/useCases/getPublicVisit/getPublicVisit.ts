import type { PublicVisitDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { findOrganizationLocales, findVisitContent } from "../../data";
import { resolvePublicLocale } from "../../domain";
import { toPublicVisitDto } from "../../mappers";

/** The visit page in the requested language, falling back to the default one text by text. */
export async function getPublicVisit(input: {
  organizationId: string;
  requestedLocale: string | undefined;
}): Promise<PublicVisitDto> {
  const { organizationId, requestedLocale } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const rows = await findVisitContent(organizationId, [locale, defaultLocale]);
  return toPublicVisitDto(rows, { locale, defaultLocale });
}
