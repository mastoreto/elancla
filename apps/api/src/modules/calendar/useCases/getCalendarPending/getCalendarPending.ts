import type { CalendarPendingDto, PendingYearStatus } from "@ancla/contracts";
import { db } from "@ancla/db";
import {
  findOrganizationTimezone,
  findYearRow,
  listPendingReviewRows,
} from "../../data";
import { localDateIn, reminderTargetYear, yearOf } from "../../domain";

const DEFAULT_TIMEZONE = "UTC";

function statusOf(
  yearRow: { status: "DRAFT" | "PUBLISHED" } | null,
): PendingYearStatus {
  if (!yearRow) return "missing";
  return yearRow.status === "PUBLISHED" ? "published" : "draft";
}

/**
 * What is left of the year that is about to start (the next one in December, the current one
 * otherwise): publishing it and confirming its fixed activities with annual review.
 */
export async function getCalendarPending(
  organizationId: string,
  now: Date = new Date(),
): Promise<CalendarPendingDto> {
  const organization = await findOrganizationTimezone(organizationId);
  const localDate = localDateIn(
    organization?.timezone ?? DEFAULT_TIMEZONE,
    now,
  );
  const year = reminderTargetYear(localDate) ?? yearOf(localDate);

  const [yearRow, reviews] = await Promise.all([
    findYearRow(db, organizationId, year),
    listPendingReviewRows(organizationId, year),
  ]);
  const yearStatus = statusOf(yearRow);
  return {
    year,
    yearStatus,
    pendingReviews: reviews.map((row) => ({
      activityId: row.id,
      weekday: row.weekday,
      start: row.start,
      translations: Object.fromEntries(
        row.translations.map(({ locale, title }) => [locale, { title }]),
      ),
    })),
    hasPending: yearStatus !== "published" || reviews.length > 0,
  };
}
