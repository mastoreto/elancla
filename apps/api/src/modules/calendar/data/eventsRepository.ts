import type { CreateEventBody, EventSettingsBody } from "@ancla/contracts";
import { db, type EventVisibility, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const eventInclude = {
  audienceRoles: { select: { roleId: true } },
} satisfies Prisma.EventInclude;

export type EventRow = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

const VISIBILITIES: Record<CreateEventBody["visibility"], EventVisibility> = {
  public: "PUBLIC",
  internal: "INTERNAL",
};

export const toVisibilityColumn = (
  visibility: CreateEventBody["visibility"],
): EventVisibility => VISIBILITIES[visibility];

/** The events of a year, oldest first; who may see each one is decided by the caller. */
export function listEventRows(
  organizationId: string,
  year: number,
): Promise<EventRow[]> {
  return forOrganization(db, organizationId).event.findMany({
    where: { year },
    include: eventInclude,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export function findEventRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<EventRow | null> {
  return client.event.findFirst({
    where: { id, organizationId },
    include: eventInclude,
  });
}

const audienceRows = (roleIds: readonly string[]) =>
  [...new Set(roleIds)].map((roleId) => ({ roleId }));

export function createEventRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: CreateEventBody,
): Promise<EventRow> {
  return tx.event.create({
    data: {
      organizationId,
      year: body.year,
      visibility: toVisibilityColumn(body.visibility),
      audienceRoles: { create: audienceRows(body.audienceRoleIds) },
    },
    include: eventInclude,
  });
}

/**
 * Lock by `version`: replaces visibility and audience only if the row is still the one the editor
 * loaded. `false` means someone saved first.
 */
export async function replaceEventSettingsIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: Omit<EventSettingsBody, "version">,
): Promise<boolean> {
  const { count } = await tx.event.updateMany({
    where,
    data: {
      visibility: toVisibilityColumn(body.visibility),
      version: { increment: 1 },
    },
  });
  if (count === 0) return false;
  await tx.eventAudienceRole.deleteMany({ where: { eventId: where.id } });
  await tx.eventAudienceRole.createMany({
    data: audienceRows(body.audienceRoleIds).map((row) => ({
      ...row,
      eventId: where.id,
    })),
  });
  return true;
}

export async function deleteEventRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.event.deleteMany({ where: { id, organizationId } });
}

/** The ids of the roles of the organization among `ids`, for checks before a write. */
export async function findExistingRoleIdsOf(
  tx: Prisma.TransactionClient,
  organizationId: string,
  ids: readonly string[],
): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await tx.role.findMany({
    where: { organizationId, id: { in: [...ids] } },
    select: { id: true },
  });
  return rows.map(({ id }) => id);
}

/** Copies of events made into a draft year: the row and who sees it, nothing of the content. */
export function createCopiedEventRow(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    year: number;
    visibility: EventVisibility;
    audienceRoleIds: readonly string[];
  },
): Promise<EventRow> {
  return tx.event.create({
    data: {
      organizationId: input.organizationId,
      year: input.year,
      visibility: input.visibility,
      needsReview: true,
      audienceRoles: { create: audienceRows(input.audienceRoleIds) },
    },
    include: eventInclude,
  });
}
