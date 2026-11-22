import type { UpsertScheduleExceptionBody } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import { parseDateOnly } from "../domain";

const exceptionInclude = {
  translations: true,
} satisfies Prisma.ScheduleExceptionInclude;

export type ScheduleExceptionRow = Prisma.ScheduleExceptionGetPayload<{
  include: typeof exceptionInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

/** Exceptions by date. */
export function listExceptionRows(
  organizationId: string,
): Promise<ScheduleExceptionRow[]> {
  return forOrganization(db, organizationId).scheduleException.findMany({
    include: exceptionInclude,
    orderBy: [{ date: "asc" }],
  });
}

export function findExceptionRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<ScheduleExceptionRow | null> {
  return client.scheduleException.findFirst({
    where: { id, organizationId },
    include: exceptionInclude,
  });
}

/** Whether another exception already holds the date. */
export async function isExceptionDateTaken(
  tx: Prisma.TransactionClient,
  input: { organizationId: string; date: string; exceptId?: string },
): Promise<boolean> {
  const count = await tx.scheduleException.count({
    where: {
      organizationId: input.organizationId,
      date: parseDateOnly(input.date),
      ...(input.exceptId ? { id: { not: input.exceptId } } : {}),
    },
  });
  return count > 0;
}

const translationRows = (
  translations: UpsertScheduleExceptionBody["translations"],
) =>
  Object.entries(translations).map(([locale, { message }]) => ({
    locale,
    message,
  }));

export function createExceptionRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertScheduleExceptionBody,
): Promise<ScheduleExceptionRow> {
  return tx.scheduleException.create({
    data: {
      organizationId,
      date: parseDateOnly(body.date),
      replacementSetId: body.replacementSetId,
      translations: { create: translationRows(body.translations) },
    },
    include: exceptionInclude,
  });
}

/**
 * Lock by `version`: replaces the date, the replacement and the whole set of translations only if
 * the row is still the one the editor loaded. `false` means someone saved first.
 */
export async function replaceExceptionIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: UpsertScheduleExceptionBody,
): Promise<boolean> {
  const { count } = await tx.scheduleException.updateMany({
    where,
    data: {
      date: parseDateOnly(body.date),
      replacementSetId: body.replacementSetId,
      version: { increment: 1 },
    },
  });
  if (count === 0) return false;
  await tx.scheduleExceptionTranslation.deleteMany({
    where: { exceptionId: where.id },
  });
  await tx.scheduleExceptionTranslation.createMany({
    data: translationRows(body.translations).map((row) => ({
      ...row,
      exceptionId: where.id,
    })),
  });
  return true;
}

export async function deleteException(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.scheduleException.deleteMany({ where: { id, organizationId } });
}
