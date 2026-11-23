import type { UpsertSermonSeriesBody } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import { NotFoundError, ValidationError } from "../../../../core/errors";
import { TaxonomySlugTakenError } from "../../../blog";
import { assertMediaValid } from "../../../editorial";
import { findOrganizationSermonConfig, findTakenSeriesSlug } from "../../data";

/**
 * What every write of a series must satisfy, in its transaction: the languages include the
 * organization's default one and only enabled ones (400, one issue per fault), the cover is a
 * finished content image of the organization (400 `invalid_media`), and no slug is used by another
 * series of the same language (409 `slug_taken`).
 */
export async function assertSeriesInput(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertSermonSeriesBody,
  exceptId?: string,
): Promise<void> {
  const config = await findOrganizationSermonConfig(tx, organizationId);
  if (!config) throw new NotFoundError("The organization was not found");
  const issues = Object.keys(body.translations)
    .filter((locale) => !config.locales.includes(locale))
    .map((locale) => ({
      path: `translations.${locale}`,
      message: `${locale} is not an enabled language`,
    }));
  if (!body.translations[config.defaultLocale]) {
    issues.push({
      path: `translations.${config.defaultLocale}`,
      message: `The ${config.defaultLocale} translation (the default language) is required`,
    });
  }
  if (issues.length > 0) {
    throw new ValidationError("Some languages are not valid", issues);
  }

  await assertMediaValid(
    { tx, organizationId },
    body.coverMediaId ? [body.coverMediaId] : [],
    "The cover must be a finished content image of the organization",
  );
  const taken = await findTakenSeriesSlug(tx, {
    organizationId,
    slugs: Object.entries(body.translations).map(([locale, { slug }]) => ({
      locale,
      slug,
    })),
    exceptId,
  });
  if (taken) throw new TaxonomySlugTakenError(taken.locale, taken.slug);
}
