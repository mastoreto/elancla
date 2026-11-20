import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import type { SiteLocales } from "../../types";

// ponytail: a role with `people:view` but without `site:view` cannot read the site settings, so it
// gets the three launch languages instead of the organization's real list.
const FALLBACK_LOCALES: SiteLocales = { locales: ["es", "en", "pt"], defaultLocale: "es" };

/** The languages the organization works in, which drive the locale tabs of the people screens. */
export async function loadSiteLocales(api: ServerApiClient): Promise<SiteLocales> {
  const response = await api.site.settings.$get();
  if (!response.ok) return FALLBACK_LOCALES;
  const { locales, defaultLocale } = await response.json();
  return { locales, defaultLocale };
}
