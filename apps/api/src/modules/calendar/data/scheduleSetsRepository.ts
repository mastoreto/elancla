import type { UpsertScheduleSetBody } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import { parseDateOnly } from "../domain";

const setInclude = {
  translations: true,
} satisfies Prisma.ScheduleSetInclude;

export type ScheduleSetRow = Prisma.ScheduleSetGetPayload<{
  include: typeof setInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

/** The flags that only one set per church may hold. */
type ExclusiveFlag = "isDefault" | "forcedActive";

/** Sets that are not deleted, by their order. */
export function listScheduleSetRows(
  organizationId: string,
): Promise<ScheduleSetRow[]> {
  return forOrganization(db, organizationId).scheduleSet.findMany({
    where: { deletedAt: null },
    include: setInclude,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export function findScheduleSetRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<ScheduleSetRow | null> {
  return client.scheduleSet.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: setInclude,
  });
}

export async function scheduleSetExists(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const count = await tx.scheduleSet.count({
    where: { id, organizationId, deletedAt: null },
  });
  return count > 0;
}

const translationRows = (translations: UpsertScheduleSetBody["translations"]) =>
  Object.entries(translations).map(([locale, { name }]) => ({ locale, name }));

const dateOrNull = (value: string | null): Date | null =>
  value === null ? null : parseDateOnly(value);

/** Turning a flag on takes it from the set that had it (the partial unique indexes demand it). */
export async function releaseExclusiveFlags(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    exceptId?: string;
    flags: Partial<Record<ExclusiveFlag, boolean>>;
  },
): Promise<void> {
  const { organizationId, exceptId, flags } = input;
  for (const flag of ["isDefault", "forcedActive"] as const) {
    if (!flags[flag]) continue;
    await tx.scheduleSet.updateMany({
      where: {
        organizationId,
        deletedAt: null,
        [flag]: true,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { [flag]: false, version: { increment: 1 } },
    });
  }
}

export function createScheduleSetRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertScheduleSetBody,
): Promise<ScheduleSetRow> {
  return tx.scheduleSet.create({
    data: {
      organizationId,
      validFrom: dateOrNull(body.validFrom),
      validTo: dateOrNull(body.validTo),
      isDefault: body.isDefault,
      forcedActive: body.forcedActive,
      order: body.order,
      translations: { create: translationRows(body.translations) },
    },
    include: setInclude,
  });
}

/**
 * Lock by `version`: replaces the fields and the whole set of translations only if the row is
 * still the one the editor loaded. `false` means someone saved first.
 */
export async function replaceScheduleSetIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: UpsertScheduleSetBody,
): Promise<boolean> {
  const { count } = await tx.scheduleSet.updateMany({
    where: { ...where, deletedAt: null },
    data: {
      validFrom: dateOrNull(body.validFrom),
      validTo: dateOrNull(body.validTo),
      isDefault: body.isDefault,
      forcedActive: body.forcedActive,
      order: body.order,
      version: { increment: 1 },
    },
  });
  if (count === 0) return false;
  await tx.scheduleSetTranslation.deleteMany({
    where: { scheduleSetId: where.id },
  });
  await tx.scheduleSetTranslation.createMany({
    data: translationRows(body.translations).map((row) => ({
      ...row,
      scheduleSetId: where.id,
    })),
  });
  return true;
}

/** Deleting a set takes its activities with it (they are only meaningful inside it). */
export async function softDeleteScheduleSet(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  const now = new Date();
  await tx.scheduleSet.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: {
      deletedAt: now,
      isDefault: false,
      forcedActive: false,
      version: { increment: 1 },
    },
  });
  await tx.recurringActivity.updateMany({
    where: { organizationId, scheduleSetId: id, deletedAt: null },
    data: { deletedAt: now, version: { increment: 1 } },
  });
}

/** An exception uses the set as its replacement. */
export async function isScheduleSetInUse(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const used = await tx.scheduleException.count({
    where: { organizationId, replacementSetId: id },
  });
  return used > 0;
}
