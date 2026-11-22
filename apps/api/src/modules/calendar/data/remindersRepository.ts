import {
  ADMIN_ROLE_KEY,
  type UpdateCalendarReminderSettingsBody,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { formatDateOnly, parseDateOnly } from "../domain";

type Client = Prisma.TransactionClient | typeof db;

export type ReminderSettingsRow =
  Prisma.CalendarReminderSettingsGetPayload<object>;

export interface ReminderRecipient {
  id: string;
  name: string;
  email: string;
}

const RECIPIENT = { select: { id: true, name: true, email: true } } as const;

export function findReminderSettingsRow(
  client: Client,
  organizationId: string,
): Promise<ReminderSettingsRow | null> {
  return client.calendarReminderSettings.findUnique({
    where: { organizationId },
  });
}

export function upsertReminderSettingsRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpdateCalendarReminderSettingsBody,
): Promise<ReminderSettingsRow> {
  return tx.calendarReminderSettings.upsert({
    where: { organizationId },
    create: { organizationId, ...body },
    update: body,
  });
}

/** Records that the reminder of `localDate` went out, so the cron job never repeats it. */
export async function markReminderSent(
  organizationId: string,
  localDate: string,
): Promise<void> {
  await db.calendarReminderSettings.upsert({
    where: { organizationId },
    create: { organizationId, lastSentOn: parseDateOnly(localDate) },
    update: { lastSentOn: parseDateOnly(localDate) },
  });
}

export const lastSentOnOf = (row: ReminderSettingsRow | null): string | null =>
  row?.lastSentOn ? formatDateOnly(row.lastSentOn) : null;

export async function findExistingUserIdsOf(
  client: Client,
  ids: readonly string[],
): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await client.user.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true },
  });
  return rows.map(({ id }) => id);
}

/** The users named directly or through a role. Stale ids match nobody. */
export function findRecipientsOf(
  organizationId: string,
  settings: Pick<ReminderSettingsRow, "recipientRoleIds" | "recipientUserIds">,
): Promise<ReminderRecipient[]> {
  return db.user.findMany({
    where: {
      OR: [
        { id: { in: settings.recipientUserIds } },
        {
          userRoles: {
            some: {
              roleId: { in: settings.recipientRoleIds },
              role: { organizationId },
            },
          },
        },
      ],
    },
    ...RECIPIENT,
  });
}

export function findAdminRecipients(
  organizationId: string,
): Promise<ReminderRecipient[]> {
  return db.user.findMany({
    where: {
      userRoles: { some: { role: { organizationId, key: ADMIN_ROLE_KEY } } },
    },
    ...RECIPIENT,
  });
}

const pendingReviewInclude = {
  translations: true,
} satisfies Prisma.RecurringActivityInclude;

export type PendingReviewRow = Prisma.RecurringActivityGetPayload<{
  include: typeof pendingReviewInclude;
}>;

/** Fixed activities with annual review that nobody confirmed for `year`. */
export function listPendingReviewRows(
  organizationId: string,
  year: number,
): Promise<PendingReviewRow[]> {
  return db.recurringActivity.findMany({
    where: {
      organizationId,
      deletedAt: null,
      isFixed: true,
      annualReview: true,
      yearReviews: { none: { year } },
    },
    include: pendingReviewInclude,
    orderBy: [{ weekday: "asc" }, { start: "asc" }, { id: "asc" }],
  });
}

export async function listOrganizationIds(): Promise<
  { id: string; name: string; timezone: string }[]
> {
  return db.organization.findMany({
    select: { id: true, name: true, timezone: true },
  });
}
