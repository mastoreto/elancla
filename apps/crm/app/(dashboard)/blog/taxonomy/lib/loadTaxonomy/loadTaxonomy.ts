import { notFound } from "next/navigation";
// ponytail: shared with the people and pages screens; it moves to `website/lib` if a fourth needs it.
import { loadSiteLocales } from "@/app/(dashboard)/website/people/lib/loadSiteLocales";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import type { TaxonomyData } from "../../types";

const HTTP_FORBIDDEN = 403;

/** Categories, series and the site languages; a role without `blogPosts:view` gets a 404. */
export async function loadTaxonomy(api: ServerApiClient): Promise<TaxonomyData> {
  const [categories, series, site] = await Promise.all([
    api.content.categories.$get(),
    api.content.series.$get(),
    loadSiteLocales(api),
  ]);
  if (categories.status === HTTP_FORBIDDEN || series.status === HTTP_FORBIDDEN) notFound();
  if (!categories.ok || !series.ok) {
    throw new Error(`Could not load the taxonomy (${categories.status}/${series.status})`);
  }
  return {
    categories: (await categories.json()).items,
    series: (await series.json()).items,
    site,
  };
}
