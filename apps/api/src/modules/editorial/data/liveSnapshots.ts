import type { EditorialContentType } from "@ancla/db";
import { db } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

export interface LiveSnapshot {
  entityId: string;
  snapshot: Record<string, unknown>;
  publishedAt: Date | null;
}

const asSnapshot = (value: unknown): Record<string, unknown> =>
  value as Record<string, unknown>;

/**
 * What the public site shows for one entity: its published revision. A paused revision is hidden,
 * so it yields `null`, and so does an entity whose newer edits are still in review.
 */
export async function findLiveSnapshot(
  organizationId: string,
  contentType: EditorialContentType,
  entityId: string,
): Promise<Record<string, unknown> | null> {
  const row = await forOrganization(
    db,
    organizationId,
  ).contentRevision.findFirst({
    where: { contentType, entityId, state: "PUBLISHED" },
    select: { snapshot: true },
  });
  return row ? asSnapshot(row.snapshot) : null;
}

/** Every published entity of a type (paused ones excluded), for list pages. */
export async function listLiveSnapshots(
  organizationId: string,
  contentType: EditorialContentType,
): Promise<LiveSnapshot[]> {
  const rows = await forOrganization(
    db,
    organizationId,
  ).contentRevision.findMany({
    where: { contentType, state: "PUBLISHED" },
    select: { entityId: true, snapshot: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((row) => ({
    entityId: row.entityId,
    snapshot: asSnapshot(row.snapshot),
    publishedAt: row.publishedAt,
  }));
}
