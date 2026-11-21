import type { MinistryCategoryDto } from "@ancla/contracts";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";

/**
 * The categories for the selects and labels. A role that can read ministries but not the list gets
 * it empty rather than a broken page.
 */
export async function loadMinistryCategories(
  api: ServerApiClient,
): Promise<readonly MinistryCategoryDto[]> {
  const response = await api.content["ministry-categories"].$get();
  return response.ok ? (await response.json()).items : [];
}
