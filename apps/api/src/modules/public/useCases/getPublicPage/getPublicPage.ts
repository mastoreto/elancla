import type { PublicPageDto, SimplePageSnapshot } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { listLiveSnapshots } from "../../../editorial";
import { findOrganizationLocales } from "../../data";
import { pickPageTranslation, resolvePublicLocale } from "../../domain";
import { toPublicPageDto } from "../../mappers";

const hasSlug = (snapshot: Record<string, unknown>, slug: string): boolean =>
  Object.values((snapshot as unknown as SimplePageSnapshot).translations).some(
    (translation) => translation.slug === slug,
  );

/**
 * A published page by the slug it has in any of its languages, served in the requested one (or the
 * default). Paused and unknown pages are the same 404.
 */
export async function getPublicPage(input: {
  organizationId: string;
  slug: string;
  requestedLocale: string | undefined;
}): Promise<PublicPageDto> {
  const { organizationId, slug, requestedLocale } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const live = await listLiveSnapshots(organizationId, "SIMPLE_PAGE");
  // ponytail: in-memory scan, index slugs if pages grow past ~100
  const found = live.find(({ snapshot }) => hasSlug(snapshot, slug));
  const picked = found
    ? pickPageTranslation(found.snapshot, { locale, defaultLocale })
    : null;
  if (!found || !picked) throw new NotFoundError("The page was not found");
  return toPublicPageDto(picked, found.snapshot);
}
