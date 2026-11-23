import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import type { PlatformLinkFields } from "../domain";

type Client = Prisma.TransactionClient | typeof db;

export type PlatformLinkRow = Prisma.PlatformLinkGetPayload<object>;

/** Whether this YouTube video already belongs to a sermon or an episode of the organization. */
export async function isVideoLinked(
  client: Client,
  organizationId: string,
  externalId: string,
): Promise<boolean> {
  const found = await client.platformLink.findFirst({
    where: { organizationId, platform: "YOUTUBE", externalId },
    select: { id: true },
  });
  return found !== null;
}

/** Of these YouTube video ids, the ones already linked (to anything). */
export async function findLinkedVideoIds(
  organizationId: string,
  externalIds: readonly string[],
): Promise<Set<string>> {
  const rows = await forOrganization(db, organizationId).platformLink.findMany({
    where: { platform: "YOUTUBE", externalId: { in: [...externalIds] } },
    select: { externalId: true },
  });
  return new Set(rows.map((row) => row.externalId));
}

/** The YouTube links of these sermons, by sermon id. */
export async function listSermonLinks(
  organizationId: string,
  sermonIds: readonly string[],
): Promise<Map<string, PlatformLinkRow>> {
  const rows = await forOrganization(db, organizationId).platformLink.findMany({
    where: {
      entityType: "SERMON",
      platform: "YOUTUBE",
      entityId: { in: [...sermonIds] },
    },
  });
  return new Map(rows.map((row) => [row.entityId, row]));
}

export interface NewSermonLink extends PlatformLinkFields {
  organizationId: string;
  sermonId: string;
  externalId: string;
  url: string;
}

export function createSermonLinkRow(
  tx: Prisma.TransactionClient,
  { sermonId, ...data }: NewSermonLink,
): Promise<PlatformLinkRow> {
  return tx.platformLink.create({
    data: {
      ...data,
      entityType: "SERMON",
      entityId: sermonId,
      platform: "YOUTUBE",
    },
  });
}

/** A sermon's links go with it, which frees the video to be linked again. */
export async function deleteSermonLinks(
  tx: Prisma.TransactionClient,
  organizationId: string,
  sermonId: string,
): Promise<void> {
  await tx.platformLink.deleteMany({
    where: { organizationId, entityType: "SERMON", entityId: sermonId },
  });
}
