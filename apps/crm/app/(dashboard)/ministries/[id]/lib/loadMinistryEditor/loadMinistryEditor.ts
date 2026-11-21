import { notFound } from "next/navigation";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import { loadMinistryCategories } from "../../../lib/loadMinistryCategories";
import type { MinistryConfiguration } from "../../types";

/**
 * What the Configuración and Responsables cards need. A role that can edit the profile but not
 * read people gets the leaders select empty rather than a broken page.
 */
export async function loadMinistryEditor(
  api: ServerApiClient,
  id: string,
): Promise<MinistryConfiguration> {
  const [ministries, categories, people] = await Promise.all([
    api.content.ministries.$get(),
    loadMinistryCategories(api),
    api.content.people.$get(),
  ]);
  if (!ministries.ok) throw new Error(`Could not load the ministry (${ministries.status})`);
  const ministry = (await ministries.json()).items.find((item) => item.id === id);
  if (!ministry) notFound();
  return {
    ministry,
    categories,
    people: people.ok ? (await people.json()).data : [],
  };
}
