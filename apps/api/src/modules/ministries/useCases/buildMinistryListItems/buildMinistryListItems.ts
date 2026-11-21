import type { MinistryListItemDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { listCurrentRevisionRows, type RevisionRow } from "../../../editorial";
import { findOrganizationLocales, type MinistryRow } from "../../data";
import { toMinistryListItemDto } from "../../mappers";

const LIVE_STATES = ["PUBLISHED", "PAUSED"];

/** The ministries with their live and working revision, in two queries whatever the count. */
export async function buildMinistryListItems(
  organizationId: string,
  rows: readonly MinistryRow[],
): Promise<MinistryListItemDto[]> {
  const [revisions, config] = await Promise.all([
    listCurrentRevisionRows(organizationId, "MINISTRY"),
    findOrganizationLocales(db, organizationId),
  ]);
  const byEntity = new Map<string, RevisionRow[]>();
  for (const revision of revisions) {
    byEntity.set(revision.entityId, [
      ...(byEntity.get(revision.entityId) ?? []),
      revision,
    ]);
  }
  return rows.map((row) => {
    const own = byEntity.get(row.id) ?? [];
    return toMinistryListItemDto(row, {
      defaultLocale: config?.defaultLocale ?? "",
      live: own.find((r) => LIVE_STATES.includes(r.state)) ?? null,
      working: own.find((r) => !LIVE_STATES.includes(r.state)) ?? null,
    });
  });
}
