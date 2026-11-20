import type { UpdateVisitBody } from "@ancla/contracts";
import { ValidationError } from "../../../../core/errors";

interface LocaleIssue {
  path: string;
  message: string;
}

function unknownLocaleIssues(
  prefix: string,
  locales: string[],
  enabledLocales: readonly string[],
): LocaleIssue[] {
  return locales
    .filter((locale) => !enabledLocales.includes(locale))
    .map((locale) => ({
      path: `${prefix}.${locale}`,
      message: `${locale} is not an enabled language`,
    }));
}

/**
 * Every language must be enabled for the organization, and every FAQ needs the default-language
 * text (it is what the other languages fall back to).
 */
export function assertVisitLocales(
  body: UpdateVisitBody,
  organization: { locales: readonly string[]; defaultLocale: string },
): void {
  const { locales, defaultLocale } = organization;
  const issues: LocaleIssue[] = unknownLocaleIssues(
    "directions",
    Object.keys(body.directions),
    locales,
  );
  for (const [index, faq] of body.faqs.entries()) {
    const prefix = `faqs.${index}.translations`;
    issues.push(
      ...unknownLocaleIssues(prefix, Object.keys(faq.translations), locales),
    );
    if (!(defaultLocale in faq.translations)) {
      issues.push({
        path: `${prefix}.${defaultLocale}`,
        message: `The ${defaultLocale} (default language) text is required`,
      });
    }
  }
  if (issues.length === 0) return;
  throw new ValidationError("The visit content is not valid", issues);
}
