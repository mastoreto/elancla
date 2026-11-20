import type { PublicPageListDto, PublicPageSummaryDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { listLiveSnapshots } from "../../../editorial";
import { findOrganizationLocales } from "../../data";
import { pickPageTranslation, resolvePublicLocale } from "../../domain";
import { toPublicPageSummaryDto } from "../../mappers";

/** The published pages (paused ones are hidden), by title; a page with no usable language is skipped. */
export async function getPublicPages(input: {
  organizationId: string;
  requestedLocale: string | undefined;
}): Promise<PublicPageListDto> {
  const { organizationId, requestedLocale } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const live = await listLiveSnapshots(organizationId, "SIMPLE_PAGE");
  const items: PublicPageSummaryDto[] = live.flatMap(({ snapshot }) => {
    const picked = pickPageTranslation(snapshot, { locale, defaultLocale });
    return picked ? [toPublicPageSummaryDto(picked)] : [];
  });
  items.sort((a, b) => a.title.localeCompare(b.title, locale));
  return { items };
}
