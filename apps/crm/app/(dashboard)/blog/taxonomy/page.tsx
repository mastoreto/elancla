import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { TaxonomyPageContent } from "./components/taxonomy-page-content";
import { loadTaxonomy } from "./lib/loadTaxonomy";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function BlogTaxonomyPage() {
  const api = await createServerApiClient();
  const taxonomy = await loadTaxonomy(api);
  return <TaxonomyPageContent {...taxonomy} />;
}
