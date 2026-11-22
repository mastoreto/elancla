import {
  calendarDate,
  EXCEPTION_MESSAGE_MAX_LENGTH,
  type ScheduleExceptionDto,
  type UpdateScheduleExceptionBody,
  type UpsertScheduleExceptionBody,
} from "@ancla/contracts";
import type { ExceptionFormErrors, ExceptionFormValues } from "../../types";
import { toLocaleTexts, toTranslations, validateTexts } from "../translatedText";

const DATE_MESSAGE = "Escribe una fecha que exista.";

const pickMessage = (translation: { message: string }): string => translation.message;
const wrapMessage = (message: string): { message: string } => ({ message });

/** The form state: what the exception holds, or a blank one. */
export function toExceptionFormValues(
  exception: ScheduleExceptionDto | null,
  locales: readonly string[],
): ExceptionFormValues {
  return {
    date: exception?.date ?? "",
    replacementSetId: exception?.replacementSetId ?? "",
    messages: toLocaleTexts(exception?.translations ?? {}, pickMessage, locales),
  };
}

export function toUpsertExceptionBody(
  values: ExceptionFormValues,
  defaultLocale: string,
): UpsertScheduleExceptionBody {
  return {
    date: values.date.trim(),
    replacementSetId: values.replacementSetId === "" ? null : values.replacementSetId,
    translations: toTranslations(values.messages, defaultLocale, wrapMessage),
  };
}

export function toUpdateExceptionBody(
  values: ExceptionFormValues,
  defaultLocale: string,
  version: number,
): UpdateScheduleExceptionBody {
  return { ...toUpsertExceptionBody(values, defaultLocale), version };
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validateExceptionForm(
  values: ExceptionFormValues,
  defaultLocale: string,
): ExceptionFormErrors {
  const errors: ExceptionFormErrors = {
    messages: validateTexts(values.messages, defaultLocale, EXCEPTION_MESSAGE_MAX_LENGTH),
  };
  if (!calendarDate.safeParse(values.date.trim()).success) errors.date = DATE_MESSAGE;
  return errors;
}

export function hasExceptionErrors(errors: ExceptionFormErrors): boolean {
  return errors.date !== undefined || Object.keys(errors.messages).length > 0;
}
