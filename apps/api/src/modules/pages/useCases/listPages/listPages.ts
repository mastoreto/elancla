import type { SimplePageListDto } from "@ancla/contracts";
import { listCurrentRevisionRows, type RevisionRow } from "../../../editorial";
import { findDefaultLocale, listSimplePageRows } from "../../data";
import { toSimplePageListItemDto } from "../../mappers";

const LIVE_STATES = ["PUBLISHED", "PAUSED"];

/** Every page with its live and working revision, fetched in three queries whatever the count. */
export async function listPages(
  organizationId: string,
): Promise<SimplePageListDto> {
  const [pages, revisions, defaultLocale] = await Promise.all([
    listSimplePageRows(organizationId),
    listCurrentRevisionRows(organizationId, "SIMPLE_PAGE"),
    findDefaultLocale(organizationId),
  ]);
  const byEntity = new Map<string, RevisionRow[]>();
  for (const revision of revisions) {
    byEntity.set(revision.entityId, [
      ...(byEntity.get(revision.entityId) ?? []),
      revision,
    ]);
  }
  return {
    items: pages.map(({ id }) => {
      const own = byEntity.get(id) ?? [];
      return toSimplePageListItemDto({
        id,
        defaultLocale,
        live: own.find((row) => LIVE_STATES.includes(row.state)) ?? null,
        working: own.find((row) => !LIVE_STATES.includes(row.state)) ?? null,
      });
    }),
  };
}
