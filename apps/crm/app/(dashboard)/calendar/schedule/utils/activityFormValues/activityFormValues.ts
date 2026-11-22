import {
  ACTIVITY_MINISTRIES_MAX_COUNT,
  ACTIVITY_TITLE_MAX_LENGTH,
  calendarYearNumber,
  type RecurringActivityDto,
  timeOfDay,
  type UpdateRecurringActivityBody,
  type UpsertRecurringActivityBody,
} from "@ancla/contracts";
import type { ActivityFormErrors, ActivityFormValues } from "../../types";
import { toLocaleTexts, toTranslations, validateTexts } from "../translatedText";

const TIME_MESSAGE = "Escribe una hora válida (HH:mm).";
const END_MESSAGE = "La hora de fin debe ser posterior a la de inicio.";
const YEAR_MESSAGE = "Escribe un año entre 2000 y 2100.";
const MINISTRIES_MESSAGE = `Elige hasta ${ACTIVITY_MINISTRIES_MAX_COUNT} ministerios.`;

const pickTitle = (translation: { title: string }): string => translation.title;
const wrapTitle = (title: string): { title: string } => ({ title });

/** The form state: what the activity holds, or the defaults of a new one. */
export function toActivityFormValues(
  activity: RecurringActivityDto | null,
  locales: readonly string[],
): ActivityFormValues {
  const year = activity?.year ?? null;
  return {
    weekday: String(activity?.weekday ?? 0),
    start: activity?.start ?? "",
    end: activity?.end ?? "",
    titles: toLocaleTexts(activity?.translations ?? {}, pickTitle, locales),
    placeId: activity?.placeId ?? "",
    serviceKind: activity?.serviceKind ?? "none",
    isPublic: activity?.isPublic ?? true,
    scope: year === null ? "fixed" : "year",
    year: year === null ? "" : String(year),
    annualReview: activity?.annualReview ?? false,
    ministryIds: activity?.ministryIds ?? [],
  };
}

function yearOrNull(values: ActivityFormValues): number | null {
  return values.scope === "fixed" ? null : Number(values.year.trim());
}

/** Fields shared by the create and the update body (`scheduleSetId` is the one being edited). */
function toActivityFields(
  values: ActivityFormValues,
  scheduleSetId: string,
  defaultLocale: string,
): UpsertRecurringActivityBody {
  return {
    scheduleSetId,
    weekday: Number(values.weekday),
    start: values.start.trim(),
    end: values.end.trim() === "" ? null : values.end.trim(),
    placeId: values.placeId === "" ? null : values.placeId,
    serviceKind: values.serviceKind === "none" ? null : values.serviceKind,
    isPublic: values.isPublic,
    year: yearOrNull(values),
    // Only fixed activities are reviewed every year; the switch is hidden for the others.
    annualReview: values.scope === "fixed" && values.annualReview,
    ministryIds: values.ministryIds,
    translations: toTranslations(values.titles, defaultLocale, wrapTitle),
  };
}

export function toUpsertActivityBody(
  values: ActivityFormValues,
  scheduleSetId: string,
  defaultLocale: string,
): UpsertRecurringActivityBody {
  return toActivityFields(values, scheduleSetId, defaultLocale);
}

export function toUpdateActivityBody(
  values: ActivityFormValues,
  scheduleSetId: string,
  options: { defaultLocale: string; version: number },
): UpdateRecurringActivityBody {
  return {
    ...toActivityFields(values, scheduleSetId, options.defaultLocale),
    version: options.version,
  };
}

function validateTimes(values: ActivityFormValues): Pick<ActivityFormErrors, "start" | "end"> {
  const errors: Pick<ActivityFormErrors, "start" | "end"> = {};
  const start = values.start.trim();
  const end = values.end.trim();
  const startIsValid = timeOfDay.safeParse(start).success;
  if (!startIsValid) errors.start = TIME_MESSAGE;
  if (end === "") return errors;
  if (!timeOfDay.safeParse(end).success) errors.end = TIME_MESSAGE;
  else if (startIsValid && end <= start) errors.end = END_MESSAGE;
  return errors;
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validateActivityForm(
  values: ActivityFormValues,
  defaultLocale: string,
): ActivityFormErrors {
  const errors: ActivityFormErrors = {
    ...validateTimes(values),
    titles: validateTexts(values.titles, defaultLocale, ACTIVITY_TITLE_MAX_LENGTH),
  };
  const year = yearOrNull(values);
  if (year !== null && !calendarYearNumber.safeParse(year).success) errors.year = YEAR_MESSAGE;
  if (values.ministryIds.length > ACTIVITY_MINISTRIES_MAX_COUNT) {
    errors.ministryIds = MINISTRIES_MESSAGE;
  }
  return errors;
}

export function hasActivityErrors(errors: ActivityFormErrors): boolean {
  return (
    Object.keys(errors.titles).length > 0 ||
    errors.start !== undefined ||
    errors.end !== undefined ||
    errors.year !== undefined ||
    errors.ministryIds !== undefined
  );
}

/** Adds or removes one ministry from the selection. */
export function toggleMinistry(ministryIds: readonly string[], ministryId: string): string[] {
  return ministryIds.includes(ministryId)
    ? ministryIds.filter((id) => id !== ministryId)
    : [...ministryIds, ministryId];
}
