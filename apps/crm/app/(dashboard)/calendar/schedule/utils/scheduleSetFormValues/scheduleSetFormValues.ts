import {
  calendarDate,
  SCHEDULE_SET_NAME_MAX_LENGTH,
  type ScheduleSetDto,
  type UpdateScheduleSetBody,
  type UpsertScheduleSetBody,
} from "@ancla/contracts";
import type { ScheduleSetFormErrors, ScheduleSetFormValues } from "../../types";
import { nextOrderAfter, ORDER_MESSAGE, parseOrder } from "../orderField";
import { toLocaleTexts, toTranslations, validateTexts } from "../translatedText";

const DATE_MESSAGE = "Escribe una fecha que exista.";
const WINDOW_MESSAGE = "La fecha final no puede ser anterior a la inicial.";

const pickName = (translation: { name: string }): string => translation.name;
const wrapName = (name: string): { name: string } => ({ name });

/** The form state: what the set holds, or the defaults of a new one (after `existingOrders`). */
export function toScheduleSetFormValues(
  set: ScheduleSetDto | null,
  locales: readonly string[],
  existingOrders: readonly number[] = [],
): ScheduleSetFormValues {
  return {
    names: toLocaleTexts(set?.translations ?? {}, pickName, locales),
    validFrom: set?.validFrom ?? "",
    validTo: set?.validTo ?? "",
    isDefault: set?.isDefault ?? false,
    forcedActive: set?.forcedActive ?? false,
    order: String(set?.order ?? nextOrderAfter(existingOrders)),
  };
}

/** A blank date means "no limit". */
function dateOrNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed === "" ? null : trimmed;
}

/** The body to send; `order` is only valid once `validateScheduleSetForm` passed. */
export function toUpsertScheduleSetBody(
  values: ScheduleSetFormValues,
  defaultLocale: string,
): UpsertScheduleSetBody {
  return {
    validFrom: dateOrNull(values.validFrom),
    validTo: dateOrNull(values.validTo),
    isDefault: values.isDefault,
    forcedActive: values.forcedActive,
    order: parseOrder(values.order) ?? 0,
    translations: toTranslations(values.names, defaultLocale, wrapName),
  };
}

export function toUpdateScheduleSetBody(
  values: ScheduleSetFormValues,
  defaultLocale: string,
  version: number,
): UpdateScheduleSetBody {
  return { ...toUpsertScheduleSetBody(values, defaultLocale), version };
}

/**
 * The PATCH body of a set as it is, with one flag changed: the "Forzar este horario" switch saves
 * the whole set (the API replaces it) and keeps every translation it has.
 */
export function toForcedActiveBody(
  set: ScheduleSetDto,
  forcedActive: boolean,
): UpdateScheduleSetBody {
  return {
    validFrom: set.validFrom,
    validTo: set.validTo,
    isDefault: set.isDefault,
    forcedActive,
    order: set.order,
    translations: set.translations,
    version: set.version,
  };
}

function dateError(text: string): string | undefined {
  const date = dateOrNull(text);
  if (date === null) return undefined;
  return calendarDate.safeParse(date).success ? undefined : DATE_MESSAGE;
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validateScheduleSetForm(
  values: ScheduleSetFormValues,
  defaultLocale: string,
): ScheduleSetFormErrors {
  const errors: ScheduleSetFormErrors = {
    names: validateTexts(values.names, defaultLocale, SCHEDULE_SET_NAME_MAX_LENGTH),
  };
  const validFrom = dateError(values.validFrom);
  const validTo = dateError(values.validTo);
  if (validFrom) errors.validFrom = validFrom;
  if (validTo) errors.validTo = validTo;
  const [from, to] = [dateOrNull(values.validFrom), dateOrNull(values.validTo)];
  if (!(validFrom || validTo) && from !== null && to !== null && to < from) {
    errors.validTo = WINDOW_MESSAGE;
  }
  if (parseOrder(values.order) === null) errors.order = ORDER_MESSAGE;
  return errors;
}

export function hasScheduleSetErrors(errors: ScheduleSetFormErrors): boolean {
  return (
    Object.keys(errors.names).length > 0 ||
    errors.validFrom !== undefined ||
    errors.validTo !== undefined ||
    errors.order !== undefined
  );
}
