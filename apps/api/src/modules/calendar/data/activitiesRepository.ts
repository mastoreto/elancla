import type { UpsertRecurringActivityBody } from "@ancla/contracts";
import { db, type Prisma, type ServiceKind } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const activityInclude = {
  translations: true,
  ministries: { select: { ministryId: true } },
} satisfies Prisma.RecurringActivityInclude;

export type RecurringActivityRow = Prisma.RecurringActivityGetPayload<{
  include: typeof activityInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

const SERVICE_KINDS: Record<
  NonNullable<UpsertRecurringActivityBody["serviceKind"]>,
  ServiceKind
> = {
  worship: "WORSHIP",
  bibleSchool: "BIBLE_SCHOOL",
};

/** Activities that are not deleted, optionally those of one set, in week order. */
export function listActivityRows(
  organizationId: string,
  scheduleSetId: string | undefined,
): Promise<RecurringActivityRow[]> {
  return forOrganization(db, organizationId).recurringActivity.findMany({
    where: { deletedAt: null, ...(scheduleSetId ? { scheduleSetId } : {}) },
    include: activityInclude,
    orderBy: [{ weekday: "asc" }, { start: "asc" }, { id: "asc" }],
  });
}

export function findActivityRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<RecurringActivityRow | null> {
  return client.recurringActivity.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: activityInclude,
  });
}

const translationRows = (
  translations: UpsertRecurringActivityBody["translations"],
) =>
  Object.entries(translations).map(([locale, { title }]) => ({
    locale,
    title,
  }));

function columnsOf(body: UpsertRecurringActivityBody) {
  return {
    scheduleSetId: body.scheduleSetId,
    weekday: body.weekday,
    start: body.start,
    end: body.end,
    placeId: body.placeId,
    serviceKind: body.serviceKind ? SERVICE_KINDS[body.serviceKind] : null,
    isPublic: body.isPublic,
    // A fixed activity is the one without a year (the database CHECK says the same).
    isFixed: body.year === null,
    year: body.year,
    annualReview: body.annualReview,
  };
}

export function createActivityRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertRecurringActivityBody,
): Promise<RecurringActivityRow> {
  return tx.recurringActivity.create({
    data: {
      organizationId,
      ...columnsOf(body),
      translations: { create: translationRows(body.translations) },
      ministries: {
        create: body.ministryIds.map((ministryId) => ({ ministryId })),
      },
    },
    include: activityInclude,
  });
}

/**
 * Lock by `version`: replaces the fields, the translations and the linked ministries only if the
 * row is still the one the editor loaded. `false` means someone saved first.
 */
export async function replaceActivityIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: UpsertRecurringActivityBody,
): Promise<boolean> {
  const { count } = await tx.recurringActivity.updateMany({
    where: { ...where, deletedAt: null },
    // Saving from the CRM is the confirmation of a copied activity: it no longer needs review.
    data: { ...columnsOf(body), needsReview: false, version: { increment: 1 } },
  });
  if (count === 0) return false;
  await tx.recurringActivityTranslation.deleteMany({
    where: { activityId: where.id },
  });
  await tx.recurringActivityTranslation.createMany({
    data: translationRows(body.translations).map((row) => ({
      ...row,
      activityId: where.id,
    })),
  });
  await tx.recurringActivityMinistry.deleteMany({
    where: { activityId: where.id },
  });
  await tx.recurringActivityMinistry.createMany({
    data: body.ministryIds.map((ministryId) => ({
      activityId: where.id,
      ministryId,
    })),
  });
  return true;
}

export async function softDeleteActivity(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.recurringActivity.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  });
}

/** The `ids` that are ministries of the organization, for checks before a write. */
export async function findExistingMinistryIds(
  tx: Prisma.TransactionClient,
  organizationId: string,
  ids: readonly string[],
): Promise<string[]> {
  const rows = await tx.ministry.findMany({
    where: { organizationId, id: { in: [...ids] } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}
