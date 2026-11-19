import type { SiteKeyDto } from "@ancla/contracts";
import { listSiteKeyRows } from "../../data";
import { toSiteKeyDto } from "../../mappers";

export async function listSiteKeys(
  organizationId: string,
): Promise<SiteKeyDto[]> {
  const rows = await listSiteKeyRows(organizationId);
  return rows.map(toSiteKeyDto);
}
