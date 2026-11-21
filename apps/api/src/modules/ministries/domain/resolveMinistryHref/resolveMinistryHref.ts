import type { MinistryDestination } from "@ancla/contracts";

interface HrefInput {
  destination: MinistryDestination;
  /** The slug of the served language; only a ministry with a page has one. */
  slug: string | undefined;
  externalUrl: string | null;
  locale: string;
  defaultLocale: string;
}

const PAGE_BASE_PATH = "/ministerios";

/**
 * Where the links to a ministry go: its page (the default language has no prefix on the site),
 * its external URL, or nowhere (`undefined`: the tile and the list entry carry no link).
 */
export function resolveMinistryHref({
  destination,
  slug,
  externalUrl,
  locale,
  defaultLocale,
}: HrefInput): string | undefined {
  if (destination === "external") return externalUrl ?? undefined;
  if (destination === "none" || slug === undefined) return undefined;
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${prefix}${PAGE_BASE_PATH}/${slug}`;
}
