import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

/** Newest first; the id (a v7 uuid) breaks ties of posts created in the same millisecond. */
export function listPostRows(
  organizationId: string,
): Promise<{ id: string; firstLiveAt: Date | null }[]> {
  return forOrganization(db, organizationId).post.findMany({
    select: { id: true, firstLiveAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

/** A post with no content yet: its content goes through the editorial workflow. */
export function createPostRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<{ id: string }> {
  return tx.post.create({ data: { organizationId }, select: { id: true } });
}

/** Names the CRM list shows: categories (any language, deleted ones too) by id. */
export function findCategoryNames(
  organizationId: string,
  ids: readonly string[],
): Promise<{ id: string; translations: { locale: string; name: string }[] }[]> {
  return forOrganization(db, organizationId).category.findMany({
    where: { id: { in: [...ids] } },
    select: {
      id: true,
      translations: { select: { locale: true, name: true } },
    },
  });
}

export function findAuthorNames(
  organizationId: string,
  ids: readonly string[],
): Promise<{ id: string; name: string }[]> {
  return forOrganization(db, organizationId).personProfile.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true, name: true },
  });
}
