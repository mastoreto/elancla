import type { Prisma } from "@ancla/db";
import { NotFoundError, ValidationError } from "../../../../core/errors";
import { findOrganizationBlogConfig } from "../../data";

/**
 * The translations of a category or series must include the organization's default language and
 * only enabled ones (400 with one issue per fault).
 */
export async function assertTaxonomyLocales(
  tx: Prisma.TransactionClient,
  organizationId: string,
  translations: Record<string, unknown>,
): Promise<void> {
  const config = await findOrganizationBlogConfig(tx, organizationId);
  if (!config) throw new NotFoundError("The organization was not found");
  const issues = Object.keys(translations)
    .filter((locale) => !config.locales.includes(locale))
    .map((locale) => ({
      path: `translations.${locale}`,
      message: `${locale} is not an enabled language`,
    }));
  if (!translations[config.defaultLocale]) {
    issues.push({
      path: `translations.${config.defaultLocale}`,
      message: `The ${config.defaultLocale} translation (the default language) is required`,
    });
  }
  if (issues.length > 0) {
    throw new ValidationError("Some languages are not valid", issues);
  }
}
