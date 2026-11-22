import { eventSnapshot as eventSnapshotSchema } from "@ancla/contracts";
import type { EventFormValues, EventTranslationValues } from "../../types";

function emptyTranslation(): EventTranslationValues {
  return { title: "", description: "" };
}

function emptyValues(locales: readonly string[]): EventFormValues {
  return {
    translations: Object.fromEntries(locales.map((locale) => [locale, emptyTranslation()])),
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    allDay: false,
    placeMode: "tbc",
    placeId: "",
    externalAddress: "",
    ministryIds: [],
    imageId: "",
    linkUrl: "",
    status: "scheduled",
  };
}

/** The form state for every language: what the snapshot holds, blank for the rest. */
export function toEventFormValues(
  snapshot: Record<string, unknown> | null,
  locales: readonly string[],
): EventFormValues {
  const parsed = snapshot ? eventSnapshotSchema.safeParse(snapshot) : null;
  if (!parsed?.success) return emptyValues(locales);
  const stored = parsed.data;
  return {
    translations: Object.fromEntries(
      locales.map((locale) => {
        const translation = stored.translations[locale];
        return [
          locale,
          translation
            ? { title: translation.title, description: translation.description ?? "" }
            : emptyTranslation(),
        ];
      }),
    ),
    startDate: stored.startDate,
    startTime: stored.startTime ?? "",
    endDate: stored.endDate ?? "",
    endTime: stored.endTime ?? "",
    allDay: stored.allDay,
    placeMode: stored.placeMode,
    placeId: stored.placeId ?? "",
    externalAddress: stored.externalAddress ?? "",
    ministryIds: stored.ministryIds,
    imageId: stored.imageId ?? "",
    linkUrl: stored.linkUrl ?? "",
    status: stored.status,
  };
}

function isTranslationBlank({ title, description }: EventTranslationValues): boolean {
  return title.trim() === "" && description.trim() === "";
}

function toTranslationInput({ title, description }: EventTranslationValues) {
  const trimmedDescription = description.trim();
  return {
    title: title.trim(),
    ...(trimmedDescription === "" ? {} : { description: trimmedDescription }),
  };
}

/** An optional text the user left blank is not sent, so the strict schema never sees it. */
function optional<Key extends string>(key: Key, value: string): Partial<Record<Key, string>> {
  const trimmed = value.trim();
  return trimmed === "" ? {} : ({ [key]: trimmed } as Record<Key, string>);
}

/** Times only exist for an event that is not all day. */
function timesOf(values: EventFormValues): Record<string, string> {
  if (values.allDay) return {};
  return { ...optional("startTime", values.startTime), ...optional("endTime", values.endTime) };
}

/** The place field that matches the mode; the others would break the schema. */
function placeOf(values: EventFormValues): Record<string, string> {
  if (values.placeMode === "place") return optional("placeId", values.placeId);
  if (values.placeMode === "external") return optional("externalAddress", values.externalAddress);
  return {};
}

/**
 * The snapshot to send, with exactly the keys the API's strict schema knows. The default language
 * always goes (the API requires it); a blank translation of any other language is left out.
 */
export function toEventSnapshot(
  values: EventFormValues,
  defaultLocale: string,
): Record<string, unknown> {
  const translations = Object.entries(values.translations)
    .filter(([locale, translation]) => locale === defaultLocale || !isTranslationBlank(translation))
    .map(([locale, translation]) => [locale, toTranslationInput(translation)] as const);
  return {
    translations: Object.fromEntries(translations),
    startDate: values.startDate.trim(),
    ...optional("endDate", values.endDate),
    ...timesOf(values),
    allDay: values.allDay,
    placeMode: values.placeMode,
    ...placeOf(values),
    ministryIds: values.ministryIds,
    ...optional("imageId", values.imageId),
    ...optional("linkUrl", values.linkUrl),
    status: values.status,
  };
}
