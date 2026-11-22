import { parseDateOnly, yearOf } from "../dateOnly";

const REMINDER_START_MONTH = 12;
const REMINDER_END_MONTH = 1;
const REMINDER_EVERY_N_DAYS = 2;
const MS_PER_DAY = 86_400_000;

export interface ReminderState {
  /** The target year is published. */
  targetYearPublished: boolean;
  /** Fixed activities with annual review that nobody confirmed for the target year. */
  pendingReviews: number;
  /** Local date of the last reminder sent, `null` if never. */
  lastSentOn: string | null;
}

const monthOf = (localDate: string): number => Number(localDate.slice(5, 7));

/**
 * The year the reminders are about: from December it is the next one (still to be prepared); in
 * January it is the one that just started. Other months have none.
 */
export function reminderTargetYear(localDate: string): number | null {
  const month = monthOf(localDate);
  if (month === REMINDER_START_MONTH) return yearOf(localDate) + 1;
  if (month === REMINDER_END_MONTH) return yearOf(localDate);
  return null;
}

/** Days since the 1st of December that opened the reminder season the date belongs to. */
function daysSinceSeasonStart(localDate: string): number {
  const seasonYear =
    monthOf(localDate) === REMINDER_END_MONTH
      ? yearOf(localDate) - 1
      : yearOf(localDate);
  const start = parseDateOnly(`${seasonYear}-12-01`);
  return Math.round(
    (parseDateOnly(localDate).getTime() - start.getTime()) / MS_PER_DAY,
  );
}

/**
 * Whether today is a reminder day: from the 1st of December, every second day (1, 3, 5 of
 * December... and it goes on in January), while the target year is not published or some fixed
 * activity with annual review is not confirmed. It never fires twice on the same local day.
 */
export function shouldRemind(localDate: string, state: ReminderState): boolean {
  if (reminderTargetYear(localDate) === null) return false;
  if (state.lastSentOn === localDate) return false;
  if (state.targetYearPublished && state.pendingReviews === 0) return false;
  return daysSinceSeasonStart(localDate) % REMINDER_EVERY_N_DAYS === 0;
}
