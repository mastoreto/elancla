import {
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_EXTERNAL_ADDRESS_MAX_LENGTH,
  EVENT_LINK_URL_MAX_LENGTH,
  EVENT_MINISTRIES_MAX_COUNT,
  EVENT_TITLE_MAX_LENGTH,
  eventSnapshot,
} from "@ancla/contracts";
import type {
  EventFormErrors,
  EventFormValues,
  EventGeneralField,
  EventTranslationField,
} from "../../types";
import { toEventSnapshot } from "../eventFormValues";

const YEAR_LENGTH = 4;

const TRANSLATION_MESSAGES: Record<EventTranslationField, string> = {
  title: `Escribe un título de hasta ${EVENT_TITLE_MAX_LENGTH} caracteres.`,
  description: `La descripción admite hasta ${EVENT_DESCRIPTION_MAX_LENGTH} caracteres.`,
};

const GENERAL_MESSAGES: Record<EventGeneralField, string> = {
  startDate: "Elige una fecha de inicio válida.",
  startTime: "La hora de inicio no es válida.",
  endDate: "El evento no puede terminar antes de empezar: revisa la fecha y la hora de fin.",
  endTime: "La hora de fin necesita una hora de inicio.",
  placeId: "Elige un lugar de la lista.",
  externalAddress: `Escribe la dirección (hasta ${EVENT_EXTERNAL_ADDRESS_MAX_LENGTH} caracteres).`,
  ministryIds: `Elige hasta ${EVENT_MINISTRIES_MAX_COUNT} ministerios, sin repetir.`,
  imageId: "La imagen no es válida. Súbela de nuevo.",
  linkUrl: `El enlace debe empezar con https:// y tener hasta ${EVENT_LINK_URL_MAX_LENGTH} caracteres.`,
};

const YEAR_MISMATCH_MESSAGE = (year: number): string =>
  `La fecha de inicio debe estar en ${year}, el año de este evento.`;

function isTranslationField(key: unknown): key is EventTranslationField {
  return typeof key === "string" && key in TRANSLATION_MESSAGES;
}

function isGeneralField(key: unknown): key is EventGeneralField {
  return typeof key === "string" && key in GENERAL_MESSAGES;
}

/** A place that does not match its mode is reported on the field the user has to fill. */
function fieldOfPlaceMode(values: EventFormValues): EventGeneralField | null {
  if (values.placeMode === "place") return "placeId";
  if (values.placeMode === "external") return "externalAddress";
  return null;
}

function addGeneralError(errors: EventFormErrors, field: EventGeneralField): void {
  errors.general[field] ??= GENERAL_MESSAGES[field];
}

function addTranslationError(
  errors: EventFormErrors,
  locale: string,
  field: EventTranslationField,
): void {
  const current = errors.translations[locale] ?? {};
  errors.translations[locale] = {
    ...current,
    [field]: current[field] ?? TRANSLATION_MESSAGES[field],
  };
}

/** Puts one schema issue on the field the user has to fix. */
function applyIssue(
  errors: EventFormErrors,
  values: EventFormValues,
  path: readonly PropertyKey[],
): void {
  const [root, locale, field] = path;
  if (root === "translations" && typeof locale === "string") {
    addTranslationError(errors, locale, isTranslationField(field) ? field : "title");
    return;
  }
  if (root === "placeMode") {
    const placeField = fieldOfPlaceMode(values);
    if (placeField) addGeneralError(errors, placeField);
    return;
  }
  if (isGeneralField(root)) addGeneralError(errors, root);
}

/**
 * Field errors for what would be sent, from the same schema the API enforces plus the year of the
 * event (the API checks it when publishing). Empty when the snapshot is valid.
 */
export function validateEventForm(
  values: EventFormValues,
  options: { defaultLocale: string; year: number },
): EventFormErrors {
  const errors: EventFormErrors = { translations: {}, general: {} };
  const startYear = Number(values.startDate.slice(0, YEAR_LENGTH));
  if (values.startDate.trim() !== "" && startYear !== options.year) {
    errors.general.startDate = YEAR_MISMATCH_MESSAGE(options.year);
  }
  const result = eventSnapshot.safeParse(toEventSnapshot(values, options.defaultLocale));
  if (result.success) return errors;
  for (const issue of result.error.issues) applyIssue(errors, values, issue.path);
  return errors;
}

export function hasEventFormErrors(errors: EventFormErrors): boolean {
  return (
    Object.keys(errors.general).length > 0 ||
    Object.values(errors.translations).some((fields) => Object.keys(fields).length > 0)
  );
}
