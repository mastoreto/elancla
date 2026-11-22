import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { renderCalendarReminderEmail } from "@ancla/emails";
import { auditSourceForSystem, writeAudit } from "../../../../core/audit";
import { getApiEnv } from "../../../../core/env";
import { getMailer, type Mailer } from "../../../../core/mail";
import {
  findAdminRecipients,
  findRecipientsOf,
  findReminderSettingsRow,
  findYearRow,
  lastSentOnOf,
  listOrganizationIds,
  listPendingReviewRows,
  markReminderSent,
  type ReminderRecipient,
  type ReminderSettingsRow,
} from "../../data";
import { localDateIn, reminderTargetYear, shouldRemind } from "../../domain";

export const CRON_ACTOR_LABEL = "cron";
const CALENDAR_CRM_PATH = "/calendar";

interface OrganizationToRemind {
  id: string;
  name: string;
  timezone: string;
}

/** Configured recipients; with none (or none that still exist) the admins take their place. */
async function recipientsFor(
  organizationId: string,
  settings: ReminderSettingsRow | null,
): Promise<ReminderRecipient[]> {
  const configured = settings
    ? await findRecipientsOf(organizationId, settings)
    : [];
  return configured.length > 0
    ? configured
    : await findAdminRecipients(organizationId);
}

async function remindOrganization(
  organization: OrganizationToRemind,
  now: Date,
  mailer: Mailer,
): Promise<number> {
  const localDate = localDateIn(organization.timezone, now);
  const year = reminderTargetYear(localDate);
  if (year === null) return 0;

  const settings = await findReminderSettingsRow(db, organization.id);
  const [yearRow, pendingReviews] = await Promise.all([
    findYearRow(db, organization.id, year),
    listPendingReviewRows(organization.id, year),
  ]);
  const yearPublished = yearRow?.status === "PUBLISHED";
  const due = shouldRemind(localDate, {
    targetYearPublished: yearPublished,
    pendingReviews: pendingReviews.length,
    lastSentOn: lastSentOnOf(settings),
  });
  if (!due) return 0;

  const recipients = await recipientsFor(organization.id, settings);
  let delivered = 0;
  for (const recipient of recipients) {
    try {
      const email = await renderCalendarReminderEmail({
        churchName: organization.name,
        recipientEmail: recipient.email,
        year,
        yearPublished,
        pendingReviews: pendingReviews.length,
        actionUrl: `${getApiEnv().CRM_ORIGIN}${CALENDAR_CRM_PATH}`,
      });
      await mailer.send({ to: recipient.email, ...email });
      delivered += 1;
    } catch (error) {
      console.error("Calendar reminder not sent", { to: recipient.id, error });
    }
  }
  if (delivered === 0) return 0;

  await markReminderSent(organization.id, localDate);
  await writeAudit(
    db,
    auditSourceForSystem(organization.id, CRON_ACTOR_LABEL),
    {
      action: AUDIT_ACTIONS.calendarReminder.sent,
      entity: { type: "calendarReminderSettings", id: organization.id },
      metadata: { year, localDate, recipients: delivered },
    },
  );
  return delivered;
}

/**
 * Cron job: emails the calendar reminder to the organizations whose local date is a reminder day.
 * A failure on one organization is logged and does not stop the others. Returns how many emails
 * went out.
 */
export async function sendCalendarReminders(
  now: Date = new Date(),
  mailer: Mailer = getMailer(),
): Promise<number> {
  let sent = 0;
  for (const organization of await listOrganizationIds()) {
    try {
      sent += await remindOrganization(organization, now, mailer);
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          job: "calendar.reminders",
          organizationId: organization.id,
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
  return sent;
}
